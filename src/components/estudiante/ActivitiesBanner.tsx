import { useState } from 'react'
import type { JoyuItem } from '../../types'

const SLIDE_TITLES = ['Actividades Populares', 'Actividades Para Ti Hoy'] as const

// ── Activity card shared by both slides ──────────────────────────────────────
const BannerActivityCard = ({ item }: { item: JoyuItem }) => (
  <div className="banner-activity-card">
    {item.image
      ? <img src={item.image} alt={item.title} className="banner-activity-card__img" />
      : <div className="banner-activity-card__placeholder">🌟</div>
    }
    <div className="banner-activity-card__info">
      <p className="banner-activity-card__title">{item.title}</p>
      <p className="banner-activity-card__category">{item.category}</p>
    </div>
  </div>
)

interface Props {
  items: JoyuItem[]
}

export const ActivitiesBanner = ({ items }: Props) => {
  const [slide, setSlide] = useState<0 | 1>(0)

  // Slide 0: first 5 activities = "popular"
  const popular = items.slice(0, 5)

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
          {/* ── Slide 0: Popular ── */}
          <div className="banner-slide">
            {popular.length > 0
              ? <ul className="banner-activity-list">
                  {popular.map((item) => (
                    <li key={item.id} style={{ listStyle: 'none' }}>
                      <BannerActivityCard item={item} />
                    </li>
                  ))}
                </ul>
              : <p className="banner-empty">No hay actividades disponibles.</p>
            }
          </div>

          {/* ── Slide 1: Available today (placeholder) ── */}
          <div className="banner-slide">
            <p className="banner-empty">Cargando actividades para hoy…</p>
          </div>
        </div>
      </div>
    </section>
  )
}
