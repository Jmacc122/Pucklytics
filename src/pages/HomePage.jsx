import { useState, useEffect } from 'react'
import GameCard from '../components/GameCard'
import InsightCard from '../components/InsightCard'

const BASE = 'https://pucklytics-backend.onrender.com'

const TEAMS = {
  ANA: 'Anaheim',    ARI: 'Arizona',     BOS: 'Boston',      BUF: 'Buffalo',
  CAR: 'Carolina',   CBJ: 'Columbus',    CGY: 'Calgary',     CHI: 'Chicago',
  COL: 'Colorado',   DAL: 'Dallas',      DET: 'Detroit',     EDM: 'Edmonton',
  FLA: 'Florida',    LAK: 'LA Kings',    MIN: 'Minnesota',   MTL: 'Montreal',
  NJD: 'New Jersey', NSH: 'Nashville',   NYI: 'NY Islanders',NYR: 'NY Rangers',
  OTT: 'Ottawa',     PHI: 'Philadelphia',PIT: 'Pittsburgh',  SEA: 'Seattle',
  SJS: 'San Jose',   STL: 'St. Louis',   TBL: 'Tampa Bay',   TOR: 'Toronto',
  VAN: 'Vancouver',  VGK: 'Vegas',       WPG: 'Winnipeg',    WSH: 'Washington',
}

function teamName(abbr) { return TEAMS[abbr] || abbr }

function mtToday() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' })
}

function formatMT(utcStr) {
  if (!utcStr) return '—'
  try {
    return new Date(utcStr).toLocaleTimeString('en-US', {
      timeZone: 'America/Denver',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }) + ' MT'
  } catch (_) { return '—' }
}

function periodLabel(p) {
  if (p === 1) return '1st'
  if (p === 2) return '2nd'
  if (p === 3) return '3rd'
  if (p === 4) return 'OT'
  if (p >= 5) return 'SO'
  return ''
}

function mapGameState(state) {
  if (state === 'LIVE' || state === 'CRIT') return 'live'
  if (state === 'OFF' || state === 'FINAL') return 'final'
  if (state === 'FUT' || state === 'PRE') return 'upcoming'
  return 'upcoming'
}

function formatStrength(s) {
  if (!s || s === 'even') return 'Even'
  return s.toUpperCase()
}

function formatWinProb(prob, home, away) {
  if (prob === null || prob === undefined) return null
  const h = Math.round(prob * 100)
  const a = 100 - h
  return h >= a ? `${home} ${h}%` : `${away} ${a}%`
}

function mapToGameCard(g) {
  const status = mapGameState(g.game_state)
  const isLive = status === 'live'
  const isUpcoming = status === 'upcoming'
  const homeLeading = g.home_score > g.away_score
  return {
    game_id: g.game_id,
    home: teamName(g.home_team),
    homeGoalie: null,
    homeScore: isUpcoming ? null : g.home_score,
    away: teamName(g.away_team),
    awayGoalie: null,
    awayScore: isUpcoming ? null : g.away_score,
    status,
    period: isLive ? periodLabel(g.period) : null,
    time: isLive ? g.time_remaining : isUpcoming ? formatMT(g.start_time_utc) : 'Final',
    strength: isLive ? formatStrength(g.strength) : null,
    pullRisk: null,
    pullRiskLevel: null,
    winProb: formatWinProb(g.win_probability, g.home_team, g.away_team),
    featured: isLive && homeLeading,
  }
}

const insights = [
  {
    title: 'Empty net',
    desc: 'Pull timing, EN score rates, and coach tendencies by game situation',
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
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    fetch(`${BASE}/games/date/${mtToday()}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => setGames(Array.isArray(data) ? data.map(mapToGameCard) : []))
      .catch(() => setGames([]))
      .finally(() => { clearTimeout(timeoutId); setLoading(false) })

    return () => { clearTimeout(timeoutId); controller.abort() }
  }, [])

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
          {loading ? (
            <div className="loading-card">Loading games…</div>
          ) : games.length === 0 ? (
            <div className="empty-card">No games today</div>
          ) : (
            <div className="row3">
              {games.map((g, i) => <GameCard key={g.game_id ?? i} game={g} />)}
            </div>
          )}
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
