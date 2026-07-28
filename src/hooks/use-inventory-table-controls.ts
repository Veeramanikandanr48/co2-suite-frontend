import { useState, useCallback, useEffect } from 'react';
import { apiService } from '@/lib/api-service';
import { API_LIST } from '@/lib/api-list';

export function useInventoryTableControls<T>(category: string) {
  const [items, setItems] = useState<T[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterFacility, setFilterFacility] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchInventoryEntries = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        category,
        page: String(currentPage),
        limit: String(pageSize),
      };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filterFacility) params.facility = filterFacility;
      if (filterStatus) params.status = filterStatus;
      if (sortField) {
        params.sortField = sortField;
        params.sortOrder = sortOrder.toUpperCase();
      }

      const response = await apiService.get<any>(API_LIST.INVENTORY_ENTRIES, params);
      const data = (response as any)?.data ?? response;

      if (data && typeof data === 'object' && 'items' in data) {
        setItems(Array.isArray(data.items) ? data.items : []);
        setTotalRecords(data.totalRecords || 0);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setItems(data);
        setTotalRecords(data.length);
        setTotalPages(1);
      } else {
        setItems([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch inventory entries from DB:', error);
      setItems([]);
      setTotalRecords(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [category, currentPage, pageSize, searchTerm, filterFacility, filterStatus, sortField, sortOrder]);

  useEffect(() => {
    fetchInventoryEntries();
  }, [fetchInventoryEntries]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterFacility('');
    setFilterStatus('');
    setSortField(null);
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return {
    items,
    loading,
    totalRecords,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize: (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
    },
    searchTerm,
    setSearchTerm: (term: string) => {
      setSearchTerm(term);
      setCurrentPage(1);
    },
    filterFacility,
    setFilterFacility: (fac: string) => {
      setFilterFacility(fac);
      setCurrentPage(1);
    },
    filterStatus,
    setFilterStatus: (stat: string) => {
      setFilterStatus(stat);
      setCurrentPage(1);
    },
    sortField,
    sortOrder,
    handleSort,
    clearAllFilters,
    startRecord,
    endRecord,
    refetch: fetchInventoryEntries,
  };
}

