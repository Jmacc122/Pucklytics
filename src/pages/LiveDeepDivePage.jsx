import { useRef, useEffect } from 'react'
import Chart from 'chart.js/auto'
import LiveDeepDiveCard from '../components/LiveDeepDiveCard'

const game = {
  home: 'Calgary', homeAbbr: 'CGY', homeScore: 3,
  away: 'Edmonton', awayAbbr: 'EDM', awayScore: 2,
  period: '3rd', time: '4:22', venue: 'Rogers Place, Edmonton',
  pp: 'CGY', en: true,
  pullRisk: 82, pullRiskTeam: 'EDM',
  winProbHome: 71, winProbAway: 29,
  homeSog: 28, awaySog: 22,
  homeCorsi: 58, awayCorsi: 42,
  homePP: '2/3', awayPP: '0/2',
  homeTilt: 68, awayTilt: 32, tiltPct: 44,
  netTilt: '+44%', homeWeighted: 68, awayWeighted: 32,
}

const tiltLabels = ['14:22','13:22','12:22','11:22','10:22','9:22','8:22','7:22','6:22','5:22','4:22']
const tiltData   = [18, 22, 16, 28, 32, 30, 40, 44, 42, 46, 44]

const kmLabels = ['20','19','18','17','16','15','14','13','12','11','10','9','8','7','6','5','4','3','2','1','0']
const kmEdm    = [1.00,1.00,1.00,1.00,1.00,0.99,0.99,0.98,0.97,0.95,0.92,0.86,0.74,0.58,0.40,0.24,0.14,0.08,0.04,0.02,0.01]
const kmAvg    = [1.00,1.00,1.00,1.00,1.00,1.00,0.99,0.99,0.98,0.97,0.95,0.92,0.87,0.79,0.68,0.55,0.40,0.26,0.14,0.06,0.02]

const vertLinePlugin = {
  id: 'vertLine',
  afterDraw(chart) {
    const idx = chart.data.labels.indexOf('4')
    if (idx < 0) return
    const meta = chart.getDatasetMeta(0)
    if (!meta.data[idx]) return
    const x = meta.data[idx].x
    const { top, bottom, ctx } = { ...chart.chartArea, ctx: chart.ctx }
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

export default function LiveDeepDivePage({ onNav }) {
  const tiltRef = useRef(null)
  const tiltInst = useRef(null)
  const kmRef = useRef(null)
  const kmInst = useRef(null)

  useEffect(() => {
    if (tiltRef.current) {
      tiltInst.current = new Chart(tiltRef.current, {
        type: 'line',
        data: {
          labels: tiltLabels,
          datasets: [{
            data: tiltData,
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37,99,235,0.07)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 }, color: '#9CA3AF', maxRotation: 30 }
            },
            y: {
              min: 0, max: 60,
              grid: { color: '#F3F4F6' },
              ticks: { font: { size: 10 }, color: '#9CA3AF', callback: v => v + '%' }
            }
          }
        }
      })
    }

    if (kmRef.current) {
      kmInst.current = new Chart(kmRef.current, {
        type: 'line',
        plugins: [vertLinePlugin],
        data: {
          labels: kmLabels,
          datasets: [
            {
              label: 'EDM',
              data: kmEdm,
              borderColor: '#DC2626',
              backgroundColor: 'transparent',
              borderWidth: 2.5,
              pointRadius: 0,
              tension: 0.3,
              fill: false,
            },
            {
              label: 'League avg',
              data: kmAvg,
              borderColor: '#9CA3AF',
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              borderDash: [5, 4],
              pointRadius: 0,
              tension: 0.3,
              fill: false,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: { font: { size: 10 }, color: '#9CA3AF', usePointStyle: true, pointStyleWidth: 18, boxHeight: 2 }
            },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 }, color: '#9CA3AF' },
              title: { display: true, text: 'Time remaining (min)', font: { size: 10 }, color: '#9CA3AF', padding: { top: 4 } }
            },
            y: {
              min: 0, max: 1,
              grid: { color: '#F3F4F6' },
              ticks: { font: { size: 10 }, color: '#9CA3AF', callback: v => Math.round(v * 100) + '%' },
              title: { display: true, text: 'P(not yet pulled)', font: { size: 10 }, color: '#9CA3AF' }
            }
          }
        }
      })
    }

    return () => {
      tiltInst.current?.destroy()
      kmInst.current?.destroy()
    }
  }, [])

  const circR = 48
  const circC = +(2 * Math.PI * circR).toFixed(1)
  const circOff = +(circC * (1 - game.pullRisk / 100)).toFixed(1)

  const pullLabel = game.pullRisk >= 70 ? 'Very likely' : game.pullRisk >= 40 ? 'Likely' : 'Low'
  const pullColor = game.pullRisk >= 70 ? '#DC2626' : game.pullRisk >= 40 ? '#D97706' : '#16A34A'

  const beamFill = Math.round(288 * game.homeTilt / 100)

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
        <div className="live-pill"><div className="live-dot"></div>1 live now</div>
      </nav>

      <div className="ddv-back-bar">
        <button className="ddv-back" onClick={() => onNav('live')}>← Back to live games</button>
      </div>

      <div className="body">
        <LiveDeepDiveCard game={game} />

        <div className="ddv-cols">

          {/* LEFT: Ice Tilt */}
          <div className="ddv-col">
            <div className="section-label">Ice tilt</div>

            <div className="card">
              <div className="ddv-tilt-teams">
                <span className="ddv-tilt-side blue">{game.homeAbbr} <strong>{game.homeTilt}%</strong></span>
                <span className="ddv-tilt-mid">net tilt +{game.tiltPct}% ({game.homeAbbr})</span>
                <span className="ddv-tilt-side muted"><strong>{game.awayTilt}%</strong> {game.awayAbbr}</span>
              </div>
              <svg width="100%" height="90" viewBox="0 0 320 90" style={{ display: 'block', margin: '14px 0 6px' }}>
                <polygon points="160,74 150,86 170,86" fill="#D1D5DB"/>
                <rect x="132" y="83" width="56" height="5" rx="2.5" fill="#D1D5DB"/>
                <g transform="rotate(-10 160 68)">
                  <rect x="16" y="62" width="288" height="10" rx="5" fill="#F3F4F6"/>
                  <rect x="16" y="62" width={beamFill} height="10" rx="5" fill="#2563EB"/>
                </g>
              </svg>
            </div>

            <div className="ddv-metrics">
              <div className="ddv-metric">
                <div className="ddv-m-lbl">Net tilt</div>
                <div className="ddv-m-val blue">{game.netTilt}</div>
                <div className="ddv-m-sub">CGY adv.</div>
              </div>
              <div className="ddv-metric">
                <div className="ddv-m-lbl">CGY weighted</div>
                <div className="ddv-m-val">{game.homeWeighted}</div>
                <div className="ddv-m-sub">score</div>
              </div>
              <div className="ddv-metric">
                <div className="ddv-m-lbl">EDM weighted</div>
                <div className="ddv-m-val">{game.awayWeighted}</div>
                <div className="ddv-m-sub">score</div>
              </div>
            </div>

            <div className="card ddv-chart-card">
              <div className="ddv-chart-lbl">Rolling tilt · last 10 min</div>
              <div style={{ height: 130 }}>
                <canvas ref={tiltRef}></canvas>
              </div>
            </div>
          </div>

          {/* RIGHT: Goalie Pull Risk */}
          <div className="ddv-col">
            <div className="section-label">Goalie pull risk · {game.pullRiskTeam}</div>

            <div className="card">
              <div className="ddv-circ-row">
                <svg width="128" height="128" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
                  <circle cx="60" cy="60" r={circR} fill="none" stroke="#FEE2E2" strokeWidth="10"/>
                  <circle
                    cx="60" cy="60" r={circR}
                    fill="none" stroke="#DC2626" strokeWidth="10"
                    strokeDasharray={`${circC} ${circC}`}
                    strokeDashoffset={circOff}
                    transform="rotate(-90 60 60)"
                    strokeLinecap="round"
                  />
                  <text x="60" y="54" textAnchor="middle" dominantBaseline="middle" fontSize="22" fontWeight="500" fill="#0D1117">{game.pullRisk}%</text>
                  <text x="60" y="73" textAnchor="middle" fontSize="9" fill="#9CA3AF" letterSpacing="0.06em">PULL RISK</text>
                </svg>
                <div className="ddv-circ-info">
                  <div className="ddv-pull-label" style={{ color: pullColor }}>{pullLabel}</div>
                  <div className="ddv-pull-ctx">
                    EDM coaches pull with &gt;4 min left in 62% of similar situations — above league average.
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
              <div className="ddv-chart-lbl">P(not yet pulled) — EDM vs league avg</div>
              <div style={{ height: 148 }}>
                <canvas ref={kmRef}></canvas>
              </div>
            </div>
          </div>

        </div>

        {/* Stats strip */}
        <div className="ddv-strip">
          <div className="ddv-strip-team">{game.homeAbbr}</div>
          <div className="ddv-strip-stat">
            <div className="ddv-s-lbl">SOG</div>
            <div className="ddv-s-val"><span className="ddv-s-blue">{game.homeSog}</span> – {game.awaySog}</div>
          </div>
          <div className="ddv-strip-div"></div>
          <div className="ddv-strip-stat">
            <div className="ddv-s-lbl">Corsi%</div>
            <div className="ddv-s-val"><span className="ddv-s-blue">{game.homeCorsi}%</span> – {game.awayCorsi}%</div>
          </div>
          <div className="ddv-strip-div"></div>
          <div className="ddv-strip-stat">
            <div className="ddv-s-lbl">PP record</div>
            <div className="ddv-s-val"><span className="ddv-s-blue">{game.homePP}</span> – {game.awayPP}</div>
          </div>
          <div className="ddv-strip-div"></div>
          <div className="ddv-strip-stat">
            <div className="ddv-s-lbl">Win prob</div>
            <div className="ddv-s-val"><span className="ddv-s-blue">CGY {game.winProbHome}%</span> – EDM {game.winProbAway}%</div>
          </div>
          <div className="ddv-strip-team" style={{ textAlign: 'right' }}>{game.awayAbbr}</div>
        </div>

      </div>
    </div>
  )
}
