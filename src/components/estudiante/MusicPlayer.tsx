import { useState } from 'react'
import '../../styles/MusicPlayer.css'

const STUDY_TRACKS = [
  { title: 'Lofi Hip Hop Radio', embedId: 'jfKfPfyJRdk' },
  { title: 'Chillhop Essentials', embedId: '5yx6BWlEVcY' },
  { title: 'Jazz & Bossa Nova', embedId: 'Dx5qFachd3A' },
  { title: 'Deep Focus Music', embedId: 'lTRiuFIWV54' },
]

const MusicPlayer = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? STUDY_TRACKS.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === STUDY_TRACKS.length - 1 ? 0 : prev + 1))
  }

  const currentTrack = STUDY_TRACKS[currentIndex]

  return <div>MusicPlayer placeholder</div>
}

export default MusicPlayer
