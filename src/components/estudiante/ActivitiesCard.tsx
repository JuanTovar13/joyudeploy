import type { JoyuItem } from '../../types'

interface ActivitiesCardProps {
  items: JoyuItem[]
}

export const ActivitiesCard = ({ items }: ActivitiesCardProps) => {
  return (
    <section className="activities-card">
      <div className="activities-header">
        <h2>Next recommended activities</h2>
        <button className="view-all">See all</button>
      </div>
      <div className="activities-grid">
        {items.map((item) => (
          <div key={item.id} className="activity-item">
            {item.image && <img src={item.image} alt={item.title} />}
            <div>
              <h3>{item.title}</h3>
              <p className="activity-category">{item.category}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
