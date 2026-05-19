import '../../css/styles.css';
import { supabase } from '../config/supabase.js';
import { alertaAviso, alertaErro, confirmar, toastSucesso } from '../ui/alerts.js';
import { aplicarTemaSalvo, inicializarLayout } from '../ui/layout.js';
import { heroicon } from '../ui/icons.js';
import { intervaloPagina, renderizarPaginacao } from '../utils/pagination.js';

aplicarTemaSalvo();
let pagina = 1;
const tamanhoPagina = 10;

async function carregar() {
    try {
        const { inicio, fim } = intervaloPagina(pagina, tamanhoPagina);
        let query = supabase.from('marcas').select('id, nome', { count: 'exact' }).order('nome').range(inicio, fim);
        const busca = document.querySelector('#busca').value.trim();
        if (busca) query = query.ilike('nome', `%${busca}%`);
        const { data, count, error } = await query;
        if (error) throw error;
        document.querySelector('#tabela').innerHTML = data.length ? data.map((marca) => `
      <tr><td>${marca.nome}</td><td class="flex gap-2"><button class="app-button-secondary" data-editar="${marca.id}" data-nome="${marca.nome}">${heroicon('pencil')}Editar</button></td></tr>
    `).join('') : '<tr><td colspan="2" class="text-center">Não há marcas cadastradas.</td></tr>';
        document.querySelectorAll('[data-editar]').forEach((botao) => botao.addEventListener('click', () => {
            document.querySelector('#registroId').value = botao.dataset.editar;
            document.querySelector('#nome').value = botao.dataset.nome;
        }));
        renderizarPaginacao(document.querySelector('#paginacao'), { pagina, total: count, tamanhoPagina, aoMudar: (p) => { pagina = p;
                carregar(); } });
    } catch (erro) {
        await alertaErro('Erro ao carregar marcas', erro);
    }
}

async function salvar(evento) {
    evento.preventDefault();
    const id = document.querySelector('#registroId').value;
    const nome = document.querySelector('#nome').value.trim();
    if (!nome) return alertaAviso('Campo obrigatório', 'Informe o nome da marca.');
    try {
        const resposta = await confirmar('Salvar marca', `Deseja salvar a marca ${nome}?`, 'Salvar');
        if (!resposta.isConfirmed) return;
        const operacao = id ? supabase.from('marcas').update({ nome }).eq('id', id) : supabase.from('marcas').insert({ nome });
        const { error } = await operacao;
        if (error) throw error;
        evento.currentTarget.reset();
        document.querySelector('#registroId').value = '';
        await toastSucesso('Marca salva');
        await carregar();
    } catch (erro) {
        await alertaErro('Erro ao salvar marca', erro);
    }
}

const perfil = await inicializarLayout({ titulo: 'Marcas' });
if (perfil) {
    document.querySelector('#formCadastro').addEventListener('submit', salvar);
    document.querySelector('#busca').addEventListener('input', () => { pagina = 1;
        carregar(); });
    document.querySelector('#btnLimpar').addEventListener('click', () => { document.querySelector('#busca').value = '';
        pagina = 1;
        carregar(); });
    await carregar();
}