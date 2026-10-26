import { supabase } from '../lib/supabase'
import type { ExerciseFormData } from '../schemas/exerciseSchema'
import type { Exercise } from '../types'

// Funções para buscar, salvar e excluir exercícios no Supabase.
// Se o Supabase devolver erro, a função lança o erro ("throw")
// para a tela mostrar uma mensagem.

export async function getExercises() {
  const { data, error } = await supabase.from('exercises').select('*').order('name')

  if (error) {
    throw error
  }
  return data as Exercise[]
}

// Devolve o exercício, ou null se não existir
export async function getExercise(id: string) {
  const { data, error } = await supabase.from('exercises').select('*').eq('id', id).maybeSingle()

  if (error) {
    throw error
  }
  return data as Exercise | null
}

// Diz se já existe outro exercício com esse nome.
// Usa "ilike" para não diferenciar maiúsculas de minúsculas
// ("Supino reto" e "supino RETO" contam como o mesmo nome).
// Na edição, passe o id do exercício para ele não contar a si mesmo.
export async function exerciseNameExists(name: string, ignoreId?: string) {
  // % e _ são curingas no ilike; a barra faz eles valerem como texto comum
  const safeName = name.replace(/[\\%_]/g, '\\$&')

  let query = supabase.from('exercises').select('id').ilike('name', safeName)
  if (ignoreId) {
    query = query.neq('id', ignoreId)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }
  return data.length > 0
}

// Cria o exercício e devolve o id gerado pelo banco
export async function createExercise(formData: ExerciseFormData) {
  const { data, error } = await supabase
    .from('exercises')
    .insert({
      name: formData.name,
      muscle_group: formData.muscle_group,
      notes: formData.notes,
    })
    .select('id')
    .single()

  if (error) {
    throw error
  }
  return data.id as string
}

export async function updateExercise(id: string, formData: ExerciseFormData) {
  const { error } = await supabase
    .from('exercises')
    .update({
      name: formData.name,
      muscle_group: formData.muscle_group,
      notes: formData.notes,
    })
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function deleteExercise(id: string) {
  const { error } = await supabase.from('exercises').delete().eq('id', id)

  if (error) {
    throw error
  }
}
