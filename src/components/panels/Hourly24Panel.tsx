import { useEffect, useMemo, useState } from 'react';
import { fromZonedTime } from 'date-fns-tz';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { HourlyObs, FeedStatus } from '../../types/weather';
import { formatTimeInZone } from '../../lib/time';
import { Panel } from '../common/Panel';

interface Hourly24PanelProps {
  hourly: HourlyObs[];
  feedStatus: FeedStatus;
  timezone: string;
  sourceTimezone: string;
}

export function Hourly24Panel({
  hourly,
  feedStatus,
  timezone,
  sourceTimezone,
}: Hourly24PanelProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  const hourlyData = useMemo(() => {
    const now = new Date(nowMs);
    const localDateKey = formatDateKeyInTimezone(now, timezone);
    const startOfDay = fromZonedTime(`${localDateKey}T00:00:00`, timezone);
    const endOfDay = fromZonedTime(`${localDateKey}T23:59:59`, timezone);

    const points = hourly
      .map((obs) => ({
        ...obs,
        parsedTime: parseHourlyTimestamp(obs.time, sourceTimezone),
      }))
      .filter(
        (obs): obs is HourlyObs & { parsedTime: Date } =>
          obs.parsedTime != null &&
          obs.parsedTime >= startOfDay &&
          obs.parsedTime <= endOfDay
      )
      .sort((a, b) => a.parsedTime.getTime() - b.parsedTime.getTime());

    return points.map((obs) => ({
      timeMs: obs.parsedTime.getTime(),
      tempC: obs.tempC,
    }));
  }, [hourly, timezone, sourceTimezone, nowMs]);

  return (
    <Panel
      title="Hourly Max Forecast (00:00-24:00)"
      feedStatus={feedStatus}
      feedName="Hourly Forecast"
    >
      {hourlyData.length === 0 ? (
        <p className="text-surface-500 text-sm italic">
          No hourly forecast data available
        </p>
      ) : (
        <div className="chart-shell h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={hourlyData}
              margin={{ top: 16, right: 12, left: 0, bottom: 0 }}
              baseValue="dataMin"
            >
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-warning)"
                      stopOpacity={0.08}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-warning)"
                      stopOpacity={0.26}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(var(--color-surface-500-rgb, 59, 69, 91), 0.3)"
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
                    return formatTimeInZone(new Date(numeric), timezone, 'HH:mm');
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
                    return formatTimeInZone(new Date(numeric), timezone, 'HH:mm');
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
                <ReferenceLine
                  x={nowMs}
                  stroke="var(--color-info)"
                  strokeDasharray="6 6"
                  strokeWidth={2}
                  strokeOpacity={0.95}
                  ifOverflow="extendDomain"
                />
                <Area
                  type="monotone"
                  dataKey="tempC"
                  stroke="var(--color-warning)"
                  fill="url(#tempGrad)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  connectNulls
                  dot={false}
                  activeDot={{
                    r: 5,
                    stroke: 'var(--color-surface-50)',
                    strokeWidth: 1.5,
                    fill: 'var(--color-warning)',
                  }}
                />
            </AreaChart>
          </ResponsiveContainer>
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

function formatDateKeyInTimezone(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';

  return `${year}-${month}-${day}`;
}
