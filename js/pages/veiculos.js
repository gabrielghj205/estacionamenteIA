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

const form = document.querySelector('[data-veiculos-form]');
const inputId = document.querySelector('[data-veiculo-id]');
const inputPlaca = document.querySelector('[data-veiculo-placa]');
const inputCor = document.querySelector('[data-veiculo-cor]');
const selectMarca = document.querySelector('[data-veiculo-marca]');
const selectModelo = document.querySelector('[data-veiculo-modelo]');
const selectTipo = document.querySelector('[data-veiculo-tipo]');
const selectCliente = document.querySelector('[data-veiculo-cliente]');
const submitButton = document.querySelector('[data-veiculo-submit]');
const cancelarButton = document.querySelector('[data-veiculo-cancelar]');
const tbody = document.querySelector('[data-veiculos-tbody]');
const pagination = document.querySelector('[data-veiculos-pagination]');

let paginaAtual = 1;
let totalPaginas = 1;
let veiculosPagina = [];
let modelos = [];

async function iniciarPagina() {
  try {
    const contexto = await verificarAutenticacao(['proprietario']);

    if (!contexto) {
      return;
    }

    configurarLayout(contexto.perfil);
    configurarEventos();
    await carregarOpcoes();
    await carregarVeiculos();
  } catch (error) {
    await exibirErro('Não foi possível carregar veículos', normalizarMensagemErro(error));
  }
}

function configurarEventos() {
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await salvarVeiculo();
  });

  cancelarButton?.addEventListener('click', limparFormulario);

  selectMarca?.addEventListener('change', () => preencherModelos(selectMarca.value));

  selectTipo?.addEventListener('change', () => {
    if (selectTipo.value === 'avulso') {
      selectCliente.value = '';
    }
  });

  tbody?.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-id]');
    const toggleButton = event.target.closest('[data-toggle-id]');

    if (editButton) {
      editarVeiculo(editButton.dataset.editId);
      return;
    }

    if (toggleButton) {
      await alternarStatusVeiculo(toggleButton.dataset.toggleId);
    }
  });

  pagination?.addEventListener('click', async (event) => {
    if (event.target.closest('[data-page-prev]') && paginaAtual > 1) {
      paginaAtual -= 1;
      await carregarVeiculos();
    }

    if (event.target.closest('[data-page-next]') && paginaAtual < totalPaginas) {
      paginaAtual += 1;
      await carregarVeiculos();
    }
  });
}

async function carregarOpcoes() {
  const [marcasResult, modelosResult, clientesResult] = await Promise.all([
    supabase.from('marcas').select('id, nome').eq('ativo', true).order('nome'),
    supabase.from('modelos').select('id, marca_id, nome').eq('ativo', true).order('nome'),
    supabase.from('clientes').select('id, nome').eq('ativo', true).order('nome'),
  ]);

  if (marcasResult.error) throw marcasResult.error;
  if (modelosResult.error) throw modelosResult.error;
  if (clientesResult.error) throw clientesResult.error;

  modelos = modelosResult.data || [];

  selectMarca.innerHTML = '<option value="">Selecione</option>';
  marcasResult.data.forEach((marca) => {
    selectMarca.insertAdjacentHTML('beforeend', `<option value="${marca.id}">${escaparHtml(marca.nome)}</option>`);
  });

  selectCliente.innerHTML = '<option value="">Sem vínculo</option>';
  clientesResult.data.forEach((cliente) => {
    selectCliente.insertAdjacentHTML('beforeend', `<option value="${cliente.id}">${escaparHtml(cliente.nome)}</option>`);
  });

  preencherModelos('');
}

function preencherModelos(marcaId, modeloSelecionado = '') {
  selectModelo.innerHTML = '<option value="">Selecione</option>';

  modelos
    .filter((modelo) => !marcaId || modelo.marca_id === marcaId)
    .forEach((modelo) => {
      selectModelo.insertAdjacentHTML('beforeend', `<option value="${modelo.id}">${escaparHtml(modelo.nome)}</option>`);
    });

  selectModelo.value = modeloSelecionado;
}

async function salvarVeiculo() {
  const id = inputId.value;
  const placa = inputPlaca.value.trim().toUpperCase();
  const cor = inputCor.value.trim();
  const marcaId = selectMarca.value;
  const modeloId = selectModelo.value;
  const tipoCliente = selectTipo.value;
  const clienteId = tipoCliente === 'mensalista' ? selectCliente.value : '';

  if (!placa || !marcaId || !modeloId || !tipoCliente) {
    await exibirAviso('Preencha os campos obrigatórios', 'Informe placa, marca, modelo e tipo.');
    return;
  }

  if (tipoCliente === 'mensalista' && !clienteId) {
    await exibirAviso('Selecione o cliente', 'Veículos mensalistas precisam estar vinculados a um cliente.');
    return;
  }

  submitButton.disabled = true;
  submitButton.innerHTML = `${heroicon('save')}Salvando...`;

  try {
    const payload = {
      placa,
      cor: cor || null,
      marca_id: marcaId,
      modelo_id: modeloId,
      tipo_cliente: tipoCliente,
      cliente_id: clienteId || null,
    };
    const operacao = id
      ? supabase.from('veiculos').update(payload).eq('id', id)
      : supabase.from('veiculos').insert({ ...payload, ativo: true });
    const { error } = await operacao;

    if (error) {
      throw error;
    }

    limparFormulario();
    await exibirSucesso(id ? 'Veículo atualizado com sucesso' : 'Veículo salvo com sucesso');
    await carregarVeiculos();
  } catch (error) {
    await exibirErro('Não foi possível salvar o veículo', normalizarMensagemErro(error));
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = `${heroicon('save')}${inputId.value ? 'Atualizar' : 'Salvar'}`;
  }
}

async function carregarVeiculos() {
  const { inicio, fim } = calcularIntervaloPagina(paginaAtual);
  const { data, error, count } = await supabase
    .from('veiculos')
    .select('id, cliente_id, marca_id, modelo_id, placa, cor, tipo_cliente, ativo, marcas(nome), modelos(nome), clientes(nome)', { count: 'exact' })
    .order('placa', { ascending: true })
    .range(inicio, fim);

  if (error) {
    await exibirErro('Erro ao carregar veículos', normalizarMensagemErro(error));
    renderizarMensagemTabela(tbody, 'Não foi possível carregar os veículos.', 6);
    return;
  }

  totalPaginas = calcularTotalPaginas(count || 0);

  if (paginaAtual > totalPaginas) {
    paginaAtual = totalPaginas;
    await carregarVeiculos();
    return;
  }

  veiculosPagina = data || [];
  renderizarVeiculos(veiculosPagina);
  renderizarPaginacao(pagination, paginaAtual, totalPaginas, count || 0);
}

function renderizarVeiculos(veiculos) {
  if (veiculos.length === 0) {
    renderizarMensagemTabela(tbody, 'Nenhum veículo cadastrado.', 6);
    return;
  }

  tbody.innerHTML = veiculos
    .map((veiculo) => {
      const nomeVeiculo = `${veiculo.marcas?.nome || '-'} ${veiculo.modelos?.nome || ''}`.trim();

      return `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <td class="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">${escaparHtml(veiculo.placa)}</td>
          <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${escaparHtml(nomeVeiculo)}</td>
          <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${escaparHtml(veiculo.clientes?.nome || '-')}</td>
          <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${veiculo.tipo_cliente === 'mensalista' ? 'Mensalista' : 'Avulso'}</td>
          <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${veiculo.ativo ? 'Ativo' : 'Inativo'}</td>
          <td class="px-4 py-4">
            <div class="flex justify-end gap-2">
              <button class="btn-secondary px-3 py-1.5" type="button" data-edit-id="${veiculo.id}">${heroicon('edit', 'h-4 w-4')}Editar</button>
              <button class="${veiculo.ativo ? 'btn-danger' : 'btn-primary'} px-3 py-1.5" type="button" data-toggle-id="${veiculo.id}">${heroicon(veiculo.ativo ? 'ban' : 'refresh', 'h-4 w-4')}${veiculo.ativo ? 'Inativar' : 'Reativar'}</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');
}

function editarVeiculo(id) {
  const veiculo = veiculosPagina.find((item) => item.id === id);

  if (!veiculo) {
    return;
  }

  inputId.value = veiculo.id;
  inputPlaca.value = veiculo.placa;
  inputCor.value = veiculo.cor || '';
  selectMarca.value = veiculo.marca_id || '';
  preencherModelos(veiculo.marca_id || '', veiculo.modelo_id || '');
  selectTipo.value = veiculo.tipo_cliente;
  selectCliente.value = veiculo.cliente_id || '';
  submitButton.innerHTML = `${heroicon('save')}Atualizar`;
  cancelarButton.classList.remove('hidden');
  inputPlaca.focus();
}

async function alternarStatusVeiculo(id) {
  const veiculo = veiculosPagina.find((item) => item.id === id);

  if (!veiculo) {
    return;
  }

  const acao = veiculo.ativo ? 'inativar' : 'reativar';
  const resultado = await confirmarAcao(`${acao[0].toUpperCase()}${acao.slice(1)} veículo?`, `O veículo ${veiculo.placa} será ${veiculo.ativo ? 'inativado' : 'reativado'}.`, acao);

  if (!resultado.isConfirmed) {
    return;
  }

  try {
    const { error } = await supabase.from('veiculos').update({ ativo: !veiculo.ativo }).eq('id', id);

    if (error) {
      throw error;
    }

    limparFormulario();
    await exibirSucesso(`Veículo ${veiculo.ativo ? 'inativado' : 'reativado'} com sucesso`);
    await carregarVeiculos();
  } catch (error) {
    await exibirErro('Não foi possível alterar o veículo', normalizarMensagemErro(error));
  }
}

function limparFormulario() {
  form.reset();
  inputId.value = '';
  preencherModelos('');
  submitButton.innerHTML = `${heroicon('save')}Salvar`;
  cancelarButton.classList.add('hidden');
}

iniciarPagina();



