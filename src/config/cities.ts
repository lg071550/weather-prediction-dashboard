export interface CityConfig {
  id: string;
  displayName: string;
  timezone: string;
  lat: number;
  lon: number;
  primaryStation: string;
  metarStations: string[];
  nwpModels: string[];
}

export interface RefreshIntervals {
  metar: number;
  metarHistory: number;
  taf: number;
  nwp: number;
  hourly: number;
}

export const REFRESH_INTERVALS: RefreshIntervals = {
  metar: 30,
  metarHistory: 300,
  taf: 60,
  nwp: 300,
  hourly: 300,
};

export const CITIES: CityConfig[] = [
  {
    id: 'london',
    displayName: 'London',
    timezone: 'Europe/London',
    lat: 51.5074,
    lon: -0.1278,
    primaryStation: 'EGLC',
    metarStations: ['EGLC', 'EGLL', 'EGKB', 'EGWU'],
    nwpModels: [
      'ecmwf_ifs025',
      'gfs_seamless',
      'icon_seamless',
      'ukmo_uk_deterministic_2km',
    ],
  },
  {
    id: 'toronto',
    displayName: 'Toronto',
    timezone: 'America/Toronto',
    lat: 43.6777,
    lon: -79.6248,
    primaryStation: 'CYYZ',
    metarStations: ['CYYZ', 'CYTZ', 'CYHM', 'CYKF', 'CYOO', 'CYSN', 'CYZD', 'CYKZ'],
    nwpModels: [
      'ecmwf_ifs025',
      'gfs_seamless',
      'icon_seamless',
      'gem_seamless',
    ],
  },
];

export const getCityById = (id: string): CityConfig | undefined =>
  CITIES.find((c) => c.id === id);
