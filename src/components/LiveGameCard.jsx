export default function LiveGameCard({ game, onClick }) {
  const tiltStartX = game.tiltSide === 'home' ? 70 : 70 - game.tiltStrength
  const tiltFillColor = game.tiltColor === 'red' ? '#DC2626' : '#2563EB'

  return (
    <div className="lcard live" onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
      <div className="lc-top">
        <span className="badge br">● {game.period} · {game.time}</span>
        <div className="lc-badges">
          {game.pp && <span className="badge by">PP {game.pp}</span>}
          {game.en && <span className="en-tag">● EN</span>}
          {!game.pp && !game.en && <span className="badge bf">Even</span>}
        </div>
      </div>

      <div className="lc-team">
        <div>
          <div className="lc-tname">{game.home}</div>
          <div className="lc-tsog">
            <strong>{game.homeSog}</strong> SOG
            {game.homePulled && <span style={{ color: '#DC2626' }}> · pulled</span>}
          </div>
        </div>
        <div className={`lc-tscore ${game.homeHighlight ? 'blue' : ''}`}>{game.homeScore}</div>
      </div>

      <div className="lc-divider"></div>

      <div className="lc-team">
        <div>
          <div className="lc-tname">{game.away}</div>
          <div className="lc-tsog">
            <strong>{game.awaySog}</strong> SOG
            {game.awayPulled && <span style={{ color: '#DC2626' }}> · pulled</span>}
          </div>
        </div>
        <div className={`lc-tscore ${game.awayHighlight ? 'blue' : 'dim'}`}>{game.awayScore}</div>
      </div>

      <div className="lc-foot">
        <div>
          <div className="lc-lbl">
            {game.pullRiskTeam ? `Pull risk · ${game.pullRiskTeam}` : 'Pull risk'}
          </div>
          {game.pullRisk === null ? (
            <>
              <div className="lc-val" style={{ color: '#9CA3AF' }}>—</div>
              <div className="pull-meter"></div>
            </>
          ) : game.pullRiskLevel === 'low' ? (
            <>
              <div className="lc-val green">Low</div>
              <div className="pull-meter">
                <div className="pull-fill" style={{ width: '10%', background: '#16A34A' }}></div>
              </div>
            </>
          ) : (
            <>
              <div className="lc-val red">{game.pullRisk}%</div>
              <div className="pull-meter">
                <div className="pull-fill" style={{ width: `${game.pullRisk}%`, background: '#DC2626' }}></div>
              </div>
            </>
          )}
        </div>

        <div>
          <div className="lc-lbl">Ice tilt</div>
          <div className="tilt-container">
            <span className="tilt-label" style={game.tiltColor === 'blue' && game.tiltSide === 'home' ? { color: '#2563EB' } : {}}>
              {game.home.split(' ')[0].slice(0, 3).toUpperCase()}
            </span>
            <div className="tilt-svg-wrap">
              <svg width="100%" height="22" viewBox="0 0 140 22" preserveAspectRatio="none">
                <line x1="70" y1="2" x2="70" y2="20" stroke="#9CA3AF" strokeWidth="0.5" strokeDasharray="2 2"/>
                <g transform={`rotate(${game.tiltAngle} 70 11)`}>
                  <rect x="10" y="9" width="120" height="4" rx="2" fill="#F3F4F6"/>
                  <rect x={tiltStartX} y="9" width={game.tiltStrength} height="4" rx="2" fill={tiltFillColor}/>
                </g>
              </svg>
            </div>
            <span className="tilt-label r" style={game.tiltColor === 'red' && game.tiltSide === 'away' ? { color: '#DC2626' } : {}}>
              {game.away.split(' ')[0].slice(0, 3).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}