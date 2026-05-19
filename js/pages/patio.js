import '../../css/styles.css';
import { supabase } from '../config/supabase.js';
import { alertaErro } from '../ui/alerts.js';
import { aplicarTemaSalvo, inicializarLayout } from '../ui/layout.js';
import { formatarDataHora, formatarStatus, normalizarPlaca } from '../utils/formatters.js';
import { intervaloPagina, renderizarPaginacao } from '../utils/pagination.js';

aplicarTemaSalvo();

let pagina = 1;
const tamanhoPagina = 10;

async function carregarPatio() {
  try {
    const { inicio, fim } = intervaloPagina(pagina, tamanhoPagina);
    const placa = normalizarPlaca(document.querySelector('#buscaPlaca').value || '');
    let query = supabase
      .from('movimentacoes')
      .select('id, data_hora_entrada, veiculos!inner(placa, tipo_cliente, marcas(nome), modelos(nome), clientes(nome))', { count: 'exact' })
      .eq('status', 'aberta')
      .order('data_hora_entrada', { ascending: true })
      .range(inicio, fim);

    if (placa) query = query.ilike('veiculos.placa', `%${placa}%`);

    const { data, count, error } = await query;
    if (error) throw error;

    document.querySelector('#tabelaPatio').innerHTML = data.length
      ? data.map((item) => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800">
          <td>${item.veiculos?.placa || '-'}</td>
          <td>${item.veiculos?.marcas?.nome || '-'}</td>
          <td>${item.veiculos?.modelos?.nome || '-'}</td>
          <td>${item.veiculos?.clientes?.nome || 'Avulso'}</td>
          <td>${formatarStatus(item.veiculos?.tipo_cliente)}</td>
          <td>${formatarDataHora(item.data_hora_entrada)}</td>
        </tr>`).join('')
      : '<tr><td colspan="6" class="text-center">Não há veículos no pátio para os filtros atuais.</td></tr>';

    renderizarPaginacao(document.querySelector('#paginacao'), {
      pagina,
      total: count,
      tamanhoPagina,
      aoMudar: (novaPagina) => {
        pagina = novaPagina;
        carregarPatio();
      }
    });
  } catch (erro) {
    await alertaErro('Erro ao carregar pátio', erro);
  }
}

const perfil = await inicializarLayout({ titulo: 'Pátio' });
if (perfil) {
  document.querySelector('#btnBuscar').addEventListener('click', () => {
    pagina = 1;
    carregarPatio();
  });
  await carregarPatio();
}
