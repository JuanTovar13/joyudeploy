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

  return (
    <div className="musicplayer-container">
      <h2 className="musicplayer-title">Study Music 🎵</h2>
      <p className="musicplayer-track-name">{currentTrack.title}</p>
      <iframe
        className="musicplayer-iframe"
        src={`https://www.youtube.com/embed/${currentTrack.embedId}?autoplay=1`}
        title={currentTrack.title}
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
      <div className="musicplayer-controls">
        <button
          type="button"
          className="musicplayer-btn"
          onClick={handlePrev}
          aria-label="Previous track"
        >
          ‹
        </button>
        <span
          className="musicplayer-counter"
          aria-label={`Track ${currentIndex + 1} of ${STUDY_TRACKS.length}`}
        >
          {currentIndex + 1} / {STUDY_TRACKS.length}
        </span>
        <button
          type="button"
          className="musicplayer-btn"
          onClick={handleNext}
          aria-label="Next track"
        >
          ›
        </button>
      </div>
    </div>
  )
}

export default MusicPlayer
