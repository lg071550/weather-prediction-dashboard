import { z } from 'zod';
import { fetchJson, nwpUrl } from './apiClient';
import type { NwpModelForecast, DailyForecast } from '../types/weather';

/* ---- Zod schema for Open-Meteo daily response ---- */
const DailySchema = z.object({
  time: z.array(z.string()).optional().default([]),
  temperature_2m_max: z.array(z.number().nullable()).optional().default([]),
  temperature_2m_min: z.array(z.number().nullable()).optional().default([]),
});

const NwpResponseSchema = z.object({
  daily: DailySchema.optional(),
});

const MODEL_DISPLAY_NAMES: Record<string, string> = {
  ecmwf_ifs025: 'ECMWF IFS 0.25°',
  gfs_seamless: 'GFS',
  icon_seamless: 'ICON',
  ukmo_uk_deterministic_2km: 'UKMO 2km',
  gem_seamless: 'GEM',
};

function normalizeNwp(
  modelSlug: string,
  data: z.infer<typeof NwpResponseSchema>
): NwpModelForecast {
  const daily = data.daily;
  const forecasts: DailyForecast[] = [];

  if (daily) {
    const times = daily.time ?? [];
    const tmaxArr = daily.temperature_2m_max ?? [];
    const tminArr = daily.temperature_2m_min ?? [];

    for (let i = 0; i < times.length; i++) {
      forecasts.push({
        date: times[i] ?? '',
        tmaxC: tmaxArr[i] ?? null,
        tminC: tminArr[i] ?? null,
      });
    }
  }

  return {
    modelSlug,
    modelDisplayName: MODEL_DISPLAY_NAMES[modelSlug] ?? modelSlug,
    dailyForecasts: forecasts,
  };
}

export async function fetchNwpModel(
  lat: number,
  lon: number,
  timezone: string,
  modelSlug: string
): Promise<NwpModelForecast> {
  const url = nwpUrl(lat, lon, timezone, modelSlug);
  const raw = await fetchJson<unknown>(url);
  const parsed = NwpResponseSchema.parse(raw);
  return normalizeNwp(modelSlug, parsed);
}

export async function fetchAllNwpModels(
  lat: number,
  lon: number,
  timezone: string,
  modelSlugs: string[]
): Promise<NwpModelForecast[]> {
  const results = await Promise.allSettled(
    modelSlugs.map((slug) => fetchNwpModel(lat, lon, timezone, slug))
  );
  return results
    .filter(
      (r): r is PromiseFulfilledResult<NwpModelForecast> =>
        r.status === 'fulfilled'
    )
    .map((r) => r.value);
}
