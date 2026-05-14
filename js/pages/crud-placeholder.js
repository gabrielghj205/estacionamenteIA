import { aplicarTemaInicial } from '../ui/theme.js';
import { verificarAutenticacao } from '../services/auth.js';
import { configurarLayout } from '../ui/layout.js';
import { exibirErro } from '../ui/alerts.js';

aplicarTemaInicial();

async function iniciarPagina() {
  try {
    const contexto = await verificarAutenticacao(['proprietario']);

    if (contexto) {
      configurarLayout(contexto.perfil);
    }
  } catch (error) {
    await exibirErro('Sessao invalida', error.message);
    window.location.href = '../login.html';
  }
}

iniciarPagina();

