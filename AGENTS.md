# AGENTS.md

## Regras permanentes de interface

- Todo texto visível da interface deve usar português do Brasil com acentuação correta.
- Não deixar grafias sem acento como `veiculos`, `historico`, `patio`, `acoes`, `situacao`, `usuario`, `pagina` ou `proxima` quando forem texto exibido ao usuário.
- Nomes técnicos, colunas do banco, variáveis, rotas, arquivos e atributos `data-*` podem permanecer sem acento.
- A interface deve usar Heroicons nos menus, botões de ação e controles principais.
- Em HTML, preferir `data-heroicon="nome-do-icone"` e renderizar pelo módulo `js/ui/icons.js`.
- Em conteúdo gerado por JavaScript, usar a função `heroicon()` do módulo `js/ui/icons.js`.
- Evitar símbolos soltos como `☰` ou `◐` quando houver ícone Heroicons equivalente.

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

## Supabase RLS e GRANT

- Sempre que criar ou alterar tabelas protegidas por RLS no Supabase, tambem configurar os `GRANTs` necessarios para os papeis usados pelo front-end.
- Para tabelas acessadas apos login, incluir pelo menos `grant usage on schema public to authenticated;` e o `grant` adequado na tabela (`select`, `insert`, `update`, ou `all`).
- Nao considerar uma policy RLS suficiente por si so: o usuario precisa ter permissao SQL na tabela e a policy decide quais linhas ele pode acessar.
- Se aparecer erro como `permission denied for table ...`, verificar primeiro se existem `GRANTs` para `authenticated`.

Exemplos de Grants minimos do projeto:

```sql
grant usage on schema public to authenticated;
grant select on public.perfis to authenticated;
grant all on public.marcas to authenticated;
```

Se novas tabelas forem criadas, adicionar o `grant` correspondente e uma policy RLS adequada antes de usar no front-end.

### Padrao obrigatorio para CRUDs

Todos os cadastros administrativos devem ser implementados como CRUD completo:

- Listar registros com paginacao.
- Criar novos registros.
- Editar registros existentes.
- Inativar registros em vez de excluir fisicamente, quando a entidade possuir campo `ativo`.
- Reativar registros inativos quando fizer sentido para o cadastro.
- Validar campos obrigatorios antes de enviar ao Supabase.
- Exibir mensagens de sucesso, erro, confirmacao e alerta com SweetAlert2.
- Mostrar erros reais retornados pelo Supabase ao usuario, sem falhar silenciosamente.
- Usar `async/await` e `try/catch` em todas as operacoes.
- Atualizar a tabela/listagem apos criar, editar, inativar ou reativar.

### Paginacao dos cadastros

- Toda listagem de cadastro deve usar paginacao no Supabase com `.range(inicio, fim)`.
- Usar `select(..., { count: 'exact' })` quando precisar calcular total de paginas.
- Exibir controles de pagina anterior/proxima e informacao da pagina atual.
- Definir um tamanho de pagina padrao, preferencialmente 10 registros por pagina.
- Manter busca/filtros integrados com a paginacao quando existirem.
