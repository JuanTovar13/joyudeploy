import { useState } from 'react'
import type { JoyuItem } from '../../types'

const SLIDE_TITLES = ['Actividades Populares', 'Actividades Para Ti Hoy'] as const

interface Props {
  items: JoyuItem[]
}

export const ActivitiesBanner = ({ items }: Props) => {
  const [slide, setSlide] = useState<0 | 1>(0)

  return (
    <section className="activities-banner">
      <div className="banner-header">
        <h2 className="banner-title">{SLIDE_TITLES[slide]}</h2>
        <div className="banner-dots" role="tablist" aria-label="Banner navigation">
          {SLIDE_TITLES.map((title, i) => (
            <button
              key={title}
              role="tab"
              aria-selected={i === slide}
              aria-label={title}
              className={`banner-dot${i === slide ? ' banner-dot--active' : ''}`}
              onClick={() => setSlide(i as 0 | 1)}
            />
          ))}
        </div>
      </div>

      <div className="banner-track-wrapper">
        <div
          className="banner-track"
          style={{ transform: `translateX(-${slide * 50}%)` }}
        >
          {/* Slide 0: Popular */}
          <div className="banner-slide">
            <p className="banner-empty">Cargando actividades…</p>
          </div>

          {/* Slide 1: Available today */}
          <div className="banner-slide">
            <p className="banner-empty">Cargando actividades para hoy…</p>
          </div>
        </div>
      </div>
    </section>
  )
}
