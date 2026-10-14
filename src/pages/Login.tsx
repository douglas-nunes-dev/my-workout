import { zodResolver } from '@hookform/resolvers/zod'
import { Dumbbell } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router'
import { ThemeToggle } from '../components/ThemeToggle'
import { useSession } from '../hooks/useSession'
import { supabase } from '../lib/supabase'
import { loginSchema, type LoginFormData } from '../schemas/loginSchema'

const inputClass =
  'w-full rounded-lg border border-line bg-card px-3 py-2 focus:border-primary focus:outline-none'

export function Login() {
  const session = useSession()
  const navigate = useNavigate()
  const [loginError, setLoginError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginFormData) {
    setLoginError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setLoginError('E-mail ou senha incorretos.')
      return
    }

    navigate('/')
  }

  // Se já está logado, não precisa ver a tela de login
  if (session) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-page px-4 text-ink">
      <div className="absolute top-4 right-4">
        <ThemeToggle className="text-muted hover:text-ink" />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Dumbbell size={40} className="text-primary" />
          <h1 className="text-2xl font-bold">My Workout</h1>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-lg border border-line bg-card p-6"
        >
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={inputClass}
            />
            {errors.email && <p className="mt-1 text-sm text-danger">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className={inputClass}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-danger">{errors.password.message}</p>
            )}
          </div>

          {loginError && (
            <p className="rounded-lg bg-danger-soft p-2 text-center text-sm text-danger">{loginError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary py-2 font-medium text-on-primary glow hover:bg-primary-hover disabled:opacity-50"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
