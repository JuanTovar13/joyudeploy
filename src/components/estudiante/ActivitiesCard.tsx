import type { JoyuItem } from '../../types'

interface ActivitiesCardProps {
  items: JoyuItem[]
}

export function ActivitiesCard({ items }: ActivitiesCardProps) {
  return (
    <section className="activities-card">
      <div className="activities-header">
        <h2>Next recommended activities</h2>
        <button className="view-all">See all</button>
      </div>
      <div className="activities-grid">
        {items.map((item) => (
          <div key={item.id} className="activity-item">
            <img src={item.image} alt={item.title} />
            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
