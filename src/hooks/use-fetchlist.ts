import { useState, useEffect, useCallback } from 'react';
import { apiService } from '~/lib/api-service';
import { ListResponse, ListFilter, UseFetchListReturn } from '~/types/fetch';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_FILTER: ListFilter = {
  offSet: 0,
  limit: DEFAULT_PAGE_SIZE,
  searchInput: '',
  sortField: '',
  sortOrder: -1,
  additionalFilter: {}
};

export function useFetchList<T>(
  endpoint: string,
  initialFilter: Partial<ListFilter> = {}
): UseFetchListReturn<T> {
  const [filter, setFilter] = useState<ListFilter>({
    ...DEFAULT_FILTER,
    ...initialFilter
  });
  const [list, setList] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentSorting, setCurrentSorting] = useState<{ 
    field?: string; 
    order?: 'asc' | 'desc' 
  }>({});

  const fetchList = useCallback(async (append = false) => {
    try {
      if (!append) setIsLoading(true);
      
      // Normalize the search input before sending to API
      const normalizedFilter = {
        ...filter,
        searchInput: filter.searchInput.trim().replace(/\s+/g, ' ')
      };
      
      const response = await apiService.post(endpoint, normalizedFilter) as { data: ListResponse<T> };
      if (response?.data) {
        const newItems = response.data.listData;
        if (append) {
          setList(prev => [...prev, ...newItems]);
        } else {
          setList(newItems);
        }
        setTotalCount(response.data.dataCount);
        setHasMore(newItems.length === filter.limit);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [endpoint, filter]);

  const refetch = ()=> {
    setFilter(prev => ({
      ...prev,
      offSet: 0
    }));
    setList([]);
    setTotalCount(0);
    setHasMore(true);
    setError(null);
    setCurrentSorting({});
  };

  const setPage = useCallback((page: number) => {
    setFilter(prev => ({
      ...prev,
      offSet: (page - 1) * prev.limit
    }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setFilter(prev => ({
      ...prev,
      limit: size,
      offSet: 0
    }));
  }, []);

  const setSearch = useCallback((search: string) => {
    // Normalize search input before setting it in the filter
    const normalizedSearch = search.trim().replace(/\s+/g, ' ');
    
    setFilter(prev => ({
      ...prev,
      searchInput: normalizedSearch,
      offSet: 0
    }));
    setList([]);
    setHasMore(true);
  }, []);

  const setSorting = useCallback((field: string) => {
    let newOrder: 'asc' | 'desc';
    if (currentSorting.field === field) {
      newOrder = currentSorting.order === 'asc' ? 'desc' : 'asc';
    } else {
      newOrder = 'asc';
    }

    setCurrentSorting({
      field,
      order: newOrder
    });

    setFilter(prev => ({
      ...prev,
      sortField: field,
      sortOrder: newOrder === 'asc' ? 1 : -1,
      offSet: 0
    }));
    setList([]);
    setHasMore(true);
  }, [currentSorting]);

  const setAdditionalFilter = useCallback((additionalFilter: Record<string, unknown>) => {
    setFilter(prev => ({
      ...prev,
      additionalFilter,
      offSet: 0
    }));
    setList([]);
    setHasMore(true);
  }, []);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    setFilter(prev => ({
      ...prev,
      offSet: prev.offSet + prev.limit
    }));
  }, [hasMore, isLoadingMore]);

  useEffect(() => {
    const isInitialLoad = filter.offSet === 0;
    fetchList(!isInitialLoad);
  }, [filter, fetchList]);

  return {
    list,
    totalCount,
    error,
    currentPage: Math.floor(filter.offSet / filter.limit) + 1,
    pageSize: filter.limit,
    currentSorting,
    isLoadingMore,
    hasMore,
    searchInput: filter.searchInput,
    setPage,
    setPageSize,
    setSearch,
    setSorting,
    setAdditionalFilter,
    loadMore,
    refetch,
    isLoading,
    setIsLoading
  };
}