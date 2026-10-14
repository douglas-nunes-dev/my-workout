-- =====================================================================
-- My Workout — estrutura do banco no Supabase
-- Como usar: no painel do Supabase, abra "SQL Editor", cole este arquivo
-- inteiro e clique em "Run".
-- =====================================================================


-- ---------------------------------------------------------------------
-- Tabela: exercises (biblioteca de exercícios)
-- ---------------------------------------------------------------------
create table exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  muscle_group text not null,
  notes text,
  created_at timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- Tabela: exercise_media (fotos, vídeos e links do YouTube de um exercício)
-- ---------------------------------------------------------------------
create table exercise_media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  exercise_id uuid not null references exercises (id) on delete cascade,
  type text not null check (type in ('imagem', 'video', 'youtube')),
  file_path text, -- caminho do arquivo no Storage (imagem ou vídeo)
  url text,       -- link (youtube)
  created_at timestamptz not null default now()
);

create index exercise_media_exercise_id_idx on exercise_media (exercise_id);


-- ---------------------------------------------------------------------
-- Tabela: workouts (treinos, ex.: "A1" - "Peito + Ombro + Tríceps")
-- ---------------------------------------------------------------------
create table workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,        -- "A1"
  description text,          -- "Peito + Ombro + Tríceps"
  -- dia da semana, padrão do JavaScript: 0 = Domingo, 1 = Segunda ... 6 = Sábado
  -- (veio da alteração 002-dia-da-semana.sql; quem roda este arquivo do zero
  --  NÃO precisa rodar a 002)
  day_of_week smallint check (day_of_week between 0 and 6),
  created_at timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- Tabela: workout_exercises (exercícios dentro de um treino)
-- ---------------------------------------------------------------------
create table workout_exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  workout_id uuid not null references workouts (id) on delete cascade,
  exercise_id uuid not null references exercises (id) on delete cascade,
  sets integer not null,  -- séries
  reps text not null,     -- "10-12", "até a falha"
  weight_kg numeric,      -- carga
  rest_seconds integer,   -- descanso
  position integer not null default 0 -- ordem no treino
);

create index workout_exercises_workout_id_idx on workout_exercises (workout_id);
create index workout_exercises_exercise_id_idx on workout_exercises (exercise_id);


-- ---------------------------------------------------------------------
-- Segurança (RLS): cada usuário só vê e altera os PRÓPRIOS dados
-- ---------------------------------------------------------------------
alter table exercises enable row level security;
alter table exercise_media enable row level security;
alter table workouts enable row level security;
alter table workout_exercises enable row level security;

create policy "Dono acessa seus exercícios" on exercises
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Dono acessa suas mídias" on exercise_media
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Dono acessa seus treinos" on workouts
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Dono acessa os exercícios dos seus treinos" on workout_exercises
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));


-- ---------------------------------------------------------------------
-- Storage: pasta (bucket) privada para fotos e vídeos, limite de 50 MB
-- Os arquivos ficam em: <id do usuário>/<id do exercício>/<nome do arquivo>
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('exercise-media', 'exercise-media', false, 52428800, array['image/*', 'video/*']);

create policy "Dono acessa seus arquivos" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'exercise-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'exercise-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
