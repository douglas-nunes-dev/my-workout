import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { PageTitle } from '../components/PageTitle'
import { muscleGroups } from '../constants/muscleGroups'
import { weekDays } from '../constants/weekDays'
import {
  emptyWorkoutExercise,
  workoutSchema,
  type WorkoutFormData,
} from '../schemas/workoutSchema'
import { getExercises } from '../services/exercises'
import {
  createWorkout,
  deleteWorkout,
  getWorkout,
  getWorkoutExercises,
  getWorkouts,
  updateWorkout,
} from '../services/workouts'
import type { Exercise, Workout } from '../types'

const inputClass =
  'w-full rounded-lg border border-line bg-card px-3 py-2 focus:border-primary focus:outline-hidden'
const labelClass = 'mb-1 block text-sm font-medium'
const smallLabelClass = 'mb-1 block text-xs text-muted'
const errorClass = 'mt-1 text-sm text-danger'

export function WorkoutForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')

  // Exercícios cadastrados (para escolher na lista). undefined = carregando
  const [allExercises, setAllExercises] = useState<Exercise[] | undefined>(undefined)
  // Todos os treinos (para avisar se o dia já está ocupado)
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([])

  // Se a URL tem id, estamos editando; senão, criando
  const isEditing = Boolean(id)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: '',
      description: '',
      day_of_week: '',
      exercises: [emptyWorkoutExercise],
    },
  })

  // useFieldArray controla a lista de exercícios do treino
  // (adicionar, remover e mudar a ordem)
  const { fields, append, remove, move } = useFieldArray({ control, name: 'exercises' })

  // Ao abrir a tela: busca os exercícios, os treinos e (na edição) o treino atual
  useEffect(() => {
    async function loadData() {
      try {
        const exercisesResult = await getExercises()
        const workoutsResult = await getWorkouts()
        setAllExercises(exercisesResult)
        setAllWorkouts(workoutsResult)

        if (!id) {
          return
        }

        const workout = await getWorkout(id)
        if (!workout) {
          setErrorMessage('Treino não encontrado.')
          return
        }
        const items = await getWorkoutExercises(id)

        // Preenche o formulário (os números viram texto)
        reset({
          name: workout.name,
          description: workout.description ?? '',
          day_of_week: workout.day_of_week === null ? '' : String(workout.day_of_week),
          exercises: items.map((item) => {
            return {
              exercise_id: item.exercise_id,
              sets: String(item.sets),
              reps: item.reps,
              weight_kg: item.weight_kg === null ? '' : String(item.weight_kg),
              rest_seconds: item.rest_seconds === null ? '' : String(item.rest_seconds),
            }
          }),
        })
      } catch {
        setErrorMessage('Não foi possível carregar os dados.')
      }
    }
    loadData()
  }, [id, reset])

  async function onSubmit(data: WorkoutFormData) {
    setErrorMessage('')

    // Se o dia escolhido já tem outro treino, pergunta antes de trocar
    if (data.day_of_week !== '') {
      const dayNumber = Number(data.day_of_week)
      const otherWorkout = allWorkouts.find((workout) => {
        return workout.day_of_week === dayNumber && workout.id !== id
      })

      if (otherWorkout) {
        const day = weekDays.find((weekDay) => weekDay.number === dayNumber)
        const confirmed = window.confirm(
          `${day?.name} já tem o treino "${otherWorkout.name}".\n` +
            `Colocar este treino no lugar? ("${otherWorkout.name}" ficará sem dia fixo.)`,
        )
        if (!confirmed) {
          return
        }
      }
    }

    try {
      if (id) {
        await updateWorkout(id, data)
        navigate(`/treinos/${id}`)
      } else {
        const newId = await createWorkout(data)
        navigate(`/treinos/${newId}`)
      }
    } catch {
      setErrorMessage('Não foi possível salvar. Verifique sua internet e tente de novo.')
    }
  }

  async function handleDelete() {
    if (!id) {
      return
    }
    const confirmed = window.confirm('Excluir este treino?')
    if (!confirmed) {
      return
    }
    try {
      await deleteWorkout(id)
      navigate('/')
    } catch {
      setErrorMessage('Não foi possível excluir o treino.')
    }
  }

  if (allExercises === undefined && !errorMessage) {
    return <p className="text-muted">Carregando...</p>
  }

  // Sem exercícios cadastrados não dá para montar treino
  if (allExercises && allExercises.length === 0) {
    return (
      <>
        <PageTitle>Novo treino</PageTitle>
        <p className="mb-4 text-muted">
          Cadastre seus exercícios primeiro. Depois volte aqui para montar o treino.
        </p>
        <Link to="/exercicios/novo" className="font-medium text-primary">
          Cadastrar exercício
        </Link>
      </>
    )
  }

  // Mensagem de erro da lista inteira (ex.: "Adicione pelo menos um exercício")
  let exercisesListError = ''
  if (errors.exercises?.message) {
    exercisesListError = errors.exercises.message
  } else if (errors.exercises?.root?.message) {
    exercisesListError = errors.exercises.root.message
  }

  return (
    <>
      <PageTitle>{isEditing ? 'Editar treino' : 'Novo treino'}</PageTitle>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ---------- Dados do treino ---------- */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="name" className={labelClass}>
              Nome
            </label>
            <input id="name" {...register('name')} placeholder="A1" className={inputClass} />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>

          <div className="col-span-2">
            <label htmlFor="day_of_week" className={labelClass}>
              Dia da semana
            </label>
            <select id="day_of_week" {...register('day_of_week')} className={inputClass}>
              <option value="">Sem dia fixo</option>
              {weekDays.map((day) => (
                <option key={day.number} value={String(day.number)}>
                  {day.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Descrição
          </label>
          <input
            id="description"
            {...register('description')}
            placeholder="Peito + Ombro + Tríceps"
            className={inputClass}
          />
        </div>

        {/* ---------- Exercícios do treino ---------- */}
        <h3 className="pt-2 text-sm font-semibold tracking-wide text-muted">EXERCÍCIOS</h3>

        <ol className="space-y-3">
          {fields.map((field, index) => {
            const itemErrors = errors.exercises?.[index]
            const isFirst = index === 0
            const isLast = index === fields.length - 1

            return (
              // field.id é uma chave criada pelo useFieldArray para o React
              <li key={field.id} className="rounded-lg border border-line bg-card p-3">
                {/* Número + botões de ordem e remover */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                    {index + 1}
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, index - 1)}
                      disabled={isFirst}
                      aria-label="Subir"
                      className="rounded-lg p-2 text-muted hover:bg-hover disabled:opacity-30"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, index + 1)}
                      disabled={isLast}
                      aria-label="Descer"
                      className="rounded-lg p-2 text-muted hover:bg-hover disabled:opacity-30"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label="Remover"
                      className="rounded-lg p-2 text-danger hover:bg-danger-soft"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Escolher o exercício (separado por grupo muscular) */}
                <select {...register(`exercises.${index}.exercise_id`)} className={inputClass}>
                  <option value="">Escolha o exercício...</option>
                  {muscleGroups.map((group) => {
                    const exercisesOfGroup = (allExercises ?? []).filter(
                      (exercise) => exercise.muscle_group === group,
                    )
                    if (exercisesOfGroup.length === 0) {
                      return null
                    }
                    return (
                      <optgroup key={group} label={group}>
                        {exercisesOfGroup.map((exercise) => (
                          <option key={exercise.id} value={exercise.id}>
                            {exercise.name}
                          </option>
                        ))}
                      </optgroup>
                    )
                  })}
                </select>
                {itemErrors?.exercise_id && (
                  <p className={errorClass}>{itemErrors.exercise_id.message}</p>
                )}

                {/* Séries, repetições e descanso.
                    A carga não aparece aqui: ela é editada na tela do treino.
                    (O valor dela continua guardado no formulário para não se perder ao salvar.) */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div>
                    <label className={smallLabelClass}>Séries</label>
                    <input
                      {...register(`exercises.${index}.sets`)}
                      inputMode="numeric"
                      placeholder="3"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={smallLabelClass}>Reps</label>
                    <input
                      {...register(`exercises.${index}.reps`)}
                      placeholder="6–10"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={smallLabelClass}>Descanso (s)</label>
                    <input
                      {...register(`exercises.${index}.rest_seconds`)}
                      inputMode="numeric"
                      placeholder="—"
                      className={inputClass}
                    />
                  </div>
                </div>
                {itemErrors?.sets && <p className={errorClass}>{itemErrors.sets.message}</p>}
                {itemErrors?.reps && <p className={errorClass}>{itemErrors.reps.message}</p>}
                {itemErrors?.rest_seconds && (
                  <p className={errorClass}>{itemErrors.rest_seconds.message}</p>
                )}
              </li>
            )
          })}
        </ol>

        {exercisesListError && <p className={errorClass}>{exercisesListError}</p>}

        <button
          type="button"
          onClick={() => append(emptyWorkoutExercise)}
          className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-primary py-2 font-medium text-primary hover:bg-primary/10"
        >
          <Plus size={16} />
          Adicionar exercício
        </button>

        {errorMessage && (
          <p className="rounded-lg bg-danger-soft p-2 text-center text-sm text-danger">
            {errorMessage}
          </p>
        )}

        {/* ---------- Salvar / Cancelar / Excluir ---------- */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-primary py-2 font-medium text-on-primary glow hover:bg-primary-hover disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar treino'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 rounded-lg border border-line py-2 font-medium hover:bg-hover"
          >
            Cancelar
          </button>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-danger/40 py-2 font-medium text-danger hover:bg-danger-soft"
          >
            <Trash2 size={16} />
            Excluir treino
          </button>
        )}
      </form>
    </>
  )
}
