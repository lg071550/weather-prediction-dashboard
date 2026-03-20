import { z } from 'zod';
import { fetchJson, tafUrl } from './apiClient';
import { ageMinutes, parseApiTimestamp } from '../lib/time';
import type { TafForecast, AviationAlert } from '../types/weather';

/* ---- Zod schemas ---- */
const RawTafCloudSchema = z.object({
  cover: z.string().optional().default(''),
  base: z.number().nullable().optional().default(null),
});

const flexStr = z.union([z.string(), z.number()]).nullable().optional().transform((v) => (v != null ? String(v) : ''));

const RawFcstSchema = z.object({
  timeFrom: flexStr,
  timeTo: flexStr,
  fcstChange: flexStr,
  probability: z.number().nullable().optional().default(null),
  wdir: z.union([z.number(), z.string()]).nullable().optional().default(null),
  wspd: z.number().nullable().optional().default(null),
  wgst: z.number().nullable().optional().default(null),
  visib: z.union([z.number(), z.string()]).nullable().optional().default(null),
  wxString: z.string().nullable().optional().default(null),
  clouds: z.array(RawTafCloudSchema).optional().default([]),
}).passthrough();

const RawTafSchema = z.object({
  icaoId: z.string().optional().default(''),
  issueTime: z.string().optional().default(''),
  rawTAF: z.string().optional().default(''),
  fcsts: z.array(RawFcstSchema).optional().default([]),
}).passthrough();

type RawTaf = z.infer<typeof RawTafSchema>;
type RawFcst = z.infer<typeof RawFcstSchema>;

/* ---- Alert extraction ---- */
function formatTafTime(
  rawTime: string,
  issueDateString: string
): { iso: string; formatted: string } {
  const token = rawTime.trim();
  if (!token) return { iso: '', formatted: '?' };

  const parsed =
    parseEpochToken(token) ??
    parseDayHourToken(token, issueDateString) ??
    parseApiTimestamp(token);

  if (!parsed) {
    return { iso: '', formatted: '?' };
  }

  const formatted = new Intl.DateTimeFormat([], {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed);

  return { iso: parsed.toISOString(), formatted };
}

function parseEpochToken(token: string): Date | null {
  if (!/^\d+$/.test(token)) return null;

  const numeric = Number(token);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;

  const epochMs =
    token.length >= 12
      ? numeric
      : token.length >= 9
        ? numeric * 1000
        : null;

  if (epochMs == null) return null;

  const parsed = new Date(epochMs);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseDayHourToken(
  token: string,
  issueDateString: string
): Date | null {
  if (!/^\d{4}$/.test(token)) return null;

  const issueDate = parseApiTimestamp(issueDateString);
  if (!issueDate) return null;

  const day = Number(token.slice(0, 2));
  const hour = Number(token.slice(2, 4));

  if (day < 1 || day > 31 || hour < 0 || hour > 23) return null;

  const parsed = new Date(issueDate);
  if (day < parsed.getUTCDate() && parsed.getUTCDate() > 20) {
    parsed.setUTCMonth(parsed.getUTCMonth() + 1);
  }
  parsed.setUTCDate(day);
  parsed.setUTCHours(hour, 0, 0, 0);
  return parsed;
}

function extractAlerts(
  stationId: string,
  issueTime: string,
  fcsts: RawFcst[]
): AviationAlert[] {
  const alerts: AviationAlert[] = [];

  for (const f of fcsts) {
    const changeType = f.fcstChange || 'BASE';
    const probStr = f.probability ? `PROB${f.probability}` : '';
    const start = formatTafTime(f.timeFrom || '', issueTime);
    const end = formatTafTime(f.timeTo || '', issueTime);
    const window = `${start.formatted} → ${end.formatted}`;

    // Ceiling <= 1500 ft (BKN/OVC)
    for (const c of f.clouds ?? []) {
      if (
        c.base != null &&
        c.base <= 1500 &&
        (c.cover === 'BKN' || c.cover === 'OVC')
      ) {
        alerts.push({
          stationId,
          label: 'LOW CEILING',
          detail: `${c.cover} ${c.base}ft`,
          timeWindow: window,
          timeStart: start.iso,
          timeEnd: end.iso,
          severity: c.base <= 500 ? 'warning' : 'caution',
          changeType: [changeType, probStr].filter(Boolean).join(' '),
        });
      }
    }

    // Visibility < 5 SM
    const vis = f.visib != null ? Number(f.visib) : null;
    if (vis != null && !isNaN(vis) && vis < 5) {
      alerts.push({
        stationId,
        label: 'LOW VIS',
        detail: `${vis}SM`,
        timeWindow: window,
        timeStart: start.iso,
        timeEnd: end.iso,
        severity: vis < 1 ? 'warning' : 'caution',
        changeType: [changeType, probStr].filter(Boolean).join(' '),
      });
    }

    // Gust >= 25 kt
    if (f.wgst != null && f.wgst >= 25) {
      alerts.push({
        stationId,
        label: 'GUSTY',
        detail: `G${f.wgst}KT`,
        timeWindow: window,
        timeStart: start.iso,
        timeEnd: end.iso,
        severity: f.wgst >= 40 ? 'warning' : 'caution',
        changeType: [changeType, probStr].filter(Boolean).join(' '),
      });
    }

    // wxString non-empty
    if (f.wxString && f.wxString.trim() !== '') {
      alerts.push({
        stationId,
        label: 'WX',
        detail: f.wxString,
        timeWindow: window,
        timeStart: start.iso,
        timeEnd: end.iso,
        severity: /TS|FZ|SN/.test(f.wxString) ? 'warning' : 'info',
        changeType: [changeType, probStr].filter(Boolean).join(' '),
      });
    }
  }

  return alerts;
}

function normalizeTaf(raw: RawTaf): TafForecast {
  return {
    stationId: raw.icaoId || '',
    issueTime: raw.issueTime || '',
    rawTaf: raw.rawTAF || '',
    ageMinutes: raw.issueTime ? ageMinutes(raw.issueTime) : -1,
    alerts: extractAlerts(raw.icaoId || '', raw.issueTime || '', raw.fcsts ?? []),
  };
}

export async function fetchTafs(
  stations: string[]
): Promise<TafForecast[]> {
  const url = tafUrl(stations);
  const raw = await fetchJson<unknown[]>(url);
  const parsed = z.array(RawTafSchema).parse(raw);
  return parsed.map(normalizeTaf);
}
