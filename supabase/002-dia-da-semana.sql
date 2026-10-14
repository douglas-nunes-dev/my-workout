-- =====================================================================
-- Alteração 002: dia da semana no treino
-- Como usar: no painel do Supabase, abra "SQL Editor", cole este arquivo
-- e clique em "Run". (Rodar só uma vez.)
-- =====================================================================

-- Dia da semana do treino, no mesmo padrão do JavaScript (Date.getDay()):
-- 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
-- Vazio (null) = treino sem dia fixo. Dia sem treino = Descanso.
alter table workouts
  add column day_of_week smallint check (day_of_week between 0 and 6);
