export function formatarDataHora(valor) {
    if (!valor) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    }).format(new Date(valor));
}

export function formatarMoeda(valor) {
    if (valor === null || valor === undefined || valor === '') return '-';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(Number(valor));
}

export function inicioDoDiaISO() {
    const data = new Date();
    data.setHours(0, 0, 0, 0);
    return data.toISOString();
}

export function fimDoDiaISO() {
    const data = new Date();
    data.setHours(23, 59, 59, 999);
    return data.toISOString();
}

export function normalizarPlaca(placa) {
    return placa.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function formatarStatus(status) {
    const mapa = {
        aberta: 'Aberta',
        encerrada: 'Encerrada',
        mensalista: 'Mensalista',
        avulso: 'Avulso'
    };
    return mapa[status] || status || '-';
}