import type { ReactNode } from 'react'

interface FormMessageProps {
  type: 'error' | 'success' | 'warning'
  children: ReactNode
  className?: string
}

export const FormMessage = ({ type, children, className }: FormMessageProps) => (
  <p
    className={`ui-form-message ui-form-message--${type}${className ? ` ${className}` : ''}`}
    role={type === 'error' || type === 'warning' ? 'alert' : 'status'}
  >
    {children}
  </p>
)
