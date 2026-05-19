import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        target: 'esnext',
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'index.html'),
                login: resolve(__dirname, 'login.html'),
                dashboard: resolve(__dirname, 'pages/dashboard.html'),
                marcas: resolve(__dirname, 'pages/marcas.html'),
                modelos: resolve(__dirname, 'pages/modelos.html'),
                clientes: resolve(__dirname, 'pages/clientes.html'),
                veiculos: resolve(__dirname, 'pages/veiculos.html'),
                movimentacoes: resolve(__dirname, 'pages/movimentacoes.html'),
                patio: resolve(__dirname, 'pages/patio.html'),
                historico: resolve(__dirname, 'pages/historico.html'),
                dashboardCliente: resolve(__dirname, 'cliente/dashboard-cliente.html'),
                veiculosCliente: resolve(__dirname, 'cliente/veiculos-cliente.html'),
                historicoCliente: resolve(__dirname, 'cliente/historico-cliente.html')
            }
        }
    }
});