import { Link } from 'react-router'
import { PageTitle } from '../components/PageTitle'

export function NotFound() {
  return (
    <>
      <PageTitle>Página não encontrada</PageTitle>
      <Link to="/" className="font-medium text-primary">
        Voltar para os treinos
      </Link>
    </>
  )
}
