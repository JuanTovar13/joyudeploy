import feliz from '../assets/home-icons/FelizRadiante (MoradoLila).svg'
import neutral from '../assets/home-icons/NeutralCalmado (Verde claro).svg'
import enojado from '../assets/home-icons/EnojadoMolesto (AmarilloVerde).svg'
import triste from '../assets/home-icons/TristeCansado (Azul).svg'

export interface EmotionConfig {
  label: string
  icon: string
  color: string
  score: number
}

export const EMOTION_CONFIG: Record<string, EmotionConfig> = {
  'Muy bien': { label: 'Muy bien', icon: feliz, color: '#B39DDB', score: 5 },
  'Bien': { label: 'Bien', icon: neutral, color: '#81C784', score: 4 },
  'Estresado/a': { label: 'Estresado/a', icon: enojado, color: '#FFD54F', score: 2 },
  'Agotado/a': { label: 'Agotado/a', icon: triste, color: '#90CAF9', score: 1 },
}

export const getEmotionConfig = (emotion: string): EmotionConfig =>
  EMOTION_CONFIG[emotion] ?? {
    label: emotion,
    icon: neutral,
    color: '#E0E0E0',
    score: 3,
  }
