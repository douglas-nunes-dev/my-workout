import type { ReactNode } from 'react'

interface PageTitleProps {
  children: ReactNode
  action?: ReactNode
}

export function PageTitle({ children, action }: PageTitleProps) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <h2 className="text-2xl font-bold">{children}</h2>
      {action}
    </div>
  )
}
