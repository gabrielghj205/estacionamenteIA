import '../../css/styles.css';
import { supabase } from '../config/supabase.js';
import { alertaAviso, alertaErro, confirmar, toastSucesso } from '../ui/alerts.js';
import { aplicarTemaSalvo, inicializarLayout } from '../ui/layout.js';
import { heroicon } from '../ui/icons.js';
import { intervaloPagina, renderizarPaginacao } from '../utils/pagination.js';

aplicarTemaSalvo();
let pagina = 1;
const tamanhoPagina = 10;

async function carregarMarcas() {
    const { data, error } = await supabase.from('marcas').select('id, nome').order('nome');
    if (error) throw error;
    document.querySelector('#marca_id').innerHTML = '<option value="">Selecione</option>' + data.map((marca) => `<option value="${marca.id}">${marca.nome}</option>`).join('');
}

async function carregar() {
    try {
        const { inicio, fim } = intervaloPagina(pagina, tamanhoPagina);
        const { data, count, error } = await supabase
            .from('modelos')
            .select('id, nome, marca_id, marcas(nome)', { count: 'exact' })
            .order('nome')
            .range(inicio, fim);
        if (error) throw error;
        document.querySelector('#tabela').innerHTML = data.length ? data.map((modelo) => `
      <tr><td>${modelo.marcas?.nome || '-'}</td><td>${modelo.nome}</td><td class="flex gap-2"><button class="app-button-secondary" data-editar="${modelo.id}" data-nome="${modelo.nome}" data-marca="${modelo.marca_id}">${heroicon('pencil')}Editar</button></td></tr>
    `).join('') : '<tr><td colspan="3" class="text-center">Não há modelos cadastrados.</td></tr>';
        document.querySelectorAll('[data-editar]').forEach((botao) => botao.addEventListener('click', () => {
            document.querySelector('#registroId').value = botao.dataset.editar;
            document.querySelector('#nome').value = botao.dataset.nome;
            document.querySelector('#marca_id').value = botao.dataset.marca;
        }));
        renderizarPaginacao(document.querySelector('#paginacao'), { pagina, total: count, tamanhoPagina, aoMudar: (p) => { pagina = p;
                carregar(); } });
    } catch (erro) {
        await alertaErro('Erro ao carregar modelos', erro);
    }
}

async function salvar(evento) {
    evento.preventDefault();
    const id = document.querySelector('#registroId').value;
    const nome = document.querySelector('#nome').value.trim();
    const marca_id = document.querySelector('#marca_id').value;
    if (!nome || !marca_id) return alertaAviso('Campos obrigatórios', 'Informe marca e nome do modelo.');
    try {
        const resposta = await confirmar('Salvar modelo', `Deseja salvar o modelo ${nome}?`, 'Salvar');
        if (!resposta.isConfirmed) return;
        const payload = { nome, marca_id };
        const operacao = id ? supabase.from('modelos').update(payload).eq('id', id) : supabase.from('modelos').insert(payload);
        const { error } = await operacao;
        if (error) throw error;
        evento.currentTarget.reset();
        document.querySelector('#registroId').value = '';
        await toastSucesso('Modelo salvo');
        await carregar();
    } catch (erro) {
        await alertaErro('Erro ao salvar modelo', erro);
    }
}

const perfil = await inicializarLayout({ titulo: 'Modelos' });
if (perfil) {
    await carregarMarcas();
    document.querySelector('#formCadastro').addEventListener('submit', salvar);
    await carregar();
}