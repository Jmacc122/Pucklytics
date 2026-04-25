import { useRef, useEffect, useState } from 'react'
import Chart from 'chart.js/auto'
import LiveDeepDiveCard from '../components/LiveDeepDiveCard'

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

function fmtTimestamp(ts) {
  if (!ts) return null
  try { return new Date(ts).toISOString().substring(11, 19) } catch (_) { return null }
}

function formatAge(secs) {
  if (secs == null) return '—'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')} ago`
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
  return '—'
}

function mapGameState(s) {
  if (s === 'LIVE' || s === 'CRIT') return 'live'
  if (s === 'OFF'  || s === 'FINAL') return 'final'
  return 'upcoming'
}

// KM survival curve — mock until a dedicated endpoint exists
const KM_LABELS = ['20','19','18','17','16','15','14','13','12','11','10','9','8','7','6','5','4','3','2','1','0']
const KM_TEAM   = [1.00,1.00,1.00,1.00,1.00,0.99,0.99,0.98,0.97,0.95,0.92,0.86,0.74,0.58,0.40,0.24,0.14,0.08,0.04,0.02,0.01]
const KM_AVG    = [1.00,1.00,1.00,1.00,1.00,1.00,0.99,0.99,0.98,0.97,0.95,0.92,0.87,0.79,0.68,0.55,0.40,0.26,0.14,0.06,0.02]

const vertLinePlugin = {
  id: 'vertLine',
  afterDraw(chart) {
    const idx = chart.data.labels.indexOf('4')
    if (idx < 0) return
    const meta = chart.getDatasetMeta(0)
    if (!meta.data[idx]) return
    const x = meta.data[idx].x
    const { top, bottom } = chart.chartArea
    const ctx = chart.ctx
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, top)
    ctx.lineTo(x, bottom)
    ctx.strokeStyle = '#DC2626'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.globalAlpha = 0.5
    ctx.stroke()
    ctx.restore()
  }
}

function NavBar({ onNav }) {
  return (
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
      <div className="live-pill"><div className="live-dot"></div>live</div>
    </nav>
  )
}

export default function LiveDeepDivePage({ onNav, gameId }) {
  const [data, setData] = useState(null)   // { game, tilt }
  const [loading, setLoading] = useState(true)
  const [eventsOpen, setEventsOpen] = useState(false)
  const tiltRef = useRef(null)
  const tiltInst = useRef(null)
  const kmRef = useRef(null)
  const kmInst = useRef(null)
  const controllerRef = useRef(null)

  // Poll game + tilt every 10 s, same pattern as LivePage
  useEffect(() => {
    if (!gameId) { setLoading(false); return }
    let active = true

    async function load() {
      if (controllerRef.current) controllerRef.current.abort()
      controllerRef.current = new AbortController()
      const { signal } = controllerRef.current
      const timeoutId = setTimeout(() => controllerRef.current?.abort(), 15000)
      try {
        const [gameRes, tiltRes] = await Promise.allSettled([
          fetch(`${BASE}/games/${gameId}`,      { signal }).then(r => r.json()),
          fetch(`${BASE}/games/${gameId}/tilt`, { signal }).then(r => r.json()),
        ])
        if (!active || signal.aborted) return
        setData({
          game: gameRes.status === 'fulfilled' ? gameRes.value : null,
          tilt: tiltRes.status === 'fulfilled' ? tiltRes.value : null,
        })
      } catch (_) {
        // ignore aborts and network errors; keep existing data on re-polls
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
  }, [gameId])

  // Destroy charts on unmount only (not on every poll)
  useEffect(() => {
    return () => { tiltInst.current?.destroy(); kmInst.current?.destroy() }
  }, [])

  // Create charts first time data arrives; update in-place on subsequent polls
  useEffect(() => {
    if (!data?.game) return
    if (mapGameState(data.game.game_state) === 'upcoming') return

    const history = data.tilt?.history ?? []
    const tiltLabels = history.map((h, i) => {
      if (typeof h !== 'object') return String(i)
      if (h.period != null && h.time_remaining != null) return `P${h.period} ${h.time_remaining}`
      return h.time ?? h.t ?? fmtTimestamp(h.timestamp) ?? String(i)
    })
    const tiltVals = history.map(h => {
      const raw = typeof h === 'object' ? (h.net_tilt ?? h.value ?? h.v ?? 0) : (typeof h === 'number' ? h : 0)
      const norm = Math.abs(raw) > 1 ? raw / 100 : raw
      return Math.min(60, Math.max(-60, Math.round(norm * 100)))
    })
    const labels = tiltLabels.length ? tiltLabels : ['—']
    const vals   = tiltVals.length   ? tiltVals   : [0]

    if (tiltRef.current) {
      if (tiltInst.current) {
        // Update data in-place — no flicker, no animation
        tiltInst.current.data.labels = labels
        tiltInst.current.data.datasets[0].data = vals
        tiltInst.current.update('none')
      } else {
        tiltInst.current = new Chart(tiltRef.current, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              data: vals,
              borderColor: '#2563EB',
              backgroundColor: 'transparent',
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.3,
              fill: false,
              segment: {
                borderColor: ctx => ctx.p1.parsed.y >= 0 ? '#2563EB' : '#DC2626',
              },
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
            scales: {
              x: {
                grid: { display: false },
                ticks: { font: { size: 9 }, color: '#9CA3AF', maxRotation: 30, maxTicksLimit: 8 },
              },
              y: {
                min: -60,
                max: 60,
                grid: { color: ctx => ctx.tick.value === 0 ? '#9CA3AF' : '#F3F4F6' },
                ticks: { font: { size: 10 }, color: '#9CA3AF', callback: v => v > 0 ? '+' + v : String(v), stepSize: 20 },
                title: { display: true, text: 'tilt', font: { size: 10 }, color: '#9CA3AF' },
              },
            }
          }
        })
      }
    }

    // KM chart uses static mock data — create once, never update
    if (kmRef.current && !kmInst.current) {
      const awayAbbr = data.game.away_team
      kmInst.current = new Chart(kmRef.current, {
        type: 'line',
        plugins: [vertLinePlugin],
        data: {
          labels: KM_LABELS,
          datasets: [
            { label: awayAbbr, data: KM_TEAM, borderColor: '#DC2626', backgroundColor: 'transparent', borderWidth: 2.5, pointRadius: 0, tension: 0.3, fill: false },
            { label: 'League avg', data: KM_AVG, borderColor: '#9CA3AF', backgroundColor: 'transparent', borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, tension: 0.3, fill: false },
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'bottom', labels: { font: { size: 10 }, color: '#9CA3AF', usePointStyle: true, pointStyleWidth: 18, boxHeight: 2 } },
            tooltip: { mode: 'index', intersect: false },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#9CA3AF' }, title: { display: true, text: 'Time remaining (min)', font: { size: 10 }, color: '#9CA3AF', padding: { top: 4 } } },
            y: { min: 0, max: 1, grid: { color: '#F3F4F6' }, ticks: { font: { size: 10 }, color: '#9CA3AF', callback: v => Math.round(v * 100) + '%' }, title: { display: true, text: 'P(not yet pulled)', font: { size: 10 }, color: '#9CA3AF' } },
          }
        }
      })
    }
  }, [data])

  // ── Derived display values ──────────────────────────────────
  const g    = data?.game
  const tilt = data?.tilt

  const status     = g ? mapGameState(g.game_state) : null
  const isUpcoming = status === 'upcoming'

  const homeAbbr = g?.home_team ?? 'HOME'
  const awayAbbr = g?.away_team ?? 'AWAY'

  // Tilt visuals from net_tilt (normalised to [-1, 1])
  const rawNet = tilt?.net_tilt ?? 0
  const net    = Math.abs(rawNet) > 1 ? rawNet / 100 : rawNet
  const abs    = Math.abs(net)
  const homeTiltPct  = Math.min(100, Math.max(0, Math.round(50 + net * 50)))
  const awayTiltPct  = 100 - homeTiltPct
  const beamFill     = Math.round(288 * homeTiltPct / 100)
  const tiltAngle    = net >= 0 ? -Math.min(Math.round(abs * 20), 12) : Math.min(Math.round(abs * 20), 12)
  const netTiltLabel = net === 0 ? '—' : (net > 0 ? '+' : '') + Math.round(net * 100) + '%'
  const tiltAdvAbbr  = net >= 0 ? homeAbbr : awayAbbr
  const homeWeighted = tilt?.home_score != null ? +tilt.home_score.toFixed(1) : '—'
  const awayWeighted = tilt?.away_score != null ? +tilt.away_score.toFixed(1) : '—'

  // Pull risk — mock until endpoint exists
  const pullRisk = 82
  const circR    = 48
  const circC    = +(2 * Math.PI * circR).toFixed(1)
  const circOff  = +(circC * (1 - pullRisk / 100)).toFixed(1)

  // Win probability
  const homeWinPct = g?.win_probability != null ? Math.round(g.win_probability * 100) : null
  const awayWinPct = homeWinPct != null ? 100 - homeWinPct : null

  // Card game object for LiveDeepDiveCard header
  const cardGame = g && {
    home:      teamName(homeAbbr),
    away:      teamName(awayAbbr),
    homeScore: isUpcoming ? null : g.home_score,
    awayScore: isUpcoming ? null : g.away_score,
    period:    periodLabel(g.period),
    time:      g.time_remaining ?? '—',
    venue:     null,
    pp:        null,
    en:        g.empty_net ?? false,
  }

  // ── Loading / error shells ──────────────────────────────────
  if (loading) return (
    <div className="page">
      <NavBar onNav={onNav} />
      <div className="ddv-back-bar"><button className="ddv-back" onClick={() => onNav('live')}>← Back to live games</button></div>
      <div className="body"><div className="loading-card" style={{ minHeight: 200 }}>Loading game data…</div></div>
    </div>
  )

  if (!g) return (
    <div className="page">
      <NavBar onNav={onNav} />
      <div className="ddv-back-bar"><button className="ddv-back" onClick={() => onNav('live')}>← Back to live games</button></div>
      <div className="body"><div className="empty-card">Could not load game data.</div></div>
    </div>
  )

  // ── Main render ─────────────────────────────────────────────
  return (
    <div className="page">
      <NavBar onNav={onNav} />

      <div className="ddv-back-bar">
        <button className="ddv-back" onClick={() => onNav('live')}>← Back to live games</button>
      </div>

      <div className="body">
        <LiveDeepDiveCard game={cardGame} />

        {isUpcoming ? (
          <div className="empty-card" style={{ minHeight: 120 }}>
            Game starts at {formatMT(g.start_time_utc)}
          </div>
        ) : (
          <>
            <div className="ddv-cols">

              {/* LEFT — Ice Tilt */}
              <div className="ddv-col">
                <div className="section-label">Ice tilt</div>

                <div className="card">
                  <div className="ddv-tilt-teams">
                    <span className="ddv-tilt-side blue">{homeAbbr} <strong>{homeTiltPct}%</strong></span>
                    <span className="ddv-tilt-mid">net tilt {netTiltLabel} ({tiltAdvAbbr})</span>
                    <span className="ddv-tilt-side muted"><strong>{awayTiltPct}%</strong> {awayAbbr}</span>
                  </div>
                  <svg width="100%" height="90" viewBox="0 0 320 90" style={{ display: 'block', margin: '14px 0 6px' }}>
                    <polygon points="160,74 150,86 170,86" fill="#D1D5DB"/>
                    <rect x="132" y="83" width="56" height="5" rx="2.5" fill="#D1D5DB"/>
                    <g transform={`rotate(${tiltAngle} 160 68)`}>
                      <rect x="16" y="62" width="288" height="10" rx="5" fill="#F3F4F6"/>
                      <rect x="16" y="62" width={beamFill} height="10" rx="5" fill="#2563EB"/>
                    </g>
                  </svg>
                </div>

                <div className="ddv-events-bar">
                  <button className="ddv-events-toggle" onClick={() => setEventsOpen(o => !o)}>
                    {eventsOpen ? 'Hide events ↑' : 'View events →'}
                  </button>
                </div>
                {eventsOpen && (
                  <div className="ddv-events-wrap">
                    <table className="ddv-events-table">
                      <thead>
                        <tr>
                          <th>Event</th>
                          <th>Team</th>
                          <th>Age</th>
                          <th>Base</th>
                          <th>Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data.tilt?.history ?? []).slice().reverse().map((h, i) => {
                          const isHome = h.team === homeAbbr
                          return (
                            <tr key={i} className={isHome ? 'ev-home' : 'ev-away'}>
                              <td>{h.event_type ?? h.event ?? '—'}</td>
                              <td>{h.team ?? '—'}</td>
                              <td>{formatAge(h.age)}</td>
                              <td>{h.base_weight != null ? +h.base_weight.toFixed(2) : '—'}</td>
                              <td>{h.weight != null ? +h.weight.toFixed(2) : h.decayed_weight != null ? +h.decayed_weight.toFixed(2) : '—'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="ddv-metrics">
                  <div className="ddv-metric">
                    <div className="ddv-m-lbl">Net tilt</div>
                    <div className={`ddv-m-val ${net !== 0 ? 'blue' : ''}`}>{netTiltLabel}</div>
                    <div className="ddv-m-sub">{tiltAdvAbbr} adv.</div>
                  </div>
                  <div className="ddv-metric">
                    <div className="ddv-m-lbl">{homeAbbr} weighted</div>
                    <div className="ddv-m-val">{homeWeighted}</div>
                    <div className="ddv-m-sub">score</div>
                  </div>
                  <div className="ddv-metric">
                    <div className="ddv-m-lbl">{awayAbbr} weighted</div>
                    <div className="ddv-m-val">{awayWeighted}</div>
                    <div className="ddv-m-sub">score</div>
                  </div>
                </div>

                <div className="card ddv-chart-card">
                  <div className="ddv-chart-lbl">Rolling tilt · last 10 min</div>
                  <div style={{ height: 130 }}><canvas ref={tiltRef}></canvas></div>
                  <div className="tilt-legend">
                    <span className="tilt-legend-item"><span className="tilt-legend-sq blue"></span>{homeAbbr}</span>
                    <span className="tilt-legend-item"><span className="tilt-legend-sq red"></span>{awayAbbr}</span>
                    <span className="tilt-legend-note">Positive = home team momentum</span>
                  </div>
                </div>
              </div>

              {/* RIGHT — Goalie Pull Risk (mock until endpoint exists) */}
              <div className="ddv-col">
                <div className="section-label">Goalie pull risk · {awayAbbr}</div>

                <div className="card">
                  <div className="ddv-circ-row">
                    <svg width="128" height="128" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
                      <circle cx="60" cy="60" r={circR} fill="none" stroke="#FEE2E2" strokeWidth="10"/>
                      <circle cx="60" cy="60" r={circR} fill="none" stroke="#DC2626" strokeWidth="10"
                        strokeDasharray={`${circC} ${circC}`} strokeDashoffset={circOff}
                        transform="rotate(-90 60 60)" strokeLinecap="round"/>
                      <text x="60" y="54" textAnchor="middle" dominantBaseline="middle" fontSize="22" fontWeight="500" fill="#0D1117">{pullRisk}%</text>
                      <text x="60" y="73" textAnchor="middle" fontSize="9" fill="#9CA3AF" letterSpacing="0.06em">PULL RISK</text>
                    </svg>
                    <div className="ddv-circ-info">
                      <div className="ddv-pull-label" style={{ color: '#DC2626' }}>Very likely</div>
                      <div className="ddv-pull-ctx">
                        {awayAbbr} coaches pull with &gt;4 min left in 62% of similar situations — above league average.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ddv-metrics">
                  <div className="ddv-metric">
                    <div className="ddv-m-lbl">Pulled here</div>
                    <div className="ddv-m-val red">21/34</div>
                    <div className="ddv-m-sub">situations</div>
                  </div>
                  <div className="ddv-metric">
                    <div className="ddv-m-lbl">Avg pull</div>
                    <div className="ddv-m-val">4:08</div>
                    <div className="ddv-m-sub">remaining</div>
                  </div>
                  <div className="ddv-metric">
                    <div className="ddv-m-lbl">EN goal %</div>
                    <div className="ddv-m-val">18%</div>
                    <div className="ddv-m-sub">against</div>
                  </div>
                </div>

                <div className="card ddv-chart-card">
                  <div className="ddv-chart-lbl">P(not yet pulled) — {awayAbbr} vs league avg</div>
                  <div style={{ height: 148 }}><canvas ref={kmRef}></canvas></div>
                </div>
              </div>

            </div>

            {/* Stats strip */}
            <div className="ddv-strip">
              <div className="ddv-strip-team">{homeAbbr}</div>
              <div className="ddv-strip-stat">
                <div className="ddv-s-lbl">SOG</div>
                <div className="ddv-s-val" style={{ color: '#9CA3AF' }}>—</div>
              </div>
              <div className="ddv-strip-div"></div>
              <div className="ddv-strip-stat">
                <div className="ddv-s-lbl">Corsi%</div>
                <div className="ddv-s-val" style={{ color: '#9CA3AF' }}>—</div>
              </div>
              <div className="ddv-strip-div"></div>
              <div className="ddv-strip-stat">
                <div className="ddv-s-lbl">PP record</div>
                <div className="ddv-s-val" style={{ color: '#9CA3AF' }}>—</div>
              </div>
              <div className="ddv-strip-div"></div>
              <div className="ddv-strip-stat">
                <div className="ddv-s-lbl">Win prob</div>
                <div className="ddv-s-val">
                  {homeWinPct !== null
                    ? <><span className="ddv-s-blue">{homeAbbr} {homeWinPct}%</span> – {awayAbbr} {awayWinPct}%</>
                    : <span style={{ color: '#9CA3AF' }}>—</span>}
                </div>
              </div>
              <div className="ddv-strip-team" style={{ textAlign: 'right' }}>{awayAbbr}</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
