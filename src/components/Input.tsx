type Props = {
  placeholder: string
  type?: string
}

export const Input = ({ placeholder, type = 'text' }: Props) => {
  return <input type={type} placeholder={placeholder} className="input" />
}
