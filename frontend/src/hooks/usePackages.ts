import { useQuery } from '@tanstack/react-query';
import { packageService } from '../api/services/packages';

export function usePackages() {
  return useQuery({
    queryKey: ['packages'],
    queryFn: packageService.getPackages,
  });
}
