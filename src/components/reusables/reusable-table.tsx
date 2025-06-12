import { useReactTable, getCoreRowModel, flexRender, getSortedRowModel, SortingState, ColumnDef } from "@tanstack/react-table";
import { useRef, useCallback, useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const SCROLL_THRESHOLD = 50; // Distance from bottom to trigger load more
const DEBOUNCE_DELAY = 200; // Debounce delay in milliseconds

interface ReusableTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    isLoadingMore: boolean;
    handleLoadMore: () => void;
    onRowClick?: (id: string) => void;
    tableHeight?: string;
}

export function ReusableTable<T extends { id: string }>({
    data,
    columns,
    isLoadingMore,
    handleLoadMore,
    onRowClick,
    tableHeight = "calc(100vh - 210px)"
}: Readonly<ReusableTableProps<T>>) {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const isFetchingRef = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const checkIfNearBottom = useCallback(() => {
        if (!container || isLoadingMore || isFetchingRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
        
        if (distanceFromBottom <= SCROLL_THRESHOLD) {
            isFetchingRef.current = true;
            handleLoadMore();
            
            setTimeout(() => {
                isFetchingRef.current = false;
            }, DEBOUNCE_DELAY);
        }
    }, [container, handleLoadMore, isLoadingMore]);

    useEffect(() => {
        if (!container) return;

        const handleScroll = () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }

            scrollTimeoutRef.current = setTimeout(() => {
                requestAnimationFrame(checkIfNearBottom);
            }, DEBOUNCE_DELAY);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [container, checkIfNearBottom]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: { sorting },
        manualSorting: true,
    });

    const handleRowClick = (id: string) => {
        if (onRowClick) {
            onRowClick(id);
        }
    };

    return (
        <div className="flex flex-col rounded-none overflow-hidden" style={{ height: tableHeight }}>
            <div className="w-full">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow 
                                key={headerGroup.id} 
                                className="h-11 bg-light-500"
                            >
                                {headerGroup.headers.map(header => (
                                    <TableHead 
                                        key={header.id} 
                                        className="px-5 py-3"
                                        style={{ 
                                            width: `${header.column.getSize()}px`,
                                            minWidth: `${header.column.getSize()}px`,
                                            maxWidth: `${header.column.getSize()}px`
                                        }}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>     
                        ))}
                    </TableHeader>
                </Table>
            </div>
            <div 
                ref={setContainer}
                className="flex-1 overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
            >
                <Table>
                    <TableBody>
                        {table.getRowModel().rows.map((row, index) => (
                            <TableRow 
                                key={row.id} 
                                className={`h-[73px] border-b border-gray-200 ${
                                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                } ${onRowClick ? 'cursor-pointer' : ''} hover:bg-light-600`}
                                onClick={() => onRowClick && handleRowClick(row.original.id)}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <TableCell  
                                        key={cell.id} 
                                        className={`${
                                            cell.column.id === 'actions' 
                                                ? 'p-0 h-full' 
                                                : 'py-4 px-3 gap-2.5'
                                        }`}
                                        style={{ 
                                            width: `${cell.column.getSize()}px`,
                                            minWidth: `${cell.column.getSize()}px`,
                                            maxWidth: `${cell.column.getSize()}px`
                                        }}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {isLoadingMore && (
                            <TableRow>
                                <TableCell 
                                    colSpan={columns.length} 
                                    className="h-24 text-center text-gray-500"
                                >
                                    Loading more...
                                </TableCell>
                            </TableRow>
                        )}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell 
                                    colSpan={columns.length} 
                                    className="h-24 text-center text-gray-500"
                                >
                                    No data found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 