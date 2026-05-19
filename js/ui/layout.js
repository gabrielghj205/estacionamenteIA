import { logout, verificarAutenticacao, getPerfilAtual } from '../services/auth.js';
import { alertaErro } from './alerts.js';
import { heroicon, renderHeroicons } from './icons.js';

const linksProprietario = [
  ['dashboard.html', 'home', 'Dashboard'],
  ['marcas.html', 'tag', 'Marcas'],
  ['modelos.html', 'tag', 'Modelos'],
  ['clientes.html', 'users', 'Clientes'],
  ['veiculos.html', 'truck', 'Veículos'],
  ['movimentacoes.html', 'plus', 'Movimentações'],
  ['patio.html', 'clock', 'Pátio'],
  ['historico.html', 'document', 'Histórico']
];

const linksCliente = [
  ['dashboard-cliente.html', 'home', 'Dashboard'],
  ['veiculos-cliente.html', 'truck', 'Meus veículos'],
  ['historico-cliente.html', 'document', 'Meu histórico']
];

function alternarTema() {
  const html = document.documentElement;
  const escuro = html.classList.toggle('dark');
  localStorage.setItem('tema', escuro ? 'dark' : 'light');
  renderHeroicons();
}

export async function inicializarLayout({ area = 'proprietario', titulo = 'Estacionamento' } = {}) {
  try {
    await verificarAutenticacao();
    const perfil = await getPerfilAtual();

    if (area === 'proprietario' && perfil.tipo_usuario !== 'proprietario') {
      window.location.href = '../cliente/dashboard-cliente.html';
      return null;
    }

    if (area === 'cliente' && perfil.tipo_usuario !== 'cliente') {
      window.location.href = '../pages/dashboard.html';
      return null;
    }

    const app = document.querySelector('#app');
    const conteudo = app.innerHTML;
    const links = area === 'cliente' ? linksCliente : linksProprietario;
    const prefixo = area === 'cliente' ? '' : '';
    const paginaAtual = window.location.pathname.split('/').pop();

    app.innerHTML = `
      <div class="min-h-screen lg:flex">
        <aside id="sidebar" class="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:block">
          <a href="${links[0][0]}" class="mb-8 flex items-center gap-3">
            <img src="../assets/logo.png" alt="Logo do sistema" class="h-10 w-10 rounded-lg object-contain">
            <div>
              <p class="text-sm font-bold text-slate-900 dark:text-white">Estacionamentos</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Controle didático</p>
            </div>
          </a>
          <nav class="space-y-1">
            ${links.map(([href, icon, label]) => `
              <a href="${prefixo}${href}" class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${paginaAtual === href ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}">
                ${heroicon(icon)}
                <span>${label}</span>
              </a>
            `).join('')}
          </nav>
        </aside>

        <div class="min-w-0 flex-1 lg:pl-64">
          <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
            <div class="flex items-center justify-between gap-4">
              <div>
                <h1 class="text-xl font-bold text-slate-900 dark:text-white">${titulo}</h1>
                <p class="text-sm text-slate-500 dark:text-slate-400">${perfil.nome} • ${perfil.tipo_usuario === 'proprietario' ? 'Proprietário' : 'Cliente mensalista'}</p>
              </div>
              <div class="flex items-center gap-2">
                <button id="btnTema" class="app-button-secondary px-3" type="button" aria-label="Alternar tema">
                  ${heroicon(document.documentElement.classList.contains('dark') ? 'sun' : 'moon')}
                </button>
                <button id="btnSair" class="app-button-secondary" type="button">
                  ${heroicon('arrowRightOnRectangle')}
                  Sair
                </button>
              </div>
            </div>
          </header>
          <main class="p-4 sm:p-6">
            ${conteudo}
          </main>
        </div>
      </div>
    `;

    document.querySelector('#btnTema').addEventListener('click', alternarTema);
    document.querySelector('#btnSair').addEventListener('click', async () => {
      try {
        await logout();
      } catch (erro) {
        await alertaErro('Erro ao sair', erro);
      }
    });

    renderHeroicons();
    return perfil;
  } catch (erro) {
    await alertaErro('Erro de autenticação', erro);
    window.location.href = '../login.html';
    return null;
  }
}

export function aplicarTemaSalvo() {
  const tema = localStorage.getItem('tema');
  if (tema === 'dark') document.documentElement.classList.add('dark');
}
