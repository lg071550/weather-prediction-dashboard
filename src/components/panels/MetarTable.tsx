import type { MetarReport, FeedStatus } from '../../types/weather';
import { ageMinutes } from '../../lib/time';
import { Panel } from '../common/Panel';

interface MetarTableProps {
  metars: MetarReport[];
  feedStatus: FeedStatus;
}

function ageColor(minutes: number): string {
  if (minutes < 0) return 'text-surface-500';
  if (minutes <= 30) return 'text-success';
  if (minutes <= 60) return 'text-warning';
  return 'text-danger';
}

export function MetarTable({ metars, feedStatus }: MetarTableProps) {
  return (
    <Panel title="METAR Reports" feedStatus={feedStatus} feedName="METAR">
      {metars.length === 0 ? (
        <p className="text-surface-500 text-sm italic">No METAR data available</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700/50">
                <th className="text-left py-2 pr-3 text-surface-400 font-medium">Station</th>
                <th className="text-center py-2 px-2 text-surface-400 font-medium">Temp</th>
                <th className="text-center py-2 px-2 text-surface-400 font-medium">Dew</th>
                <th className="text-center py-2 px-2 text-surface-400 font-medium">Wind</th>
                <th className="text-center py-2 px-2 text-surface-400 font-medium">Vis</th>
                <th className="text-right py-2 pl-3 text-surface-400 font-medium">Age</th>
              </tr>
            </thead>
            <tbody>
              {metars.map((m) => {
                const liveAgeMinutes = ageMinutes(m.observationTime);
                const displayAgeMinutes =
                  liveAgeMinutes !== -1 ? liveAgeMinutes : m.ageMinutes;

                return (
                  <tr
                    key={m.stationId}
                    className="border-b border-surface-700/30 hover:bg-surface-700/20 transition-colors"
                  >
                    <td className="py-2 pr-3 font-mono font-semibold text-surface-200">
                      {m.stationId}
                    </td>
                    <td className="text-center py-2 px-2 text-orange-400">
                      {m.tempC != null ? `${m.tempC}°C` : '—'}
                    </td>
                    <td className="text-center py-2 px-2 text-sky-400">
                      {m.dewpointC != null ? `${m.dewpointC}°C` : '—'}
                    </td>
                    <td className="text-center py-2 px-2 text-surface-300 whitespace-nowrap">
                      {m.windSpeedKt != null ? `${m.windSpeedKt}kt` : '—'}
                    </td>
                    <td className="text-center py-2 px-2 text-surface-300">
                      {m.visibility ?? '—'}
                    </td>
                    <td className={`text-right py-2 pl-3 font-mono text-xs ${ageColor(displayAgeMinutes)}`}>
                      {displayAgeMinutes >= 0 ? `${displayAgeMinutes}m` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
