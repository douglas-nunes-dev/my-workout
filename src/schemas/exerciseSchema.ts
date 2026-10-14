import { z } from 'zod'

// Regras de validação do formulário de exercício
export const exerciseSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do exercício'),
  muscle_group: z.string().min(1, 'Escolha o grupo muscular'),
  notes: z.string(),
})

// Campos do formulário (mesmos nomes das colunas do banco)
export interface ExerciseFormData {
  name: string
  muscle_group: string
  notes: string
}
