interface BackButtonProps {
  onClick: () => void
  className?: string
  'aria-label'?: string
}

export const BackButton = ({
  onClick,
  className,
  'aria-label': ariaLabel = 'Go back',
}: BackButtonProps) => (
  <button
    type="button"
    className={`ui-back-btn${className ? ` ${className}` : ''}`}
    onClick={onClick}
    aria-label={ariaLabel}
  >
    ‹
  </button>
)
