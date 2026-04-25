import GameCard from '../components/GameCard'
import InsightCard from '../components/InsightCard'

const games = [
  {
    home: 'Calgary', homeAbbr: 'CGY', homeGoalie: 'Markstrom', homeScore: 3,
    away: 'Edmonton', awayAbbr: 'EDM', awayGoalie: 'Skinner', awayScore: 2,
    status: 'live', period: '3rd', time: '4:22', strength: 'PP — CGY',
    pullRisk: 'EDM 82%', pullRiskLevel: 'red', winProb: 'CGY 71%', featured: true
  },
  {
    home: 'Boston', homeAbbr: 'BOS', homeGoalie: 'Swayman', homeScore: 1,
    away: 'Tampa Bay', awayAbbr: 'TBL', awayGoalie: 'Vasilevskiy', awayScore: 1,
    status: 'live', period: '2nd', time: '11:04', strength: 'Even',
    pullRisk: 'Low', pullRiskLevel: 'green', winProb: 'TBL 52%', featured: false
  },
  {
    home: 'Vancouver', homeAbbr: 'VAN', homeGoalie: 'TBC', homeScore: null,
    away: 'Vegas', awayAbbr: 'VGK', awayGoalie: 'TBC', awayScore: null,
    status: 'upcoming', time: '9:00 PM MT', strength: 'Goalie TBC',
    pullRisk: null, winProb: 'VAN 54%', edge: '+5%', featured: false
  }
]

const insights = [
  {
    title: 'Empty net',
    desc: 'Pull timing, EN score rates, coach patterns by situation',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="8" width="18" height="13" rx="2" stroke="#2563EB" strokeWidth="1.5"/>
        <line x1="7" y1="8" x2="7" y2="21" stroke="#2563EB" strokeWidth="1"/>
        <line x1="11" y1="8" x2="11" y2="21" stroke="#2563EB" strokeWidth="1"/>
        <line x1="15" y1="8" x2="15" y2="21" stroke="#2563EB" strokeWidth="1"/>
        <line x1="3" y1="13" x2="21" y2="13" stroke="#2563EB" strokeWidth="1"/>
        <line x1="3" y1="17" x2="21" y2="17" stroke="#2563EB" strokeWidth="1"/>
        <circle cx="22" cy="9" r="3" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5"/>
      </svg>
    )
  },
  {
    title: 'Shots + Corsi',
    desc: 'Shot rates, scoring chances, pace by period and state',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="16" r="4" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5"/>
        <path d="M14 12 L14 5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 5 L10 9" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M6 20 Q14 8 22 20" stroke="#2563EB" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    title: 'Challenges',
    desc: 'Coach success rates, timing, and review outcomes',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="5" width="18" height="18" rx="3" fill="#DBEAFE" stroke="#2563EB" strokeWidth="1.5"/>
        <path d="M9 14 L12.5 17.5 L19 10.5" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    title: 'More soon',
    desc: 'Goalie performance, score states, prop models',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="9" stroke="#2563EB" strokeWidth="1.5"/>
        <path d="M14 9 C14 9 11 11 11 14 C11 17 14 19 14 19" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14 9 C14 9 17 11 17 14 C17 17 14 19 14 19" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="5" y1="14" x2="23" y2="14" stroke="#2563EB" strokeWidth="1.5"/>
      </svg>
    )
  }
]

export default function HomePage({ onNav }) {
  return (
    <div className="page">
      <nav className="nav">
        <div className="nav-links">
          <button className="nl on" onClick={() => onNav('home')}>Home</button>
          <button className="nl" onClick={() => onNav('insights')}>Insights</button>
          <button className="nl live-tab" onClick={() => onNav('live')}>
            <span className="nav-live-dot"></span>Live
          </button>
          <button className="nl">Coaches</button>
          <button className="nl">Teams</button>
          <button className="nl">History</button>
        </div>
        <div className="live-pill">
          <div className="live-dot"></div>
          Live now
        </div>
      </nav>

      <div className="hero">
        <div className="hero-title">puck<span>lytics</span></div>
      </div>

      <div className="body">

        <div>
          <div className="sec">Tonight</div>
          <div className="row3">
            {games.map((g, i) => <GameCard key={i} game={g} />)}
          </div>
        </div>

        <div>
          <div className="sec">Insights</div>
          <div className="row4">
            {insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
          </div>
        </div>

      </div>
    </div>
  )
}