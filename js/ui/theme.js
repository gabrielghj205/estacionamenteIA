const STORAGE_KEY = 'estacionamentos-tema';

export function aplicarTemaInicial() {
  const temaSalvo = localStorage.getItem(STORAGE_KEY);
  const prefereDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  document.documentElement.classList.toggle('dark', temaSalvo ? temaSalvo === 'dark' : prefereDark);
}

export function alternarTema() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
}

export function configurarBotaoTema() {
  const botaoTema = document.querySelector('[data-theme-toggle]');

  if (!botaoTema) {
    return;
  }

  botaoTema.addEventListener('click', alternarTema);
}

