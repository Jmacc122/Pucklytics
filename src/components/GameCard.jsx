export default function GameCard({ game }) {
  return (
    <div className={`card ${game.featured ? 'hl' : ''}`}>
      <div className="gtop">
        {game.status === 'live' ? (
          <span className="badge br">● {game.period} · {game.time}</span>
        ) : game.status === 'final' ? (
          <span className="badge bf">Final</span>
        ) : (
          <span className="badge bl">{game.time}</span>
        )}
        {game.strength && <span className="badge bf">{game.strength}</span>}
      </div>

      <div className="gteam">
        <div>
          <div className="gname">{game.home}</div>
          <div className="gsub">{game.homeGoalie}</div>
        </div>
        <div className={`gscore ${game.homeScore === null ? 'dim' : game.featured ? 'blue' : ''}`}>
          {game.homeScore !== null ? game.homeScore : '—'}
        </div>
      </div>

      <div className="gdiv"></div>

      <div className="gteam">
        <div>
          <div className="gname">{game.away}</div>
          <div className="gsub">{game.awayGoalie}</div>
        </div>
        <div className={`gscore ${game.awayScore === null ? 'dim' : ''}`}>
          {game.awayScore !== null ? game.awayScore : '—'}
        </div>
      </div>

      <div className="gfoot">
        {game.status === 'final' ? (
          <>
            <div>
              <div className="gfl">Total shots</div>
              <div className="gfv">{game.totalShots ?? '—'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="gfl">EN goals</div>
              <div className="gfv">{game.enGoals ?? '—'}</div>
            </div>
          </>
        ) : (
          <>
            <div>
              <div className="gfl">Pull risk</div>
              <div className={`gfv ${game.pullRiskLevel || ''}`}>
                {game.pullRisk || '—'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="gfl">{game.edge ? 'Edge' : 'Win prob'}</div>
              <div className={`gfv ${game.edge ? 'green' : game.featured ? 'blue' : ''}`}>
                {game.edge || game.winProb || '—'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
