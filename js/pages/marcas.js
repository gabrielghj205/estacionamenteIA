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

const form = document.querySelector('[data-marcas-form]');
const inputId = document.querySelector('[data-marca-id]');
const inputNome = document.querySelector('[data-marca-nome]');
const submitButton = document.querySelector('[data-marca-submit]');
const cancelarButton = document.querySelector('[data-marca-cancelar]');
const tbody = document.querySelector('[data-marcas-tbody]');
const pagination = document.querySelector('[data-marcas-pagination]');

let paginaAtual = 1;
let totalPaginas = 1;
let marcasPagina = [];

async function iniciarPagina() {
  try {
    const contexto = await verificarAutenticacao(['proprietario']);

    if (!contexto) {
      return;
    }

    configurarLayout(contexto.perfil);
    configurarFormulario();
    await carregarMarcas();
  } catch (error) {
    await exibirErro('Não foi possível carregar marcas', error.message);
  }
}

function configurarFormulario() {
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await salvarMarca();
  });

  cancelarButton?.addEventListener('click', limparFormulario);

  tbody?.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-id]');
    const toggleButton = event.target.closest('[data-toggle-id]');

    if (editButton) {
      editarMarca(editButton.dataset.editId);
      return;
    }

    if (toggleButton) {
      await alternarStatusMarca(toggleButton.dataset.toggleId);
    }
  });

  pagination?.addEventListener('click', async (event) => {
    if (event.target.closest('[data-page-prev]') && paginaAtual > 1) {
      paginaAtual -= 1;
      await carregarMarcas();
    }

    if (event.target.closest('[data-page-next]') && paginaAtual < totalPaginas) {
      paginaAtual += 1;
      await carregarMarcas();
    }
  });
}

async function salvarMarca() {
  const nome = inputNome.value.trim();
  const id = inputId.value;

  if (!nome) {
    await exibirAviso('Informe o nome da marca', 'O campo nome é obrigatório.');
    inputNome.focus();
    return;
  }

  submitButton.disabled = true;
  submitButton.innerHTML = `${heroicon('save')}Salvando...`;

  try {
    const payload = { nome };
    const operacao = id
      ? supabase.from('marcas').update(payload).eq('id', id)
      : supabase.from('marcas').insert({ ...payload, ativo: true });

    const { error } = await operacao;

    if (error) {
      throw error;
    }

    limparFormulario();
    await exibirSucesso(id ? 'Marca atualizada com sucesso' : 'Marca salva com sucesso');
    await carregarMarcas();
  } catch (error) {
    await exibirErro('Não foi possível salvar a marca', normalizarMensagemErro(error));
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = `${heroicon('save')}Salvar`;
  }
}

async function carregarMarcas() {
  try {
    const { inicio, fim } = calcularIntervaloPagina(paginaAtual);
    const { data, error, count } = await supabase
      .from('marcas')
      .select('id, nome, ativo', { count: 'exact' })
      .order('nome', { ascending: true })
      .range(inicio, fim);

    if (error) {
      throw error;
    }

    totalPaginas = calcularTotalPaginas(count || 0);

    if (paginaAtual > totalPaginas) {
      paginaAtual = totalPaginas;
      await carregarMarcas();
      return;
    }

    marcasPagina = data || [];
    renderizarMarcas(data || []);
    renderizarPaginacao(pagination, paginaAtual, totalPaginas, count || 0);
  } catch (error) {
    renderizarMensagemTabela(tbody, 'Não foi possível carregar as marcas.', 3);
    await exibirErro('Erro ao carregar marcas', normalizarMensagemErro(error));
  }
}

function renderizarMarcas(marcas) {
  if (!tbody) {
    return;
  }

  if (marcas.length === 0) {
    renderizarMensagemTabela(tbody, 'Nenhuma marca cadastrada.', 3);
    return;
  }

  tbody.innerHTML = marcas
    .map((marca) => {
      const situacao = marca.ativo ? 'Ativa' : 'Inativa';

      return `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <td class="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">${escaparHtml(marca.nome)}</td>
          <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${situacao}</td>
          <td class="px-4 py-4">
            <div class="flex justify-end gap-2">
              <button class="btn-secondary px-3 py-1.5" type="button" data-edit-id="${marca.id}">${heroicon('edit', 'h-4 w-4')}Editar</button>
              <button class="${marca.ativo ? 'btn-danger' : 'btn-primary'} px-3 py-1.5" type="button" data-toggle-id="${marca.id}">
                ${heroicon(marca.ativo ? 'ban' : 'refresh', 'h-4 w-4')}${marca.ativo ? 'Inativar' : 'Reativar'}
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function editarMarca(id) {
  const marca = marcasPagina.find((item) => item.id === id);

  if (!marca) {
    return;
  }

  inputId.value = marca.id;
  inputNome.value = marca.nome;
  submitButton.innerHTML = `${heroicon('save')}Atualizar`;
  cancelarButton.classList.remove('hidden');
  inputNome.focus();
}

async function alternarStatusMarca(id) {
  const marca = marcasPagina.find((item) => item.id === id);

  if (!marca) {
    return;
  }

  const acao = marca.ativo ? 'inativar' : 'reativar';
  const resultado = await confirmarAcao(`${acao[0].toUpperCase()}${acao.slice(1)} marca?`, `A marca ${marca.nome} será ${marca.ativo ? 'inativada' : 'reativada'}.`, acao);

  if (!resultado.isConfirmed) {
    return;
  }

  try {
    const { error } = await supabase.from('marcas').update({ ativo: !marca.ativo }).eq('id', id);

    if (error) {
      throw error;
    }

    limparFormulario();
    await exibirSucesso(`Marca ${marca.ativo ? 'inativada' : 'reativada'} com sucesso`);
    await carregarMarcas();
  } catch (error) {
    await exibirErro('Não foi possível alterar a marca', normalizarMensagemErro(error));
  }
}

function limparFormulario() {
  form.reset();
  inputId.value = '';
  submitButton.innerHTML = `${heroicon('save')}Salvar`;
  cancelarButton.classList.add('hidden');
}

iniciarPagina();



