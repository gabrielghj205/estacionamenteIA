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

const form = document.querySelector('[data-clientes-form]');
const inputId = document.querySelector('[data-cliente-id]');
const inputNome = document.querySelector('[data-cliente-nome]');
const inputTelefone = document.querySelector('[data-cliente-telefone]');
const inputEmail = document.querySelector('[data-cliente-email]');
const submitButton = document.querySelector('[data-cliente-submit]');
const cancelarButton = document.querySelector('[data-cliente-cancelar]');
const tbody = document.querySelector('[data-clientes-tbody]');
const pagination = document.querySelector('[data-clientes-pagination]');

let paginaAtual = 1;
let totalPaginas = 1;
let clientesPagina = [];

async function iniciarPagina() {
  try {
    const contexto = await verificarAutenticacao(['proprietario']);

    if (!contexto) {
      return;
    }

    configurarLayout(contexto.perfil);
    configurarEventos();
    await carregarClientes();
  } catch (error) {
    await exibirErro('Não foi possível carregar clientes', normalizarMensagemErro(error));
  }
}

function configurarEventos() {
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await salvarCliente();
  });

  cancelarButton?.addEventListener('click', limparFormulario);

  tbody?.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-id]');
    const toggleButton = event.target.closest('[data-toggle-id]');

    if (editButton) {
      editarCliente(editButton.dataset.editId);
      return;
    }

    if (toggleButton) {
      await alternarStatusCliente(toggleButton.dataset.toggleId);
    }
  });

  pagination?.addEventListener('click', async (event) => {
    if (event.target.closest('[data-page-prev]') && paginaAtual > 1) {
      paginaAtual -= 1;
      await carregarClientes();
    }

    if (event.target.closest('[data-page-next]') && paginaAtual < totalPaginas) {
      paginaAtual += 1;
      await carregarClientes();
    }
  });
}

async function salvarCliente() {
  const id = inputId.value;
  const nome = inputNome.value.trim();
  const telefone = inputTelefone.value.trim();
  const email = inputEmail.value.trim();

  if (!nome || !email) {
    await exibirAviso('Preencha os campos obrigatórios', 'Informe nome e e-mail do cliente.');
    return;
  }

  submitButton.disabled = true;
  submitButton.innerHTML = `${heroicon('save')}Salvando...`;

  try {
    const payload = { nome, telefone: telefone || null, email };
    const operacao = id
      ? supabase.from('clientes').update(payload).eq('id', id)
      : supabase.from('clientes').insert({ ...payload, ativo: true });
    const { error } = await operacao;

    if (error) {
      throw error;
    }

    limparFormulario();
    await exibirSucesso(id ? 'Cliente atualizado com sucesso' : 'Cliente salvo com sucesso');
    await carregarClientes();
  } catch (error) {
    await exibirErro('Não foi possível salvar o cliente', normalizarMensagemErro(error));
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = `${heroicon('save')}${inputId.value ? 'Atualizar' : 'Salvar'}`;
  }
}

async function carregarClientes() {
  const { inicio, fim } = calcularIntervaloPagina(paginaAtual);
  const { data, error, count } = await supabase
    .from('clientes')
    .select('id, nome, telefone, email, ativo', { count: 'exact' })
    .order('nome', { ascending: true })
    .range(inicio, fim);

  if (error) {
    await exibirErro('Erro ao carregar clientes', normalizarMensagemErro(error));
    renderizarMensagemTabela(tbody, 'Não foi possível carregar os clientes.', 5);
    return;
  }

  totalPaginas = calcularTotalPaginas(count || 0);

  if (paginaAtual > totalPaginas) {
    paginaAtual = totalPaginas;
    await carregarClientes();
    return;
  }

  clientesPagina = data || [];
  renderizarClientes(clientesPagina);
  renderizarPaginacao(pagination, paginaAtual, totalPaginas, count || 0);
}

function renderizarClientes(clientes) {
  if (clientes.length === 0) {
    renderizarMensagemTabela(tbody, 'Nenhum cliente cadastrado.', 5);
    return;
  }

  tbody.innerHTML = clientes
    .map((cliente) => `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
        <td class="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">${escaparHtml(cliente.nome)}</td>
        <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${escaparHtml(cliente.email)}</td>
        <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${escaparHtml(cliente.telefone || '-')}</td>
        <td class="px-4 py-4 text-slate-600 dark:text-slate-300">${cliente.ativo ? 'Ativo' : 'Inativo'}</td>
        <td class="px-4 py-4">
          <div class="flex justify-end gap-2">
            <button class="btn-secondary px-3 py-1.5" type="button" data-edit-id="${cliente.id}">${heroicon('edit', 'h-4 w-4')}Editar</button>
            <button class="${cliente.ativo ? 'btn-danger' : 'btn-primary'} px-3 py-1.5" type="button" data-toggle-id="${cliente.id}">${heroicon(cliente.ativo ? 'ban' : 'refresh', 'h-4 w-4')}${cliente.ativo ? 'Inativar' : 'Reativar'}</button>
          </div>
        </td>
      </tr>
    `)
    .join('');
}

function editarCliente(id) {
  const cliente = clientesPagina.find((item) => item.id === id);

  if (!cliente) {
    return;
  }

  inputId.value = cliente.id;
  inputNome.value = cliente.nome;
  inputTelefone.value = cliente.telefone || '';
  inputEmail.value = cliente.email;
  submitButton.innerHTML = `${heroicon('save')}Atualizar`;
  cancelarButton.classList.remove('hidden');
  inputNome.focus();
}

async function alternarStatusCliente(id) {
  const cliente = clientesPagina.find((item) => item.id === id);

  if (!cliente) {
    return;
  }

  const acao = cliente.ativo ? 'inativar' : 'reativar';
  const resultado = await confirmarAcao(`${acao[0].toUpperCase()}${acao.slice(1)} cliente?`, `O cliente ${cliente.nome} será ${cliente.ativo ? 'inativado' : 'reativado'}.`, acao);

  if (!resultado.isConfirmed) {
    return;
  }

  try {
    const { error } = await supabase.from('clientes').update({ ativo: !cliente.ativo }).eq('id', id);

    if (error) {
      throw error;
    }

    limparFormulario();
    await exibirSucesso(`Cliente ${cliente.ativo ? 'inativado' : 'reativado'} com sucesso`);
    await carregarClientes();
  } catch (error) {
    await exibirErro('Não foi possível alterar o cliente', normalizarMensagemErro(error));
  }
}

function limparFormulario() {
  form.reset();
  inputId.value = '';
  submitButton.innerHTML = `${heroicon('save')}Salvar`;
  cancelarButton.classList.add('hidden');
}

iniciarPagina();



