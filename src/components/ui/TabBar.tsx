interface Tab {
  id: string
  label: string
}

interface TabBarProps {
  tabs: Tab[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export const TabBar = ({ tabs, activeId, onChange, className }: TabBarProps) => (
  <div
    className={`ui-tab-bar${className ? ` ${className}` : ''}`}
    role="tablist"
  >
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={activeId === tab.id}
        className={`ui-tab-btn${activeId === tab.id ? ' ui-tab-btn--active' : ''}`}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
)
