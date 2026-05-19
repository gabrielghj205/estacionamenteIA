import '../../css/styles.css';
import { supabase } from '../config/supabase.js';
import { alertaErro } from '../ui/alerts.js';
import { aplicarTemaSalvo, inicializarLayout } from '../ui/layout.js';
import { heroicon } from '../ui/icons.js';
import { fimDoDiaISO, formatarDataHora, formatarStatus, inicioDoDiaISO } from '../utils/formatters.js';

aplicarTemaSalvo();

async function contar(tabela, coluna, operador, valor, valorFinal = null) {
    let query = supabase.from(tabela).select('id', { count: 'exact', head: true });
    query = valorFinal ? query.gte(coluna, valor).lte(coluna, valorFinal) : query[operador](coluna, valor);
    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
}

function card(titulo, valor, icone, cor) {
    return `
    <article class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium text-slate-600 dark:text-slate-300">${titulo}</p>
        <span class="rounded-lg ${cor} p-2 text-white">${heroicon(icone)}</span>
      </div>
      <p class="mt-4 text-3xl font-bold text-slate-900 dark:text-white">${valor}</p>
    </article>
  `;
}

async function carregarDashboard() {
    try {
        const [noPatio, mensalistas, entradasHoje, saidasHoje] = await Promise.all([
            contar('movimentacoes', 'status', 'eq', 'aberta'),
            contar('clientes', 'ativo', 'eq', true),
            contar('movimentacoes', 'data_hora_entrada', 'gte', inicioDoDiaISO(), fimDoDiaISO()),
            contar('movimentacoes', 'data_hora_saida', 'gte', inicioDoDiaISO(), fimDoDiaISO())
        ]);

        document.querySelector('#cardsResumo').innerHTML = [
            card('Veículos no pátio', noPatio, 'truck', 'bg-primary'),
            card('Mensalistas ativos', mensalistas, 'users', 'bg-emerald-600'),
            card('Entradas hoje', entradasHoje, 'plus', 'bg-amber-500'),
            card('Saídas hoje', saidasHoje, 'arrowRight', 'bg-red-600')
        ].join('');

        const { data, error } = await supabase
            .from('movimentacoes')
            .select('id, data_hora_entrada, status, veiculos(placa, clientes(nome))')
            .order('data_hora_entrada', { ascending: false })
            .limit(5);

        if (error) throw error;

        document.querySelector('#tabelaRecentes').innerHTML = data.length ?
            data.map((item) => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800">
          <td>${item.veiculos?.placa || '-'}</td>
          <td>${item.veiculos?.clientes?.nome || 'Avulso'}</td>
          <td>${formatarDataHora(item.data_hora_entrada)}</td>
          <td><span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold dark:bg-slate-800">${formatarStatus(item.status)}</span></td>
        </tr>`).join('') :
            '<tr><td colspan="4" class="text-center">Não há movimentações recentes.</td></tr>';
    } catch (erro) {
        await alertaErro('Erro ao carregar dashboard', erro);
    }
}

const perfil = await inicializarLayout({ titulo: 'Dashboard' });
if (perfil) await carregarDashboard();