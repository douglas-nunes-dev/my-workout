import { z } from 'zod'

// Regras de validação do formulário de login
export const loginSchema = z.object({
  email: z.email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe a senha'),
})

// Campos do formulário
export interface LoginFormData {
  email: string
  password: string
}
