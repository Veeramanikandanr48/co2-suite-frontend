import { useReactTable, getCoreRowModel, flexRender, getSortedRowModel, SortingState, ColumnDef } from "@tanstack/react-table";
import { useRef, useCallback, useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const SCROLL_THRESHOLD = 50; // Distance from bottom to trigger load more
const DEBOUNCE_DELAY = 200; // Debounce delay in milliseconds

interface ReusableTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    isLoadingMore: boolean;
    hasMore?: boolean;
    handleLoadMore: () => void;
    onRowClick?: (id: string | number) => void;
    tableHeight?: string;
    rowHeight?: string;
}

export function ReusableTable<T extends { id: string | number }>({
    data,
    columns,
    isLoadingMore,
    hasMore,
    handleLoadMore,
    onRowClick,
    tableHeight = "calc(100vh - 210px)",
    rowHeight = "h-[52px]"
}: Readonly<ReusableTableProps<T>>) {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    const [sorting, setSorting] = useState<SortingState>([]);
    const isFetchingRef = useRef(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const checkIfNearBottom = useCallback(() => {
        if (!container || isLoadingMore || isFetchingRef.current || hasMore === false) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        if (scrollHeight <= clientHeight) return;

        const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
        
        if (distanceFromBottom <= SCROLL_THRESHOLD) {
            isFetchingRef.current = true;
            handleLoadMore();
            
            setTimeout(() => {
                isFetchingRef.current = false;
            }, DEBOUNCE_DELAY);
        }
    }, [container, handleLoadMore, isLoadingMore, hasMore]);

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
        defaultColumn: {
            size: 100,
            minSize: 40,
            maxSize: 250,
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: { sorting },
        manualSorting: true,
    });

    const handleRowClick = (id: string | number) => {
        if (onRowClick) {
            onRowClick(id);
        }
    };

    const containerStyle = tableHeight === "auto" ? {} : { height: tableHeight, maxHeight: tableHeight };

    return (
        <div 
            ref={setContainer}
            className="w-full overflow-auto rounded-xl border border-border shadow-xs scrollbar-custom"
            style={containerStyle}
        >
            <Table className="w-full text-left border-collapse text-xs min-w-full">
                <TableHeader className="sticky top-0 z-10 bg-muted/60 shadow-xs">
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow 
                            key={headerGroup.id} 
                            className="h-10 bg-muted/60 border-b border-border"
                        >
                            {headerGroup.headers.map(header => (
                                <TableHead 
                                    key={header.id} 
                                    className="sticky top-0 z-10 bg-muted/60 px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                                    style={{ 
                                        width: header.column.getSize() ? `${header.column.getSize()}px` : undefined,
                                    }}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>     
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map((row, index) => (
                        <TableRow 
                            key={row.id} 
                            className={`${rowHeight} border-b border-border/50 ${
                                index % 2 === 0 ? 'bg-card' : 'bg-muted/20'
                            } ${onRowClick ? 'cursor-pointer' : ''} hover:bg-muted/50 transition-colors`}
                            onClick={() => onRowClick && handleRowClick(row.original.id)}
                        >
                            {row.getVisibleCells().map(cell => (
                                <TableCell  
                                    key={cell.id} 
                                    className={`${
                                        cell.column.id === 'actions' 
                                            ? 'py-2 px-4 h-full' 
                                            : 'py-2.5 px-4 gap-2 text-xs whitespace-nowrap'
                                    }`}
                                    style={{ 
                                        width: cell.column.getSize() ? `${cell.column.getSize()}px` : undefined,
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
                                className="h-16 text-center text-neutral-500 text-xs"
                            >
                                Loading more...
                            </TableCell>
                        </TableRow>
                    )}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell 
                                colSpan={columns.length} 
                                className="h-16 text-center text-neutral-500 text-xs"
                            >
                                No data found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
} 