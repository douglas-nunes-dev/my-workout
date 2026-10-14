# My Workout — Planejamento do Projeto

## 1. Visão geral

Aplicação web pessoal para cadastrar e consultar minhas séries de musculação,
com fotos e vídeos de cada exercício para lembrar a execução correta.

Os dados ficam **na nuvem (Supabase)**: cadastro no computador e consulto no
celular, na academia, com login.

**Objetivos de aprendizado:** React 19, TypeScript, Vite, Tailwind CSS 4,
rotas, formulários com validação, banco de dados na nuvem, login e deploy.

## 2. Stack

| Camada            | Tecnologia                                    | Status          |
| ----------------- | --------------------------------------------- | --------------- |
| Build / Dev       | Vite                                          | ✅ instalado    |
| UI                | React 19 + TypeScript                         | ✅ instalado    |
| Estilo            | Tailwind CSS 4 (`@tailwindcss/vite`)          | ✅ configurado  |
| Rotas             | React Router                                  | ✅ instalado    |
| Formulários       | React Hook Form + Zod (`@hookform/resolvers`) | ✅ instalado    |
| Ícones            | lucide-react                                  | ✅ instalado    |
| Banco de dados    | Supabase (PostgreSQL)                         | ✅ configurado  |
| Login             | Supabase Auth (e-mail e senha)                | ✅ configurado  |
| Vídeos            | Busca do YouTube (link, sem API)              | ✅ feito        |
| ~~Fotos e vídeos~~ | ~~Supabase Storage~~ (bucket criado, sem uso por enquanto) | ⏸️ pausado |
| Hospedagem        | Vercel                                        | ⬜ a configurar |
| ~~Persistência local~~ | ~~Dexie (IndexedDB)~~, substituído pelo Supabase | 🗑️ removido |

### Como as peças se conectam

```
 Celular / Computador                 Supabase (nuvem)
┌───────────────────────┐        ┌──────────────────────────────┐
│  App React (Vercel)   │ ─────► │  Auth     → login            │
│                       │        │  Database → tabelas (dados)  │
│ @supabase/supabase-js │        │  Storage  → fotos e vídeos   │
└───────────────────────┘        └──────────────────────────────┘
```

### Limites do plano gratuito do Supabase
- Banco: 500 MB (sobra muito para texto)
- Storage: **1 GB no total** e **até 50 MB por arquivo**
- Dica: preferir fotos e vídeos curtos (poucos segundos); para vídeos longos,
  usar link do YouTube
- Projetos gratuitos **pausam após 7 dias sem uso**; basta reativar no painel

## 3. Funcionalidades

### MVP (versão 1)
- [x] **Login** com e-mail e senha (só eu uso o app)
- [x] Cadastrar, editar e excluir **exercícios** (nome, grupo muscular, observações), com botão "Salvar e cadastrar outro"
- [x] Botão **"Ver no YouTube"** em cada exercício: abre a busca do YouTube pelo nome do exercício
  (no lugar do upload de fotos/vídeos, que daria muito trabalho manual)
- [x] Cadastrar **treinos** (ex.: A1, B1, C1) com uma lista de exercícios e o **dia da semana**
- [x] Definir em cada exercício do treino: séries, repetições e descanso (a **carga** é editada na tela do treino)
- [x] Tela inicial com **saudação** ("Bom dia, Douglas!"), data de hoje e a **divisão semanal** (hoje destacado; dia sem treino = Descanso)
- [x] Tela de **visualização do treino** para usar na academia (mobile first): cartões que abrem/fecham,
  editar carga, **concluir exercício** (✓), barra de progresso e **finalizar treino**
- [x] **Modo diurno e noturno** (botão ☀️/🌙; noturno em cinza escuro + verde `#00E676`)
- [ ] App publicado na internet (Vercel)

### Versão 2 (ideias)
- [ ] Registrar treino realizado no banco (histórico de cargas). Hoje os ✓ do dia ficam só no
  aparelho (localStorage) e zeram no dia seguinte
- [ ] Gráfico de evolução de carga por exercício
- [ ] Cronômetro de descanso
- [ ] PWA (ícone na tela inicial do celular)
- [ ] "Fixar" um vídeo do YouTube no exercício (colar o link) e mostrar a miniatura no quadrado
- [ ] Upload de fotos/vídeos próprios (Supabase Storage, bucket `exercise-media` já criado)

## 4. Banco de dados

O script completo está em [`supabase/schema.sql`](supabase/schema.sql).
Alterações feitas depois ficam em arquivos numerados (`supabase/002-...sql`).

```
exercises ──< exercise_media              (um exercício tem várias mídias)
    │
    └──< workout_exercises >── workouts   (um treino tem vários exercícios)
```

| Tabela              | Campos principais                                                          |
| ------------------- | -------------------------------------------------------------------------- |
| `exercises`         | id, name, muscle_group, notes, created_at                                  |
| `exercise_media`    | id, exercise_id, type (`imagem`/`video`/`youtube`), file_path, url         |
| `workouts`          | id, name, description, day_of_week, created_at                             |
| `workout_exercises` | id, workout_id, exercise_id, sets, reps, weight_kg, rest_seconds, position |

Todas as tabelas têm `user_id`, preenchido automaticamente com o usuário logado.

**Nome da saudação:** fica nos dados do usuário do Supabase (`user_metadata.name`).
Para mudar, rodar no SQL Editor (e depois sair e entrar de novo no app):

```sql
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"name": "Douglas"}'
where email = 'douglasonunes@gmail.com';
```

**Segurança (RLS, Row Level Security):** o Postgres só deixa cada usuário ver e
alterar as linhas em que `user_id` é o dele. Mesmo que alguém pegue a chave
pública do app, não consegue ler os dados de outra pessoa.

**Fotos e vídeos:** ficam no bucket privado `exercise-media`, no caminho
`<id do usuário>/<id do exercício>/<arquivo>`. A tabela `exercise_media` guarda
só o caminho (`file_path`). Para exibir, o app gera um link temporário
(*signed URL*).

**Ao excluir:** excluir um exercício apaga junto suas mídias (linhas) e o remove
dos treinos (`on delete cascade`). Os **arquivos** do Storage precisam ser
apagados pelo app antes.

### Tipos TypeScript

Tipagem simples: `interface` com os mesmos nomes das colunas do banco.
`null` = campo vazio no banco.

```ts
interface Exercise {
  id: string
  name: string
  muscle_group: string  // "Peito", "Costas"...
  notes: string | null
  created_at: string
}

interface ExerciseMedia {
  id: string
  exercise_id: string
  type: string          // "imagem", "video" ou "youtube"
  file_path: string | null
  url: string | null
}

interface Workout {
  id: string
  name: string          // "A1"
  description: string | null  // "Peito + Ombro + Tríceps"
  day_of_week: number | null  // 0 = Domingo, 1 = Segunda ... 6 = Sábado
  created_at: string
}

interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  sets: number          // séries
  reps: string          // "10-12", "até a falha"
  weight_kg: number | null
  rest_seconds: number | null
  position: number      // ordem no treino
}
```

## 5. Telas e rotas

| Rota                     | Tela                                 |
| ------------------------ | ------------------------------------ |
| `/login`                 | Login (única tela sem estar logado)  |
| `/`                      | Divisão semanal (treino de cada dia) |
| `/treinos/novo`          | Criar treino                         |
| `/treinos/:id`           | Ver treino (modo academia)           |
| `/treinos/:id/editar`    | Editar treino                        |
| `/exercicios`            | Biblioteca de exercícios             |
| `/exercicios/novo`       | Cadastrar exercício                  |
| `/exercicios/:id`        | Detalhe do exercício (mídia)         |
| `/exercicios/:id/editar` | Editar exercício                     |

Se não estiver logado, qualquer rota redireciona para `/login`.

### Como as telas principais ficam

**Tela inicial: divisão semanal** (`/`)

```
DIVISÃO SEMANAL
┌───────────────────────────────────────┐
│ SEG  A1 · Peito + Ombro + Tríceps   › │ ◄ hoje (destacado)
│ TER  B1 · Costas + Bíceps           › │
│ QUA  C1 · Pernas + Abdômen          › │
│ QUI  A2 · Peito + Ombro + Tríceps   › │
│ SEX  B2 · Costas + Bíceps           › │
│ SÁB  C2 · Pernas + Abdômen          › │
│ DOM  Descanso                         │ ◄ dia sem treino
└───────────────────────────────────────┘
```

**Tela do treino: modo academia** (`/treinos/:id`)

```
SEGUNDA — A1
PEITO + OMBRO + TRÍCEPS
Progresso                         3 de 7
████████████░░░░░░░░░░░░░░░░

[1]  Supino inclinado com halteres  ✅ ⌄   ◄ concluído
[2]  Supino reto máquina ou barra   ✅ ⌄
[3]  Crossover                      ✅ ⌄
[4]  Elevação lateral                  ⌃   ◄ aberto
     (↻) Séries: 4
     Repetições 10–15 | Carga 8 kg | Intervalo -
     (      ✓ Concluir exercício      )
     (      ✏️ Editar carga            )
[5]  Desenvolvimento máquina/halteres  ⌄
     3x 8–12
──────────────────────────────────────
(         🏁 Finalizar treino         )   ◄ barra fixa
```

Ao concluir um exercício, o próximo abre sozinho. Os ✓ do dia ficam salvos no
aparelho (se a página recarregar, não se perdem). "Ver no YouTube" fica ao lado de
"Editar carga". No futuro, o quadrado com o
número pode mostrar a miniatura de um vídeo fixado (ideia da versão 2).

## 6. Estrutura de pastas

```
supabase/
├── schema.sql              # script das tabelas, segurança e storage
└── 002-dia-da-semana.sql   # alteração: coluna day_of_week
src/
├── components/      # Layout, PageTitle, RequireAuth (porteiro do login), ThemeToggle (☀️/🌙), YoutubeButton
├── constants/       # listas fixas (grupos musculares, dias da semana)
├── pages/           # uma tela por arquivo
├── lib/
│   └── supabase.ts  # conexão com o Supabase
├── services/        # funções que leem/gravam no Supabase (exercises.ts, workouts.ts...)
├── hooks/           # hooks (useSession...)
├── schemas/         # validação dos formulários (Zod)
├── types/           # interfaces TypeScript (seção 4)
├── utils/           # funções auxiliares (saudação, progresso do treino do dia, link do YouTube)
├── App.tsx          # rotas
├── index.css        # Tailwind + cores do tema (diurno e noturno)
└── main.tsx
.env.local           # chaves do Supabase (NÃO vai para o Git)
```

### Variáveis de ambiente (`.env.local`)

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
```

A chave *publishable* pode ficar no navegador, porque quem protege os dados é o RLS.
**Nunca** usar a chave *secret* no app.

## 7. Roteiro de implementação

1. [x] Configurar Tailwind 4 e limpar o template do Vite
2. [x] React Router e layout base (cabeçalho + navegação)
3. [x] ~~Tipos e banco Dexie~~ (substituído pelo Supabase)
4. [x] CRUD de exercícios com Dexie (as telas serão reaproveitadas)
5. [x] **Criar o projeto no Supabase** (eu, no painel):
   - criar conta e projeto em supabase.com
   - rodar `supabase/schema.sql` no SQL Editor
   - criar meu usuário em Authentication → Users
   - desativar novos cadastros (Authentication → Sign In / Providers → "Allow new users to sign up")
   - copiar URL e publishable key para o `.env.local`
6. [x] Conectar o app ao Supabase (`@supabase/supabase-js`)
7. [x] Tela de login e proteção das rotas
8. [x] Migrar o CRUD de exercícios para o Supabase e remover o Dexie
9. [x] ~~Upload de foto/vídeo~~ → botão "Ver no YouTube" (busca pelo nome do exercício)
10. [x] CRUD de treinos, vinculando exercícios e dia da semana
11. [x] Tela "modo academia": cartões que abrem/fecham, editar carga, concluir exercício (✓) e finalizar treino
12. [ ] Publicar na Vercel (antes: colocar o projeto no Git/GitHub)
13. [ ] Ajustes visuais e responsividade (tema escuro ✅ feito: cinza escuro + verde #00E676, botão ☀️/🌙)

## 8. Convenções

- **Código simples e fácil de entender:** tipagem básica com `interface`, sem tipos avançados
  (generics, `Pick`, `Omit`, unions complexas); preferir `if/else` a ternários aninhados;
  funções com nomes claros
- Componentes em `PascalCase.tsx`, hooks começando com `use`
- Textos da interface em português; código em inglês
- Campos dos tipos com os mesmos nomes das colunas do banco (`muscle_group`)
- **Cores:** usar os nomes do tema (`bg-primary`, `bg-card`, `text-muted`...) definidos no
  `index.css`, nunca cores fixas (`bg-blue-600`), para funcionar nos dois modos
- Mobile first: o uso principal é no celular, na academia
- Commits pequenos, um por etapa do roteiro (o projeto ainda **não** está no Git)
