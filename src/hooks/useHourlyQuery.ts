import { useQuery } from '@tanstack/react-query';
import { fetchHourly } from '../services/hourlyService';
import { REFRESH_INTERVALS } from '../config/cities';

export function useHourlyQuery(
  lat: number,
  lon: number,
  timezone: string,
  cityId: string
) {
  return useQuery({
    queryKey: ['hourly', cityId],
    queryFn: () => fetchHourly(lat, lon, timezone),
    refetchInterval: REFRESH_INTERVALS.hourly * 1000,
    staleTime: REFRESH_INTERVALS.hourly * 500,
    retry: 2,
  });
}
