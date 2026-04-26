export default function LiveDeepDiveCard({ game }) {
  const homeLeading = game.homeScore > game.awayScore

  return (
    <div className="ddv-header">
      <div className="ddv-hdr-left">
        <div className="ddv-matchup">
          <div className="ddv-team">
            <span className="ddv-tname">{game.home}</span>
            <span className={`ddv-score ${homeLeading ? 'blue' : ''}`}>{game.homeScore}</span>
          </div>
          <span className="ddv-vs">vs</span>
          <div className="ddv-team">
            <span className={`ddv-score ${!homeLeading ? 'blue' : 'dim'}`}>{game.awayScore}</span>
            <span className="ddv-tname">{game.away}</span>
          </div>
        </div>
        <div className="ddv-venue">{game.venue}</div>
      </div>
      <div className="ddv-hdr-right">
        {game.status === 'final' ? (
          <span className="badge bf">Final</span>
        ) : (
          <span className="badge br">● {game.period} · {game.time}</span>
        )}
        {game.pp && <span className="badge by">PP {game.pp}</span>}
        {game.en && <span className="en-tag">● EN</span>}
      </div>
    </div>
  )
}
