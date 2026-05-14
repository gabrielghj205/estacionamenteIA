import { heroicon } from '../ui/icons.js';

export const PAGE_SIZE = 10;

export function calcularIntervaloPagina(paginaAtual) {
  const inicio = (paginaAtual - 1) * PAGE_SIZE;
  const fim = inicio + PAGE_SIZE - 1;

  return { inicio, fim };
}

export function calcularTotalPaginas(totalRegistros) {
  return Math.max(Math.ceil(totalRegistros / PAGE_SIZE), 1);
}

export function escaparHtml(valor) {
  return String(valor ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function normalizarMensagemErro(error) {
  if (error?.code === '23505') {
    return 'Já existe um registro cadastrado com esses dados.';
  }

  if (error?.code === '42501') {
    return 'Permissão negada. Verifique os GRANTs e as policies RLS no Supabase.';
  }

  if (error?.message) {
    return error.message;
  }

  return 'Tente novamente em instantes.';
}

export function renderizarMensagemTabela(tbody, mensagem, colunas) {
  if (!tbody) {
    return;
  }

  tbody.innerHTML = `
    <tr>
      <td class="px-4 py-4 text-slate-500 dark:text-slate-300" colspan="${colunas}">${mensagem}</td>
    </tr>
  `;
}

export function renderizarPaginacao(container, paginaAtual, totalPaginas, totalRegistros) {
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
      <span>Página ${paginaAtual} de ${totalPaginas} · ${totalRegistros} registro(s)</span>
      <div class="flex gap-2">
        <button class="btn-secondary" type="button" data-page-prev ${paginaAtual <= 1 ? 'disabled' : ''}>${heroicon('chevronLeft')}Anterior</button>
        <button class="btn-secondary" type="button" data-page-next ${paginaAtual >= totalPaginas ? 'disabled' : ''}>${heroicon('chevronRight')}Próxima</button>
      </div>
    </div>
  `;
}


