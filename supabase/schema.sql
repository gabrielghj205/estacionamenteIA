create table if not exists public.perfis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  tipo_usuario text not null check (tipo_usuario in ('proprietario', 'cliente')),
  created_at timestamptz not null default now()
);

create table if not exists public.marcas (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.modelos (
  id uuid primary key default gen_random_uuid(),
  marca_id uuid not null references public.marcas(id),
  nome text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (marca_id, nome)
);

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  nome text not null,
  telefone text,
  email text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.veiculos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete set null,
  marca_id uuid references public.marcas(id),
  modelo_id uuid references public.modelos(id),
  placa text not null unique,
  cor text,
  tipo_cliente text not null check (tipo_cliente in ('mensalista', 'avulso')),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.movimentacoes (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references public.veiculos(id),
  data_hora_entrada timestamptz not null default now(),
  data_hora_saida timestamptz,
  valor_cobrado numeric(10, 2),
  status text not null default 'aberta' check (status in ('aberta', 'encerrada')),
  created_at timestamptz not null default now()
);

create unique index if not exists movimentacoes_veiculo_aberta_idx
  on public.movimentacoes (veiculo_id)
  where status = 'aberta';

alter table public.perfis enable row level security;
alter table public.marcas enable row level security;
alter table public.modelos enable row level security;
alter table public.clientes enable row level security;
alter table public.veiculos enable row level security;
alter table public.movimentacoes enable row level security;

grant usage on schema public to authenticated;
grant select on public.perfis to authenticated;
grant all on public.marcas to authenticated;
grant all on public.modelos to authenticated;
grant all on public.clientes to authenticated;
grant all on public.veiculos to authenticated;
grant all on public.movimentacoes to authenticated;

create or replace function public.usuario_e_proprietario()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.perfis
    where user_id = auth.uid()
      and tipo_usuario = 'proprietario'
  );
$$;

grant execute on function public.usuario_e_proprietario() to authenticated;

create policy "perfis_select_proprio_ou_proprietario"
on public.perfis for select
to authenticated
using (user_id = auth.uid() or public.usuario_e_proprietario());

create policy "admin_marcas_all"
on public.marcas for all
to authenticated
using (public.usuario_e_proprietario())
with check (public.usuario_e_proprietario());

create policy "admin_modelos_all"
on public.modelos for all
to authenticated
using (public.usuario_e_proprietario())
with check (public.usuario_e_proprietario());

create policy "admin_clientes_all"
on public.clientes for all
to authenticated
using (public.usuario_e_proprietario())
with check (public.usuario_e_proprietario());

create policy "cliente_select_proprio"
on public.clientes for select
to authenticated
using (user_id = auth.uid() or public.usuario_e_proprietario());

create policy "admin_veiculos_all"
on public.veiculos for all
to authenticated
using (public.usuario_e_proprietario())
with check (public.usuario_e_proprietario());

create policy "cliente_select_veiculos"
on public.veiculos for select
to authenticated
using (
  public.usuario_e_proprietario()
  or exists (
    select 1
    from public.clientes
    where clientes.id = veiculos.cliente_id
      and clientes.user_id = auth.uid()
  )
);

create policy "admin_movimentacoes_all"
on public.movimentacoes for all
to authenticated
using (public.usuario_e_proprietario())
with check (public.usuario_e_proprietario());

create policy "cliente_select_movimentacoes"
on public.movimentacoes for select
to authenticated
using (
  public.usuario_e_proprietario()
  or exists (
    select 1
    from public.veiculos
    join public.clientes on clientes.id = veiculos.cliente_id
    where veiculos.id = movimentacoes.veiculo_id
      and clientes.user_id = auth.uid()
  )
);
