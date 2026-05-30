import { useState, useMemo } from 'react'
import '../../styles/MusicPlayer.css'

interface Track {
  title: string
  embedId: string
}

const ALL_TRACKS: Track[] = [
  { title: 'Lofi Hip Hop Beats', embedId: 'BHACKCNDMW8' },
  { title: 'Chill Study Music', embedId: 'n61ULEU7CO0' },
  { title: 'Jazz for Focus', embedId: 'neV3EPgvZ3g' },
  { title: 'Deep Focus Ambient', embedId: 'WPni755-Krg' },
  { title: 'Piano Study Music', embedId: '9Q634rbsypE' },
  { title: 'Classical Focus', embedId: 'mIYzp5rcTvU' },
  { title: 'Rainy Day Study', embedId: 'mPZkdNFkNps' },
  { title: 'Chillhop Essentials', embedId: '7NOSDKb0HlU' },
  { title: 'Coffee Shop Ambience', embedId: 'MYPVQccHhAQ' },
  { title: 'Soft Piano Lofi', embedId: 'SpQ8-xiDYWI' },
  { title: 'Study with Me', embedId: 'wnRH0o-9GHc' },
  { title: 'Cozy Cafe Music', embedId: 'MVPTGNGiI-4' },
  { title: 'Peaceful Guitar', embedId: 'YabPVkewkOc' },
  { title: 'Forest Rain Ambience', embedId: 'xNN7iTA57jM' },
  { title: 'Evening Jazz Cafe', embedId: 'DSGyEsJ17cI' },
  { title: 'Tokyo Lofi Beats', embedId: 'MabPSn-FzGQ' },
  { title: 'Morning Coffee Jazz', embedId: 'Dx5qFachd3A' },
  { title: 'Thunderstorm Focus', embedId: 'nDq6TstZnfo' },
  { title: 'Late Night Coding', embedId: '5qap5aO4i9A' },
  { title: 'Calm Piano Melodies', embedId: 'lFcSrYw2ARY' },
]

const TRACKS_PER_WEEK = 10

/**
 * getWeekNumber - returns the ISO week number of the year for a given date
 * Used to rotate the weekly playlist automatically
 */
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

const MusicPlayer = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [videoVisible, setVideoVisible] = useState(true)

  const weeklyTracks = useMemo(() => {
    const weekNumber = getWeekNumber(new Date())
    const startIndex = (weekNumber * TRACKS_PER_WEEK) % ALL_TRACKS.length
    const tracks: Track[] = []
    for (let i = 0; i < TRACKS_PER_WEEK; i++) {
      tracks.push(ALL_TRACKS[(startIndex + i) % ALL_TRACKS.length])
    }
    return tracks
  }, [])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? weeklyTracks.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === weeklyTracks.length - 1 ? 0 : prev + 1))
  }

  const currentTrack = weeklyTracks[currentIndex]

  return (
    <div className={`musicplayer-container${videoVisible ? '' : ' musicplayer-container--compact'}`}>
      <div className="musicplayer-header">
        <h2 className="musicplayer-title">Study Music 🎵</h2>
        <button
          type="button"
          className="musicplayer-toggle-btn"
          onClick={() => setVideoVisible(v => !v)}
          aria-label={videoVisible ? 'Hide video' : 'Show video'}
        >
          {videoVisible ? '🙈 Hide video' : '▶ Show video'}
        </button>
      </div>
      <p className="musicplayer-week-label">This week's playlist</p>
      <p className="musicplayer-track-name">{currentTrack.title}</p>
      {videoVisible && (
        <iframe
          className="musicplayer-iframe"
          src={`https://www.youtube.com/embed/${currentTrack.embedId}?autoplay=1&mute=0`}
          title={currentTrack.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
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
          aria-label={`Track ${currentIndex + 1} of ${weeklyTracks.length}`}
        >
          {currentIndex + 1} / {weeklyTracks.length}
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
