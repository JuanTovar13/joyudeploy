import caraFrase from '../../assets/home-icons/Cara sonriente(frase motivadora).svg'
import type { GroqRecommendation } from '../../lib/groqClient'

interface QuoteCardProps {
  loadingRec: boolean
  recError: boolean
  rec: GroqRecommendation
}

export const QuoteCard = ({ loadingRec, recError, rec }: QuoteCardProps) => {
  return (
    <section className="quote-card">
      {loadingRec ? (
        <div className="quote-loading">
          <span className="quote-dot" />
          <span className="quote-dot" />
          <span className="quote-dot" />
        </div>
      ) : recError ? (
        <p className="quote-error">
          Could not load your recommendation. Try the check-in again!
        </p>
      ) : (
        <div className="quote-content">
          <p>{rec.message}</p>
          {rec.activities && rec.activities.length > 0 && (
            <div className="quote-activities">
              <span className="quote-activities-label">✦ Recommended for you</span>
              <div className="quote-activities-list">
                {rec.activities.map((activity) => (
                  <span key={activity} className="quote-activity-badge">
                    {activity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <img src={caraFrase} alt="Smiley" />
    </section>
  )
}
