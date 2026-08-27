import type { ReactNode } from 'react'

type Tab = 'org' | 'shortlist' | 'external'

interface Props {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  shortlistCount: number
  hasFirstPick: boolean
}

interface TabConfig {
  id: Tab
  label: string
  icon: ReactNode
}

function OrgIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <rect x="7" y="1" width="6" height="4" rx="1" />
      <rect x="1" y="14" width="6" height="4" rx="1" />
      <rect x="7" y="14" width="6" height="4" rx="1" />
      <rect x="13" y="14" width="6" height="4" rx="1" />
      <line x1="10" y1="5" x2="10" y2="8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="4" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" />
      <line x1="4" y1="8" x2="4" y2="14" stroke="currentColor" strokeWidth="1.5" />
      <line x1="10" y1="8" x2="10" y2="14" stroke="currentColor" strokeWidth="1.5" />
      <line x1="16" y1="8" x2="16" y2="14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 5h14M3 10h14M3 15h8" strokeLinecap="round" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="10" cy="8" r="4" />
      <path d="M2 18c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
      <path d="M16 2l2 2-2 2M14 4h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function BottomNav({ activeTab, onTabChange, shortlistCount, hasFirstPick }: Props) {
  const tabs: TabConfig[] = [
    { id: 'org', label: 'Org Chart', icon: <OrgIcon /> },
    { id: 'shortlist', label: `Shortlist${shortlistCount > 0 ? ` (${shortlistCount})` : ''}`, icon: <ListIcon /> },
    { id: 'external', label: 'External', icon: <ExternalIcon /> },
  ]

  return (
    <div className="flex border-t border-white/10 bg-[#0d1224] safe-bottom">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id
        const showBadge = tab.id === 'shortlist' && shortlistCount > 0
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 relative transition-colors ${
              isActive ? 'text-brand' : 'text-white/40'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {showBadge && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {shortlistCount}
                </span>
              )}
              {tab.id === 'shortlist' && hasFirstPick && (
                <span className="absolute -top-1 -right-1 bg-green-500 w-2 h-2 rounded-full" />
              )}
            </div>
            <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            {isActive && (
              <span className="absolute top-0 left-4 right-4 h-0.5 bg-brand rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
