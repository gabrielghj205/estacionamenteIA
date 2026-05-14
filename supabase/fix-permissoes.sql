grant usage on schema public to authenticated;

grant select on public.perfis to authenticated;
grant all on public.marcas to authenticated;
grant all on public.modelos to authenticated;
grant all on public.clientes to authenticated;
grant all on public.veiculos to authenticated;
grant all on public.movimentacoes to authenticated;

grant execute on function public.usuario_e_proprietario() to authenticated;
