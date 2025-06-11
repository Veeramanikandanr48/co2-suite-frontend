export interface ListResponse<T> {
    listData: T[];
    dataCount: number;
}

export interface ListFilter {
    offSet: number;
    limit: number;
    searchInput: string;
    sortField: string;
    sortOrder: number;
    additionalFilter?: Record<string, unknown>;
}

export interface UseFetchListReturn<T> {
    list: T[];
    totalCount: number;
    error: Error | null;
    currentPage: number;
    pageSize: number;
    currentSorting: { field?: string; order?: 'asc' | 'desc' };
    isLoadingMore: boolean;
    hasMore: boolean;
    searchInput: string;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setSearch: (search: string) => void;
    setSorting: (field: string) => void;
    setAdditionalFilter: (filter: Record<string, unknown>) => void;
    loadMore: () => void;
    refetch: () => void;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
}