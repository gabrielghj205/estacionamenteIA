import { heroicon } from '../ui/icons.js';

export function intervaloPagina(pagina, tamanhoPagina) {
  const inicio = (pagina - 1) * tamanhoPagina;
  return { inicio, fim: inicio + tamanhoPagina - 1 };
}

export function totalPaginas(total, tamanhoPagina) {
  return Math.max(1, Math.ceil((total || 0) / tamanhoPagina));
}

export function renderizarPaginacao(container, { pagina, total, tamanhoPagina, aoMudar }) {
  const paginas = totalPaginas(total, tamanhoPagina);
  container.innerHTML = `
    <div class="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row">
      <p class="text-sm text-slate-600 dark:text-slate-300">Página ${pagina} de ${paginas} • ${total || 0} registro(s)</p>
      <div class="flex gap-2">
        <button class="app-button-secondary" data-page="prev" type="button" ${pagina <= 1 ? 'disabled' : ''}>
          ${heroicon('arrowLeft')} Anterior
        </button>
        <button class="app-button-secondary" data-page="next" type="button" ${pagina >= paginas ? 'disabled' : ''}>
          Próxima ${heroicon('arrowRight')}
        </button>
      </div>
    </div>
  `;

  container.querySelector('[data-page="prev"]')?.addEventListener('click', () => aoMudar(pagina - 1));
  container.querySelector('[data-page="next"]')?.addEventListener('click', () => aoMudar(pagina + 1));
}
