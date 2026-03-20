import type { EnsembleForecast, FeedStatus } from '../../types/weather';
import { Panel } from '../common/Panel';
import { formatDateShort } from '../../lib/time';

interface EnsemblePanelProps {
  ensemble: EnsembleForecast[];
  feedStatus: FeedStatus;
}

export function EnsemblePanel({ ensemble, feedStatus }: EnsemblePanelProps) {
  return (
    <Panel title="Ensemble Consensus" feedStatus={feedStatus} feedName="NWP">
      {ensemble.length === 0 ? (
        <p className="text-surface-500 text-sm italic">Waiting for model data…</p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-surface-400">
            Δ = change in weighted Tmax versus the previous forecast day.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-700/50">
                  <th className="text-left py-2 pr-3 text-surface-400 font-medium">Date</th>
                  <th className="text-center py-2 px-2 text-surface-400 font-medium">Wt Tmax</th>
                  <th className="text-center py-2 px-2 text-surface-400 font-medium">Spread</th>
                  <th className="text-center py-2 px-2 text-surface-400 font-medium">σ×2.5</th>
                  <th className="text-center py-2 px-2 text-surface-400 font-medium">Δ</th>
                </tr>
              </thead>
              <tbody>
                {ensemble.map((e) => (
                  <tr
                    key={e.date}
                    className="border-b border-surface-700/30 hover:bg-surface-700/20 transition-colors"
                  >
                    <td className="py-2 pr-3 font-medium text-surface-200 whitespace-nowrap">
                      {formatDateShort(e.date)}
                    </td>
                    <td className="text-center py-2 px-2">
                      <span className="text-orange-400 font-semibold">
                        {e.weightedTmax != null ? `${e.weightedTmax.toFixed(1)}°` : '—'}
                      </span>
                    </td>
                    <td className="text-center py-2 px-2">
                      <span className={e.spread >= 2 ? 'text-warning' : 'text-surface-300'}>
                        {e.spread.toFixed(1)}°
                      </span>
                    </td>
                    <td className="text-center py-2 px-2 text-surface-300">
                      {e.sigma.toFixed(2)}
                    </td>
                    <td className="text-center py-2 px-2">
                      {e.deltaFromPrevious != null ? (
                        <span
                          className={`font-medium ${
                            Math.abs(e.deltaFromPrevious) < 0.1
                              ? 'text-surface-500'
                              : e.deltaFromPrevious > 0
                                ? 'text-warning'
                                : 'text-info'
                          }`}
                        >
                          {e.deltaFromPrevious > 0 ? '+' : ''}
                          {e.deltaFromPrevious.toFixed(1)}°
                        </span>
                      ) : (
                        <span className="text-surface-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Panel>
  );
}
