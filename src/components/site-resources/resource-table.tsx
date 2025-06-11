import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { MoreVertical, Download, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import siteResource from "@/components/test-ids/site-resource.ids"
import type { TableResourceItem } from "~/types/resource"

interface ResourceTableColumnsProps {
  handlePdfClick: (resource: TableResourceItem) => void
  handleDownload: (resource: TableResourceItem) => void
  handleDeleteClick: (id: string) => void
  capitalize: (str?: string | null) => string
}

export const getResourceTableColumns = ({
  handlePdfClick,
  handleDownload,
  handleDeleteClick,
}: ResourceTableColumnsProps): ColumnDef<TableResourceItem>[] => [
  {
    id: "docNo",
    header: () => <div className="text-center text-sm font-medium text-neutral-400">Doc no.</div>,
    size: 52,
    cell: ({ row }) => <div className="text-center text-xs font-normal text-header-secondary" data-testid={siteResource.docNo}>{row.index + 1}</div>,
  },
  {
    accessorKey: "resourceName",
    header: () => <div className="text-left text-sm font-medium text-neutral-400" data-testid={siteResource.docName}>Doc name</div>,
    size: 185,
    cell: ({ row }) => <div className="text-left text-xs text-header-secondary font-normal pl-2 break-words max-w-[200px] line-clamp-1" data-testid={siteResource.docName}>{(row.original.resourceName)}</div>,
  },
  {
    accessorKey: "description",
    header: () => <div className="text-left text-sm font-medium text-neutral-400" data-testid={siteResource.details}>Details</div>,
    size: 241,
    cell: ({ row }) => <div className="text-left text-header-secondary text-xs font-normal pl-2 break-words max-w-[400px] line-clamp-3" data-testid={siteResource.details}>{(row.original.description) || '-'}</div>,
  },
  {
    accessorKey: "tags",
    header: () => <div className="text-left text-sm font-medium text-neutral-400" data-testid={siteResource.tags}>Tags</div>,
    size: 163,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-2 pl-2" data-testid={`${siteResource.tags}-${row.original.id}`}>
        {Array.isArray(row.original.tags) && row.original.tags.length > 0 ? (
          row.original.tags.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="text-left bg-gray-200 text-gray-700 px-3 py-1.5 text-input-label rounded-lg text-[10px] font-normal break-words max-w-[200px] uppercase line-clamp-2"
            >
              {(tag)}
            </span>
          ))
        ) : (
          <span className="text-gray-400 text-xs font-normal">No tags</span>
        )}
      </div>
    ),
  },
  {
    id: "link",
    header: () => <div className="text-left text-sm font-medium text-neutral-400">Link</div>,
    size: 96,
    cell: ({ row }) => (
      <div className="text-left text-xs font-semibold pl-4">
        {row.original.displayName ? (
          <button
            className="text-left text-primary-500 underline text-xs font-bold break-words max-w-[200px] line-clamp-1"
            onClick={() => handlePdfClick(row.original)}
          >
            {row.original.displayName ?? 'View File'}
          </button>
        ) : (
          <span className="text-gray-400 text-xs font-normal">No file</span>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center text-sm font-medium text-neutral-400"></div>,
    size: 86,
    cell: ({ row }) => (
      <div className="text-center text-xs font-normal pl-8 ">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`${siteResource.moreOptionsButton}-${row.original.id}`} className="hover:bg-transparent">
              <MoreVertical className="h-4 w-4 text-neutral-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[114px] border border-gray-200 bg-white p-0 rounded-none"
            data-testid={`${siteResource.moreOptionsMenu}-${row.original.id}`}
          >
            <button
              onClick={() => handleDownload(row.original)}
              className="flex items-center cursor-pointer px-3 py-2 text-xs font-normal text-text-primary gap-2 border-b border-gray-200 rounded-none h-[38px] w-full "
              data-testid={`${siteResource.downloadButton}-${row.original.id}`}
            >
              <Download className="h-[16px] w-[16px]" stroke="var(--header-secondary)" />
              Download
            </button>
            <DropdownMenuItem
              onClick={() => handleDeleteClick(row.original.id)}
              className="flex items-center cursor-pointer px-3 py-2 text-xs font-normal text-text-primary gap-2 rounded-none h-[38px] data-[highlighted]:bg-transparent data-[highlighted]:text-text-primary "
              data-testid={`${siteResource.deleteButton}-${row.original.id}`}
            >
              <Trash className="h-[16px] w-[16px]" stroke="var(--header-secondary)" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
] 