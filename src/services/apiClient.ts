export class ApiError extends Error {
  public status?: number;
  constructor(
    message: string,
    status?: number
  ) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new ApiError(
      `API request failed: ${res.status} ${res.statusText}`,
      res.status
    );
  }
  return res.json() as Promise<T>;
}

/**
 * In dev, the Vite proxy rewrites /api/aviation → aviationweather.gov/api/data.
 * In production builds, use a CORS proxy (allorigins) as a fallback.
 */
const isDev = import.meta.env.DEV;

const AVIATION_BASE = isDev
  ? '/api/aviation'
  : 'https://api.allorigins.win/raw?url=';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';
const METAR_HISTORY_HOURS = 2;

function aviationUrl(path: string): string {
  if (isDev) {
    return `${AVIATION_BASE}${path}`;
  }
  return `${AVIATION_BASE}${encodeURIComponent(`https://aviationweather.gov/api/data${path}`)}`;
}

export function metarUrl(stations: string[], hours: number = METAR_HISTORY_HOURS): string {
  return aviationUrl(
    `/metar?ids=${stations.join(',')}&format=json&hours=${hours}`
  );
}

export function tafUrl(stations: string[]): string {
  return aviationUrl(`/taf?ids=${stations.join(',')}&format=json`);
}

export function nwpUrl(
  lat: number,
  lon: number,
  timezone: string,
  modelSlug: string
): string {
  const tz = encodeURIComponent(timezone);
  return `${OPEN_METEO_BASE}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=${tz}&forecast_days=5&models=${modelSlug}`;
}

export function hourlyUrl(
  lat: number,
  lon: number,
  timezone: string
): string {
  const tz = encodeURIComponent(timezone);
  return `${OPEN_METEO_BASE}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,wind_speed_10m,cloud_cover&timezone=${tz}&forecast_days=7`;
}
