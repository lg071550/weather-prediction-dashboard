import { useMemo } from 'react';
import { fromZonedTime } from 'date-fns-tz';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { HourlyObs, FeedStatus } from '../../types/weather';
import { Panel } from '../common/Panel';

interface HourlyPanelProps {
  hourly: HourlyObs[];
  feedStatus: FeedStatus;
  timezone: string;
  sourceTimezone: string;
}

export function HourlyPanel({
  hourly,
  feedStatus,
  timezone,
  sourceTimezone,
}: HourlyPanelProps) {
  const daily = useMemo(() => {
    const now = new Date();
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const inRange = hourly
      .map((obs) => ({
        ...obs,
        parsedTime: parseHourlyTimestamp(obs.time, sourceTimezone),
      }))
      .filter(
        (obs): obs is HourlyObs & { parsedTime: Date } =>
          obs.parsedTime != null && obs.parsedTime >= now && obs.parsedTime <= end
      );

    const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const labelFormatter = new Intl.DateTimeFormat([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: timezone,
    });

    const map = new Map<string, {
      label: string;
      sampleTime: string;
      tmin: number | null;
      tmax: number | null;
      totalPrecip: number;
      cloudMax: number;
      windMin: number | null;
      windMax: number | null;
    }>();

    inRange.forEach((h) => {
      const key = dayKeyFormatter.format(h.parsedTime);
      const existing = map.get(key) || {
        label: labelFormatter.format(h.parsedTime),
        sampleTime: h.parsedTime.toISOString(),
        tmin: null,
        tmax: null,
        totalPrecip: 0,
        cloudMax: 0,
        windMin: null,
        windMax: null,
      };

      if (h.tempC != null) {
        existing.tmin = existing.tmin === null ? h.tempC : Math.min(existing.tmin, h.tempC);
        existing.tmax = existing.tmax === null ? h.tempC : Math.max(existing.tmax, h.tempC);
      }
      existing.totalPrecip += h.precipMm ?? 0;
      existing.cloudMax = Math.max(existing.cloudMax, h.cloudCoverPct ?? 0);
      if (h.windSpeedKmh != null) {
        existing.windMin = existing.windMin === null ? h.windSpeedKmh : Math.min(existing.windMin, h.windSpeedKmh);
        existing.windMax = existing.windMax === null ? h.windSpeedKmh : Math.max(existing.windMax, h.windSpeedKmh);
      }
      map.set(key, existing);
    });

    const arr = Array.from(map.values()).sort(
      (a, b) => new Date(a.sampleTime).getTime() - new Date(b.sampleTime).getTime()
    );
    return arr.slice(0, 7);
  }, [hourly, timezone, sourceTimezone]);

  const chartData = useMemo(
    () => daily.map((d) => ({ day: d.label, tmin: d.tmin, tmax: d.tmax, precip: d.totalPrecip })),
    [daily]
  );

  return (
    <Panel title="7-Day Forecast" feedStatus={feedStatus} feedName="Forecast">
      {daily.length === 0 ? (
        <p className="text-surface-500 text-sm italic">No forecast data available</p>
      ) : (
        <div className="space-y-5">
          <div className="chart-shell h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 16, right: 12, left: 0, bottom: 0 }}
                baseValue="dataMin"
              >
                <defs>
                  <linearGradient id="tmaxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-warning)"
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-warning)"
                      stopOpacity={0.28}
                    />
                  </linearGradient>
                  <linearGradient id="tminGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-info)"
                      stopOpacity={0.08}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-info)"
                      stopOpacity={0.2}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(var(--color-surface-500-rgb, 59, 69, 91), 0.28)"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  tick={{ fill: 'var(--color-surface-300)', fontSize: 12 }}
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
                    stroke: 'rgba(var(--color-info-rgb, 96, 165, 250), 0.2)',
                    strokeWidth: 1.5,
                    strokeDasharray: '4 4',
                  }}
                  contentStyle={{
                    backgroundColor:
                      'rgba(var(--color-surface-800-rgb, 21, 24, 33), 0.96)',
                    border:
                      '1px solid rgba(var(--color-surface-500-rgb, 59, 69, 91), 0.5)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--color-surface-100)',
                    boxShadow: '0 16px 34px rgba(0, 0, 0, 0.34)',
                    backdropFilter: 'blur(12px)',
                  }}
                  formatter={(value: unknown, name: unknown) => {
                    const label = typeof name === 'string' ? name : String(name ?? '');
                    if (value == null) return ['—', label];

                    const numericValue = typeof value === 'number' ? value : Number(value);

                    if (label === 'precip') {
                      return [
                        Number.isFinite(numericValue) ? `${numericValue.toFixed(1)}mm` : '—',
                        'Precip',
                      ];
                    }

                    return [Number.isFinite(numericValue) ? `${numericValue.toFixed(1)}°C` : '—', label];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tmax"
                  stroke="var(--color-warning)"
                  fill="url(#tmaxGrad)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  connectNulls
                  dot={false}
                  activeDot={{
                    r: 4.5,
                    stroke: 'var(--color-surface-50)',
                    strokeWidth: 1.25,
                    fill: 'var(--color-warning)',
                  }}
                  name="High"
                />
                <Area
                  type="monotone"
                  dataKey="tmin"
                  stroke="var(--color-info)"
                  fill="url(#tminGrad)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  connectNulls
                  dot={false}
                  activeDot={{
                    r: 4.5,
                    stroke: 'var(--color-surface-50)',
                    strokeWidth: 1.25,
                    fill: 'var(--color-info)',
                  }}
                  name="Low"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

            <div className="min-w-0 overflow-hidden">
              <table className="mx-auto w-full max-w-[720px] table-fixed text-[13px]">
                <thead>
                  <tr className="border-b border-surface-700/50">
                    <th className="w-[28%] text-center py-2 px-1.5 text-surface-400 font-medium">Day</th>
                    <th className="w-[24%] text-center py-2 px-1.5 text-surface-400 font-medium">Low</th>
                    <th className="w-[24%] text-center py-2 px-1.5 text-surface-400 font-medium">High</th>
                    <th className="w-[24%] text-center py-2 px-1.5 text-surface-400 font-medium">Rain</th>
                  </tr>
                </thead>
                <tbody>
                  {daily.map((d) => (
                    <tr key={d.sampleTime} className="border-b border-surface-700/30 hover:bg-surface-700/20 transition-colors">
                      <td className="py-2 px-1.5 text-center font-mono font-semibold text-surface-200 truncate">{d.label}</td>
                      <td className="text-center py-2 px-1.5 text-info whitespace-nowrap overflow-hidden text-ellipsis">{d.tmin != null ? `${d.tmin.toFixed(1)}°` : '—'}</td>
                      <td className="text-center py-2 px-1.5 text-warning whitespace-nowrap overflow-hidden text-ellipsis">{d.tmax != null ? `${d.tmax.toFixed(1)}°` : '—'}</td>
                      <td className="text-center py-2 px-1.5 text-info whitespace-nowrap overflow-hidden text-ellipsis">{d.totalPrecip != null ? `${d.totalPrecip.toFixed(1)}mm` : '—'}</td>
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

const TIMEZONE_SUFFIX = /(Z|[+-]\d{2}(?::?\d{2})?)$/i;

function parseHourlyTimestamp(
  isoTime: string,
  sourceTimezone: string
): Date | null {
  const trimmed = isoTime.trim();
  if (!trimmed) return null;
  const normalized = trimmed.includes('T')
    ? trimmed
    : trimmed.replace(' ', 'T');

  if (TIMEZONE_SUFFIX.test(normalized)) {
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = fromZonedTime(normalized, sourceTimezone);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
