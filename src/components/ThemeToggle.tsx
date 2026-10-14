import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'

// Botão que alterna entre modo diurno e noturno.
// O modo noturno é a classe "dark" na tag <html>.
// A escolha fica salva no navegador (localStorage).
interface ThemeToggleProps {
  className?: string // cores do botão (opcional)
}

export function ThemeToggle({ className = 'text-slate-300 hover:text-white' }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'))

  function handleToggle() {
    const newIsDark = !isDark

    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }

    setIsDark(newIsDark)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'Mudar para modo diurno' : 'Mudar para modo noturno'}
      className={`rounded-lg p-2 ${className}`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
