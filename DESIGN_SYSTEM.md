# DESIGN_SYSTEM.md

## Paleta de cores

### Cores principais
- Primary: #2563EB
- Primary Hover: #1D4ED8
- Secondary: #64748B
- Success: #16A34A
- Warning: #F59E0B
- Danger: #DC2626

### Light Mode
- Background: #F8FAFC
- Surface: #FFFFFF
- Text Primary: #0F172A
- Text Secondary: #475569
- Border: #E2E8F0

### Dark Mode
- Background: #0F172A
- Surface: #1E293B
- Text Primary: #F8FAFC
- Text Secondary: #CBD5E1
- Border: #334155

## Tipografia

- Fonte principal: Inter
- Títulos: font-bold
- Texto padrão: text-sm ou text-base
- Labels: text-sm font-medium

## Componentes

### Botão Primário
Classes:
bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg

### Botão Secundário
Classes:
bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg

### Inputs
border border-slate-300 rounded-lg px-3 py-2 w-full
focus:ring-2 focus:ring-blue-500

### Cards
bg-white dark:bg-slate-800 rounded-xl shadow p-6

## Layout padrão

- Sidebar fixa com 256px
- Header superior
- Conteúdo central com padding de 24px
- Largura máxima de formulários: max-w-3xl

## Dark Mode

O dark mode será implementado com a classe `dark` no elemento `<html>`.

## Biblioteca de ícones

- Heroicons

## Tabelas

- Cabeçalho com fundo cinza claro
- Zebra striping opcional
- Hover nas linhas

## Responsividade

- Mobile-first
- Breakpoints padrão do Tailwind
- Sidebar recolhível em telas pequenas

## Feedback ao usuário

Todas as mensagens de:

- Sucesso
- Erro
- Confirmação
- Aviso

devem utilizar SweetAlert2 com estilo compatível com o tema claro e escuro.

## Tela de Login

Elementos obrigatórios:

- Logo do sistema
- Campo de e-mail
- Campo de senha
- Botão "Entrar"
- Link "Esqueci minha senha" (opcional)
- Mensagens de erro com SweetAlert2

## Cabeçalho autenticado

Deve exibir:

- Nome do usuário
- Tipo de perfil
- Botão "Sair"

## Logotipo
Utilize o logotipo disponível na pasta `assets`
