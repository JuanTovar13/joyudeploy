export interface JoyuItem {
  id: number
  title: string
  description: string
  image: string
}

export const joyuItems: JoyuItem[] = [
  {
    id: 1,
    title: 'Tenis Class',
    description: 'Improve your body and mind with a friendly group session.',
    image: new URL('../assets/home-icons/Pelotas de Tenis (Para clases deportivas).svg', import.meta.url).href,
  },
  {
    id: 2,
    title: 'Art Workshop',
    description: 'Create new art and relax with a guided painting activity.',
    image: new URL('../assets/home-icons/Paleta de Pintor (Para talleres de arte)..svg', import.meta.url).href,
  },
  {
    id: 3,
    title: 'Mind Check',
    description: 'Reflect on your mood and get a quick emotional snapshot.',
    image: new URL('../assets/home-icons/Cara sonriente(frase motivadora).svg', import.meta.url).href,
  },
  {
    id: 4,
    title: 'Talk It Out',
    description: 'Connect with a supportive chat to feel better today.',
    image: new URL('../assets/home-icons/Burbuja de Chat con Carita.svg', import.meta.url).href,
  },
]
