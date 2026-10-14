import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { PageTitle } from '../components/PageTitle'
import { YoutubeButton } from '../components/YoutubeButton'
import { deleteExercise, getExercise } from '../services/exercises'
import type { Exercise } from '../types'

export function ExerciseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // undefined = carregando, null = não encontrado
  const [exercise, setExercise] = useState<Exercise | null | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState('')

  // Busca o exercício pelo id da URL
  useEffect(() => {
    async function loadExercise() {
      try {
        const result = await getExercise(id ?? '')
        setExercise(result)
      } catch {
        setErrorMessage('Não foi possível carregar o exercício.')
      }
    }
    loadExercise()
  }, [id])

  async function handleDelete() {
    if (!exercise) {
      return
    }
    const confirmed = window.confirm(
      `Excluir o exercício "${exercise.name}"?\nEle também será removido dos treinos.`,
    )
    if (!confirmed) {
      return
    }

    try {
      await deleteExercise(exercise.id)
      navigate('/exercicios')
    } catch {
      setErrorMessage('Não foi possível excluir o exercício.')
    }
  }

  if (errorMessage) {
    return <p className="text-danger">{errorMessage}</p>
  }

  if (exercise === undefined) {
    return <p className="text-muted">Carregando...</p>
  }

  if (exercise === null) {
    return (
      <>
        <PageTitle>Exercício não encontrado</PageTitle>
        <Link to="/exercicios" className="font-medium text-primary">
          Voltar para os exercícios
        </Link>
      </>
    )
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/exercicios" className="flex items-center gap-1 text-sm font-medium text-primary">
          <ArrowLeft size={16} />
          Exercícios
        </Link>
        <Link
          to="/exercicios/novo"
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-on-primary glow hover:bg-primary-hover"
        >
          <Plus size={16} />
          Novo
        </Link>
      </div>

      <PageTitle>{exercise.name}</PageTitle>

      <div className="space-y-4 rounded-lg border border-line bg-card p-4">
        <div>
          <p className="text-sm text-muted">Grupo muscular</p>
          <p className="font-medium">{exercise.muscle_group}</p>
        </div>

        {exercise.notes && (
          <div>
            <p className="text-sm text-muted">Observações</p>
            <p className="whitespace-pre-line">{exercise.notes}</p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <YoutubeButton exerciseName={exercise.name} />
      </div>

      <div className="mt-2 flex gap-2">
        <Link
          to={`/exercicios/${exercise.id}/editar`}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-line py-2 font-medium hover:bg-hover"
        >
          <Pencil size={16} />
          Editar
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-danger/40 py-2 font-medium text-danger hover:bg-danger-soft"
        >
          <Trash2 size={16} />
          Excluir
        </button>
      </div>
    </>
  )
}
