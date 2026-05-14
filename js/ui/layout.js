import { logout } from '../services/auth.js';
import { exibirErro, confirmarAcao } from './alerts.js';
import { configurarBotaoTema } from './theme.js';
import { renderHeroicons } from './icons.js';

export function preencherCabecalho(perfil) {
  const nomeUsuario = document.querySelector('[data-user-name]');
  const tipoUsuario = document.querySelector('[data-user-role]');

  if (nomeUsuario) {
    nomeUsuario.textContent = perfil.nome;
  }

  if (tipoUsuario) {
    tipoUsuario.textContent = perfil.tipo_usuario === 'proprietario' ? 'Proprietário' : 'Cliente mensalista';
  }
}

export function marcarNavegacaoAtiva() {
  const caminhoAtual = window.location.pathname.split('/').pop();

  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const href = link.getAttribute('href');
    const isActive = href && href.endsWith(caminhoAtual);
    link.classList.toggle('nav-link-active', Boolean(isActive));
  });
}

export function configurarMenuMobile() {
  const botao = document.querySelector('[data-menu-toggle]');
  const sidebar = document.querySelector('[data-sidebar]');

  if (!botao || !sidebar) {
    return;
  }

  botao.addEventListener('click', () => {
    sidebar.classList.toggle('-translate-x-full');
  });
}

export function configurarLogout() {
  const botaoLogout = document.querySelector('[data-logout]');

  if (!botaoLogout) {
    return;
  }

  botaoLogout.addEventListener('click', async () => {
    const resultado = await confirmarAcao('Sair do sistema?', 'Sua sessão será encerrada.', 'Sair');

    if (!resultado.isConfirmed) {
      return;
    }

    try {
      await logout();
      window.location.href = getCaminhoLogin();
    } catch (error) {
      exibirErro('Não foi possível sair', error.message);
    }
  });
}

export function configurarLayout(perfil) {
  preencherCabecalho(perfil);
  marcarNavegacaoAtiva();
  configurarMenuMobile();
  configurarBotaoTema();
  configurarLogout();
  renderHeroicons();
}

function getCaminhoLogin() {
  const caminho = window.location.pathname;
  const estaEmSubpasta = caminho.includes('/pages/') || caminho.includes('/cliente/');

  return estaEmSubpasta ? '../login.html' : 'login.html';
}


