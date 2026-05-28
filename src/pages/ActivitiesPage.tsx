import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchActivities, fetchActivitySchedules } from '../store/slices/activitiesSlice'
import { ActivityDetailModal } from '../components/estudiante/ActivityDetailModal'
import type { JoyuItem } from '../types'
import '../styles/ActivitiesPage.css'

// ── Preferred display order ───────────────────────────────────────────────────
// Normalized strings (lowercase, no accents) that map to a display name + section
const PREFERRED: { normalized: string; display: string; section: 'Cultura' | 'Deportes' }[] = [
  { normalized: 'artes plasticas',      display: 'Artes Plásticas',      section: 'Cultura'   },
  { normalized: 'artes musicales',      display: 'Artes Musicales',      section: 'Cultura'   },
  { normalized: 'deportes individuales', display: 'Deportes Individuales', section: 'Deportes'  },
  { normalized: 'deportes de conjunto', display: 'Deportes de Conjunto', section: 'Deportes'  },
]

const SECTION_EMOJI: Record<'Cultura' | 'Deportes', string> = {
  Cultura:  '🎨',
  Deportes: '⚽',
}

// Strip accents and lowercase for fuzzy comparison
const norm = (s: string) =>
  s.toLowerCase()
   .normalize('NFD')
   .replace(/[̀-ͯ]/g, '')   // remove combining diacritics
   .trim()

// Match a DB category string to one of our preferred entries
const matchPreferred = (dbCat: string) =>
  PREFERRED.find(p => p.normalized === norm(dbCat)) ?? null

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

  useEffect(() => {
    if (status === 'idle')          void dispatch(fetchActivities())
  }, [dispatch, status])

  useEffect(() => {
    if (schedulesStatus === 'idle') void dispatch(fetchActivitySchedules())
  }, [dispatch, schedulesStatus])

  // Build an ordered list of { display, section, items }
  const categoryGroups = useMemo(() => {
    // Collect unique DB categories and their items
    const rawMap = new Map<string, JoyuItem[]>()          // key = original DB string
    for (const item of items) {
      const cat = item.category?.trim() || 'Sin categoría'
      if (!rawMap.has(cat)) rawMap.set(cat, [])
      rawMap.get(cat)!.push(item)
    }

    // Build display groups in preferred order first, then leftover categories
    const used = new Set<string>()
    const result: { display: string; section: 'Cultura' | 'Deportes' | null; items: JoyuItem[] }[] = []

    for (const pref of PREFERRED) {
      // Find all DB keys that match this preferred slot
      const matched: JoyuItem[] = []
      for (const [dbCat, dbItems] of rawMap) {
        if (norm(dbCat) === pref.normalized) {
          matched.push(...dbItems)
          used.add(dbCat)
        }
      }
      if (matched.length > 0) {
        result.push({ display: pref.display, section: pref.section, items: matched })
      }
    }

    // Any DB categories that didn't match a preferred slot — append at the end
    for (const [dbCat, dbItems] of rawMap) {
      if (!used.has(dbCat)) {
        result.push({ display: dbCat, section: null, items: dbItems })
      }
    }

    return result
  }, [items])

  // Group into sections preserving order
  const sections = useMemo(() => {
    const map = new Map<string, typeof categoryGroups>()
    for (const group of categoryGroups) {
      const sec = group.section ?? 'Otros'
      if (!map.has(sec)) map.set(sec, [])
      map.get(sec)!.push(group)
    }
    // Preferred section order
    const order = ['Cultura', 'Deportes', 'Otros']
    return order.flatMap(s => {
      const groups = map.get(s)
      if (!groups) return []
      return [{ section: s, groups }]
    })
  }, [categoryGroups])

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
        ) : items.length === 0 ? (
          <div className="acts-page__loading">No hay actividades disponibles.</div>
        ) : sections.length === 0 ? (
          <div className="acts-page__loading">No hay actividades disponibles.</div>
        ) : (
          sections.map(({ section, groups }) => (
            <section key={section} className="acts-section">
              <h2 className="acts-section__heading">
                {SECTION_EMOJI[section as 'Cultura' | 'Deportes'] ?? '📋'} {section}
              </h2>

              {groups.map(group => (
                <div key={group.display} className="acts-category">
                  <h3 className="acts-category__title">{group.display}</h3>
                  <div className="acts-grid">
                    {group.items.map(item => (
                      <ActivityCard
                        key={item.id}
                        item={item}
                        onClick={() => setSelected(item)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))
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
