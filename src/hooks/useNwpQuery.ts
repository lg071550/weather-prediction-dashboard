import { useQuery } from '@tanstack/react-query';
import { fetchAllNwpModels } from '../services/nwpService';
import { REFRESH_INTERVALS } from '../config/cities';

export function useNwpQuery(
  lat: number,
  lon: number,
  timezone: string,
  modelSlugs: string[],
  cityId: string
) {
  return useQuery({
    queryKey: ['nwp', cityId, modelSlugs],
    queryFn: () => fetchAllNwpModels(lat, lon, timezone, modelSlugs),
    refetchInterval: REFRESH_INTERVALS.nwp * 1000,
    staleTime: REFRESH_INTERVALS.nwp * 500,
    retry: 2,
  });
}
