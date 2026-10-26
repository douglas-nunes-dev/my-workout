import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Flag,
  Pencil,
  Repeat,
  RotateCcw,
  RotateCw,
  Timer,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { YoutubeButton } from '../components/YoutubeButton'
import { weekDays } from '../constants/weekDays'
import { getExercises } from '../services/exercises'
import {
  getWorkout,
  getWorkoutExercises,
  updateWorkoutExerciseWeight,
} from '../services/workouts'
import type { Exercise, Workout, WorkoutExercise } from '../types'
import { clearProgress, loadProgress, saveProgress } from '../utils/workoutProgress'

export function WorkoutDetail() {
  const { id } = useParams()

  // undefined = carregando, null = não encontrado
  const [workout, setWorkout] = useState<Workout | null | undefined>(undefined)
  const [items, setItems] = useState<WorkoutExercise[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  // id do cartão aberto ("" = todos fechados)
  const [openItemId, setOpenItemId] = useState('')

  // ids dos exercícios concluídos hoje
  const [completedIds, setCompletedIds] = useState<string[]>([])

  // true depois de clicar em "Finalizar treino"
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    async function loadWorkout() {
      try {
        const workoutResult = await getWorkout(id ?? '')
        if (workoutResult) {
          const itemsResult = await getWorkoutExercises(workoutResult.id)
          const exercisesResult = await getExercises()
          // Só considera os exercícios que ainda existem no treino
          // (se o treino foi editado, os antigos são ignorados)
          const savedProgress = loadProgress(workoutResult.id).filter((savedId) => {
            return itemsResult.some((item) => item.id === savedId)
          })

          setItems(itemsResult)
          setExercises(exercisesResult)
          setCompletedIds(savedProgress)

          // Começa com o primeiro exercício ainda não concluído aberto
          const firstPending = itemsResult.find((item) => !savedProgress.includes(item.id))
          if (firstPending) {
            setOpenItemId(firstPending.id)
          }
        }
        setWorkout(workoutResult)
      } catch {
        setErrorMessage('Não foi possível carregar o treino.')
      }
    }
    loadWorkout()
  }, [id])

  // Nome do exercício a partir do id
  function getExerciseName(exerciseId: string) {
    const exercise = exercises.find((item) => item.id === exerciseId)
    if (exercise) {
      return exercise.name
    }
    return 'Exercício removido'
  }

  // Cardio (esteira, bicicleta...) é exibido diferente: só a duração
  function isCardio(exerciseId: string) {
    const exercise = exercises.find((item) => item.id === exerciseId)
    return exercise?.muscle_group === 'Cardio'
  }

  // Abre o cartão clicado; se já estava aberto, fecha
  function handleToggle(itemId: string) {
    if (openItemId === itemId) {
      setOpenItemId('')
    } else {
      setOpenItemId(itemId)
    }
  }

  // Depois de salvar a carga, atualiza a lista na tela
  function handleWeightSaved(itemId: string, newWeight: number | null) {
    const updatedItems = items.map((item) => {
      if (item.id === itemId) {
        return { ...item, weight_kg: newWeight }
      }
      return item
    })
    setItems(updatedItems)
  }

  // Marca o exercício como concluído e abre o próximo que falta
  function handleComplete(itemId: string) {
    if (!workout) {
      return
    }
    const newCompletedIds = [...completedIds, itemId]
    setCompletedIds(newCompletedIds)
    saveProgress(workout.id, newCompletedIds)

    const nextPending = items.find((item) => !newCompletedIds.includes(item.id))
    if (nextPending) {
      setOpenItemId(nextPending.id)
    } else {
      setOpenItemId('')
    }
  }

  // Desfaz o "concluído" de um exercício
  function handleUndo(itemId: string) {
    if (!workout) {
      return
    }
    const newCompletedIds = completedIds.filter((completedId) => completedId !== itemId)
    setCompletedIds(newCompletedIds)
    saveProgress(workout.id, newCompletedIds)
  }

  function handleFinish() {
    if (!workout) {
      return
    }
    const remaining = items.length - completedIds.length
    if (remaining > 0) {
      const confirmed = window.confirm(
        `Ainda falta ${remaining} exercício(s). Finalizar o treino mesmo assim?`,
      )
      if (!confirmed) {
        return
      }
    }
    clearProgress(workout.id)
    setIsFinished(true)
  }

  // Começa o mesmo treino de novo (depois de finalizar)
  function handleRestart() {
    setCompletedIds([])
    setIsFinished(false)
    if (items.length > 0) {
      setOpenItemId(items[0].id)
    }
  }

  if (errorMessage) {
    return <p className="text-danger">{errorMessage}</p>
  }

  if (workout === undefined) {
    return <p className="text-muted">Carregando...</p>
  }

  if (workout === null) {
    return (
      <>
        <h2 className="mb-4 text-2xl font-bold">Treino não encontrado</h2>
        <Link to="/" className="font-medium text-primary">
          Voltar para o início
        </Link>
      </>
    )
  }

  // Tela de parabéns depois de "Finalizar treino"
  if (isFinished) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <CheckCircle2 size={72} className="mb-4 text-primary" />
        <h2 className="text-2xl font-bold">Treino finalizado!</h2>
        <p className="mt-1 text-muted">
          {workout.name}: {completedIds.length} de {items.length} exercícios concluídos.
        </p>
        <p className="mt-1 text-muted">Bom descanso! 💪</p>

        <Link
          to="/"
          className="mt-8 w-full rounded-full bg-primary py-3 font-medium text-on-primary glow hover:bg-primary-hover"
        >
          Voltar para o início
        </Link>
        <button
          type="button"
          onClick={handleRestart}
          className="mt-3 w-full rounded-full border border-line py-3 font-medium hover:bg-hover"
        >
          Fazer este treino de novo
        </button>
      </div>
    )
  }

  // Nome do dia: "SEGUNDA"
  let dayName = ''
  const day = weekDays.find((weekDay) => weekDay.number === workout.day_of_week)
  if (day) {
    dayName = day.name.toUpperCase()
  }

  // Barra de progresso: % de exercícios concluídos
  let progressPercent = 0
  if (items.length > 0) {
    progressPercent = Math.round((completedIds.length / items.length) * 100)
  }
  const allDone = items.length > 0 && completedIds.length === items.length

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 text-sm font-medium text-primary">
          <ArrowLeft size={16} />
          Início
        </Link>
        <Link
          to={`/treinos/${workout.id}/editar`}
          className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-sm font-medium hover:bg-hover"
        >
          <Pencil size={14} />
          Editar treino
        </Link>
      </div>

      {/* Título: "SEGUNDA — A1" */}
      <h2 className="text-2xl font-bold">
        {dayName && <span className="text-primary">{dayName} — </span>}
        {workout.name}
      </h2>
      {workout.description && (
        <p className="font-medium tracking-wide text-muted uppercase">{workout.description}</p>
      )}

      {/* Progresso */}
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-sm text-muted">
          <span>Progresso</span>
          <span>
            {completedIds.length} de {items.length}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-hover">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Lista de exercícios: cada um é um cartão que abre e fecha */}
      <ol className="mt-6 space-y-3">
        {items.map((item, index) => (
          <ExerciseCard
            key={item.id}
            item={item}
            number={index + 1}
            name={getExerciseName(item.exercise_id)}
            isCardio={isCardio(item.exercise_id)}
            isOpen={openItemId === item.id}
            isCompleted={completedIds.includes(item.id)}
            onToggle={() => handleToggle(item.id)}
            onComplete={() => handleComplete(item.id)}
            onUndo={() => handleUndo(item.id)}
            onWeightSaved={handleWeightSaved}
          />
        ))}
      </ol>

      {/* Finalizar treino: barra fixa no fim da tela, acima do menu.
          Fica verde cheio quando todos os exercícios estão concluídos. */}
      <div className="sticky bottom-12 -mx-4 mt-6 border-t border-line bg-card px-4 py-4">
        <button
          type="button"
          onClick={handleFinish}
          className={
            allDone
              ? 'flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-medium text-on-primary glow hover:bg-primary-hover'
              : 'flex w-full items-center justify-center gap-2 rounded-full border border-muted py-3 font-medium text-primary hover:bg-hover'
          }
        >
          <Flag size={18} />
          Finalizar treino
        </button>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------
// Cartão de um exercício do treino
// ---------------------------------------------------------------------

interface ExerciseCardProps {
  item: WorkoutExercise
  number: number // posição na lista: 1, 2, 3...
  name: string
  isCardio: boolean // true = mostra só a duração (campo "reps"), sem séries e carga
  isOpen: boolean
  isCompleted: boolean
  onToggle: () => void
  onComplete: () => void
  onUndo: () => void
  onWeightSaved: (itemId: string, newWeight: number | null) => void
}

function ExerciseCard({
  item,
  number,
  name,
  isCardio,
  isOpen,
  isCompleted,
  onToggle,
  onComplete,
  onUndo,
  onWeightSaved,
}: ExerciseCardProps) {
  const [isEditingWeight, setIsEditingWeight] = useState(false)
  const [weightText, setWeightText] = useState('')
  const [weightError, setWeightError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Texto que aparece nos quadrinhos
  let weightLabel = '-'
  if (item.weight_kg !== null) {
    weightLabel = `${item.weight_kg} kg`
  }
  let restLabel = '-'
  if (item.rest_seconds !== null) {
    restLabel = `${item.rest_seconds}s`
  }

  // Resumo embaixo do nome: "3x 10-12", ou só "20 min" no cardio
  let summary = `${item.sets}x ${item.reps}`
  if (isCardio) {
    summary = item.reps
  }

  // Nome do exercício: acinzentado quando concluído
  let nameClass = 'block font-medium'
  if (isCompleted) {
    nameClass = 'block font-medium text-muted'
  }

  function startEditingWeight() {
    if (item.weight_kg === null) {
      setWeightText('')
    } else {
      setWeightText(String(item.weight_kg))
    }
    setWeightError('')
    setIsEditingWeight(true)
  }

  async function saveWeight() {
    // Aceita vazio, "35" ou "12,5"
    const isValid = /^([0-9]+([.,][0-9]+)?)?$/.test(weightText.trim())
    if (!isValid) {
      setWeightError('Digite só números. Ex.: 35 ou 12,5')
      return
    }

    setIsSaving(true)
    try {
      await updateWorkoutExerciseWeight(item.id, weightText)

      let newWeight: number | null = null
      if (weightText.trim() !== '') {
        newWeight = Number(weightText.replace(',', '.'))
      }
      onWeightSaved(item.id, newWeight)
      setIsEditingWeight(false)
    } catch {
      setWeightError('Não foi possível salvar. Tente de novo.')
    }
    setIsSaving(false)
  }

  return (
    <li className="rounded-2xl bg-card p-3">
      {/* Cabeçalho: clicar abre/fecha */}
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 text-left">
        {/* Quadrado com o número (no futuro: foto do exercício) */}
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-hover text-lg font-bold text-primary">
          {number}
        </span>
        <span className="flex-1">
          <span className={nameClass}>{name}</span>
          {!isCompleted && !isOpen && (
            <span className="block text-sm text-muted">{summary}</span>
          )}
        </span>
        {/* Selo verde de concluído */}
        {isCompleted && (
          <BadgeCheck size={28} className="shrink-0 fill-primary text-card" aria-label="Concluído" />
        )}
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Conteúdo que aparece quando o cartão está aberto */}
      {isOpen && (
        <div className="mt-3 space-y-2">
          {isCardio ? (
            // Cardio: só a duração (guardada no campo "reps")
            <div className="flex items-center gap-3 rounded-xl bg-hover p-3">
              <IconCircle>
                <Timer size={20} />
              </IconCircle>
              <span className="flex-1">Duração:</span>
              <span className="text-lg font-semibold">{item.reps}</span>
            </div>
          ) : (
            <>
              {/* Séries */}
              <div className="flex items-center gap-3 rounded-xl bg-hover p-3">
                <IconCircle>
                  <RotateCw size={20} />
                </IconCircle>
                <span className="flex-1">Séries:</span>
                <span className="text-lg font-semibold">{item.sets}</span>
              </div>

              {/* Repetições, carga e intervalo */}
              <div className="grid grid-cols-3 gap-2">
                <InfoBox icon={<Repeat size={20} />} label="Repetições" value={item.reps} />
                <InfoBox icon={<Dumbbell size={20} />} label="Carga" value={weightLabel} />
                <InfoBox icon={<Timer size={20} />} label="Intervalo" value={restLabel} />
              </div>
            </>
          )}

          {/* Concluir exercício (ou desfazer) */}
          {isCompleted ? (
            <button
              type="button"
              onClick={onUndo}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-line py-3 font-medium hover:bg-hover"
            >
              <RotateCcw size={18} />
              Desfazer conclusão
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 font-medium text-on-primary glow hover:bg-primary-hover"
            >
              <Check size={18} />
              Concluir exercício
            </button>
          )}

          {/* Cardio não tem carga: só o botão do YouTube */}
          {isCardio && <YoutubeButton exerciseName={name} />}

          {/* Editar carga */}
          {!isCardio && (isEditingWeight ? (
            <div className="rounded-xl bg-hover p-3">
              <label htmlFor={`weight-${item.id}`} className="mb-1 block text-sm font-medium">
                Carga (kg)
              </label>
              <div className="flex gap-2">
                <input
                  id={`weight-${item.id}`}
                  value={weightText}
                  onChange={(event) => setWeightText(event.target.value)}
                  inputMode="decimal"
                  placeholder="Ex.: 35"
                  autoFocus
                  className="w-full rounded-full border border-line bg-card px-4 py-2 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={saveWeight}
                  disabled={isSaving}
                  className="rounded-full bg-primary px-5 font-medium text-on-primary hover:bg-primary-hover disabled:opacity-50"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingWeight(false)}
                  className="rounded-full border border-line px-4 font-medium hover:bg-card"
                >
                  Cancelar
                </button>
              </div>
              {weightError && <p className="mt-1 text-sm text-danger">{weightError}</p>}
            </div>
          ) : (
            // Editar carga e YouTube lado a lado
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={startEditingWeight}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-hover py-3 font-medium hover:bg-line"
              >
                <Pencil size={18} className="text-primary" />
                Editar carga
              </button>
              <YoutubeButton exerciseName={name} />
            </div>
          ))}
        </div>
      )}
    </li>
  )
}

// Círculo escuro em volta dos ícones
function IconCircle({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-page">
      {children}
    </span>
  )
}

interface InfoBoxProps {
  icon: ReactNode
  label: string
  value: string
}

// Quadrinho com ícone, título e valor (ex.: Repetições / 10–12)
function InfoBox({ icon, label, value }: InfoBoxProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-hover p-3 text-center">
      <IconCircle>{icon}</IconCircle>
      <span className="text-sm text-muted">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  )
}
