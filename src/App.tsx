import { createBrowserRouter, RouterProvider } from 'react-router'
import { Layout } from './components/Layout'
import { RequireAuth } from './components/RequireAuth'
import { Login } from './pages/Login'
import { ExerciseDetail } from './pages/ExerciseDetail'
import { ExerciseForm } from './pages/ExerciseForm'
import { ExerciseList } from './pages/ExerciseList'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { WorkoutDetail } from './pages/WorkoutDetail'
import { WorkoutForm } from './pages/WorkoutForm'

const router = createBrowserRouter([
  // Única tela que não precisa de login
  { path: '/login', element: <Login /> },

  // Todas as outras telas só abrem com login
  {
    path: '/',
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: 'treinos/novo', element: <WorkoutForm /> },
      { path: 'treinos/:id', element: <WorkoutDetail /> },
      { path: 'treinos/:id/editar', element: <WorkoutForm /> },
      { path: 'exercicios', element: <ExerciseList /> },
      { path: 'exercicios/novo', element: <ExerciseForm /> },
      { path: 'exercicios/:id', element: <ExerciseDetail /> },
      { path: 'exercicios/:id/editar', element: <ExerciseForm /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
