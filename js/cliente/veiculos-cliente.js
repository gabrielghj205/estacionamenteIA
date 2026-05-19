import '../../css/styles.css';
import { supabase } from '../config/supabase.js';
import { alertaErro } from '../ui/alerts.js';
import { aplicarTemaSalvo, inicializarLayout } from '../ui/layout.js';

aplicarTemaSalvo();

async function carregar(perfil) {
    try {
        const { data: cliente, error: erroCliente } = await supabase.from('clientes').select('id').eq('user_id', perfil.user_id).single();
        if (erroCliente) throw erroCliente;
        const { data, error } = await supabase.from('veiculos').select('placa, cor, ativo, marcas(nome), modelos(nome)').eq('cliente_id', cliente.id).order('placa');
        if (error) throw error;
        document.querySelector('#tabela').innerHTML = data.length ? data.map((veiculo) => `
      <tr><td>${veiculo.placa}</td><td>${veiculo.marcas?.nome || '-'}</td><td>${veiculo.modelos?.nome || '-'}</td><td>${veiculo.cor || '-'}</td><td>${veiculo.ativo ? 'Ativo' : 'Inativo'}</td></tr>
    `).join('') : '<tr><td colspan="5" class="text-center">Você não possui veículos cadastrados.</td></tr>';
    } catch (erro) {
        await alertaErro('Erro ao carregar veículos', erro);
    }
}

const perfil = await inicializarLayout({ area: 'cliente', titulo: 'Meus veículos' });
if (perfil) await carregar(perfil);