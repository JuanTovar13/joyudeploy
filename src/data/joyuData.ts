export interface JoyuItem {
  id: number
  title: string
  description: string
  image: string
}

export const joyuItems: JoyuItem[] = [
  {
    id: 1,
    title: 'Futbol',
    description: 'Today - 10:00 am',
    image: 'src/assets/home-icons/futbol.png',
  },
  {
    id: 2,
    title: 'Tiro con arco',
    description: 'Today - 2:00 pm',
    image: 'src/assets/home-icons/Tiroconarco.png',
  },
  {
    id: 3,
    title: 'Taller de cerámica',
    description: 'Tomorrow - 4:00 pm',
    image: 'src/assets/home-icons/Ceramica.png',
  },
  {
    id: 4,
    title: 'Danza',
    description: 'Tomorrow - 7:00 pm',
    image: 'src/assets/home-icons/Danza.png',
  },
  {
    id: 5,
    title: 'Taller de arte',
    description: 'Friday - 3:30 pm',
    image: 'src/assets/home-icons/Pintura.png',
  },
  {
    id: 6,
    title: 'Tenis',
    description: 'Saturday - 5:00 pm',
    image: 'src/assets/home-icons/pelotas tenis.png',
  },
]
