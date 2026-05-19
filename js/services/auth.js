import { supabase } from '../config/supabase.js';

export async function login(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
    return data;
}

export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = '../login.html';
}

export async function getUsuarioAtual() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
}

export async function getSessaoAtual() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

export async function getPerfilAtual() {
    const usuario = await getUsuarioAtual();
    if (!usuario) return null;

    const { data, error } = await supabase
        .from('perfis')
        .select('id, user_id, nome, email, tipo_usuario')
        .eq('user_id', usuario.id)
        .single();

    if (error) throw error;
    return data;
}

export async function verificarAutenticacao() {
    const usuario = await getUsuarioAtual();
    if (!usuario) {
        window.location.href = '../login.html';
        return null;
    }
    return usuario;
}

export async function redirecionarPorPerfil() {
    const sessao = await getSessaoAtual();
    if (!sessao) {
        window.location.href = 'login.html';
        return;
    }

    const perfil = await getPerfilAtual();
    if (!perfil) {
        window.location.href = 'login.html';
        return;
    }

    if (perfil.tipo_usuario === 'cliente') {
        window.location.href = 'cliente/dashboard-cliente.html';
        return;
    }

    window.location.href = 'pages/dashboard.html';
}