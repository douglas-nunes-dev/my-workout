import { ChevronRight, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { PageTitle } from '../components/PageTitle'
import { getExercises } from '../services/exercises'
import type { Exercise } from '../types'

export function ExerciseList() {
  // undefined = carregando
  const [exercises, setExercises] = useState<Exercise[] | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState('')

  // Busca os exercícios no Supabase quando a tela abre
  useEffect(() => {
    async function loadExercises() {
      try {
        const result = await getExercises()
        setExercises(result)
      } catch {
        setErrorMessage('Não foi possível carregar os exercícios.')
      }
    }
    loadExercises()
  }, [])

  if (errorMessage) {
    return <p className="text-danger">{errorMessage}</p>
  }

  if (exercises === undefined) {
    return <p className="text-muted">Carregando...</p>
  }

  return (
    <>
      <PageTitle
        action={
          <Link
            to="/exercicios/novo"
            className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-on-primary glow hover:bg-primary-hover"
          >
            <Plus size={16} />
            Novo
          </Link>
        }
      >
        Exercícios
      </PageTitle>

      {exercises.length === 0 && (
        <p className="text-muted">Nenhum exercício cadastrado ainda.</p>
      )}

      <ul className="space-y-2">
        {exercises.map((exercise) => (
          <li key={exercise.id}>
            <Link
              to={`/exercicios/${exercise.id}`}
              className="flex items-center justify-between rounded-lg border border-line bg-card p-4 hover:border-primary"
            >
              <div>
                <p className="font-medium">{exercise.name}</p>
                <p className="text-sm text-muted">{exercise.muscle_group}</p>
              </div>
              <ChevronRight size={20} className="text-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
