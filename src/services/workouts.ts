import { supabase } from '../lib/supabase'
import type { WorkoutFormData } from '../schemas/workoutSchema'
import type { Workout, WorkoutExercise } from '../types'

// Funções para buscar, salvar e excluir treinos no Supabase.

export async function getWorkouts() {
  const { data, error } = await supabase.from('workouts').select('*').order('name')

  if (error) {
    throw error
  }
  return data as Workout[]
}

// Devolve o treino, ou null se não existir
export async function getWorkout(id: string) {
  const { data, error } = await supabase.from('workouts').select('*').eq('id', id).maybeSingle()

  if (error) {
    throw error
  }
  return data as Workout | null
}

// Exercícios de um treino, na ordem
export async function getWorkoutExercises(workoutId: string) {
  const { data, error } = await supabase
    .from('workout_exercises')
    .select('*')
    .eq('workout_id', workoutId)
    .order('position')

  if (error) {
    throw error
  }
  return data as WorkoutExercise[]
}

// Cria o treino com seus exercícios e devolve o id gerado
export async function createWorkout(formData: WorkoutFormData) {
  const dayOfWeek = textToNumberOrNull(formData.day_of_week)
  await freeDayOfWeek(dayOfWeek, '')

  const { data, error } = await supabase
    .from('workouts')
    .insert({
      name: formData.name,
      description: formData.description,
      day_of_week: dayOfWeek,
    })
    .select('id')
    .single()

  if (error) {
    throw error
  }

  const newId = data.id as string
  await saveWorkoutExercises(newId, formData)
  return newId
}

export async function updateWorkout(id: string, formData: WorkoutFormData) {
  const dayOfWeek = textToNumberOrNull(formData.day_of_week)
  await freeDayOfWeek(dayOfWeek, id)

  const { error } = await supabase
    .from('workouts')
    .update({
      name: formData.name,
      description: formData.description,
      day_of_week: dayOfWeek,
    })
    .eq('id', id)

  if (error) {
    throw error
  }

  // Jeito simples de atualizar a lista: apaga os exercícios antigos e grava os novos
  const { error: deleteError } = await supabase
    .from('workout_exercises')
    .delete()
    .eq('workout_id', id)

  if (deleteError) {
    throw deleteError
  }

  await saveWorkoutExercises(id, formData)
}

// Muda só a carga de um exercício do treino ("" = sem carga)
export async function updateWorkoutExerciseWeight(workoutExerciseId: string, weightText: string) {
  const { error } = await supabase
    .from('workout_exercises')
    .update({ weight_kg: textToNumberOrNull(weightText) })
    .eq('id', workoutExerciseId)

  if (error) {
    throw error
  }
}

// Excluir o treino apaga junto os exercícios dele (on delete cascade no banco)
export async function deleteWorkout(id: string) {
  const { error } = await supabase.from('workouts').delete().eq('id', id)

  if (error) {
    throw error
  }
}

// ---------------------------------------------------------------------
// Funções auxiliares (usadas só neste arquivo)
// ---------------------------------------------------------------------

// Grava a lista de exercícios do formulário na tabela workout_exercises
async function saveWorkoutExercises(workoutId: string, formData: WorkoutFormData) {
  const rows = formData.exercises.map((item, index) => {
    return {
      workout_id: workoutId,
      exercise_id: item.exercise_id,
      sets: Number(item.sets),
      reps: item.reps,
      weight_kg: textToNumberOrNull(item.weight_kg),
      rest_seconds: textToNumberOrNull(item.rest_seconds),
      position: index, // ordem da lista
    }
  })

  const { error } = await supabase.from('workout_exercises').insert(rows)

  if (error) {
    throw error
  }
}

// Cada dia só tem um treino: tira o dia de outro treino que já esteja nele
async function freeDayOfWeek(dayOfWeek: number | null, currentWorkoutId: string) {
  if (dayOfWeek === null) {
    return
  }

  let query = supabase.from('workouts').update({ day_of_week: null }).eq('day_of_week', dayOfWeek)
  if (currentWorkoutId) {
    query = query.neq('id', currentWorkoutId)
  }

  const { error } = await query
  if (error) {
    throw error
  }
}

// "" vira null; "20" vira 20; "12,5" vira 12.5
function textToNumberOrNull(text: string) {
  if (text.trim() === '') {
    return null
  }
  return Number(text.replace(',', '.'))
}
