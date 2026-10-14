// Link de busca do YouTube pelo nome do exercício.
// Ex.: "Crossover" → https://www.youtube.com/results?search_query=Crossover%20execu%C3%A7%C3%A3o
// encodeURIComponent troca espaços e acentos por códigos que podem ir na URL.
export function getYoutubeSearchUrl(exerciseName: string) {
  const search = `${exerciseName} execução`
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(search)}`
}
