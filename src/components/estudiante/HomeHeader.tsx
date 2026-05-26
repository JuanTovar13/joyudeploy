import logoJoyuOscuro from '../../assets/home-icons/Logo de Joyu oscuro.svg'

interface HomeHeaderProps {
  displayName: string | null | undefined
}

export function HomeHeader({ displayName }: HomeHeaderProps) {
  return (
    <header className="home-header">
      <div className="user-greeting">
        <h1 className="title-font">Hi, {displayName || 'User'}</h1>
        <p>How are you feeling today?</p>
      </div>
      <img src={logoJoyuOscuro} alt="Joyu Logo" className="home-logo" />
    </header>
  )
}
