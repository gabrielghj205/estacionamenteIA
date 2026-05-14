# MEMORY.md

## Contexto do projeto

Sistema didático de controle de estacionamento para uso em sala de aula.

## Tecnologias

### Front-end
- HTML
- Tailwind CSS
- JavaScript Vanilla
- Vite

### Back-end
- Supabase

## Deploy

O projeto será publicado no GitHub Pages. (npm install --save-dev gh-pages)

### Requisitos

- O build deve ser gerado na pasta `dist/`.
- Todos os caminhos devem ser compatíveis com hospedagem estática.
- O projeto deve utilizar `import.meta.env`.
- O `vite.config.js` deve definir corretamente a propriedade `base`.


## Perfis do sistema

- Proprietário
- Cliente mensalista

## Funcionalidades principais

- Autenticação
- CRUD de marcas
- CRUD de modelos
- CRUD de clientes
- CRUD de veículos
- Registro de entrada
- Registro de saída
- Consulta ao pátio
- Histórico de movimentações

## Autenticação

O sistema utiliza a autenticação do Supabase com e-mail e senha.

Após o login, o perfil do usuário é consultado na tabela `perfis`.

Tipos de usuário:

- proprietario
- cliente

### Fluxo

- Usuário acessa `login.html`.
- Após autenticação, consulta-se o perfil.
- Proprietário é redirecionado para `dashboard.html`.
- Cliente é redirecionado para `cliente/dashboard-cliente.html`.
- O logout encerra a sessão e retorna para `login.html`.

## Entidades

### perfis
- id
- user_id
- nome
- email
- tipo_usuario

### marcas
- id
- nome

### modelos
- id
- marca_id
- nome

### clientes
- id
- user_id
- nome
- telefone
- email
- ativo

### veiculos
- id
- cliente_id
- marca_id
- modelo_id
- placa
- cor
- tipo_cliente
- ativo

### movimentacoes
- id
- veiculo_id
- data_hora_entrada
- data_hora_saida
- valor_cobrado
- status

## Regras importantes

- Apenas o proprietário pode administrar cadastros.
- O cliente mensalista acessa somente seus próprios dados.
- Não pode existir mais de uma movimentação aberta por veículo.
- A saída encerra a movimentação aberta.


