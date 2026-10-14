import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useSession } from '../hooks/useSession'

interface RequireAuthProps {
  children: ReactNode
}

// Só mostra o conteúdo se o usuário estiver logado.
// Se não estiver, manda para a tela de login.
export function RequireAuth({ children }: RequireAuthProps) {
  const session = useSession()

  if (session === undefined) {
    return <p className="p-4 text-muted">Carregando...</p>
  }

  if (session === null) {
    return <Navigate to="/login" replace />
  }

  return children
}
