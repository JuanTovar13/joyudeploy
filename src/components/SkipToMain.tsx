export const SkipToMain = () => (
  <a
    href="#main-content"
    className="skip-to-main"
    onFocus={(e) => { e.currentTarget.style.clip = 'auto' }}
    onBlur={(e) => { e.currentTarget.style.clip = 'rect(0,0,0,0)' }}
  >
    Skip to main content
  </a>
)
