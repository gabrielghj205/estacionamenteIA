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

## Regras permanentes

### Supabase RLS e GRANT

RLS nao substitui `GRANT`. Toda tabela usada pelo front-end precisa ter permissao SQL para o papel `authenticated`; depois a policy RLS define quais linhas o usuario pode acessar.

Sempre manter estes grants no schema ou em script de correcao:

```sql
grant usage on schema public to authenticated;

grant select on public.perfis to authenticated;
grant all on public.marcas to authenticated;
grant all on public.modelos to authenticated;
grant all on public.clientes to authenticated;
grant all on public.veiculos to authenticated;
grant all on public.movimentacoes to authenticated;

grant execute on function public.usuario_e_proprietario() to authenticated;
```

Se surgir `permission denied for table ...`, conferir os grants antes de alterar o front-end.

### CRUD completo com paginacao

Todos os cadastros devem implementar:

- Listagem paginada.
- Criacao.
- Edicao.
- Inativacao logica quando houver campo `ativo`.
- Reativacao quando aplicavel.
- Validacao no front-end.
- Mensagens com SweetAlert2.
- Tratamento de erro com `try/catch`.
- Exibicao do erro retornado pelo Supabase, sem falha silenciosa.
- Atualizacao da listagem apos cada operacao.

Padrao de paginacao:

- Usar `.range(inicio, fim)` nas consultas do Supabase.
- Usar `select(..., { count: 'exact' })` para calcular total de paginas.
- Tamanho padrao de pagina: 10 registros.
- Exibir pagina atual, total de paginas, botao anterior e botao proxima.

### Texto e icones da interface

- Textos visiveis da UI devem estar em portugues do Brasil com acentuacao correta.
- Grafias sem acento so devem ser usadas em nomes tecnicos, variaveis, rotas, arquivos, colunas do banco e atributos `data-*`.
- Exemplos de texto visivel correto: `Veículos`, `Histórico`, `Pátio`, `Ações`, `Situação`, `Usuário`, `Página`, `Próxima`.
- Menus, botoes de acao e controles principais devem usar Heroicons.
- O projeto usa o modulo `js/ui/icons.js` para renderizar Heroicons inline.
- Em HTML, usar `data-heroicon`; em JavaScript, usar `heroicon()`.