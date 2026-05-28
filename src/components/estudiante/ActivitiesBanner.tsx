import { useState, useMemo } from 'react'
import type { JoyuItem, ActivitySchedule } from '../../types'
import { CLASS_SCHEDULE, getTodayKey, timesOverlap } from '../../data/classSchedule'

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
  schedules: ActivitySchedule[]
}

export const ActivitiesBanner = ({ items, schedules }: Props) => {
  const [slide, setSlide] = useState<0 | 1>(0)

  // ── Slide 0: first 5 activities ("popular") ──────────────────────────────
  const popular = items.slice(0, 5)

  // ── Slide 1: activities available today without class conflicts ───────────
  const todayActivities = useMemo<JoyuItem[]>(() => {
    const todayKey  = getTodayKey()           // e.g. 'Lun' — undefined on weekends
    if (!todayKey) return []

    const todayClasses = CLASS_SCHEDULE[todayKey] ?? []

    // Keep only activity schedules that run today and don't clash with any class
    const freeSchedules = schedules.filter((s) => {
      if (s.day !== todayKey) return false
      return !todayClasses.some((cls) =>
        timesOverlap(cls.start, cls.end, s.start_time, s.end_time),
      )
    })

    // Map schedule → activity, deduplicate, max 5
    const seen    = new Set<string>()
    const result: JoyuItem[] = []
    for (const s of freeSchedules) {
      if (seen.has(s.activity_id)) continue
      const activity = items.find((a) => a.id === s.activity_id)
      if (activity) {
        seen.add(s.activity_id)
        result.push(activity)
      }
      if (result.length === 5) break
    }
    return result
  }, [schedules, items])

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

          {/* ── Slide 1: Available today ── */}
          <div className="banner-slide">
            {todayActivities.length > 0
              ? <ul className="banner-activity-list">
                  {todayActivities.map((item) => (
                    <li key={item.id} style={{ listStyle: 'none' }}>
                      <BannerActivityCard item={item} />
                    </li>
                  ))}
                </ul>
              : <p className="banner-empty">
                  No hay actividades disponibles en tus ratos libres hoy 🙌
                </p>
            }
          </div>
        </div>
      </div>
    </section>
  )
}
