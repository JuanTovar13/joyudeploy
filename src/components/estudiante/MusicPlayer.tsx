import { useState } from 'react'
import '../../styles/MusicPlayer.css'

const STUDY_TRACKS = [
  {
    title: 'Lofi Hip Hop Beats',
    url: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/lofirecords/sets/lofi-hip-hop-music&color=%23262688&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false',
  },
  {
    title: 'Chill Study Music',
    url: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/chillhop/sets/chillhop-essentials-spring-2020&color=%23262688&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false',
  },
  {
    title: 'Jazz for Focus',
    url: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/jazz-and-bossa-nova/sets/jazz-bossa-nova&color=%23262688&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false',
  },
  {
    title: 'Deep Focus Ambient',
    url: 'https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/ambient-music-for-focus/sets/deep-focus&color=%23262688&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false',
  },
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
        src={currentTrack.url}
        title={currentTrack.title}
        allow="autoplay"
        scrolling="no"
        frameBorder="0"
      />
      <div className="musicplayer-controls">
        <button type="button" className="musicplayer-btn" onClick={handlePrev} aria-label="Previous track">‹</button>
        <span className="musicplayer-counter" aria-label={`Track ${currentIndex + 1} of ${STUDY_TRACKS.length}`}>
          {currentIndex + 1} / {STUDY_TRACKS.length}
        </span>
        <button type="button" className="musicplayer-btn" onClick={handleNext} aria-label="Next track">›</button>
      </div>
    </div>
  )
}

export default MusicPlayer
