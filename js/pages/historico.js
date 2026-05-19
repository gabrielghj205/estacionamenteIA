import '../../css/styles.css';
import { supabase } from '../config/supabase.js';
import { alertaErro } from '../ui/alerts.js';
import { aplicarTemaSalvo, inicializarLayout } from '../ui/layout.js';
import { formatarDataHora, formatarMoeda, formatarStatus, normalizarPlaca } from '../utils/formatters.js';
import { intervaloPagina, renderizarPaginacao } from '../utils/pagination.js';

aplicarTemaSalvo();

let pagina = 1;
const tamanhoPagina = 10;

async function carregarHistorico() {
    try {
        const { inicio, fim } = intervaloPagina(pagina, tamanhoPagina);
        const placa = normalizarPlaca(document.querySelector('#placa').value || '');
        const dataInicio = document.querySelector('#inicio').value;
        const dataFim = document.querySelector('#fim').value;
        const status = document.querySelector('#status').value;

        let query = supabase
            .from('movimentacoes')
            .select('id, data_hora_entrada, data_hora_saida, valor_cobrado, status, veiculos!inner(placa, clientes(nome))', { count: 'exact' })
            .order('data_hora_entrada', { ascending: false })
            .range(inicio, fim);

        if (placa) query = query.ilike('veiculos.placa', `%${placa}%`);
        if (dataInicio) query = query.gte('data_hora_entrada', `${dataInicio}T00:00:00`);
        if (dataFim) query = query.lte('data_hora_entrada', `${dataFim}T23:59:59`);
        if (status) query = query.eq('status', status);

        const { data, count, error } = await query;
        if (error) throw error;

        document.querySelector('#tabelaHistorico').innerHTML = data.length ?
            data.map((item) => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800">
          <td>${item.veiculos?.placa || '-'}</td>
          <td>${item.veiculos?.clientes?.nome || 'Avulso'}</td>
          <td>${formatarDataHora(item.data_hora_entrada)}</td>
          <td>${formatarDataHora(item.data_hora_saida)}</td>
          <td>${formatarMoeda(item.valor_cobrado)}</td>
          <td>${formatarStatus(item.status)}</td>
        </tr>`).join('') :
            '<tr><td colspan="6" class="text-center">Não há movimentações para os filtros atuais.</td></tr>';

        renderizarPaginacao(document.querySelector('#paginacao'), {
            pagina,
            total: count,
            tamanhoPagina,
            aoMudar: (novaPagina) => {
                pagina = novaPagina;
                carregarHistorico();
            }
        });
    } catch (erro) {
        await alertaErro('Erro ao carregar histórico', erro);
    }
}

const perfil = await inicializarLayout({ titulo: 'Histórico' });
if (perfil) {
    document.querySelector('#formFiltros').addEventListener('submit', (evento) => {
        evento.preventDefault();
        pagina = 1;
        carregarHistorico();
    });
    await carregarHistorico();
}