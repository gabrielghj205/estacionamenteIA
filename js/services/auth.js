import { supabase } from '../config/supabase.js';

export async function login(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getUsuarioAtual() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}

export async function getPerfilUsuario(userId) {
  const { data, error } = await supabase
    .from('perfis')
    .select('id, user_id, nome, email, tipo_usuario')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function verificarAutenticacao(tiposPermitidos = []) {
  const usuario = await getUsuarioAtual();

  if (!usuario) {
    window.location.href = getCaminhoLogin();
    return null;
  }

  const perfil = await getPerfilUsuario(usuario.id);

  if (tiposPermitidos.length > 0 && !tiposPermitidos.includes(perfil.tipo_usuario)) {
    await redirecionarPorPerfil(perfil);
    return null;
  }

  return { usuario, perfil };
}

export async function redirecionarPorPerfil(perfilInformado = null) {
  const usuario = await getUsuarioAtual();
  const perfil = perfilInformado || (usuario ? await getPerfilUsuario(usuario.id) : null);

  if (!perfil) {
    window.location.href = getCaminhoLogin();
    return;
  }

  if (perfil.tipo_usuario === 'proprietario') {
    window.location.href = getCaminhoPagina('pages/dashboard.html');
    return;
  }

  window.location.href = getCaminhoPagina('cliente/dashboard-cliente.html');
}

function getCaminhoLogin() {
  return getCaminhoPagina('login.html');
}

function getCaminhoPagina(pagina) {
  const caminho = window.location.pathname;
  const estaEmSubpasta = caminho.includes('/pages/') || caminho.includes('/cliente/');

  return estaEmSubpasta ? `../${pagina}` : pagina;
}

