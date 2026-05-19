import '../../css/styles.css';
import { supabase } from '../config/supabase.js';
import { alertaAviso, alertaErro, confirmar, toastSucesso } from '../ui/alerts.js';
import { aplicarTemaSalvo, inicializarLayout } from '../ui/layout.js';
import { heroicon } from '../ui/icons.js';
import { normalizarPlaca } from '../utils/formatters.js';
import { intervaloPagina, renderizarPaginacao } from '../utils/pagination.js';

aplicarTemaSalvo();
let pagina = 1;
const tamanhoPagina = 10;

async function preencherSelect(id, tabela, textoInicial = 'Selecione') {
    const { data, error } = await supabase.from(tabela).select('id, nome').order('nome');
    if (error) throw error;
    document.querySelector(id).innerHTML = `<option value="">${textoInicial}</option>` + data.map((item) => `<option value="${item.id}">${item.nome}</option>`).join('');
}

async function carregar() {
    try {
        const { inicio, fim } = intervaloPagina(pagina, tamanhoPagina);
        const { data, count, error } = await supabase
            .from('veiculos')
            .select('id, placa, cor, tipo_cliente, ativo, cliente_id, marca_id, modelo_id, clientes(nome), marcas(nome), modelos(nome)', { count: 'exact' })
            .order('placa')
            .range(inicio, fim);
        if (error) throw error;
        document.querySelector('#tabela').innerHTML = data.length ? data.map((veiculo) => `
      <tr><td>${veiculo.placa}</td><td>${veiculo.clientes?.nome || 'Avulso'}</td><td>${veiculo.marcas?.nome || '-'}</td><td>${veiculo.modelos?.nome || '-'}</td><td>${veiculo.ativo ? 'Ativo' : 'Inativo'}</td><td class="flex gap-2"><button class="app-button-secondary" data-editar="${veiculo.id}">${heroicon('pencil')}Editar</button><button class="${veiculo.ativo ? 'app-button-danger' : 'app-button-primary'}" data-status="${veiculo.id}" data-ativo="${veiculo.ativo}">${veiculo.ativo ? heroicon('trash') + 'Inativar' : heroicon('plus') + 'Reativar'}</button></td></tr>
    `).join('') : '<tr><td colspan="6" class="text-center">Não há veículos cadastrados.</td></tr>';
        document.querySelectorAll('[data-editar]').forEach((botao) => botao.addEventListener('click', () => {
            const veiculo = data.find((item) => String(item.id) === botao.dataset.editar);
            document.querySelector('#registroId').value = veiculo.id;
            document.querySelector('#placa').value = veiculo.placa;
            document.querySelector('#tipo_cliente').value = veiculo.tipo_cliente;
            document.querySelector('#cliente_id').value = veiculo.cliente_id || '';
            document.querySelector('#marca_id').value = veiculo.marca_id;
            document.querySelector('#modelo_id').value = veiculo.modelo_id;
            document.querySelector('#cor').value = veiculo.cor || '';
        }));
        document.querySelectorAll('[data-status]').forEach((botao) => botao.addEventListener('click', () => alterarStatus(botao.dataset.status, botao.dataset.ativo === 'true')));
        renderizarPaginacao(document.querySelector('#paginacao'), { pagina, total: count, tamanhoPagina, aoMudar: (p) => { pagina = p;
                carregar(); } });
    } catch (erro) {
        await alertaErro('Erro ao carregar veículos', erro);
    }
}

async function alterarStatus(id, ativo) {
    try {
        const resposta = await confirmar(ativo ? 'Inativar veículo' : 'Reativar veículo', 'Deseja alterar a situação deste veículo?', ativo ? 'Inativar' : 'Reativar');
        if (!resposta.isConfirmed) return;
        const { error } = await supabase.from('veiculos').update({ ativo: !ativo }).eq('id', id);
        if (error) throw error;
        await toastSucesso('Veículo atualizado');
        await carregar();
    } catch (erro) {
        await alertaErro('Erro ao atualizar veículo', erro);
    }
}

async function salvar(evento) {
    evento.preventDefault();
    const id = document.querySelector('#registroId').value;
    const tipoCliente = document.querySelector('#tipo_cliente').value;
    const payload = {
        placa: normalizarPlaca(document.querySelector('#placa').value),
        tipo_cliente: tipoCliente,
        cliente_id: document.querySelector('#cliente_id').value || null,
        marca_id: document.querySelector('#marca_id').value,
        modelo_id: document.querySelector('#modelo_id').value,
        cor: document.querySelector('#cor').value.trim() || null,
        ativo: true
    };
    if (!payload.placa || !payload.marca_id || !payload.modelo_id) return alertaAviso('Campos obrigatórios', 'Informe placa, marca e modelo.');
    if (tipoCliente === 'mensalista' && !payload.cliente_id) return alertaAviso('Cliente obrigatório', 'Informe o cliente para veículos mensalistas.');

    try {
        const resposta = await confirmar('Salvar veículo', `Deseja salvar a placa ${payload.placa}?`, 'Salvar');
        if (!resposta.isConfirmed) return;
        const operacao = id ? supabase.from('veiculos').update(payload).eq('id', id) : supabase.from('veiculos').insert(payload);
        const { error } = await operacao;
        if (error) throw error;
        evento.currentTarget.reset();
        document.querySelector('#registroId').value = '';
        await toastSucesso('Veículo salvo');
        await carregar();
    } catch (erro) {
        await alertaErro('Erro ao salvar veículo', erro);
    }
}

const perfil = await inicializarLayout({ titulo: 'Veículos' });
if (perfil) {
    await Promise.all([
        preencherSelect('#cliente_id', 'clientes', 'Avulso'),
        preencherSelect('#marca_id', 'marcas'),
        preencherSelect('#modelo_id', 'modelos')
    ]);
    document.querySelector('#formCadastro').addEventListener('submit', salvar);
    await carregar();
}