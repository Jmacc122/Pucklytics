const insights = [
  {
    title: 'Empty net',
    desc: 'Pull timing, EN score rates, and coach tendencies by game situation',
    stat: '13.2%',
    statLabel: 'League EN rate',
    statColor: 'blue',
    size: 'large',
    preview: 'bars',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="1" y="5" width="14" height="12" rx="2" stroke="#2563EB" strokeWidth="1.5"/>
        <line x1="5" y1="5" x2="5" y2="17" stroke="#2563EB" strokeWidth="1"/>
        <line x1="9" y1="5" x2="9" y2="17" stroke="#2563EB" strokeWidth="1"/>
        <line x1="1" y1="10" x2="15" y2="10" stroke="#2563EB" strokeWidth="1"/>
        <line x1="1" y1="14" x2="15" y2="14" stroke="#2563EB" strokeWidth="1"/>
        <circle cx="18" cy="7" r="3" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5"/>
      </svg>
    ),
    bars: [
      { name: 'FLA', val: 19, width: 82 },
      { name: 'BOS', val: 17, width: 73 },
      { name: 'CGY', val: 15, width: 65, highlight: true }
    ]
  },
  {
    title: 'Challenges',
    desc: 'Coach challenge success rates, timing patterns, and review outcomes',
    stat: '58%',
    statLabel: 'Success rate',
    statColor: 'green',
    size: 'large',
    preview: 'mini-stats',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="2" width="18" height="18" rx="3" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5"/>
        <path d="M6 11 L9.5 14.5 L16 7.5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    miniStats: [
      { num: '247', label: 'Total challenges' },
      { num: '143', label: 'Successful' },
      { num: '104', label: 'Failed' }
    ]
  },
  {
    title: 'Shots + Corsi',
    desc: 'Shot rates, scoring chances, and pace by period and score state',
    stat: '31.4',
    statLabel: 'Avg shots/game',
    size: 'small',
    preview: 'mini-stats',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="13" r="3.5" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5"/>
        <path d="M11 9.5 L11 4" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M11 4 L8 7" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M4 17 Q11 7 18 17" stroke="#2563EB" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
    miniStats: [
      { num: 'BOS', label: 'Most shots' },
      { num: 'ARI', label: 'Fewest shots' }
    ]
  },
  {
    title: 'Coach tendencies',
    desc: 'Goalie pull timing, aggression ratings, and situational patterns',
    stat: '4:31',
    statLabel: 'Avg pull time',
    size: 'small',
    preview: 'coaches',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#2563EB" strokeWidth="1.5"/>
        <path d="M11 7 L11 11 L14 14" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    coaches: [
      { name: 'Knoblauch', team: 'EDM', pct: '83%' },
      { name: 'Laviolette', team: 'NYR', pct: '79%' },
      { name: 'Blashill', team: 'CGY', pct: '76%' }
    ]
  },
  {
    title: 'Score state splits',
    desc: 'How teams perform leading, trailing, and tied — broken down by period',
    stat: 'Soon',
    statLabel: 'Coming next',
    size: 'small',
    preview: 'soon',
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 16 L7 10 L11 13 L15 7 L19 9" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="19" cy="9" r="2" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5"/>
      </svg>
    )
  }
]

function InsightCardLarge({ insight }) {
  return (
    <div className="ihub-card">
      <div className="ihub-top">
        <div className="ihub-icon">{insight.icon}</div>
        <div className="ihub-stat">
          <div className={`ihub-stat-num ${insight.statColor || ''}`}>{insight.stat}</div>
          <div className="ihub-stat-lbl">{insight.statLabel}</div>
        </div>
      </div>
      <div className="ihub-title">{insight.title}</div>
      <div className="ihub-desc">{insight.desc}</div>
      <div className="ihub-divider"></div>

      {insight.preview === 'bars' && (
        <div className="ihub-preview">
          {insight.bars.map((b, i) => (
            <div className="ihub-bar-row" key={i}>
              <span className="ihub-bar-name" style={b.highlight ? { color: '#2563EB' } : {}}>{b.name}</span>
              <div className="ihub-bar-track"><div className="ihub-bar-fill" style={{ width: `${b.width}%` }}></div></div>
              <span className="ihub-bar-val">{b.val}%</span>
            </div>
          ))}
        </div>
      )}

      {insight.preview === 'mini-stats' && (
        <div className="ihub-mini-stats">
          {insight.miniStats.map((s, i) => (
            <div className="ihub-mini-stat" key={i}>
              <div className="ihub-mini-stat-n">{s.num}</div>
              <div className="ihub-mini-stat-l">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {insight.preview === 'coaches' && (
        <div className="ihub-preview">
          {insight.coaches.map((c, i) => (
            <div className="ihub-coach-row" key={i}>
              <div>
                <div className="ihub-coach-name">{c.name}</div>
                <div className="ihub-coach-team">{c.team}</div>
              </div>
              <div className="ihub-coach-pct">{c.pct}</div>
            </div>
          ))}
        </div>
      )}

      {insight.preview === 'soon' && (
        <div className="ihub-mini-stats">
          <div className="ihub-mini-stat" style={{ opacity: 0.5 }}>
            <div className="ihub-mini-stat-n">—</div>
            <div className="ihub-mini-stat-l">Coming soon</div>
          </div>
        </div>
      )}

      <div className="ihub-explore" style={insight.preview === 'soon' ? { color: '#9CA3AF' } : {}}>
        {insight.preview === 'soon' ? 'Coming soon' : 'Explore →'}
      </div>
    </div>
  )
}

export default function InsightsPage({ onNav }) {
  const large = insights.filter(i => i.size === 'large')
  const small = insights.filter(i => i.size === 'small')

  return (
    <div className="page">
      <nav className="nav">
        <div className="nav-links">
          <button className="nl" onClick={() => onNav('home')}>Home</button>
          <button className="nl on" onClick={() => onNav('insights')}>Insights</button>
          <button className="nl live-tab" onClick={() => onNav('live')}>
            <span className="nav-live-dot"></span>Live
          </button>
          <button className="nl">Coaches</button>
          <button className="nl">Teams</button>
          <button className="nl">History</button>
        </div>
        <div className="live-pill"><div className="live-dot"></div>Live now</div>
      </nav>

      <div className="hero">
        <div className="hero-title">puck<span>lytics</span></div>
      </div>

      <div className="body">
        <div className="ihub-grid2">
          {large.map((ins, i) => <InsightCardLarge key={i} insight={ins} />)}
        </div>
        <div className="ihub-grid3">
          {small.map((ins, i) => <InsightCardLarge key={i} insight={ins} />)}
        </div>
      </div>
    </div>
  )
}