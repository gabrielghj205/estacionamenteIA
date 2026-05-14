import { supabase } from '../config/supabase.js';
import { aplicarTemaInicial } from '../ui/theme.js';
import { verificarAutenticacao } from '../services/auth.js';
import { configurarLayout } from '../ui/layout.js';
import { confirmarAcao, exibirErro, exibirSucesso, exibirAviso } from '../ui/alerts.js';
import {
  calcularIntervaloPagina,
  calcularTotalPaginas,
  escaparHtml,
  normalizarMensagemErro,
  renderizarMensagemTabela,
  renderizarPaginacao,
} from '../utils/crud.js';
import { heroicon } from '../ui/icons.js';

aplicarTemaInicial();

const form = document.querySelector('[data-modelos-form]');
const inputId = document.querySelector('[data-modelo-id]');
const selectMarca = document.querySelector('[data-modelo-marca]');
const inputNome = document.querySelector('[data-modelo-nome]');
const submitButton = document.querySelector('[data-modelo-submit]');
const cancelarButton = document.querySelector('[data-modelo-cancelar]');
const tbody = document.querySelector('[data-modelos-tbody]');
const pagination = document.querySelector('[data-modelos-pagination]');

let paginaAtual = 1;
let totalPaginas = 1;
let modelosPagina = [];

async function iniciarPagina() {
  try {
    const contexto = await verificarAutenticacao(['proprietario']);

    if (!contexto) {
      return;
    }

    configurarLayout(contexto.perfil);
    configurarEventos();
    await carregarMarcas();
    await carregarModelos();
  } catch (error) {
    await exibirErro('Não foi possível carregar modelos', normalizarMensagemErro(error));
  }
}

function configurarEventos() {
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await salvarModelo();
  });

  cancelarButton?.addEventListener('click', limparFormulario);

  tbody?.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-id]');
    const toggleButton = event.target.closest('[data-toggle-id]');

    if (editButton) {
      editarModelo(editButton.dataset.editId);
      return;
    }

    if (toggleButton) {
      await alternarStatusModelo(toggleButton.dataset.toggleId);
    }
  });

  pagination?.addEventListener('click', async (event) => {
    if (event.target.closest('[data-page-prev]') && paginaAtual > 1) {
      paginaAtual -= 1;
      await carregarModelos();
    }

    if (event.target.closest('[data-page-next]') && paginaAtual < totalPaginas) {
      paginaAtual += 1;
      await carregarModelos();
    }
  });
}

async function carregarMarcas() {
  const { data, error } = await supabase.from('marcas').select('id, nome').eq('ativo', true).order('nome');

  if (error) {
    throw error;
  }

  selectMarca.innerHTML = '<option value="">Selecione</option>';
  data.forEach((marca) => {
    selectMarca.insertAdjacentHTML('beforeend', `<option value="${marca.id}">${escaparHtml(marca.nome)}</option>`);
  });
}

async function salvarModelo() {
  const id = inputId.value;
  const marcaId = selectMarca.value;
  const nome = inputNome.value.trim();

  if (!marcaId || !nome) {
    await exibirAviso('Preencha os campos obrigatórios', 'Informe marca e nome do modelo.');
    return;
  }

  submitButton.disabled = true;
  submitButton.innerHTML = `${heroicon('save')}Salvando...`;

  try {
    const payload = { marca_id: marcaId, nome };
    const operacao = id
      ? supabase.from('modelos').update(payload).eq('id', id)
      : supabase.from('modelos').insert({ ...payload, ativo: true });
    const { error } = await operacao;

    if (error) {
      throw error;
    }

    limparFormulario();
    await exibirSucesso(id ? 'Modelo atualizado com sucesso' : 'Modelo salvo com sucesso');
    await carregarModelos();
  } catch (error) {
    await exibirErro('Não foi possível salvar o modelo', normalizarMensagemErro(error));
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = `${heroicon('save')}${inputId.value ? 'Atualizar' : 'Salvar'}`;
  }
}

async function carregarModelos() {
  const { inicio, fim } = calcularIntervaloPagina(paginaAtual);
  const { data, error, count } = await supabase
    .from('modelos')
    .select('id, marca_id, nome, ativo, marcas(nome)', { count: 'exact' })
    .order('nome', { ascending: true })
    .range(inicio, fim);

  if (error) {
    await exibirErro('Erro ao carregar modelos', normalizarMensagemErro(error));
    renderizarMensagemTabela(tbody, 'Não foi possível carregar os modelos.', 4);
    return;
  }

  totalPaginas = calcularTotalPaginas(count || 0);

  if (paginaAtual > totalPaginas) {
    paginaAtual = totalPaginas;
    await carregarModelos();
    return;
  }

  modelosPagina = data || [];
  renderizarModelos(modelosPagina);
  renderizarPaginacao(pagination, paginaAtual, totalPaginas, count || 0);
}

function renderizarModelos(modelos) {
  if (modelos.length === 0) {
    renderizarMensagemTabela(tbody, 'Nenhum modelo cadastrado.', 4);
    return;
  }

  tbody.innerHTML = modelos
    .map((modelo) => `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
        <td class="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">${escaparHtml(modelo.nome)}</td>
        <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${escaparHtml(modelo.marcas?.nome || '-')}</td>
        <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${modelo.ativo ? 'Ativo' : 'Inativo'}</td>
        <td class="px-4 py-4">
          <div class="flex justify-end gap-2">
            <button class="btn-secondary px-3 py-1.5" type="button" data-edit-id="${modelo.id}">${heroicon('edit', 'h-4 w-4')}Editar</button>
            <button class="${modelo.ativo ? 'btn-danger' : 'btn-primary'} px-3 py-1.5" type="button" data-toggle-id="${modelo.id}">${heroicon(modelo.ativo ? 'ban' : 'refresh', 'h-4 w-4')}${modelo.ativo ? 'Inativar' : 'Reativar'}</button>
          </div>
        </td>
      </tr>
    `)
    .join('');
}

function editarModelo(id) {
  const modelo = modelosPagina.find((item) => item.id === id);

  if (!modelo) {
    return;
  }

  inputId.value = modelo.id;
  selectMarca.value = modelo.marca_id;
  inputNome.value = modelo.nome;
  submitButton.innerHTML = `${heroicon('save')}Atualizar`;
  cancelarButton.classList.remove('hidden');
  inputNome.focus();
}

async function alternarStatusModelo(id) {
  const modelo = modelosPagina.find((item) => item.id === id);

  if (!modelo) {
    return;
  }

  const acao = modelo.ativo ? 'inativar' : 'reativar';
  const resultado = await confirmarAcao(`${acao[0].toUpperCase()}${acao.slice(1)} modelo?`, `O modelo ${modelo.nome} será ${modelo.ativo ? 'inativado' : 'reativado'}.`, acao);

  if (!resultado.isConfirmed) {
    return;
  }

  try {
    const { error } = await supabase.from('modelos').update({ ativo: !modelo.ativo }).eq('id', id);

    if (error) {
      throw error;
    }

    limparFormulario();
    await exibirSucesso(`Modelo ${modelo.ativo ? 'inativado' : 'reativado'} com sucesso`);
    await carregarModelos();
  } catch (error) {
    await exibirErro('Não foi possível alterar o modelo', normalizarMensagemErro(error));
  }
}

function limparFormulario() {
  form.reset();
  inputId.value = '';
  submitButton.innerHTML = `${heroicon('save')}Salvar`;
  cancelarButton.classList.add('hidden');
}

iniciarPagina();



