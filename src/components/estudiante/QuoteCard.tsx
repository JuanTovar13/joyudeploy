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
          {rec.activity && (
            <span className="quote-activity-badge">
              ✦ Recommended activity: {rec.activity}
            </span>
          )}
        </div>
      )}
      <img src={caraFrase} alt="Smiley" />
    </section>
  )
}
