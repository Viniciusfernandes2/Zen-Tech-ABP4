-- Script completo (Supabase) para cuidadores/assistidos
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.usuarios (
  id uuid primary key default uuid_generate_v4(),
  id_auth uuid unique not null references auth.users(id) on delete cascade,
  nome text not null,
  telefone text,
  criado_em timestamptz not null default now()
);
alter table public.usuarios enable row level security;

create table if not exists public.assistidos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  data_nascimento date,
  observacoes text,
  criado_em timestamptz not null default now()
);
alter table public.assistidos enable row level security;

create table if not exists public.usuarios_assistidos (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references public.usuarios(id) on delete cascade,
  assistido_id uuid not null references public.assistidos(id) on delete cascade,
  papel text not null default 'responsavel',
  criado_em timestamptz not null default now(),
  unique (usuario_id, assistido_id)
);
alter table public.usuarios_assistidos enable row level security;

create index if not exists ix_usuarios_auth on public.usuarios(id_auth);
create index if not exists ix_ua_usuario on public.usuarios_assistidos(usuario_id);
create index if not exists ix_ua_assistido on public.usuarios_assistidos(assistido_id);

create or replace function public.usuario_tem_acesso_ao_assistido(p_assistido uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.usuarios_assistidos ua
    join public.usuarios u on u.id = ua.usuario_id
    where ua.assistido_id = p_assistido
      and u.id_auth = auth.uid()
  );
$$;

create policy if not exists usuarios_select_meu on public.usuarios
  for select using ( id_auth = auth.uid() );
create policy if not exists usuarios_insert_meu on public.usuarios
  for insert with check ( id_auth = auth.uid() );
create policy if not exists usuarios_update_meu on public.usuarios
  for update using ( id_auth = auth.uid() );

create policy if not exists assistidos_select on public.assistidos
  for select using ( public.usuario_tem_acesso_ao_assistido(id) );
create policy if not exists assistidos_update on public.assistidos
  for update using ( public.usuario_tem_acesso_ao_assistido(id) );
create policy if not exists assistidos_insert on public.assistidos
  for insert with check ( true );

create policy if not exists ligacao_select on public.usuarios_assistidos
  for select using (
    usuario_id in (select id from public.usuarios where id_auth = auth.uid())
  );
create policy if not exists ligacao_insert on public.usuarios_assistidos
  for insert with check (
    usuario_id in (select id from public.usuarios where id_auth = auth.uid())
  );
create policy if not exists ligacao_delete on public.usuarios_assistidos
  for delete using (
    usuario_id in (select id from public.usuarios where id_auth = auth.uid())
  );

drop view if exists public.meus_assistidos;
create view public.meus_assistidos
with (security_invoker = true, security_barrier = true) as
select a.*
from public.assistidos a
where public.usuario_tem_acesso_ao_assistido(a.id);
