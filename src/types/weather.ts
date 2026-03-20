/* ---- METAR ---- */
export interface MetarReport {
  stationId: string;
  observationTime: string;   // ISO 8601
  ageMinutes: number;
  tempC: number | null;
  dewpointC: number | null;
  windDir: number | null;
  windSpeedKt: number | null;
  windGustKt: number | null;
  visibility: string | null;
  altimeterHpa: number | null;
  flightCategory: string | null;
  wxString: string | null;
  clouds: CloudLayer[];
  rawOb: string;
}

export interface CloudLayer {
  cover: string;
  base: number | null;
}

/* ---- TAF ---- */
export interface TafForecast {
  stationId: string;
  issueTime: string;
  rawTaf: string;
  ageMinutes: number;
  alerts: AviationAlert[];
}

export interface AviationAlert {
  stationId: string;
  label: string;         // e.g. "LOW CEILING", "LOW VIS", "GUSTY", "WX"
  detail: string;
  timeWindow: string;    // Human-readable (e.g. 12:00 PM - 3:00 PM)
  timeStart: string;     // ISO string for filtering
  timeEnd: string;       // ISO string for filtering
  severity: 'warning' | 'caution' | 'info';
  changeType: string;    // BASE / TEMPO / BECMG / PROB30 etc.
}

/* ---- NWP (daily) ---- */
export interface NwpModelForecast {
  modelSlug: string;
  modelDisplayName: string;
  dailyForecasts: DailyForecast[];
}

export interface DailyForecast {
  date: string;           // YYYY-MM-DD
  tmaxC: number | null;
  tminC: number | null;
}

/* ---- Ensemble / Consensus ---- */
export interface EnsembleForecast {
  date: string;
  weightedTmax: number | null;
  spread: number;
  sigma: number;
  modelsAgree: boolean;
  modelCount: number;
  deltaFromPrevious: number | null;
  changedSincePrevious: boolean;
}

/* ---- Hourly ---- */
export interface HourlyObs {
  time: string;             // ISO 8601
  tempC: number | null;
  precipMm: number | null;
  windSpeedKmh: number | null;
  cloudCoverPct: number | null;
}

/* ---- Primary Station Summary ---- */
export type Signal = 'Warmer than expected' | 'As expected' | 'Cooler than expected';

export interface PrimaryStationSummary {
  stationId: string;
  latestReport: MetarReport | null;
  observedHighC: number | null;
  signal: Signal | null;
  todayWeightedTmax: number | null;
}

/* ---- Feed status ---- */
export interface FeedStatus {
  lastRefresh: Date | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
}
