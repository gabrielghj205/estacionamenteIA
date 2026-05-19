import Swal from 'sweetalert2';

const temaEscuro = () => document.documentElement.classList.contains('dark');

export function toastSucesso(titulo) {
  return Swal.fire({
    icon: 'success',
    title: titulo,
    timer: 1800,
    showConfirmButton: false,
    background: temaEscuro() ? '#1E293B' : '#FFFFFF',
    color: temaEscuro() ? '#F8FAFC' : '#0F172A'
  });
}

export function alertaErro(titulo, erro) {
  return Swal.fire({
    icon: 'error',
    title: titulo,
    text: erro?.message || erro || 'Não foi possível concluir a operação.',
    confirmButtonColor: '#a855f7',
    background: temaEscuro() ? '#1E293B' : '#FFFFFF',
    color: temaEscuro() ? '#F8FAFC' : '#0F172A'
  });
}

export function alertaAviso(titulo, texto) {
  return Swal.fire({
    icon: 'warning',
    title: titulo,
    text: texto,
    confirmButtonColor: '#a855f7',
    background: temaEscuro() ? '#1E293B' : '#FFFFFF',
    color: temaEscuro() ? '#F8FAFC' : '#0F172A'
  });
}

export function confirmar(titulo, texto, textoBotao = 'Confirmar') {
  return Swal.fire({
    icon: 'question',
    title: titulo,
    text: texto,
    showCancelButton: true,
    confirmButtonText: textoBotao,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#a855f7',
    cancelButtonColor: '#64748B',
    background: temaEscuro() ? '#1E293B' : '#FFFFFF',
    color: temaEscuro() ? '#F8FAFC' : '#0F172A'
  });
}
