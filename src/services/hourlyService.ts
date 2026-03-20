import { z } from 'zod';
import { fetchJson, hourlyUrl } from './apiClient';
import type { HourlyObs } from '../types/weather';

/* ---- Zod schema with fallback field names ---- */
const HourlyDataSchema = z.object({
  time: z.array(z.string()).optional().default([]),
  temperature_2m: z.array(z.number().nullable()).optional().default([]),
  precipitation: z.array(z.number().nullable()).optional().default([]),
  // Handle both field name variants
  wind_speed_10m: z.array(z.number().nullable()).optional(),
  windspeed_10m: z.array(z.number().nullable()).optional(),
  cloud_cover: z.array(z.number().nullable()).optional(),
  cloudcover: z.array(z.number().nullable()).optional(),
});

const HourlyResponseSchema = z.object({
  hourly: HourlyDataSchema.optional(),
});

function normalizeHourly(
  data: z.infer<typeof HourlyResponseSchema>
): HourlyObs[] {
  const h = data.hourly;
  if (!h) return [];

  const times = h.time ?? [];
  const temps = h.temperature_2m ?? [];
  const precips = h.precipitation ?? [];
  const winds = h.wind_speed_10m ?? h.windspeed_10m ?? [];
  const clouds = h.cloud_cover ?? h.cloudcover ?? [];

  const results: HourlyObs[] = [];
  for (let i = 0; i < times.length; i++) {
    results.push({
      time: times[i] ?? '',
      tempC: temps[i] ?? null,
      precipMm: precips[i] ?? null,
      windSpeedKmh: winds[i] ?? null,
      cloudCoverPct: clouds[i] ?? null,
    });
  }
  return results;
}

export async function fetchHourly(
  lat: number,
  lon: number,
  timezone: string
): Promise<HourlyObs[]> {
  const url = hourlyUrl(lat, lon, timezone);
  const raw = await fetchJson<unknown>(url);
  const parsed = HourlyResponseSchema.parse(raw);
  return normalizeHourly(parsed);
}
