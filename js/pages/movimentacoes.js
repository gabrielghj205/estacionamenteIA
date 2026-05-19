import '../../css/styles.css';
import { supabase } from '../config/supabase.js';
import { alertaAviso, alertaErro, confirmar, toastSucesso } from '../ui/alerts.js';
import { aplicarTemaSalvo, inicializarLayout } from '../ui/layout.js';
import { normalizarPlaca } from '../utils/formatters.js';

aplicarTemaSalvo();

async function buscarVeiculoAtivo(placa) {
  const { data, error } = await supabase
    .from('veiculos')
    .select('id, placa, ativo')
    .eq('placa', placa)
    .eq('ativo', true)
    .single();
  if (error) throw error;
  return data;
}

async function buscarMovimentacaoAberta(veiculoId) {
  const { data, error } = await supabase
    .from('movimentacoes')
    .select('id, veiculo_id, data_hora_entrada')
    .eq('veiculo_id', veiculoId)
    .eq('status', 'aberta')
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function registrarEntrada(evento) {
  evento.preventDefault();
  const placa = normalizarPlaca(document.querySelector('#placaEntrada').value);
  if (!placa) return alertaAviso('Placa obrigatória', 'Informe a placa do veículo.');

  try {
    const veiculo = await buscarVeiculoAtivo(placa);
    const aberta = await buscarMovimentacaoAberta(veiculo.id);
    if (aberta) return alertaAviso('Entrada já aberta', 'Este veículo já possui movimentação aberta.');

    const resposta = await confirmar('Confirmar entrada', `Registrar entrada para a placa ${placa}?`, 'Registrar');
    if (!resposta.isConfirmed) return;

    const { error } = await supabase.from('movimentacoes').insert({
      veiculo_id: veiculo.id,
      data_hora_entrada: new Date().toISOString(),
      status: 'aberta'
    });
    if (error) throw error;

    document.querySelector('#formEntrada').reset();
    await toastSucesso('Entrada registrada');
  } catch (erro) {
    await alertaErro('Erro ao registrar entrada', erro);
  }
}

async function registrarSaida(evento) {
  evento.preventDefault();
  const placa = normalizarPlaca(document.querySelector('#placaSaida').value);
  const valor = Number(document.querySelector('#valorCobrado').value);
  if (!placa) return alertaAviso('Placa obrigatória', 'Informe a placa do veículo.');
  if (Number.isNaN(valor) || valor < 0) return alertaAviso('Valor inválido', 'Informe um valor cobrado válido.');

  try {
    const veiculo = await buscarVeiculoAtivo(placa);
    const aberta = await buscarMovimentacaoAberta(veiculo.id);
    if (!aberta) return alertaAviso('Sem entrada aberta', 'Este veículo não possui movimentação aberta.');

    const resposta = await confirmar('Confirmar saída', `Encerrar a movimentação da placa ${placa}?`, 'Encerrar');
    if (!resposta.isConfirmed) return;

    const { error } = await supabase
      .from('movimentacoes')
      .update({
        data_hora_saida: new Date().toISOString(),
        valor_cobrado: valor,
        status: 'encerrada'
      })
      .eq('id', aberta.id);
    if (error) throw error;

    document.querySelector('#formSaida').reset();
    await toastSucesso('Saída registrada');
  } catch (erro) {
    await alertaErro('Erro ao registrar saída', erro);
  }
}

const perfil = await inicializarLayout({ titulo: 'Movimentações' });
if (perfil) {
  document.querySelector('#formEntrada').addEventListener('submit', registrarEntrada);
  document.querySelector('#formSaida').addEventListener('submit', registrarSaida);
}
