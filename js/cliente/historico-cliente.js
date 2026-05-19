import '../../css/styles.css';
import { supabase } from '../config/supabase.js';
import { alertaErro } from '../ui/alerts.js';
import { aplicarTemaSalvo, inicializarLayout } from '../ui/layout.js';
import { formatarDataHora, formatarMoeda, formatarStatus } from '../utils/formatters.js';

aplicarTemaSalvo();

async function carregar(perfil) {
  try {
    const { data: cliente, error: erroCliente } = await supabase.from('clientes').select('id').eq('user_id', perfil.user_id).single();
    if (erroCliente) throw erroCliente;
    const { data: veiculos, error: erroVeiculos } = await supabase.from('veiculos').select('id').eq('cliente_id', cliente.id);
    if (erroVeiculos) throw erroVeiculos;
    const ids = veiculos.map((veiculo) => veiculo.id);

    const { data, error } = ids.length
      ? await supabase.from('movimentacoes').select('data_hora_entrada, data_hora_saida, valor_cobrado, status, veiculos(placa)').in('veiculo_id', ids).order('data_hora_entrada', { ascending: false })
      : { data: [], error: null };
    if (error) throw error;

    document.querySelector('#tabela').innerHTML = data.length ? data.map((item) => `
      <tr><td>${item.veiculos?.placa || '-'}</td><td>${formatarDataHora(item.data_hora_entrada)}</td><td>${formatarDataHora(item.data_hora_saida)}</td><td>${formatarMoeda(item.valor_cobrado)}</td><td>${formatarStatus(item.status)}</td></tr>
    `).join('') : '<tr><td colspan="5" class="text-center">Você ainda não possui histórico de movimentações.</td></tr>';
  } catch (erro) {
    await alertaErro('Erro ao carregar histórico', erro);
  }
}

const perfil = await inicializarLayout({ area: 'cliente', titulo: 'Meu histórico' });
if (perfil) await carregar(perfil);
