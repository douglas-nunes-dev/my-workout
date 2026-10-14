import { z } from 'zod'

// Os campos numéricos ficam como texto no formulário (é assim que o <input> devolve).
// A conversão para número acontece na hora de salvar (services/workouts.ts).

// Regras de cada exercício dentro do treino
const workoutExerciseSchema = z.object({
  exercise_id: z.string().min(1, 'Escolha o exercício'),
  sets: z.string().regex(/^[0-9]+$/, 'Informe as séries'),
  reps: z.string().trim().min(1, 'Informe as repetições'),
  weight_kg: z.string().regex(/^([0-9]+([.,][0-9]+)?)?$/, 'Carga inválida'), // vazio ou número
  rest_seconds: z.string().regex(/^[0-9]*$/, 'Só números'), // vazio ou número
})

// Regras do formulário de treino
export const workoutSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do treino'),
  description: z.string(),
  day_of_week: z.string(), // "" = sem dia fixo, "0" a "6" = dia da semana
  exercises: z.array(workoutExerciseSchema).min(1, 'Adicione pelo menos um exercício'),
})

// Campos de cada exercício do treino no formulário
export interface WorkoutExerciseFormData {
  exercise_id: string
  sets: string // "3"
  reps: string // "6–10"
  weight_kg: string // "20" ou "" (vazio). Não aparece no formulário; é editada na tela do treino
  rest_seconds: string // "90" ou "" (vazio)
}

// Campos do formulário de treino
export interface WorkoutFormData {
  name: string // "A1"
  description: string // "Peito + Ombro + Tríceps"
  day_of_week: string
  exercises: WorkoutExerciseFormData[]
}

// Linha vazia usada ao clicar em "Adicionar exercício"
export const emptyWorkoutExercise: WorkoutExerciseFormData = {
  exercise_id: '',
  sets: '3',
  reps: '',
  weight_kg: '',
  rest_seconds: '',
}
