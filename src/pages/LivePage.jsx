import LiveGameCard from '../components/LiveGameCard'

const liveGames = [
  {
    home: 'Calgary', homeSog: 28, homeScore: 3, homePulled: false,
    away: 'Edmonton', awaySog: 22, awayScore: 2, awayPulled: true,
    period: '3rd', time: '4:22', timeRemaining: 262,
    pp: 'CGY', en: true,
    pullRisk: 82, pullRiskTeam: 'EDM',
    tiltAngle: -9, tiltSide: 'home', tiltStrength: 40, tiltColor: 'blue',
    homeHighlight: true
  },
  {
    home: 'Dallas', homeSog: 9, homeScore: 1, homePulled: false,
    away: 'Colorado', awaySog: 7, awayScore: 1, awayPulled: false,
    period: '1st', time: '8:14', timeRemaining: 3494,
    pp: 'DAL', en: false,
    pullRisk: null,
    tiltAngle: -5, tiltSide: 'home', tiltStrength: 25, tiltColor: 'blue',
    homeHighlight: true
  },
  {
    home: 'Boston', homeSog: 16, homeScore: 1, homePulled: false,
    away: 'Tampa Bay', awaySog: 19, awayScore: 1, awayPulled: false,
    period: '2nd', time: '11:04', timeRemaining: 1864,
    pp: null, en: false,
    pullRisk: 10, pullRiskLevel: 'low',
    tiltAngle: 4, tiltSide: 'away', tiltStrength: 20, tiltColor: 'red',
    awayHighlight: true
  }
]

const upcomingGames = [
  { home: 'Vancouver', away: 'Vegas', time: '9:00 PM MT', model: 'VAN 54%', edge: '+5%' },
  { home: 'Seattle', away: 'San Jose', time: '9:30 PM MT', model: 'SEA 61%', edge: null }
]

const finalGames = [
  { home: 'Toronto', homeSog: 34, homeScore: 4, away: 'Montreal', awaySog: 29, awayScore: 2, totalShots: 63, enGoals: 1 }
]

const dates = [
  { day: 'Wed', num: 'Apr 22' },
  { day: 'Thu', num: 'Apr 23' },
  { day: 'Today', num: 'Apr 24', active: true },
  { day: 'Sat', num: 'Apr 26' },
  { day: 'Sun', num: 'Apr 27' },
  { day: 'Mon', num: 'Apr 28' }
]

export default function LivePage({ onNav }) {
  const sortedLive = [...liveGames].sort((a, b) => a.timeRemaining - b.timeRemaining)

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
        <div className="live-pill"><div className="live-dot"></div>{sortedLive.length} live now</div>
      </nav>

      <div className="hero">
        <div className="hero-title">puck<span>lytics</span> <span className="hero-suffix-live">live</span></div>
      </div>

      <div className="body">

        <div className="date-bar">
          <button className="date-arrow">←</button>
          {dates.map((d, i) => (
            <div key={i} className={`date-pill ${d.active ? 'on' : ''}`}>
              <div className="dp-day">{d.day}</div>
              <div className="dp-num">{d.num}</div>
            </div>
          ))}
          <button className="date-arrow">→</button>
        </div>

        <div>
          <div className="section-label">Live now · sorted by time remaining</div>
          <div className="row3">
            {sortedLive.map((g, i) => <LiveGameCard key={i} game={g} onClick={() => onNav('livedeep')} />)}
          </div>
        </div>

        <div>
          <div className="section-label">Upcoming</div>
          <div className="row3">
            {upcomingGames.map((g, i) => (
              <div key={i} className="lcard">
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
                    <div className="lc-val">{g.model}</div>
                  </div>
                  <div>
                    <div className="lc-lbl">Edge</div>
                    <div className={`lc-val ${g.edge ? 'green' : ''}`} style={!g.edge ? { color: '#9CA3AF' } : {}}>
                      {g.edge || '—'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="empty-card">No more games scheduled today</div>
          </div>
        </div>

        <div>
          <div className="section-label">Final</div>
          <div className="row3">
            {finalGames.map((g, i) => (
              <div key={i} className="lcard">
                <div className="lc-top">
                  <span className="badge bf">Final</span>
                </div>
                <div className="lc-team">
                  <div>
                    <div className="lc-tname">{g.home}</div>
                    <div className="lc-tsog"><strong>{g.homeSog}</strong> SOG</div>
                  </div>
                  <div className="lc-tscore">{g.homeScore}</div>
                </div>
                <div className="lc-divider"></div>
                <div className="lc-team">
                  <div>
                    <div className="lc-tname">{g.away}</div>
                    <div className="lc-tsog"><strong>{g.awaySog}</strong> SOG</div>
                  </div>
                  <div className="lc-tscore dim">{g.awayScore}</div>
                </div>
                <div className="lc-foot">
                  <div>
                    <div className="lc-lbl">Total shots</div>
                    <div className="lc-val">{g.totalShots}</div>
                  </div>
                  <div>
                    <div className="lc-lbl">EN goals</div>
                    <div className="lc-val">{g.enGoals}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}