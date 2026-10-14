// Guarda no navegador (localStorage) quais exercícios já foram concluídos HOJE.
// Assim, se a tela do celular bloquear ou a página recarregar, o progresso não se perde.
// No dia seguinte a chave muda, então o treino começa zerado.

// Chave única por treino e por dia, ex.: "progress-<id do treino>-2026-10-14"
function getProgressKey(workoutId: string) {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `progress-${workoutId}-${year}-${month}-${day}`
}

// Lista de ids dos exercícios concluídos hoje
export function loadProgress(workoutId: string) {
  try {
    const saved = localStorage.getItem(getProgressKey(workoutId))
    if (saved) {
      return JSON.parse(saved) as string[]
    }
  } catch {
    // Se o navegador bloquear o localStorage, só não guarda o progresso
  }
  return []
}

export function saveProgress(workoutId: string, completedIds: string[]) {
  try {
    localStorage.setItem(getProgressKey(workoutId), JSON.stringify(completedIds))
  } catch {
    // Se o navegador bloquear o localStorage, só não guarda o progresso
  }
}

export function clearProgress(workoutId: string) {
  try {
    localStorage.removeItem(getProgressKey(workoutId))
  } catch {
    // Se o navegador bloquear o localStorage, não há o que apagar
  }
}
