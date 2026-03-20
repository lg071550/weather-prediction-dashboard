import { useQuery } from '@tanstack/react-query';
import { fetchTafs } from '../services/tafService';
import { REFRESH_INTERVALS } from '../config/cities';

export function useTafQuery(stations: string[], cityId: string) {
  return useQuery({
    queryKey: ['taf', cityId, stations],
    queryFn: () => fetchTafs(stations),
    refetchInterval: REFRESH_INTERVALS.taf * 1000,
    staleTime: REFRESH_INTERVALS.taf * 500,
    retry: 3,
    retryDelay: 5000,
  });
}
