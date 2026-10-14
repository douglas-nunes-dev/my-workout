import { CirclePlay } from 'lucide-react'
import { getYoutubeSearchUrl } from '../utils/youtube'

interface YoutubeButtonProps {
  exerciseName: string
}

// Botão que abre a busca do YouTube com o nome do exercício.
// target="_blank" abre em outra aba (no celular, abre o app do YouTube).
export function YoutubeButton({ exerciseName }: YoutubeButtonProps) {
  return (
    <a
      href={getYoutubeSearchUrl(exerciseName)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center justify-center gap-2 rounded-full bg-hover py-3 font-medium hover:bg-line"
    >
      <CirclePlay size={18} className="text-youtube" />
      Ver no YouTube
    </a>
  )
}
