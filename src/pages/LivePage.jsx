import { useState, useEffect, useRef } from 'react'
import LiveGameCard from '../components/LiveGameCard'

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

function mtToday() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' })
}

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d, 12))
  dt.setUTCDate(dt.getUTCDate() + n)
  return dt.toISOString().slice(0, 10)
}

function buildWindow(centerDate) {
  const today = mtToday()
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(centerDate, i - 3)
    const [y, m, d] = date.split('-').map(Number)
    const dt = new Date(Date.UTC(y, m - 1, d))
    return {
      date,
      day: date === today ? 'Today' : dt.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
      num: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
    }
  })
}

function periodLabel(p) {
  if (p === 1) return '1st'
  if (p === 2) return '2nd'
  if (p === 3) return '3rd'
  if (p === 4) return 'OT'
  if (p >= 5) return 'SO'
  return '—'
}

function mapGameState(state) {
  if (state === 'LIVE' || state === 'CRIT') return 'live'
  if (state === 'OFF' || state === 'FINAL') return 'final'
  if (state === 'FUT' || state === 'PRE') return 'upcoming'
  return 'upcoming'
}

// Total seconds of real game time remaining — used for sort (lower = more urgent)
function totalSecsRemaining(period, timeStr) {
  if (!timeStr) return 9999
  const [m, s] = timeStr.split(':').map(Number)
  const periodSecs = (m || 0) * 60 + (s || 0)
  const periodsLeft = Math.max(0, 3 - (period || 1))
  return periodSecs + periodsLeft * 1200
}

function mapTilt(tilt) {
  const raw = tilt?.net_tilt ?? 0
  const net = Math.abs(raw) > 1 ? raw / 100 : raw  // normalise if backend sends 0-100
  const abs = Math.abs(net)
  const side = net >= 0 ? 'home' : 'away'
  return {
    tiltSide: side,
    tiltAngle: net >= 0 ? -Math.min(Math.round(abs * 20), 12) : Math.min(Math.round(abs * 20), 12),
    tiltStrength: Math.min(Math.round(abs * 65), 65),
    tiltColor: side === 'home' ? 'blue' : 'red',
  }
}

function mapLiveGame(g, tilt) {
  const homeLeading = g.home_score > g.away_score
  return {
    game_id: g.game_id,
    home: teamName(g.home_team),
    homeAbbr: g.home_team,
    homeSog: null,
    homeScore: g.home_score,
    homePulled: false,
    homeHighlight: homeLeading,
    away: teamName(g.away_team),
    awayAbbr: g.away_team,
    awaySog: null,
    awayScore: g.away_score,
    awayPulled: false,
    awayHighlight: !homeLeading && g.away_score > g.home_score,
    period: periodLabel(g.period),
    time: g.time_remaining ?? '—',
    timeRemaining: totalSecsRemaining(g.period, g.time_remaining),
    pp: null,
    en: g.empty_net ?? false,
    pullRisk: null,
    pullRiskTeam: null,
    ...mapTilt(tilt),
  }
}

function mapUpcomingGame(g) {
  return {
    game_id: g.game_id,
    home: teamName(g.home_team),
    away: teamName(g.away_team),
    time: formatMT(g.start_time_utc),
    model: '—',
    edge: null,
  }
}

function mapFinalGame(g) {
  return {
    game_id: g.game_id,
    home: teamName(g.home_team),
    homeSog: null,
    homeScore: g.home_score,
    away: teamName(g.away_team),
    awaySog: null,
    awayScore: g.away_score,
    totalShots: null,
    enGoals: null,
  }
}

export default function LivePage({ onNav }) {
  const [liveGames, setLiveGames] = useState([])
  const [upcomingGames, setUpcomingGames] = useState([])
  const [finalGames, setFinalGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [windowCenter, setWindowCenter] = useState(mtToday)
  const controllerRef = useRef(null)

  useEffect(() => {
    let active = true
    setLoading(true)

    async function load() {
      if (controllerRef.current) controllerRef.current.abort()
      controllerRef.current = new AbortController()
      const { signal } = controllerRef.current
      const timeoutId = setTimeout(() => controllerRef.current?.abort(), 15000)

      try {
        const res = await fetch(`${BASE}/games/date/${windowCenter}`, { signal })
        const all = await res.json()
        if (!Array.isArray(all)) return

        const liveRaw = all.filter(g => mapGameState(g.game_state) === 'live')
        const upcomingRaw = all.filter(g => mapGameState(g.game_state) === 'upcoming')
        const finalRaw = all.filter(g => mapGameState(g.game_state) === 'final')

        // Fetch tilt for each live game in parallel; failures yield null
        const tiltResults = await Promise.allSettled(
          liveRaw.map(g =>
            fetch(`${BASE}/games/${g.game_id}/tilt`, { signal }).then(r => r.json())
          )
        )

        if (!active || signal.aborted) return

        const mapped = liveRaw
          .map((g, i) => {
            const tilt = tiltResults[i].status === 'fulfilled' ? tiltResults[i].value : null
            return mapLiveGame(g, tilt)
          })
          .sort((a, b) => a.timeRemaining - b.timeRemaining)

        setLiveGames(mapped)
        setUpcomingGames(upcomingRaw.map(mapUpcomingGame))
        setFinalGames(finalRaw.map(mapFinalGame))
      } catch (_) {
        // network error or abort — keep existing state on re-polls, stay empty on first load
      } finally {
        clearTimeout(timeoutId)
      }
    }

    load().finally(() => { if (active) setLoading(false) })
    const pollId = setInterval(load, 10000)

    return () => {
      active = false
      clearInterval(pollId)
      controllerRef.current?.abort()
    }
  }, [windowCenter])

  return (
    <div className="page">
      <nav className="nav">
        <div className="nav-links">
          <button className="nl" onClick={() => onNav('home')}>Home</button>
          <button className="nl" onClick={() => onNav('insights')}>Insights</button>
          <button className="nl live-tab on" onClick={() => onNav('live')}>
            <span className="nav-live-dot"></span>Live
          </button>
          <button className="nl">Coaches</button>
          <button className="nl">Teams</button>
          <button className="nl">History</button>
        </div>
        <div className="live-pill">
          <div className="live-dot"></div>
          {loading ? 'Loading…' : `${liveGames.length} live now`}
        </div>
      </nav>

      <div className="hero">
        <div className="hero-title">puck<span>lytics</span> <span className="hero-suffix-live">live</span></div>
      </div>

      <div className="body">

        <div className="date-bar">
          <button className="date-arrow" onClick={() => setWindowCenter(c => addDays(c, -1))}>←</button>
          {buildWindow(windowCenter).map(d => (
            <div
              key={d.date}
              className={`date-pill ${d.date === windowCenter ? 'on' : ''}`}
              onClick={() => setWindowCenter(d.date)}
              style={{ cursor: 'pointer' }}
            >
              <div className="dp-day">{d.day}</div>
              <div className="dp-num">{d.num}</div>
            </div>
          ))}
          <button className="date-arrow" onClick={() => setWindowCenter(c => addDays(c, 1))}>→</button>
        </div>

        <div>
          <div className="section-label">Live now · sorted by time remaining</div>
          {loading ? (
            <div className="loading-card">Connecting to live data…</div>
          ) : liveGames.length === 0 ? (
            <div className="empty-card">No games live right now</div>
          ) : (
            <div className="row3">
              {liveGames.map(g => (
                <LiveGameCard key={g.game_id} game={g} onNav={onNav} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="section-label">Upcoming</div>
          {upcomingGames.length === 0 && !loading ? (
            <div className="empty-card">No more games scheduled today</div>
          ) : (
            <div className="row3">
              {upcomingGames.map(g => (
                <div key={g.game_id} className="lcard">
                  <div className="lc-top">
                    <span className="badge bl">{g.time}</span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>Goalies TBC</span>
                  </div>
                  <div className="lc-team">
                    <div><div className="lc-tname">{g.home}</div></div>
                    <div className="lc-tscore dim">—</div>
                  </div>
                  <div className="lc-divider"></div>
                  <div className="lc-team">
                    <div><div className="lc-tname">{g.away}</div></div>
                    <div className="lc-tscore dim">—</div>
                  </div>
                  <div className="lc-foot">
                    <div>
                      <div className="lc-lbl">Model</div>
                      <div className="lc-val" style={{ color: '#9CA3AF' }}>{g.model}</div>
                    </div>
                    <div>
                      <div className="lc-lbl">Edge</div>
                      <div className="lc-val" style={{ color: '#9CA3AF' }}>—</div>
                    </div>
                  </div>
                </div>
              ))}
              {!loading && <div className="empty-card">No more games scheduled today</div>}
            </div>
          )}
        </div>

        <div>
          <div className="section-label">Final</div>
          {finalGames.length === 0 && !loading ? (
            <div className="empty-card">No final games yet today</div>
          ) : (
            <div className="row3">
              {finalGames.map(g => (
                <div key={g.game_id} className="lcard">
                  <div className="lc-top">
                    <span className="badge bf">Final</span>
                  </div>
                  <div className="lc-team">
                    <div>
                      <div className="lc-tname">{g.home}</div>
                      {g.homeSog !== null && <div className="lc-tsog"><strong>{g.homeSog}</strong> SOG</div>}
                    </div>
                    <div className={`lc-tscore ${g.homeScore > g.awayScore ? '' : 'dim'}`}>{g.homeScore}</div>
                  </div>
                  <div className="lc-divider"></div>
                  <div className="lc-team">
                    <div>
                      <div className="lc-tname">{g.away}</div>
                      {g.awaySog !== null && <div className="lc-tsog"><strong>{g.awaySog}</strong> SOG</div>}
                    </div>
                    <div className={`lc-tscore ${g.awayScore > g.homeScore ? '' : 'dim'}`}>{g.awayScore}</div>
                  </div>
                  <div className="lc-foot">
                    <div>
                      <div className="lc-lbl">Total shots</div>
                      <div className="lc-val" style={g.totalShots === null ? { color: '#9CA3AF' } : {}}>
                        {g.totalShots ?? '—'}
                      </div>
                    </div>
                    <div>
                      <div className="lc-lbl">EN goals</div>
                      <div className="lc-val" style={g.enGoals === null ? { color: '#9CA3AF' } : {}}>
                        {g.enGoals ?? '—'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
