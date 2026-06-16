import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { qk } from '@/lib/query-keys'

/** The single owner profile (name, timezone, working hours). */
export function useOwner() {
  return useQuery({
    queryKey: qk.owner,
    queryFn: () => api.getOwner(),
  })
}
