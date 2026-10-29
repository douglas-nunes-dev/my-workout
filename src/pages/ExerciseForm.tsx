import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { PageTitle } from '../components/PageTitle'
import { muscleGroups } from '../constants/muscleGroups'
import { exerciseSchema, type ExerciseFormData } from '../schemas/exerciseSchema'
import {
  createExercise,
  exerciseNameExists,
  getExercise,
  updateExercise,
} from '../services/exercises'

const inputClass =
  'w-full rounded-lg border border-line bg-card px-3 py-2 focus:border-primary focus:outline-hidden'

export function ExerciseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Se a URL tem id, estamos editando; senão, criando
  const isEditing = Boolean(id)

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: { name: '', muscle_group: '', notes: '' },
  })

  // Na edição, busca o exercício no banco e preenche o formulário
  useEffect(() => {
    async function loadExercise() {
      if (!id) {
        return
      }
      try {
        const exercise = await getExercise(id)
        if (exercise) {
          reset({
            name: exercise.name,
            muscle_group: exercise.muscle_group,
            notes: exercise.notes ?? '',
          })
        }
      } catch {
        setErrorMessage('Não foi possível carregar o exercício.')
      }
    }
    loadExercise()
  }, [id, reset])

  // Se o nome já existe, mostra o erro no campo e devolve true
  async function isDuplicateName(name: string) {
    const exists = await exerciseNameExists(name, id)
    if (exists) {
      setError('name', { message: 'Já existe um exercício com esse nome' })
      setFocus('name')
    }
    return exists
  }

  // Botão "Salvar": salva e abre a tela do exercício
  async function onSubmit(data: ExerciseFormData) {
    setErrorMessage('')
    setSuccessMessage('')
    try {
      if (await isDuplicateName(data.name)) {
        return
      }
      if (id) {
        await updateExercise(id, data)
        navigate(`/exercicios/${id}`)
      } else {
        const newId = await createExercise(data)
        navigate(`/exercicios/${newId}`)
      }
    } catch {
      setErrorMessage('Não foi possível salvar. Verifique sua internet e tente de novo.')
    }
  }

  // Botão "Salvar e cadastrar outro": salva e limpa o formulário,
  // mantendo o grupo muscular (para cadastrar vários do mesmo grupo)
  async function onSubmitAndNew(data: ExerciseFormData) {
    setErrorMessage('')
    setSuccessMessage('')
    try {
      if (await isDuplicateName(data.name)) {
        return
      }
      await createExercise(data)
      reset({ name: '', muscle_group: data.muscle_group, notes: '' })
      setSuccessMessage(`"${data.name}" salvo! Cadastre o próximo.`)
      setFocus('name')
    } catch {
      setErrorMessage('Não foi possível salvar. Verifique sua internet e tente de novo.')
    }
  }

  return (
    <>
      <PageTitle>{isEditing ? 'Editar exercício' : 'Novo exercício'}</PageTitle>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Nome
          </label>
          <input
            id="name"
            {...register('name')}
            placeholder="Ex.: Supino reto com barra"
            className={inputClass}
          />
          {errors.name && <p className="mt-1 text-sm text-danger">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="muscle_group" className="mb-1 block text-sm font-medium">
            Grupo muscular
          </label>
          <select id="muscle_group" {...register('muscle_group')} className={inputClass}>
            <option value="">Selecione...</option>
            {muscleGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          {errors.muscle_group && (
            <p className="mt-1 text-sm text-danger">{errors.muscle_group.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium">
            Observações
          </label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={4}
            placeholder="Ex.: descer a barra até o peito, cotovelos a 45°"
            className={inputClass}
          />
        </div>

        {errorMessage && (
          <p className="rounded-lg bg-danger-soft p-2 text-center text-sm text-danger">{errorMessage}</p>
        )}

        {successMessage && (
          <p className="rounded-lg bg-primary/10 p-2 text-center text-sm text-primary">
            {successMessage}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-primary py-2 font-medium text-on-primary glow hover:bg-primary-hover disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 rounded-lg border border-line py-2 font-medium hover:bg-hover"
          >
            Cancelar
          </button>
        </div>

        {/* Só aparece ao criar (na edição não faz sentido) */}
        {!isEditing && (
          <button
            type="button"
            onClick={handleSubmit(onSubmitAndNew)}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-primary py-2 font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
          >
            <Plus size={16} />
            Salvar e cadastrar outro
          </button>
        )}
      </form>
    </>
  )
}
