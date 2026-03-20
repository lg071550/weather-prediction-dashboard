import { useMemo } from 'react';
import type { CityConfig } from '../config/cities';
import { REFRESH_INTERVALS } from '../config/cities';
import { useMetarQuery } from './useMetarQuery';
import { useTafQuery } from './useTafQuery';
import { useNwpQuery } from './useNwpQuery';
import { useHourlyQuery } from './useHourlyQuery';
import { computeEnsemble, computeSignal } from '../lib/math';
import { dateStrInTz, todayDateStr, parseApiTimestamp } from '../lib/time';
import type {
  MetarReport,
  TafForecast,
  NwpModelForecast,
  HourlyObs,
  EnsembleForecast,
  PrimaryStationSummary,
  AviationAlert,
  FeedStatus,
} from '../types/weather';

export interface CityWeatherData {
  metars: MetarReport[];
  primaryDayMetars: MetarReport[];
  tafs: TafForecast[];
  nwpModels: NwpModelForecast[];
  hourly: HourlyObs[];
  ensemble: EnsembleForecast[];
  primaryStation: PrimaryStationSummary;
  alerts: AviationAlert[];
  feeds: {
    metar: FeedStatus;
    taf: FeedStatus;
    nwp: FeedStatus;
    hourly: FeedStatus;
  };
}

const EMPTY_METARS: MetarReport[] = [];
const EMPTY_TAFS: TafForecast[] = [];
const EMPTY_NWP_MODELS: NwpModelForecast[] = [];
const EMPTY_HOURLY: HourlyObs[] = [];

export function useCityWeatherData(
  city: CityConfig
): CityWeatherData {
  const metarQuery = useMetarQuery(city.metarStations, city.id, {
    hours: 2,
  });
  const primaryHistoryQuery = useMetarQuery(
    [city.primaryStation],
    `${city.id}-history`,
    {
      hours: 24,
      refetchIntervalSeconds: REFRESH_INTERVALS.metarHistory,
    }
  );
  const tafQuery = useTafQuery(city.metarStations, city.id);
  const nwpQuery = useNwpQuery(
    city.lat,
    city.lon,
    city.timezone,
    city.nwpModels,
    city.id
  );
  const hourlyQuery = useHourlyQuery(city.lat, city.lon, city.timezone, city.id);

  const metarHistory = metarQuery.data ?? EMPTY_METARS;
  const primaryHistory = primaryHistoryQuery.data ?? EMPTY_METARS;
  const tafs = tafQuery.data ?? EMPTY_TAFS;
  const nwpModels = nwpQuery.data ?? EMPTY_NWP_MODELS;
  const hourly = hourlyQuery.data ?? EMPTY_HOURLY;
  const cityToday = todayDateStr(city.timezone);

  // Keep METAR table compact: show latest report per station.
  const metars = useMemo(() => {
    const latestByStation = new Map<string, MetarReport>();

    for (const metar of metarHistory) {
      if (!latestByStation.has(metar.stationId)) {
        latestByStation.set(metar.stationId, metar);
      }
    }

    return Array.from(latestByStation.values());
  }, [metarHistory]);

  const primaryStationHistory = useMemo(
    () =>
      primaryHistory.filter((metar) => metar.stationId === city.primaryStation),
    [primaryHistory, city.primaryStation]
  );

  const primaryDayMetars = useMemo(
    () =>
      primaryStationHistory
        .filter(
          (metar) => dateStrInTz(metar.observationTime, city.timezone) === cityToday
        )
        .sort((a, b) => safeEpochMs(a.observationTime) - safeEpochMs(b.observationTime)),
    [primaryStationHistory, city.timezone, cityToday]
  );

  const ensemble = useMemo(() => computeEnsemble(nwpModels), [nwpModels]);

  // All aviation alerts from TAFs
  const alerts = useMemo(
    () => tafs.flatMap((t) => t.alerts),
    [tafs]
  );

  // Primary station summary
  const primaryStation = useMemo((): PrimaryStationSummary => {
    // For current conditions, use the metarHistory (recent list)
    const stationMetars = metarHistory.filter(
      (m) => m.stationId === city.primaryStation
    );
    const latestReport = stationMetars[0] ?? null;

    // Observed high for today
    const todayTemps = primaryStationHistory
      .filter(
        (metar) =>
          dateStrInTz(metar.observationTime, city.timezone) === cityToday
      )
      .map((m) => m.tempC)
      .filter((t): t is number => t != null);

    const observedHighC =
      todayTemps.length > 0 ? Math.max(...todayTemps) : (latestReport?.tempC ?? null);

    const todayEnsemble = ensemble.find((e) => e.date === cityToday);
    const todayWeightedTmax = todayEnsemble?.weightedTmax ?? null;

    const signal = computeSignal(observedHighC, todayWeightedTmax);

    return {
      stationId: city.primaryStation,
      latestReport,
      observedHighC,
      signal,
      todayWeightedTmax,
    };
  }, [
    metarHistory,
    primaryStationHistory,
    ensemble,
    city.primaryStation,
    city.timezone,
    cityToday,
  ]);

  const feeds = {
    metar: {
      lastRefresh: metarQuery.dataUpdatedAt
        ? new Date(metarQuery.dataUpdatedAt)
        : null,
      isLoading: metarQuery.isLoading,
      isError: metarQuery.isError,
      errorMessage: metarQuery.error?.message ?? null,
    },
    taf: {
      lastRefresh: tafQuery.dataUpdatedAt
        ? new Date(tafQuery.dataUpdatedAt)
        : null,
      isLoading: tafQuery.isLoading,
      isError: tafQuery.isError,
      errorMessage: tafQuery.error?.message ?? null,
    },
    nwp: {
      lastRefresh: nwpQuery.dataUpdatedAt
        ? new Date(nwpQuery.dataUpdatedAt)
        : null,
      isLoading: nwpQuery.isLoading,
      isError: nwpQuery.isError,
      errorMessage: nwpQuery.error?.message ?? null,
    },
    hourly: {
      lastRefresh: hourlyQuery.dataUpdatedAt
        ? new Date(hourlyQuery.dataUpdatedAt)
        : null,
      isLoading: hourlyQuery.isLoading,
      isError: hourlyQuery.isError,
      errorMessage: hourlyQuery.error?.message ?? null,
    },
  };

  return {
    metars,
    primaryDayMetars,
    tafs,
    nwpModels,
    hourly,
    ensemble,
    primaryStation,
    alerts,
    feeds,
  };
}

function safeEpochMs(isoTime: string): number {
  const parsed = parseApiTimestamp(isoTime);
  return parsed ? parsed.getTime() : 0;
}
