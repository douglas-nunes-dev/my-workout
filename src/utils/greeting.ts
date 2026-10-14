// "Bom dia", "Boa tarde" ou "Boa noite", conforme a hora atual
export function getGreeting() {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return 'Bom dia'
  }
  if (hour >= 12 && hour < 18) {
    return 'Boa tarde'
  }
  return 'Boa noite'
}

// Data de hoje por extenso, ex.: "Terça-feira, 14 de outubro"
export function getTodayText() {
  const text = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  // Deixa a primeira letra maiúscula
  return text.charAt(0).toUpperCase() + text.slice(1)
}
