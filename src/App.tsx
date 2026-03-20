import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUiStore } from './store/uiStore';
import { CITIES, getCityById } from './config/cities';
import { useCityWeatherData } from './hooks/useCityWeatherData';
import {
  formatRefreshTimeWithAge,
  formatTimeInZone,
} from './lib/time';
import { CityTabs } from './components/tabs/CityTabs';
import { ThemePicker } from './components/common/ThemePicker';
import { NwpModelTable } from './components/panels/NwpModelTable';
import { EnsemblePanel } from './components/panels/EnsemblePanel';
import { MetarTable } from './components/panels/MetarTable';
import { PrimaryStationCard } from './components/panels/PrimaryStationCard';
import { AviationAlerts } from './components/panels/AviationAlerts';
import { HourlyPanel } from './components/panels/HourlyPanel';
import { Hourly24Panel } from './components/panels/Hourly24Panel';
import { MetarDayTempPanel } from './components/panels/MetarDayTempPanel';
import { WindyMapPanel } from './components/panels/WindyMapPanel';

function useLiveMinuteClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timeoutId: number | undefined;

    const scheduleNextTick = () => {
      const msUntilNextMinute = 60_000 - (Date.now() % 60_000);
      timeoutId = window.setTimeout(() => {
        setNow(new Date());
        scheduleNextTick();
      }, msUntilNextMinute);
    };

    scheduleNextTick();

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return now;
}

function CityDashboard() {
  const selectedCityId = useUiStore((s) => s.selectedCityId);
  const city = getCityById(selectedCityId) ?? CITIES[0];
  const now = useLiveMinuteClock();
  const data = useCityWeatherData(city);
  const localTimeLabel = formatTimeInZone(now, city.timezone, 'HH:mm');

  return (
    <div className="space-y-4">
      {/* Feed status bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-surface-700/70 bg-surface-800/55 px-3 py-2 text-xs text-surface-300">
        {Object.entries(data.feeds).map(([name, status]) => (
          <div key={name} className="flex items-center gap-1.5">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                status.isError
                  ? 'bg-danger'
                  : status.isLoading
                    ? 'bg-warning animate-pulse'
                    : 'bg-success'
              }`}
            />
            <span className="uppercase tracking-wider font-semibold text-surface-200">{name}</span>
            <span className="font-mono text-surface-400">
              {formatRefreshTimeWithAge(status.lastRefresh, now)}
            </span>
          </div>
        ))}
        <div
          className="ml-auto inline-flex items-center gap-2 rounded-md border border-surface-600/45 bg-surface-700/35 px-3 py-1 text-surface-300"
          title={`${city.displayName} local time`}
        >
          <span className="uppercase tracking-wider text-[11px] text-surface-400">
            Local
          </span>
          <span className="font-mono text-sm font-semibold text-surface-100">
            {localTimeLabel}
          </span>
        </div>
      </div>

      {/* Panel grid */}
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
        <NwpModelTable
          models={data.nwpModels}
          feedStatus={data.feeds.nwp}
        />
        <EnsemblePanel
          ensemble={data.ensemble}
          feedStatus={data.feeds.nwp}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="space-y-6 xl:col-span-3">
          <PrimaryStationCard
            summary={data.primaryStation}
            feedStatus={data.feeds.metar}
          />
          <MetarTable
            metars={data.metars}
            feedStatus={data.feeds.metar}
          />
        </div>

        <div className="space-y-6 xl:col-span-3">
          <MetarDayTempPanel
            reports={data.primaryDayMetars}
            stationId={city.primaryStation}
            timezone={city.timezone}
            feedStatus={data.feeds.metar}
          />
          <AviationAlerts
            alerts={data.alerts}
            feedStatus={data.feeds.taf}
          />
        </div>

        <div className="space-y-6 xl:col-span-6">
          <Hourly24Panel
            hourly={data.hourly}
            feedStatus={data.feeds.hourly}
            timezone={city.timezone}
            sourceTimezone={city.timezone}
          />
          <HourlyPanel
            hourly={data.hourly}
            feedStatus={data.feeds.hourly}
            timezone={city.timezone}
            sourceTimezone={city.timezone}
          />
        </div>
      </div>

      {/* Windy map */}
      <WindyMapPanel lat={city.lat} lon={city.lon} />
    </div>
  );
}

export default function App() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-surface-900/80 border-b border-surface-700/50">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="weather-logo-badge w-8 h-8 rounded-lg flex items-center justify-center text-surface-50 text-lg">
              ⛅
            </div>
            <div>
              <h1 className="text-lg font-bold text-surface-100 leading-tight">
                Weather Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CityTabs />
            <ThemePicker />
            <button
              onClick={handleRefresh}
              className="glow-accent px-3 py-2 rounded-lg bg-surface-700/50 hover:bg-surface-700 text-surface-300 hover:text-surface-100 text-sm font-medium transition-all duration-200 border border-surface-600/30 hover:border-surface-600 focus-visible:outline-none active:scale-95"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6">
        <CityDashboard />
      </main>
    </div>
  );
}
