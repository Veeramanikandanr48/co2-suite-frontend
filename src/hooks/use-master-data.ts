import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { MasterItem } from '@/types/master-management.types';

export function useMasterData(type?: string, parentId?: number) {
  const [data, setData] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMasterData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (parentId) params.append('parentId', String(parentId));

      const queryStr = params.toString();
      const url = queryStr ? `${API_LIST.MASTERS_ITEMS}?${queryStr}` : API_LIST.MASTERS_ITEMS;

      const res: any = await apiService.get(url);
      const items = res?.data || res || [];
      setData(items);
    } catch (err: any) {
      console.error(`Failed to fetch master data (type: ${type}):`, err);
      setError(err?.message || 'Failed to load master data');
    } finally {
      setLoading(false);
    }
  }, [type, parentId]);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);

  return { data, loading, error, refetch: fetchMasterData };
}
