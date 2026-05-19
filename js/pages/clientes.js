import '../../css/styles.css';
import { supabase } from '../config/supabase.js';
import { alertaAviso, alertaErro, confirmar, toastSucesso } from '../ui/alerts.js';
import { aplicarTemaSalvo, inicializarLayout } from '../ui/layout.js';
import { heroicon } from '../ui/icons.js';
import { intervaloPagina, renderizarPaginacao } from '../utils/pagination.js';

aplicarTemaSalvo();
let pagina = 1;
const tamanhoPagina = 10;

async function carregar() {
  try {
    const { inicio, fim } = intervaloPagina(pagina, tamanhoPagina);
    const { data, count, error } = await supabase.from('clientes').select('id, user_id, nome, telefone, email, ativo', { count: 'exact' }).order('nome').range(inicio, fim);
    if (error) throw error;
    document.querySelector('#tabela').innerHTML = data.length ? data.map((cliente) => `
      <tr><td>${cliente.nome}</td><td>${cliente.email}</td><td>${cliente.telefone || '-'}</td><td>${cliente.ativo ? 'Ativo' : 'Inativo'}</td><td class="flex gap-2"><button class="app-button-secondary" data-editar="${cliente.id}">${heroicon('pencil')}Editar</button><button class="${cliente.ativo ? 'app-button-danger' : 'app-button-primary'}" data-status="${cliente.id}" data-ativo="${cliente.ativo}">${cliente.ativo ? heroicon('trash') + 'Inativar' : heroicon('plus') + 'Reativar'}</button></td></tr>
    `).join('') : '<tr><td colspan="5" class="text-center">Não há clientes cadastrados.</td></tr>';
    document.querySelectorAll('[data-editar]').forEach((botao) => botao.addEventListener('click', () => {
      const cliente = data.find((item) => String(item.id) === botao.dataset.editar);
      document.querySelector('#registroId').value = cliente.id;
      document.querySelector('#nome').value = cliente.nome;
      document.querySelector('#email').value = cliente.email;
      document.querySelector('#telefone').value = cliente.telefone || '';
      document.querySelector('#user_id').value = cliente.user_id || '';
    }));
    document.querySelectorAll('[data-status]').forEach((botao) => botao.addEventListener('click', () => alterarStatus(botao.dataset.status, botao.dataset.ativo === 'true')));
    renderizarPaginacao(document.querySelector('#paginacao'), { pagina, total: count, tamanhoPagina, aoMudar: (p) => { pagina = p; carregar(); } });
  } catch (erro) {
    await alertaErro('Erro ao carregar clientes', erro);
  }
}

async function alterarStatus(id, ativo) {
  try {
    const resposta = await confirmar(ativo ? 'Inativar cliente' : 'Reativar cliente', 'Deseja alterar a situação deste cliente?', ativo ? 'Inativar' : 'Reativar');
    if (!resposta.isConfirmed) return;
    const { error } = await supabase.from('clientes').update({ ativo: !ativo }).eq('id', id);
    if (error) throw error;
    await toastSucesso('Cliente atualizado');
    await carregar();
  } catch (erro) {
    await alertaErro('Erro ao atualizar cliente', erro);
  }
}

async function salvar(evento) {
  evento.preventDefault();
  const id = document.querySelector('#registroId').value;
  const payload = {
    nome: document.querySelector('#nome').value.trim(),
    email: document.querySelector('#email').value.trim(),
    telefone: document.querySelector('#telefone').value.trim() || null,
    user_id: document.querySelector('#user_id').value.trim() || null,
    ativo: true
  };
  if (!payload.nome || !payload.email) return alertaAviso('Campos obrigatórios', 'Informe nome e e-mail do cliente.');
  try {
    const resposta = await confirmar('Salvar cliente', `Deseja salvar ${payload.nome}?`, 'Salvar');
    if (!resposta.isConfirmed) return;
    const operacao = id ? supabase.from('clientes').update(payload).eq('id', id) : supabase.from('clientes').insert(payload);
    const { error } = await operacao;
    if (error) throw error;
    evento.currentTarget.reset();
    document.querySelector('#registroId').value = '';
    await toastSucesso('Cliente salvo');
    await carregar();
  } catch (erro) {
    await alertaErro('Erro ao salvar cliente', erro);
  }
}

const perfil = await inicializarLayout({ titulo: 'Clientes' });
if (perfil) {
  document.querySelector('#formCadastro').addEventListener('submit', salvar);
  await carregar();
}
