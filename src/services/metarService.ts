import { z } from 'zod';
import { fetchJson, metarUrl } from './apiClient';
import { ageMinutes, parseApiTimestamp } from '../lib/time';
import type { MetarReport, CloudLayer } from '../types/weather';

/* ---- Zod schema for raw Aviation API METAR ---- */
const RawCloudSchema = z.object({
  cover: z.string().optional().default(''),
  base: z.number().nullable().optional().default(null),
});

const RawMetarSchema = z.object({
  icaoId: z.string().optional().default(''),
  reportTime: z.string().optional().default(''),
  temp: z.number().nullable().optional().default(null),
  dewp: z.number().nullable().optional().default(null),
  wdir: z.union([z.number(), z.string()]).nullable().optional().default(null),
  wspd: z.number().nullable().optional().default(null),
  wgst: z.number().nullable().optional().default(null),
  visib: z.union([z.number(), z.string()]).nullable().optional().default(null),
  altim: z.number().nullable().optional().default(null),
  fltcat: z.string().nullable().optional().default(null),
  wxString: z.string().nullable().optional().default(null),
  clouds: z.array(RawCloudSchema).optional().default([]),
  rawOb: z.string().optional().default(''),
});

type RawMetar = z.infer<typeof RawMetarSchema>;

export function normalizeMetar(raw: RawMetar): MetarReport {
  const observationDate = parseApiTimestamp(raw.reportTime || '');
  const observationTime = observationDate ? observationDate.toISOString() : '';

  const clouds: CloudLayer[] = (raw.clouds ?? []).map((c) => ({
    cover: c.cover ?? '',
    base: c.base ?? null,
  }));

  const windDir =
    typeof raw.wdir === 'number'
      ? raw.wdir
      : raw.wdir === 'VRB'
        ? null
        : null;

  return {
    stationId: raw.icaoId || '',
    observationTime,
    ageMinutes: observationTime ? ageMinutes(observationTime) : -1,
    tempC: raw.temp ?? null,
    dewpointC: raw.dewp ?? null,
    windDir,
    windSpeedKt: raw.wspd ?? null,
    windGustKt: raw.wgst ?? null,
    visibility: raw.visib != null ? String(raw.visib) : null,
    altimeterHpa: raw.altim ?? null,
    flightCategory: raw.fltcat ?? null,
    wxString: raw.wxString ?? null,
    clouds,
    rawOb: raw.rawOb || '',
  };
}

export async function fetchMetars(
  stations: string[],
  hours?: number
): Promise<MetarReport[]> {
  const url = metarUrl(stations, hours);
  const raw = await fetchJson<unknown[]>(url);
  const parsed = z.array(RawMetarSchema).parse(raw);
  return parsed
    .map(normalizeMetar)
    .sort(
      (a, b) =>
        safeEpochMs(b.observationTime) - safeEpochMs(a.observationTime)
    );
}

function safeEpochMs(isoTime: string): number {
  const parsed = parseApiTimestamp(isoTime);
  return parsed ? parsed.getTime() : 0;
}
