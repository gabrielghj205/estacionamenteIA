import '../../css/styles.css';
import { redirecionarPorPerfil } from '../services/auth.js';
import { alertaErro } from '../ui/alerts.js';

try {
  await redirecionarPorPerfil();
} catch (erro) {
  await alertaErro('Erro ao carregar o sistema', erro);
  window.location.href = 'login.html';
}
