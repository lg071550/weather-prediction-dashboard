import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { differenceInMinutes, startOfDay, format } from 'date-fns';

const TIMEZONE_SUFFIX = /(Z|[+-]\d{2}(?::?\d{2})?)$/i;

function normalizeTimestamp(isoTime: string): string {
  const trimmed = isoTime.trim();
  if (!trimmed) return '';
  const withTimeSeparator = trimmed.includes('T')
    ? trimmed
    : trimmed.replace(' ', 'T');
  return TIMEZONE_SUFFIX.test(withTimeSeparator)
    ? withTimeSeparator
    : `${withTimeSeparator}Z`;
}

export function parseApiTimestamp(isoTime: string): Date | null {
  const normalized = normalizeTimestamp(isoTime);
  if (!normalized) return null;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function ageMinutes(isoTime: string): number {
  const parsed = parseApiTimestamp(isoTime);
  if (!parsed) return -1;
  return differenceInMinutes(new Date(), parsed);
}

export function formatTimeInTz(
  isoTime: string,
  timezone: string,
  fmt = 'HH:mm'
): string {
  const parsed = parseApiTimestamp(isoTime);
  if (!parsed) return '—';
  return formatInTimeZone(parsed, timezone, fmt);
}

export function dateStrInTz(isoTime: string, timezone: string): string | null {
  const parsed = parseApiTimestamp(isoTime);
  if (!parsed) return null;
  return formatInTimeZone(parsed, timezone, 'yyyy-MM-dd');
}

export function todayDateStr(timezone: string): string {
  const zoned = toZonedTime(new Date(), timezone);
  return format(startOfDay(zoned), 'yyyy-MM-dd');
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return format(d, 'EEE dd MMM');
}

export function formatRefreshTime(date: Date | null): string {
  if (!date) return 'never';
  return format(date, 'HH:mm:ss');
}

export function formatRefreshTimeWithAge(
  date: Date | null,
  now: Date = new Date()
): string {
  if (!date) return 'never';

  const ageMinutesValue = Math.max(0, differenceInMinutes(now, date));
  return `${format(date, 'HH:mm:ss')} · ${ageMinutesValue}m`;
}

export function formatTimeInZone(
  date: Date,
  timezone: string,
  fmt = 'HH:mm'
): string {
  return formatInTimeZone(date, timezone, fmt);
}
