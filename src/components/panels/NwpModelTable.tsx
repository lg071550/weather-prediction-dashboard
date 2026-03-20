import type { NwpModelForecast } from '../../types/weather';
import type { FeedStatus } from '../../types/weather';
import { Panel } from '../common/Panel';
import { formatDateShort } from '../../lib/time';

interface NwpModelTableProps {
  models: NwpModelForecast[];
  feedStatus: FeedStatus;
}

export function NwpModelTable({ models, feedStatus }: NwpModelTableProps) {
  // Collect all unique dates across models
  const allDates = Array.from(
    new Set(models.flatMap((m) => m.dailyForecasts.map((d) => d.date)))
  ).sort();

  return (
    <Panel title="NWP Model Forecasts" feedStatus={feedStatus} feedName="NWP">
      {models.length === 0 ? (
        <p className="text-surface-500 text-sm italic">No model data available</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-700/50">
                <th className="text-left py-2 pr-4 text-surface-400 font-medium">Model</th>
                {allDates.map((d) => (
                  <th key={d} className="text-center py-2 px-2 text-surface-400 font-medium whitespace-nowrap">
                    {formatDateShort(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.modelSlug} className="border-b border-surface-700/30 hover:bg-surface-700/20 transition-colors">
                  <td className="py-2 pr-4 font-medium text-surface-200 whitespace-nowrap">
                    {model.modelDisplayName}
                  </td>
                  {allDates.map((date) => {
                    const day = model.dailyForecasts.find(
                      (d) => d.date === date
                    );
                    return (
                      <td key={date} className="text-center py-2 px-2">
                        {day ? (
                          <div className="flex flex-col">
                            <span className="text-orange-400 font-semibold">
                              {day.tmaxC != null ? `${day.tmaxC.toFixed(1)}°` : '—'}
                            </span>
                            <span className="text-sky-400 text-xs">
                              {day.tminC != null ? `${day.tminC.toFixed(1)}°` : '—'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-surface-600">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
