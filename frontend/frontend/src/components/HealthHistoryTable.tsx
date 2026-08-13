import { historyRows } from '../data/health-data'
import { MiniChart } from './MiniChart'

export function HealthHistoryTable() {
  return (
    <>
      <div className="data-table history-table">
        <div className="table-row table-head">
          <span>Date</span>
          <span>HR</span>
          <span>SpO2</span>
          <span>Temp</span>
          <span>BP</span>
          <span>Resp. Rate</span>
        </div>
        {historyRows.map((row) => (
          <div className="table-row" key={row.date}>
            <span>{row.date}</span>
            <span>{row.hr}</span>
            <span>{row.spo2}</span>
            <span>{row.temp}</span>
            <span>{row.bp}</span>
            <span>{row.rr}</span>
          </div>
        ))}
      </div>

      <div className="chart-grid history-charts">
        <MiniChart title="Heart rate over time" values={[75, 82, 78, 80]} />
        <MiniChart title="Temperature over time" values={[36.6, 36.7, 36.8, 36.7]} />
        <MiniChart title="Blood pressure trend" values={[121, 118, 120, 119]} />
      </div>
    </>
  )
}
