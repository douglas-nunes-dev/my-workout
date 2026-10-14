import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Diz se o usuário está logado.
// Resultado: undefined = verificando, null = não logado, Session = logado
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    // 1. Verifica se já existe um login salvo no navegador
    supabase.auth.getSession().then((result) => {
      setSession(result.data.session)
    })

    // 2. Fica "ouvindo" quando o usuário entra ou sai
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    // 3. Para de ouvir quando o componente sai da tela
    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  return session
}
