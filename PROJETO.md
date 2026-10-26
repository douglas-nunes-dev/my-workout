# My Workout — Planejamento do Projeto

## 1. Visão geral

Aplicação web pessoal para cadastrar e consultar minhas séries de musculação,
com atalho para vídeos de execução de cada exercício no YouTube.

Os dados ficam **na nuvem (Supabase)**: cadastro no computador e consulto no
celular, na academia, com login.

**Objetivos de aprendizado:** React 19, TypeScript, Vite, Tailwind CSS 4,
rotas, formulários com validação, banco de dados na nuvem, login e deploy.

## 2. Stack (tecnologias usadas)

Versões instaladas em outubro/2026 (a lista exata fica no `package.json` e no `package-lock.json`).

### Front-end (o app que roda no navegador)

| Tecnologia | Versão | Para que serve |
| --- | --- | --- |
| **React** (`react`, `react-dom`) | 19.3 | Monta as telas com componentes |
| **TypeScript** | 6.0 | JavaScript com tipos; avisa erros antes de rodar |
| **Tailwind CSS** (`tailwindcss`, `@tailwindcss/vite`) | 4.3 | Estilo com classes prontas (`bg-card`, `p-4`...) e tema diurno/noturno |
| **React Router** (`react-router`) | 8.4 | Rotas: troca de tela pela URL (`/treinos/:id`) |
| **React Hook Form** (`react-hook-form`) | 7.90 | Controla os campos dos formulários |
| **Zod** (`zod`) | 4.6 | Regras de validação dos formulários (pasta `schemas/`) |
| **@hookform/resolvers** | 5.9 | Liga o Zod ao React Hook Form |
| **lucide-react** | 1.57 | Ícones (lápis, lixeira, ✓...) |
| **@supabase/supabase-js** | 2.117 | Biblioteca que conversa com o Supabase (login e dados) |
| **localStorage** (do próprio navegador) | — | Guarda o tema escolhido e os ✓ do treino do dia |

### Back-end e nuvem (serviços online)

| Tecnologia | Para que serve |
| --- | --- |
| **Supabase** | "Backend pronto": API automática, login e regras de segurança |
| ↳ **PostgreSQL** | O banco de dados (relacional, SQL; parente do MySQL) |
| ↳ **Supabase Auth** | Login com e-mail e senha |
| ↳ **RLS** (Row Level Security) | Cada usuário só vê e altera os próprios dados |
| **Vercel** | Hospeda o site; publica sozinho a cada `git push` |
| **YouTube** (só link de busca, sem API) | Botão "Ver no YouTube" de cada exercício |

### Ferramentas de desenvolvimento

| Tecnologia | Versão | Para que serve |
| --- | --- | --- |
| **Node.js** | 24 | Roda as ferramentas abaixo no computador |
| **npm** | 11 | Instala as bibliotecas (`npm install`) e roda os scripts (`npm run dev`) |
| **Vite** (+ `@vitejs/plugin-react`) | 8.3 | Servidor de desenvolvimento (`npm run dev`) e build de produção |
| **ESLint** (+ `typescript-eslint`, plugins `react-hooks` e `react-refresh`) | 10.12 | Aponta erros e más práticas no código (`npm run lint`) |
| **@types/react**, **@types/react-dom**, **@types/node** | — | Tipos do TypeScript para essas bibliotecas |
| **Git** + **GitHub** | — | Histórico do código e sincronização entre computadores |
| **VS Code** + **Claude Code** | — | Editor e assistente |

### Usadas antes ou pausadas

| Tecnologia | Situação |
| --- | --- |
| ~~Dexie (IndexedDB)~~ | 🗑️ Removido: guardava os dados no navegador; trocado pelo Supabase |
| ~~Supabase Storage~~ | ⏸️ Pausado: bucket `exercise-media` criado, sem uso (ideia da versão 2) |

### Como as peças se conectam

```
 Celular / Computador                 Supabase (nuvem)
┌───────────────────────┐        ┌──────────────────────────────┐
│  App React (Vercel)   │ ─────► │  Auth     → login            │
│                       │        │  Database → tabelas (dados)  │
│ @supabase/supabase-js │        │  Storage  → (sem uso ainda)  │
└───────────────────────┘        └──────────────────────────────┘
```

O código fica no GitHub; a cada `git push` a Vercel publica a nova versão sozinha.

### Limites do plano gratuito do Supabase
- Banco: 500 MB (sobra muito para texto)
- Storage: **1 GB no total** e **até 50 MB por arquivo** (só importa se um dia
  usarmos upload de fotos/vídeos)
- Projetos gratuitos **pausam após 7 dias sem uso**; basta reativar no painel

## 3. Funcionalidades

### MVP (versão 1)
- [x] **Login** com e-mail e senha (só eu uso o app)
- [x] Cadastrar, editar e excluir **exercícios** (nome, grupo muscular, observações), com botão "Salvar e cadastrar outro"
- [x] **Não permite exercícios com o mesmo nome** (sem diferenciar maiúsculas/minúsculas), para não
  excluir o exercício errado por engano
- [x] **Cardio** no fim do treino: grupo muscular "Cardio"; na tela do treino mostra só a duração
- [x] Botão **"Ver no YouTube"** em cada exercício: abre a busca do YouTube pelo nome do exercício
  (no lugar do upload de fotos/vídeos, que daria muito trabalho manual)
- [x] Cadastrar **treinos** (ex.: A1, B1, C1) com uma lista de exercícios e o **dia da semana**
- [x] Definir em cada exercício do treino: séries, repetições e descanso (a **carga** é editada na tela do treino)
- [x] Tela inicial com **saudação** ("Bom dia, Douglas!"), data de hoje e a **divisão semanal** (hoje destacado; dia sem treino = Descanso)
- [x] Tela de **visualização do treino** para usar na academia (mobile first): cartões que abrem/fecham,
  editar carga, **concluir exercício** (✓), barra de progresso e **finalizar treino**
- [x] **Modo diurno e noturno** (botão ☀️/🌙; noturno em cinza escuro + verde `#00E676`)
- [x] App publicado na internet: https://my-workout-ten-gilt.vercel.app

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

**Nome do exercício sem repetição:** antes de salvar, o app procura outro exercício com o
mesmo nome usando `ilike` (o `like` que não diferencia maiúsculas de minúsculas), sem
curinga `%`: "Supino" não é bloqueado por existir "Supino reto". Na edição, o próprio
exercício não conta. A regra está só no app (em `services/exercises.ts`), não no banco.

**Cardio:** não tem tabela própria. É um exercício com grupo muscular `Cardio`, adicionado
por último no treino dos dias em que é feito, com **1 série** e a **duração no campo
repetições** (ex.: "20 min" ou "20 min, inclinação 8").

**Ao excluir:** excluir um exercício o remove junto dos treinos (`on delete cascade`).
Excluir um treino apaga junto a lista de exercícios dele.

**Fotos e vídeos (criado, mas ainda sem uso no app):** a tabela `exercise_media` e o
bucket privado `exercise-media` já existem para a ideia de upload da versão 2.
Plano: arquivos em `<id do usuário>/<id do exercício>/<arquivo>`, a tabela guarda
só o caminho (`file_path`) e o app exibe com um link temporário (*signed URL*).
Nesse caso, ao excluir um exercício, o app precisa apagar os arquivos antes.

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
| `/exercicios/:id`        | Detalhe do exercício (+ Ver no YouTube) |
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
     ( ✏️ Editar carga ) ( ▶ Ver no YouTube )
[5]  Desenvolvimento máquina/halteres  ⌄
     3x 8–12
[8]  Esteira                           ⌃   ◄ cardio (aberto)
     (⏱) Duração: 20 min
     (      ✓ Concluir exercício      )
     (        ▶ Ver no YouTube        )
──────────────────────────────────────
(         🏁 Finalizar treino         )   ◄ barra fixa
```

Ao concluir um exercício, o próximo abre sozinho. Os ✓ do dia ficam salvos no
aparelho (se a página recarregar, não se perdem). Exercícios do grupo **Cardio** mostram
só a duração (sem séries, carga, intervalo e "Editar carga"). No futuro, o quadrado com o
número pode mostrar a miniatura de um vídeo fixado (ideia da versão 2).

## 6. Estrutura de pastas

```
supabase/
├── schema.sql              # script das tabelas, segurança e storage
└── 002-dia-da-semana.sql   # alteração: coluna day_of_week
src/
├── components/      # Layout, PageTitle, RequireAuth (porteiro do login), ThemeToggle (☀️/🌙), YoutubeButton
├── constants/       # listas fixas (grupos musculares, incluindo Cardio; dias da semana)
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
index.html           # inclui o script que aplica o tema antes da página aparecer
vercel.json          # faz as rotas funcionarem ao recarregar a página na Vercel
.env.local           # chaves do Supabase (NÃO vai para o Git)
```

### Variáveis de ambiente (`.env.local`)

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
```

A chave *publishable* pode ficar no navegador, porque quem protege os dados é o RLS.
**Nunca** usar a chave *secret* no app.

As mesmas duas variáveis estão cadastradas na Vercel (Settings → Environment Variables).
Se mudar alguma, é preciso fazer **Redeploy** lá.

### Rodar o projeto em outro computador

```bash
git clone https://github.com/douglasonunesinfo/my-workout.git
cd my-workout
npm install
# criar o .env.local com as duas variáveis acima (ele não vem do GitHub)
npm run dev
```

No dia a dia: `git pull` antes de começar e `git push` ao terminar
(o push também publica na Vercel).

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
12. [x] Publicar na Vercel: https://my-workout-ten-gilt.vercel.app (publica sozinho a cada `git push`)
13. [ ] Ajustes visuais e responsividade (tema escuro ✅ feito: cinza escuro + verde #00E676, botão ☀️/🌙)
14. [x] Bloquear exercícios com nome repetido (`ilike` antes de salvar)
15. [x] Cardio no fim do treino (grupo "Cardio", exibe só a duração)

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
- Commits pequenos, um por etapa do roteiro
- Repositório (privado): https://github.com/douglasonunesinfo/my-workout
