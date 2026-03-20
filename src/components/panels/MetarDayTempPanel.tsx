import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MetarReport, FeedStatus } from '../../types/weather';
import { formatTimeInTz } from '../../lib/time';
import { Panel } from '../common/Panel';

interface MetarDayTempPanelProps {
  reports: MetarReport[];
  stationId: string;
  feedStatus: FeedStatus;
  timezone: string;
}

type MetarTempPoint = {
  time: string;
  timeMs: number;
  tempC: number | null;
};

type MetarTempChartPoint = {
  time: string;
  timeMs: number;
  tempC: number;
};

export function MetarDayTempPanel({
  reports,
  stationId,
  feedStatus,
  timezone,
}: MetarDayTempPanelProps) {
  const chartData = useMemo(
    (): MetarTempPoint[] =>
      reports
        .filter((report) => report.stationId === stationId)
        .map((report) => ({
          time: report.observationTime,
          timeMs: new Date(report.observationTime).getTime(),
          tempC: report.tempC,
        }))
        .filter((entry) => Number.isFinite(entry.timeMs))
        .sort((a, b) => a.timeMs - b.timeMs),
    [reports, stationId]
  );

  const validTemps = useMemo(
    (): MetarTempChartPoint[] => chartData.filter(hasTemperature),
    [chartData]
  );

  const latest = validTemps[validTemps.length - 1];
  const minTemp = validTemps.reduce(
    (min, point) => Math.min(min, point.tempC),
    Number.POSITIVE_INFINITY
  );
  const maxTemp = validTemps.reduce(
    (max, point) => Math.max(max, point.tempC),
    Number.NEGATIVE_INFINITY
  );

  return (
    <Panel title="METAR Temperature Trend" feedStatus={feedStatus}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-info/15 bg-info/8 px-4 py-3 shadow-sm shadow-info/5 flex flex-col items-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-info/80 text-center">
              Current
            </p>
            <p className="mt-1 text-lg font-semibold text-surface-50 text-center">
              {latest?.tempC != null ? `${latest.tempC.toFixed(1)}°C` : '--'}
            </p>
          </div>
          <div className="rounded-xl border border-surface-500/20 bg-surface-700/40 px-4 py-3 shadow-sm shadow-black/10 flex flex-col items-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-surface-400 text-center">
              Min
            </p>
            <p className="mt-1 text-lg font-semibold text-surface-50 text-center">
              {Number.isFinite(minTemp) ? `${minTemp.toFixed(1)}°C` : '--'}
            </p>
          </div>
          <div className="rounded-xl border border-surface-500/20 bg-surface-700/40 px-4 py-3 shadow-sm shadow-black/10 flex flex-col items-center">
            <p className="text-[11px] uppercase tracking-[0.18em] text-surface-400 text-center">
              Max
            </p>
            <p className="mt-1 text-lg font-semibold text-surface-50 text-center">
              {Number.isFinite(maxTemp) ? `${maxTemp.toFixed(1)}°C` : '--'}
            </p>
          </div>
        </div>

        {chartData.length === 0 ? (
          <p className="text-surface-500 text-sm italic">
            No METAR temperature data available
          </p>
        ) : (
          <div className="chart-shell h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 16, right: 12, left: 0, bottom: 0 }}
                baseValue="dataMin"
              >
                <defs>
                  <linearGradient id="metarTempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-info)"
                      stopOpacity={0.08}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-info)"
                      stopOpacity={0.28}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(var(--color-surface-500-rgb, 59, 69, 91), 0.28)"
                />
                <XAxis
                  type="number"
                  dataKey="timeMs"
                  domain={['dataMin', 'dataMax']}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tick={{ fill: 'var(--color-surface-300)', fontSize: 11 }}
                  tickFormatter={(value: number | string) => {
                    const numeric =
                      typeof value === 'number' ? value : Number(value);
                    if (!Number.isFinite(numeric)) return '';
                    return formatTimeInTz(
                      new Date(numeric).toISOString(),
                      timezone,
                      'HH:mm'
                    );
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tick={{ fill: 'var(--color-surface-300)', fontSize: 12 }}
                  width={48}
                  unit="°"
                />
                <Tooltip
                  cursor={{
                    stroke: 'rgba(var(--color-info-rgb, 96, 165, 250), 0.22)',
                    strokeWidth: 1.5,
                    strokeDasharray: '4 4',
                  }}
                  labelFormatter={(label: unknown) => {
                    const numeric =
                      typeof label === 'number' ? label : Number(label);
                    if (!Number.isFinite(numeric)) return String(label ?? '');
                    return formatTimeInTz(
                      new Date(numeric).toISOString(),
                      timezone,
                      'HH:mm'
                    );
                  }}
                  formatter={(value: unknown) => {
                    const numericValue =
                      typeof value === 'number' ? value : Number(value);
                    return [
                      Number.isFinite(numericValue)
                        ? `${numericValue.toFixed(1)}°C`
                        : '—',
                      'Temp',
                    ];
                  }}
                  contentStyle={{
                    backgroundColor:
                      'rgba(var(--color-surface-800-rgb, 21, 24, 33), 0.96)',
                    border:
                      '1px solid rgba(var(--color-surface-500-rgb, 59, 69, 91), 0.5)',
                    borderRadius: '12px',
                    color: 'var(--color-surface-100)',
                    fontSize: '12px',
                    boxShadow: '0 16px 34px rgba(0, 0, 0, 0.34)',
                    backdropFilter: 'blur(12px)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tempC"
                  name="Temperature"
                  stroke="var(--color-info)"
                  fill="url(#metarTempGrad)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  connectNulls
                  dot={false}
                  activeDot={{
                    r: 5,
                    stroke: 'var(--color-surface-50)',
                    strokeWidth: 1.5,
                    fill: 'var(--color-info)',
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Panel>
  );
}

function hasTemperature(point: MetarTempPoint): point is MetarTempChartPoint {
  return point.tempC != null;
}
