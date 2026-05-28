import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchActivities, fetchActivitySchedules } from '../store/slices/activitiesSlice'
import { ActivityDetailModal } from '../components/estudiante/ActivityDetailModal'
import type { JoyuItem } from '../types'
import '../styles/ActivitiesPage.css'

// ── Category config ───────────────────────────────────────────────────────────
// Canonical display names (must match DB values after normalization)
const CATEGORY_ORDER = [
  'Artes Plásticas',
  'Artes Musicales',
  'Deportes Individuales',
  'Deportes de Conjunto',
] as const

type CategoryKey = (typeof CATEGORY_ORDER)[number]

const SECTION_MAP: Record<CategoryKey, 'Cultura' | 'Deportes'> = {
  'Artes Plásticas':      'Cultura',
  'Artes Musicales':      'Cultura',
  'Deportes Individuales': 'Deportes',
  'Deportes de Conjunto':  'Deportes',
}

const SECTION_EMOJI: Record<'Cultura' | 'Deportes', string> = {
  Cultura:   '🎨',
  Deportes:  '⚽',
}

// Normalize a DB category string to one of our canonical keys (accent/case tolerant)
const normalize = (s: string) =>
  s.toLowerCase()
   .normalize('NFD')
   .replace(/\p{Diacritic}/gu, '')
   .trim()

const CANONICAL_NORMALIZED = Object.fromEntries(
  CATEGORY_ORDER.map(c => [normalize(c), c])
) as Record<string, CategoryKey>

const toCanonical = (dbCategory: string): CategoryKey | null =>
  CANONICAL_NORMALIZED[normalize(dbCategory)] ?? null

// ── Activity card ─────────────────────────────────────────────────────────────
const ActivityCard = ({ item, onClick }: { item: JoyuItem; onClick: () => void }) => (
  <button className="act-card" onClick={onClick} aria-label={item.title}>
    {item.image
      ? <img src={item.image} alt={item.title} className="act-card__img" />
      : <div className="act-card__placeholder">🌟</div>
    }
    <span className="act-card__title">{item.title}</span>
  </button>
)

// ── Page ──────────────────────────────────────────────────────────────────────
export const ActivitiesPage = () => {
  const dispatch  = useAppDispatch()
  const navigate  = useNavigate()
  const [selected, setSelected] = useState<JoyuItem | null>(null)

  const { items, schedules, status, schedulesStatus } = useAppSelector(s => s.activities)

  // Fetch if not yet loaded
  useEffect(() => {
    if (status === 'idle')         void dispatch(fetchActivities())
  }, [dispatch, status])

  useEffect(() => {
    if (schedulesStatus === 'idle') void dispatch(fetchActivitySchedules())
  }, [dispatch, schedulesStatus])

  // Group and order items
  const grouped = useMemo(() => {
    const map = new Map<CategoryKey, JoyuItem[]>(
      CATEGORY_ORDER.map(c => [c, []])
    )
    for (const item of items) {
      const key = toCanonical(item.category)
      if (key) map.get(key)!.push(item)
    }
    return map
  }, [items])

  const loading = status === 'idle' || status === 'loading'

  return (
    <>
    <div className="acts-page">

      {/* ── Header ── */}
      <div className="acts-page__header">
        <button
          className="acts-page__back"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          ‹
        </button>
        <h1 className="acts-page__title">Actividades</h1>
      </div>

      {/* ── Body ── */}
      <div className="acts-page__body">
        {loading ? (
          <div className="acts-page__loading">Cargando actividades…</div>
        ) : (
          (['Cultura', 'Deportes'] as const).map(section => {
            const cats = CATEGORY_ORDER.filter(c => SECTION_MAP[c] === section)
            const hasSomething = cats.some(c => (grouped.get(c)?.length ?? 0) > 0)
            if (!hasSomething) return null

            return (
              <section key={section} className="acts-section">
                <h2 className="acts-section__heading">
                  {SECTION_EMOJI[section]} {section}
                </h2>

                {cats.map(cat => {
                  const catItems = grouped.get(cat) ?? []
                  if (catItems.length === 0) return null

                  return (
                    <div key={cat} className="acts-category">
                      <h3 className="acts-category__title">{cat}</h3>
                      <div className="acts-grid">
                        {catItems.map(item => (
                          <ActivityCard
                            key={item.id}
                            item={item}
                            onClick={() => setSelected(item)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </section>
            )
          })
        )}
      </div>
    </div>

    {selected && (
      <ActivityDetailModal
        activity={selected}
        schedules={schedules}
        onClose={() => setSelected(null)}
      />
    )}
    </>
  )
}
