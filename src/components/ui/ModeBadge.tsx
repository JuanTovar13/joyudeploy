interface ModeBadgeProps {
  mode: string
  className?: string
}

export const ModeBadge = ({ mode, className }: ModeBadgeProps) => {
  const isVirtual = mode === 'Virtual'
  return (
    <span
      className={`ui-mode-badge ui-mode-badge--${isVirtual ? 'virtual' : 'presencial'}${className ? ` ${className}` : ''}`}
    >
      {isVirtual ? '💻 Virtual' : '🏢 In person'}
    </span>
  )
}
