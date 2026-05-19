import '../../css/styles.css';
import { supabase } from '../config/supabase.js';
import { alertaErro } from '../ui/alerts.js';
import { aplicarTemaSalvo, inicializarLayout } from '../ui/layout.js';

aplicarTemaSalvo();

async function carregar(perfil) {
  try {
    const { data: cliente, error: erroCliente } = await supabase.from('clientes').select('id').eq('user_id', perfil.user_id).single();
    if (erroCliente) throw erroCliente;

    const { count: totalVeiculos, error: erroVeiculos } = await supabase.from('veiculos').select('id', { count: 'exact', head: true }).eq('cliente_id', cliente.id).eq('ativo', true);
    if (erroVeiculos) throw erroVeiculos;

    const { data: veiculos, error: erroIds } = await supabase.from('veiculos').select('id').eq('cliente_id', cliente.id);
    if (erroIds) throw erroIds;

    const ids = veiculos.map((veiculo) => veiculo.id);
    const { count: totalAbertas, error: erroAbertas } = ids.length
      ? await supabase.from('movimentacoes').select('id', { count: 'exact', head: true }).in('veiculo_id', ids).eq('status', 'aberta')
      : { count: 0, error: null };
    if (erroAbertas) throw erroAbertas;

    document.querySelector('#totalVeiculos').textContent = totalVeiculos || 0;
    document.querySelector('#totalAbertas').textContent = totalAbertas || 0;
  } catch (erro) {
    await alertaErro('Erro ao carregar área do cliente', erro);
  }
}

const perfil = await inicializarLayout({ area: 'cliente', titulo: 'Área do cliente' });
if (perfil) await carregar(perfil);
