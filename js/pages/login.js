import '../ui/theme.js';
import { aplicarTemaInicial, configurarBotaoTema } from '../ui/theme.js';
import { login, redirecionarPorPerfil } from '../services/auth.js';
import { exibirErro, exibirAviso } from '../ui/alerts.js';
import { heroicon, renderHeroicons } from '../ui/icons.js';

aplicarTemaInicial();
configurarBotaoTema();
renderHeroicons();

const form = document.querySelector('[data-login-form]');
const emailInput = document.querySelector('#email');
const senhaInput = document.querySelector('#senha');
const submitButton = document.querySelector('[data-login-submit]');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();

  if (!email || !senha) {
    await exibirAviso('Preencha os campos obrigatórios', 'Informe e-mail e senha para continuar.');
    return;
  }

  submitButton.disabled = true;
  submitButton.innerHTML = `${heroicon('logout')}Entrando...`;

  try {
    await login(email, senha);
    await redirecionarPorPerfil();
  } catch (error) {
    exibirErro('Falha no login', error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = `${heroicon('logout')}Entrar`;
  }
});


