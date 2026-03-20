import { useMemo } from 'react';
import type { AviationAlert, FeedStatus } from '../../types/weather';
import { Panel } from '../common/Panel';

interface AviationAlertsProps {
  alerts: AviationAlert[];
  feedStatus: FeedStatus;
}

type AlertNarrative = {
  title: string;
  impact: string;
  rawDetail: string;
};

type SeverityTone = {
  card: string;
  rail: string;
  icon: string;
  iconGlow: string;
  badge: string;
  badgeGlow: string;
  chip: string;
};

function severityTone(severity: AviationAlert['severity']): SeverityTone {
  switch (severity) {
    case 'warning':
      return {
        card: 'border-danger/35 bg-gradient-to-br from-danger/12 via-surface-800/96 to-surface-700/80 glow-danger-subtle hover:border-danger/55',
        rail: 'bg-danger',
        icon: 'border-danger/30 bg-danger/15 text-danger',
        iconGlow: 'glow-danger',
        badge: 'border-danger/30 bg-danger/15 text-danger',
        badgeGlow: 'glow-danger',
        chip: 'border-danger/25 bg-danger/10 text-danger/90',
      };
    case 'caution':
      return {
        card: 'border-warning/35 bg-gradient-to-br from-warning/12 via-surface-800/96 to-surface-700/80 glow-warning-subtle hover:border-warning/55',
        rail: 'bg-warning',
        icon: 'border-warning/30 bg-warning/15 text-warning',
        iconGlow: 'glow-warning',
        badge: 'border-warning/30 bg-warning/15 text-warning',
        badgeGlow: 'glow-warning',
        chip: 'border-warning/25 bg-warning/10 text-warning/90',
      };
    case 'info':
      return {
        card: 'border-info/35 bg-gradient-to-br from-info/12 via-surface-800/96 to-surface-700/80 glow-info-subtle hover:border-info/55',
        rail: 'bg-info',
        icon: 'border-info/30 bg-info/15 text-info',
        iconGlow: 'glow-info',
        badge: 'border-info/30 bg-info/15 text-info',
        badgeGlow: 'glow-info',
        chip: 'border-info/25 bg-info/10 text-info/90',
      };
  }
}

function severityIcon(severity: AviationAlert['severity']): string {
  switch (severity) {
    case 'warning':
      return '⚠️';
    case 'caution':
      return '⚡';
    case 'info':
      return 'ℹ️';
  }
}

function severityLabel(severity: AviationAlert['severity']): string {
  switch (severity) {
    case 'warning':
      return 'WARNING';
    case 'caution':
      return 'CAUTION';
    case 'info':
      return 'INFO';
  }
}

function formatAlertTitle(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? value.toString() : Number(value.toFixed(2)).toString();
}

function describeWeatherToken(token: string): string {
  let normalized = token.trim().toUpperCase();

  if (!normalized) {
    return '';
  }

  let intensity = '';
  if (normalized.startsWith('+')) {
    intensity = 'heavy ';
    normalized = normalized.slice(1);
  } else if (normalized.startsWith('-')) {
    intensity = 'light ';
    normalized = normalized.slice(1);
  }

  if (normalized.startsWith('VC')) {
    const remainder = normalized.slice(2);
    const decoded = describeWeatherToken(remainder);
    return decoded ? `vicinity ${decoded}` : 'vicinity weather';
  }

  const specialCases: Record<string, string> = {
    TSRA: 'thunderstorms with rain',
    TSSN: 'thunderstorms with snow',
    TSGR: 'thunderstorms with hail',
    TSPL: 'thunderstorms with ice pellets',
    FZRA: 'freezing rain',
    FZFG: 'freezing fog',
    SHRA: 'rain showers',
    SHSN: 'snow showers',
  };

  const special = specialCases[normalized];
  if (special) {
    return `${intensity}${special}`;
  }

  if (normalized.includes('TS') && normalized.includes('RA')) return `${intensity}thunderstorms with rain`;
  if (normalized.includes('TS') && normalized.includes('SN')) return `${intensity}thunderstorms with snow`;
  if (normalized.includes('TS') && normalized.includes('GR')) return `${intensity}thunderstorms with hail`;
  if (normalized.includes('TS')) return `${intensity}thunderstorms`;
  if (normalized.includes('SH') && normalized.includes('RA')) return `${intensity}rain showers`;
  if (normalized.includes('SH') && normalized.includes('SN')) return `${intensity}snow showers`;
  if (normalized.includes('SH')) return `${intensity}showers`;
  if (normalized.includes('FZ') && normalized.includes('RA')) return `${intensity}freezing rain`;
  if (normalized.includes('FZ') && normalized.includes('FG')) return `${intensity}freezing fog`;
  if (normalized.includes('BR') && normalized.includes('FG')) return `${intensity}mist and fog`;

  const tokenMap: Array<[string, string]> = [
    ['RA', 'rain'],
    ['DZ', 'drizzle'],
    ['SN', 'snow'],
    ['SG', 'snow grains'],
    ['PL', 'ice pellets'],
    ['GR', 'hail'],
    ['GS', 'small hail'],
    ['IC', 'ice crystals'],
    ['BR', 'mist'],
    ['FG', 'fog'],
    ['HZ', 'haze'],
    ['FU', 'smoke'],
    ['DU', 'dust'],
    ['SA', 'sand'],
    ['VA', 'volcanic ash'],
    ['SQ', 'squalls'],
    ['FC', 'funnel clouds'],
    ['SS', 'sandstorm'],
    ['DS', 'duststorm'],
    ['PO', 'dust devils'],
    ['UP', 'precipitation'],
  ];

  for (const [code, description] of tokenMap) {
    if (normalized.includes(code)) {
      return `${intensity}${description}`;
    }
  }

  return token.toLowerCase();
}

function describeWeatherString(raw: string): string {
  const phrases = raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(describeWeatherToken)
    .filter(Boolean);

  if (phrases.length === 0) {
    return raw;
  }

  return phrases.length === 1 ? phrases[0] : phrases.join(' and ');
}

function describeAlert(alert: AviationAlert): AlertNarrative {
  const detail = alert.detail.trim();

  switch (alert.label) {
    case 'LOW CEILING': {
      const match = /^([A-Z]{3})\s*(\d+(?:\.\d+)?)\s*ft$/i.exec(detail);
      const cover = match?.[1].toUpperCase();
      const base = match ? Number(match[2]) : null;
      const coverText =
        cover === 'BKN'
          ? 'Broken'
          : cover === 'OVC'
            ? 'Overcast'
            : 'Low';

      return {
        title: base != null ? `${coverText} ceiling at ${formatNumber(base)} ft` : 'Low ceiling',
        impact:
          alert.severity === 'warning'
            ? 'Low ceilings can quickly reduce VFR margins and make approaches more restrictive.'
            : 'Low ceilings can make visual navigation and arrivals more demanding.',
        rawDetail: detail ? `Raw: ${detail}` : '',
      };
    }

    case 'LOW VIS': {
      const match = /^(\d+(?:\.\d+)?)\s*SM$/i.exec(detail);
      const visibility = match ? Number(match[1]) : null;

      return {
        title:
          visibility != null
            ? `Visibility ${formatNumber(visibility)} SM`
            : 'Low visibility',
        impact:
          alert.severity === 'warning'
            ? 'Reduced visibility can make runway references and approach decisions harder.'
            : 'Visibility is reduced enough to keep a close eye on conditions.',
        rawDetail: detail ? `Raw: ${detail}` : '',
      };
    }

    case 'GUSTY': {
      const match = /^G?(\d+(?:\.\d+)?)\s*KT$/i.exec(detail);
      const gust = match ? Number(match[1]) : null;

      return {
        title: gust != null ? `Gusts up to ${formatNumber(gust)} kt` : 'Gusty winds',
        impact:
          alert.severity === 'warning'
            ? 'Expect a bumpier ride and stronger crosswind correction on takeoff and landing.'
            : 'Gusty winds can still make handling less smooth.',
        rawDetail: detail ? `Raw: ${detail}` : '',
      };
    }

    case 'WX': {
      const decoded = describeWeatherString(detail);

      return {
        title: decoded ? formatAlertTitle(decoded) : 'Weather in forecast',
        impact:
          alert.severity === 'warning'
            ? 'Weather in the TAF can change flight conditions quickly.'
            : 'Weather mentioned in the TAF is worth watching for a category change.',
        rawDetail: detail && decoded.toLowerCase() !== detail.toLowerCase() ? `Raw: ${detail}` : '',
      };
    }

    default:
      return {
        title: formatAlertTitle(alert.label),
        impact: 'Review the timing and change type to understand the operational impact.',
        rawDetail: detail ? `Raw: ${detail}` : '',
      };
  }
}

export function AviationAlerts({ alerts, feedStatus }: AviationAlertsProps) {
  const referenceTimeMs = feedStatus.lastRefresh?.getTime() ?? null;

  const activeAlerts = useMemo(
    () =>
      alerts
        .filter((alert) => {
          if (referenceTimeMs == null) return true;

          if (!alert.timeStart || !alert.timeEnd) {
            return true;
          }

          const start = Date.parse(alert.timeStart);
          const end = Date.parse(alert.timeEnd);

          if (Number.isNaN(start) || Number.isNaN(end)) {
            return true;
          }

          return referenceTimeMs >= start && referenceTimeMs <= end;
        })
        .sort((a, b) => {
          const severityRank = { warning: 0, caution: 1, info: 2 } as const;
          const severityDelta = severityRank[a.severity] - severityRank[b.severity];
          if (severityDelta !== 0) return severityDelta;

          const aStart = Date.parse(a.timeStart);
          const bStart = Date.parse(b.timeStart);
          const hasValidTimes = !Number.isNaN(aStart) && !Number.isNaN(bStart);
          if (hasValidTimes && aStart !== bStart) return aStart - bStart;

          return a.stationId.localeCompare(b.stationId);
        }),
    [alerts, referenceTimeMs]
  );

  const alertSummary = useMemo(() => {
    const counts = { warning: 0, caution: 0, info: 0 };
    const stations = new Set<string>();

    for (const alert of activeAlerts) {
      counts[alert.severity] += 1;
      stations.add(alert.stationId);
    }

    return {
      counts,
      stationCount: stations.size,
    };
  }, [activeAlerts]);

  return (
    <Panel title="Active Aviation Alerts" feedStatus={feedStatus} feedName="TAF">
      {activeAlerts.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-success/25 bg-success/10 px-3 py-2 text-sm text-success">
          <span className="text-xl">✅</span>
          <span className="font-medium">No active alerts right now</span>
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-surface-400">
            <span className="glow-accent rounded-full border border-surface-600/45 bg-surface-700/35 px-2.5 py-1 text-surface-300">
              {activeAlerts.length} active alert{activeAlerts.length === 1 ? '' : 's'}
            </span>
            <span className="glow-neutral rounded-full border border-surface-600/45 bg-surface-700/35 px-2.5 py-1 text-surface-300">
              {alertSummary.stationCount} station
              {alertSummary.stationCount === 1 ? '' : 's'}
            </span>
            {alertSummary.counts.warning > 0 && (
              <span className="glow-danger rounded-full border border-danger/30 bg-danger/10 px-2.5 py-1 text-danger">
                {alertSummary.counts.warning} warning
                {alertSummary.counts.warning === 1 ? '' : 's'}
              </span>
            )}
            {alertSummary.counts.caution > 0 && (
              <span className="glow-warning rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-warning">
                {alertSummary.counts.caution} caution
                {alertSummary.counts.caution === 1 ? '' : 's'}
              </span>
            )}
            {alertSummary.counts.info > 0 && (
              <span className="glow-info rounded-full border border-info/30 bg-info/10 px-2.5 py-1 text-info">
                {alertSummary.counts.info} info
                {alertSummary.counts.info === 1 ? '' : 's'}
              </span>
            )}
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-3 pt-6 pb-2 aviation-alerts-scroll">
            {activeAlerts.map((alert, i) => (
              <AlertCard
                key={`${alert.stationId}-${alert.label}-${i}`}
                alert={alert}
              />
            ))}
          </div>
        </>
      )}
    </Panel>
  );
}

function AlertCard({ alert }: { alert: AviationAlert }) {
  const tone = severityTone(alert.severity);
  const narrative = describeAlert(alert);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${tone.card}`}
    >

      <div className="relative flex gap-2.5 p-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${tone.icon} ${tone.iconGlow}`}>
          <span className="text-2xl leading-none">{severityIcon(alert.severity)}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${tone.badge} ${tone.badgeGlow}`}
              >
                {severityLabel(alert.severity)}
              </span>
              <span className="glow-neutral rounded-full border border-surface-500/35 bg-surface-900/35 px-2 py-0.5 text-[11px] font-mono font-semibold text-surface-200">
                {alert.stationId}
              </span>
            </div>
            <h4 className="mt-1.5 text-sm font-semibold text-surface-50">{narrative.title}</h4>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-surface-200/90">{narrative.impact}</p>
        </div>
      </div>
    </div>
  );
}
