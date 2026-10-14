// Os campos têm os mesmos nomes das colunas do banco (Supabase).
// "| null" = o campo pode estar vazio no banco.

// Exercício da biblioteca (ex.: Supino reto)
export interface Exercise {
  id: string
  name: string
  muscle_group: string // "Peito", "Costas", "Pernas"...
  notes: string | null
  created_at: string
}

// Foto, vídeo ou link do YouTube de um exercício
export interface ExerciseMedia {
  id: string
  exercise_id: string
  type: string // "imagem", "video" ou "youtube"
  file_path: string | null // caminho do arquivo no Storage (imagem ou vídeo)
  url: string | null // link (youtube)
}

// Treino (ex.: "A1" - "Peito + Ombro + Tríceps")
export interface Workout {
  id: string
  name: string // "A1"
  description: string | null // "Peito + Ombro + Tríceps"
  day_of_week: number | null // 0 = Domingo, 1 = Segunda ... 6 = Sábado
  created_at: string
}

// Exercício dentro de um treino, com séries, repetições e carga
export interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  sets: number // séries
  reps: string // "10-12", "até a falha"
  weight_kg: number | null // carga
  rest_seconds: number | null // descanso
  position: number // ordem no treino
}
