# AGENTS.md

## Visão geral do projeto

Este projeto é um aplicação didática de controle de estacionamento.

O sistema terá duas áreas principais:

1. Área do proprietário
2. Área do cliente mensalista

### Tecnologias utilizadas

**Front-end**
- HTML
- Tailwind CSS (dark e light mode)
- JavaScript Vanilla
- Vite
- SweetAlert2

**Back-end**
- Supabase

## Objetivo do sistema

Permitir o controle de clientes mensalistas e avulsos, incluindo:

- Cadastro de marcas
- Cadastro de modelos
- Cadastro de veículos
- Cadastro de clientes mensalistas
- Registro de entrada
- Registro de saída
- Consulta de veículos no pátio
- Histórico de movimentações

## Perfis de usuário

### Proprietário
- Login
- Dashboard administrativo
- CRUD de marcas
- CRUD de modelos
- CRUD de clientes
- CRUD de veículos
- Controle de entrada e saída
- Consulta ao histórico

### Cliente Mensalista
- Login
- Consulta dos próprios veículos
- Consulta do próprio histórico

## Regras de desenvolvimento

- Não utilizar frameworks como React, Vue ou Angular.
- Utilizar apenas HTML, Tailwind CSS e JavaScript Vanilla.
- Utilizar Supabase para autenticação e banco de dados.
- Organizar o código em módulos.
- Utilizar `async/await`.
- Implementar tratamento de erros com `try/catch`.
- Validar dados no front-end antes de enviar ao Supabase.
- Configurar Row Level Security (RLS).
- Utilizar Vite como ferramenta de build e servidor de desenvolvimento.
- Variáveis de ambiente devem ser acessadas via `import.meta.env`.
- Não hardcodear URLs e chaves do Supabase.
- O projeto será publicado no GitHub Pages.
- Garantir compatibilidade com hospedagem estática.
- Configurar corretamente a opção `base` do Vite.
- Evitar dependências que exijam servidor próprio.

## Autenticação

O sistema deve utilizar a autenticação nativa do Supabase.

### Regras

- Implementar tela de login com e-mail e senha.
- Implementar funcionalidade de logout.
- Verificar sessão ativa ao carregar páginas protegidas.
- Redirecionar usuários não autenticados para `login.html`.
- Redirecionar o usuário para a área correta de acordo com o perfil.
- Exibir o nome do usuário autenticado no cabeçalho.
- Permitir recuperação futura da senha pelo Supabase.

### Funções mínimas

- login(email, senha)
- logout()
- getUsuarioAtual()
- verificarAutenticacao()
- redirecionarPorPerfil()

## Estrutura sugerida

```text
/estacionamentos
├── index.html
├── login.html
├── /pages
├── /cliente
├── /js
├── /css
└── /assets
```

## Entidades principais

- perfis
- marcas
- modelos
- clientes
- veiculos
- movimentacoes

## Regras de negócio

- Um veículo não pode ter duas entradas em aberto.
- A saída somente pode ocorrer se houver entrada aberta.
- Clientes mensalistas visualizam apenas seus próprios dados.
- Veículos avulsos não precisam estar vinculados a clientes.
- Preferir inativação lógica em vez de exclusão física.

## Regras de Interface
- Todas as mensagens de sucesso, erro, confirmação e alerta devem utilizar SweetAlert2.
- Não utilizar `alert()`, `confirm()` ou `prompt()` nativos do JavaScript.
