import { useState, useMemo, useEffect, useCallback } from 'react'
import type { JoyuItem, ActivitySchedule } from '../../types'
import { CLASS_SCHEDULE, getTodayKey, timesOverlap, type WeekDayKey } from '../../data/classSchedule'
import '../../styles/ActivitiesBanner.css'

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
  const [slide, setSlide]         = useState<0 | 1>(0)
  const [paused, setPaused]       = useState(false)

  const advance = useCallback(() => setSlide((s) => (s === 0 ? 1 : 0)), [])

  // Auto-rotate every 5 s; pause while the user hovers
  useEffect(() => {
    if (paused) return
    const id = setInterval(advance, 5000)
    return () => clearInterval(id)
  }, [paused, advance])

  // ── Slide 0: first 5 activities ("popular") ──────────────────────────────
  const popular = items.slice(0, 5)

  // ── Slide 1: activities available today without class conflicts ───────────
  const todayActivities = useMemo<JoyuItem[]>(() => {
    const todayKey = getTodayKey()   // undefined on weekends
    if (!todayKey) return []

    const todayClasses = CLASS_SCHEDULE[todayKey] ?? []

    // Flexible day matching: accepts Spanish/English, full/abbreviated, any case
    const DAY_ALIASES: Record<WeekDayKey, string[]> = {
      Lun: ['lun', 'lunes', 'monday', 'mon'],
      Mar: ['mar', 'martes', 'tuesday', 'tue'],
      Mié: ['mié', 'mie', 'miércoles', 'miercoles', 'wednesday', 'wed'],
      Jue: ['jue', 'jueves', 'thursday', 'thu'],
      Vie: ['vie', 'viernes', 'friday', 'fri'],
    }
    const matchesToday = (dbDay: string) =>
      DAY_ALIASES[todayKey].includes(dbDay.toLowerCase().trim())

    // Primary: activity_schedules that run today with no class conflict
    const freeSchedules = schedules.filter(s =>
      matchesToday(s.day) &&
      !todayClasses.some(cls => timesOverlap(cls.start, cls.end, s.start_time, s.end_time))
    )

    if (freeSchedules.length > 0) {
      const seen = new Set<string>()
      const result: JoyuItem[] = []
      for (const s of freeSchedules) {
        if (seen.has(s.activity_id)) continue
        const act = items.find(a => a.id === s.activity_id)
        if (act) { seen.add(s.activity_id); result.push(act) }
        if (result.length === 5) break
      }
      return result
    }

    // Fallback: activity_schedules has no entries for today.
    // Compute free hours from the class schedule; if there is free time,
    // suggest activities from the catalogue (any activity can be done then).
    const toH = (t: string) => { const [h, m] = t.split(':').map(Number); return h + m / 60 }
    const busyHours = todayClasses.reduce(
      (sum, cls) => sum + toH(cls.end) - toH(cls.start), 0
    )
    const freeHours = 15 - busyHours   // 7 am–10 pm = 15 h total

    if (freeHours < 1) return []   // day is essentially full

    // Return a different slice from popular for visual variety
    return items.length > 5 ? items.slice(5, 10) : items.slice(0, 5)
  }, [schedules, items])

  return (
    <section
      className="activities-banner"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
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
              onClick={() => { setSlide(i as 0 | 1); setPaused(false) }}
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
                    <li key={item.id} className="banner-card-container">
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
                    <li key={item.id} className="banner-card-container">
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
