-- Cena Raiz — controle de acesso de membros
-- Projeto Supabase: chfrrgnuinhhkvavndsw
--
-- COMO USAR
--   1. Abra https://supabase.com/dashboard
--   2. Selecione o projeto do Sistema Marca Raiz
--   3. Menu da esquerda -> SQL Editor -> New query
--   4. Cole este arquivo inteiro e clique em RUN
--
-- Pode ser executado mais de uma vez sem erro.

-- ---------------------------------------------------------------------------
-- Tabela de matriculas
-- ---------------------------------------------------------------------------
create table if not exists public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  status      text not null default 'active'
              check (status in ('active', 'inactive', 'canceled')),
  expires_at  timestamptz,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.enrollments is
  'Direito de uso do Cena Raiz. O app concede acesso quando existe linha com status active e nao expirada.';

-- Uma pessoa nao precisa de duas matriculas ativas.
create unique index if not exists enrollments_one_active_per_user
  on public.enrollments (user_id)
  where status = 'active';

-- A consulta do app filtra por user_id via RLS; o indice evita varredura completa.
create index if not exists enrollments_user_id_idx
  on public.enrollments (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.enrollments enable row level security;

-- Vale inclusive para o dono da tabela: ninguem escapa da politica por acidente.
alter table public.enrollments force row level security;

drop policy if exists enrollments_select_own on public.enrollments;

-- Cada pessoa enxerga apenas as proprias matriculas.
--
-- auth.uid() vem embrulhada em subquery de proposito: sem isso o Postgres a
-- executa uma vez POR LINHA. Com subquery, executa uma vez por consulta.
create policy enrollments_select_own
  on public.enrollments
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Nenhuma policy de insert, update ou delete e criada de proposito.
-- Se o app cliente pudesse escrever aqui, qualquer usuario se auto-concederia
-- acesso vitalicio. Conceder matricula e operacao administrativa: usa a secret
-- key, que ignora RLS por design, a partir do painel ou de um backend.

-- ---------------------------------------------------------------------------
-- updated_at automatico
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists enrollments_touch_updated_at on public.enrollments;

create trigger enrollments_touch_updated_at
  before update on public.enrollments
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- CONCEDER ACESSO A ALGUEM
--
-- A pessoa precisa existir antes em Authentication -> Users.
-- Troque o e-mail e rode apenas esta parte:
-- ---------------------------------------------------------------------------
-- insert into public.enrollments (user_id, status, notes)
-- select id, 'active', 'acesso concedido manualmente'
--   from auth.users
--  where email = 'pessoa@exemplo.com'
-- on conflict do nothing;

-- ---------------------------------------------------------------------------
-- CONFERIR QUEM TEM ACESSO
-- ---------------------------------------------------------------------------
-- select u.email, e.status, e.expires_at, e.created_at
--   from public.enrollments e
--   join auth.users u on u.id = e.user_id
--  order by e.created_at desc;

-- ---------------------------------------------------------------------------
-- REVOGAR
-- ---------------------------------------------------------------------------
-- update public.enrollments set status = 'canceled'
--  where user_id = (select id from auth.users where email = 'pessoa@exemplo.com');
