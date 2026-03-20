import type { PrimaryStationSummary, FeedStatus } from '../../types/weather';
import { Panel } from '../common/Panel';

interface PrimaryStationCardProps {
  summary: PrimaryStationSummary;
  feedStatus: FeedStatus;
}

function signalBadge(signal: PrimaryStationSummary['signal']) {
  switch (signal) {
    case 'Warmer than expected':
      return (
        <span className="glow-danger inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-danger/15 text-danger border border-danger/30">
          ▲ Warmer
        </span>
      );
    case 'As expected':
      return (
        <span className="glow-neutral inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-surface-600/30 text-surface-300 border border-surface-600/50">
          ● Expected
        </span>
      );
    case 'Cooler than expected':
      return (
        <span className="glow-success inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-success/15 text-success border border-success/30">
          ▼ Cooler
        </span>
      );
    default:
      return <span className="text-surface-500 text-xs">—</span>;
  }
}

export function PrimaryStationCard({ summary, feedStatus }: PrimaryStationCardProps) {
  const report = summary.latestReport;

  return (
    <Panel title={`Primary Station · ${summary.stationId}`} feedStatus={feedStatus} feedName="METAR">
      <div className="grid grid-cols-2 gap-4">
        {/* Latest temp */}
        <div className="space-y-1">
          <p className="text-xs text-surface-500 uppercase tracking-wider">Current Temp</p>
          <p className="text-3xl font-bold text-orange-400">
            {report?.tempC != null ? `${report.tempC}°C` : '—'}
          </p>
        </div>

        {/* Observed high */}
        <div className="space-y-1">
          <p className="text-xs text-surface-500 uppercase tracking-wider">Observed High</p>
          <p className="text-3xl font-bold text-amber-400">
            {summary.observedHighC != null ? `${summary.observedHighC}°C` : '—'}
          </p>
        </div>

        {/* Ensemble tmax */}
        <div className="space-y-1">
          <p className="text-xs text-surface-500 uppercase tracking-wider">Ensemble Tmax</p>
          <p className="text-2xl font-semibold text-surface-200">
            {summary.todayWeightedTmax != null
              ? `${summary.todayWeightedTmax.toFixed(1)}°C`
              : '—'}
          </p>
        </div>

        {/* Signal */}
        <div className="space-y-1">
          <p className="text-xs text-surface-500 uppercase tracking-wider">Signal</p>
          <div className="pt-1">{signalBadge(summary.signal)}</div>
        </div>
      </div>
    </Panel>
  );
}
