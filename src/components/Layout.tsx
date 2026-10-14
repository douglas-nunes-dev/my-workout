import { Dumbbell, LogOut } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import { supabase } from '../lib/supabase'
import { ThemeToggle } from './ThemeToggle'

// Ao sair, o RequireAuth percebe e manda para a tela de login
async function handleLogout() {
  await supabase.auth.signOut()
}

// Classes da aba do menu: cor de destaque quando ativa, cinza quando não
function getNavClass({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return 'flex-1 py-3 text-center text-sm font-medium text-primary'
  }
  return 'flex-1 py-3 text-center text-sm font-medium text-muted'
}

export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col bg-page text-ink">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-header px-4 py-3 text-white">
        <h1 className="flex items-center gap-2 text-lg font-bold">
          <Dumbbell size={20} className="text-primary" />
          My Workout
        </h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1 text-sm text-slate-300 hover:text-white"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </header>

      {/* Aqui aparece a página atual */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-24">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-line bg-card">
        <div className="mx-auto flex max-w-2xl">
          {/* "end" faz a aba Início ficar ativa só na página inicial "/" */}
          <NavLink to="/" end className={getNavClass}>
            Início
          </NavLink>
          <NavLink to="/exercicios" className={getNavClass}>
            Exercícios
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
