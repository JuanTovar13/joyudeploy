import hills from '../assets/hills.svg'
import faceYellow from '../assets/face-yellow.svg'
import faceGreen from '../assets/face-green.svg'

export const BackgroundDecor = () => {
  return (
    <>
      {/* Yellow face */}
      <img src={faceYellow} className="decor-face-yellow" />

      {/* Green face */}
      <img src={faceGreen} className="decor-face-green" />

      {/* Hills */}
      <img src={hills} className="decor-hills" />
    </>
  )
}
