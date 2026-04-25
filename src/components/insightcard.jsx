export default function InsightCard({ insight }) {
  return (
    <div className="icard">
      <div className="iicon">{insight.icon}</div>
      <div className="in">{insight.title}</div>
      <div className="is">{insight.desc}</div>
      <div className="ia">Explore →</div>
    </div>
  )
}