import '../../css/styles.css';
import { login, redirecionarPorPerfil } from '../services/auth.js';
import { alertaErro, alertaAviso } from '../ui/alerts.js';
import { aplicarTemaSalvo } from '../ui/layout.js';
import { renderHeroicons } from '../ui/icons.js';

aplicarTemaSalvo();
renderHeroicons();

document.querySelector('#formLogin').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const form = new FormData(evento.currentTarget);
  const email = String(form.get('email') || '').trim();
  const senha = String(form.get('senha') || '');

  if (!email || !senha) {
    await alertaAviso('Campos obrigatórios', 'Informe e-mail e senha para entrar.');
    return;
  }

  try {
    await login(email, senha);
    await redirecionarPorPerfil();
  } catch (erro) {
    await alertaErro('Erro ao entrar', erro);
  }
});
