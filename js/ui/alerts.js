import Swal from 'sweetalert2';

function temaAtual() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function exibirSucesso(titulo, texto = '') {
  return Swal.fire({
    icon: 'success',
    title: titulo,
    text: texto,
    confirmButtonColor: '#2563EB',
    background: temaAtual() === 'dark' ? '#1E293B' : '#FFFFFF',
    color: temaAtual() === 'dark' ? '#F8FAFC' : '#0F172A',
  });
}

export function exibirErro(titulo, texto = 'Tente novamente em instantes.') {
  return Swal.fire({
    icon: 'error',
    title: titulo,
    text: texto,
    confirmButtonColor: '#DC2626',
    background: temaAtual() === 'dark' ? '#1E293B' : '#FFFFFF',
    color: temaAtual() === 'dark' ? '#F8FAFC' : '#0F172A',
  });
}

export function exibirAviso(titulo, texto = '') {
  return Swal.fire({
    icon: 'warning',
    title: titulo,
    text: texto,
    confirmButtonColor: '#F59E0B',
    background: temaAtual() === 'dark' ? '#1E293B' : '#FFFFFF',
    color: temaAtual() === 'dark' ? '#F8FAFC' : '#0F172A',
  });
}

export function confirmarAcao(titulo, texto, confirmButtonText = 'Confirmar') {
  return Swal.fire({
    icon: 'question',
    title: titulo,
    text: texto,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#2563EB',
    cancelButtonColor: '#64748B',
    background: temaAtual() === 'dark' ? '#1E293B' : '#FFFFFF',
    color: temaAtual() === 'dark' ? '#F8FAFC' : '#0F172A',
  });
}

