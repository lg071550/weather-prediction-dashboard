import { useQuery } from '@tanstack/react-query';
import { fetchMetars } from '../services/metarService';
import { REFRESH_INTERVALS } from '../config/cities';

interface UseMetarQueryOptions {
  hours?: number;
  refetchIntervalSeconds?: number;
}

export function useMetarQuery(
  stations: string[],
  cityId: string,
  options: UseMetarQueryOptions = {}
) {
  const hours = options.hours ?? 2;
  const refetchIntervalSeconds =
    options.refetchIntervalSeconds ?? REFRESH_INTERVALS.metar;

  return useQuery({
    queryKey: ['metar', cityId, stations, hours],
    queryFn: () => fetchMetars(stations, hours),
    refetchInterval: refetchIntervalSeconds * 1000,
    staleTime: refetchIntervalSeconds * 500,
    retry: 3,
    retryDelay: 5000,
  });
}
