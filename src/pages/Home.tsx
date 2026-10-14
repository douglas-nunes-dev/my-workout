import { ChevronRight, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { weekDays } from '../constants/weekDays'
import { useSession } from '../hooks/useSession'
import { getWorkouts } from '../services/workouts'
import type { Workout } from '../types'
import { getGreeting, getTodayText } from '../utils/greeting'

export function Home() {
  const session = useSession()

  // undefined = carregando
  const [workouts, setWorkouts] = useState<Workout[] | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState('')

  // Número do dia de hoje: 0 = Domingo, 1 = Segunda ... 6 = Sábado
  const today = new Date().getDay()

  // Nome salvo no usuário do Supabase (pode não existir)
  let userName = ''
  if (session && session.user.user_metadata.name) {
    userName = session.user.user_metadata.name
  }

  useEffect(() => {
    async function loadWorkouts() {
      try {
        const result = await getWorkouts()
        setWorkouts(result)
      } catch {
        setErrorMessage('Não foi possível carregar os treinos.')
      }
    }
    loadWorkouts()
  }, [])

  // Procura o treino de um dia da semana (ou undefined se for descanso)
  function findWorkoutOfDay(dayNumber: number) {
    if (!workouts) {
      return undefined
    }
    return workouts.find((workout) => workout.day_of_week === dayNumber)
  }

  // Treinos cadastrados sem dia fixo
  let workoutsWithoutDay: Workout[] = []
  if (workouts) {
    workoutsWithoutDay = workouts.filter((workout) => workout.day_of_week === null)
  }

  return (
    <>
      {/* Saudação */}
      <div className="mb-6">
        <p className="text-2xl font-bold">
          {getGreeting()}
          {userName && `, ${userName}`}!
        </p>
        <p className="text-muted">{getTodayText()}</p>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wide text-muted">DIVISÃO SEMANAL</h2>
        <Link
          to="/treinos/novo"
          className="flex items-center gap-1 text-sm font-medium text-primary"
        >
          <Plus size={16} />
          Novo treino
        </Link>
      </div>

      {errorMessage && <p className="text-danger">{errorMessage}</p>}

      {!errorMessage && workouts === undefined && <p className="text-muted">Carregando...</p>}

      {workouts && (
        <ul className="space-y-2">
          {weekDays.map((day) => (
            <li key={day.number}>
              <DayRow
                short={day.short}
                isToday={day.number === today}
                workout={findWorkoutOfDay(day.number)}
              />
            </li>
          ))}
        </ul>
      )}

      {workoutsWithoutDay.length > 0 && (
        <>
          <h2 className="mt-8 mb-3 text-sm font-semibold tracking-wide text-muted">
            OUTROS TREINOS
          </h2>
          <ul className="space-y-2">
            {workoutsWithoutDay.map((workout) => (
              <li key={workout.id}>
                <DayRow short="—" isToday={false} workout={workout} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

interface DayRowProps {
  short: string // "SEG"
  isToday: boolean
  workout: Workout | undefined // undefined = descanso
}

// Uma linha da divisão semanal: "SEG  A1 · Peito + Ombro + Tríceps  >"
function DayRow({ short, isToday, workout }: DayRowProps) {
  // Cores: dia de hoje em azul, os outros em branco
  let boxClass = 'flex items-center gap-4 rounded-lg border p-4 '
  if (isToday) {
    boxClass += 'border-primary bg-primary text-on-primary glow'
  } else {
    boxClass += 'border-line bg-card'
  }

  let dayClass = 'w-10 text-sm font-bold '
  if (isToday) {
    dayClass += 'text-on-primary/75'
  } else {
    dayClass += 'text-muted'
  }

  // Dia sem treino: só mostra "Descanso", sem link
  if (!workout) {
    return (
      <div className={boxClass}>
        <span className={dayClass}>{short}</span>
        <span className={isToday ? 'text-on-primary/75' : 'text-muted'}>Descanso</span>
      </div>
    )
  }

  // Dia com treino: clicável, abre o treino
  return (
    <Link to={`/treinos/${workout.id}`} className={boxClass}>
      <span className={dayClass}>{short}</span>
      <div className="flex-1">
        <p className="font-semibold">{workout.name}</p>
        {workout.description && (
          <p className={isToday ? 'text-sm text-on-primary/75' : 'text-sm text-muted'}>
            {workout.description}
          </p>
        )}
      </div>
      <ChevronRight size={20} />
    </Link>
  )
}
