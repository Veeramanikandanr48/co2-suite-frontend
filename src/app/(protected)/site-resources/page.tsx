"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Filter from "~/components/svg/filter"
import Upload from "~/components/svg/fileUpload"
import { Button } from "@/components/ui/button"
import UploadFileModal from "@/components/site-resources/upload-file-popup"
import FilterDropdown from "@/components/site-resources/filter-dropdown"
import type { ResourceData, UploadResponse, ResourceFileResponse } from "@/types/resource"
import { apiService } from "@/lib/api-service"
import { API_LIST } from "@/lib/api-list"
import { AxiosError, type AxiosRequestConfig } from "axios"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"
import type { ResourceItem } from "~/types/resource"
import { useFetchList } from "~/hooks/use-fetchlist"
import { ReusableTable } from "~/components/reusables/form-fields/reusable-table"
import PdfViewerModal from "@/components/site-resources/pdf-viewer"
import { EAdditionalFieldError, ResourceType } from "~/enums/base-enum"
import SearchBar from "@/components/reusables/form-fields/search-bar"
import { CustomAxiosResponse } from "@/types"
import { DeleteDialog } from "@/components/reusables/dialogs/delete"
import siteResource from "@/components/test-ids/site-resource.ids"
import { getResourceTableColumns } from "@/components/site-resources/resource-table"
import { SubheadingDivider } from "@/components/reusables/form-fields/sub-heading"
import { useLoader } from "@/context/loader-context";

const ITEMS_PER_LOAD = 10

// Create a new interface for table items
interface TableResourceItem {
  id: string
  resourceName: string
  description: string
  tags: string[]
  displayName?: string
  fileType?: string
}

// Helper function to convert TableResourceItem to ResourceItem
const convertToResourceItem = (item: TableResourceItem): ResourceItem => ({
  ...item,
  id: parseInt(item.id, 10),
  fileType: item.fileType ?? 'application/octet-stream', // Provide a default file type if not present
  displayName: item.displayName ?? item.resourceName // Use resourceName as fallback for displayName
})

export default function SiteResourcesPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [selectedPdf, setSelectedPdf] = useState<TableResourceItem | null>(null)
  const {
    list: resources,
    isLoadingMore,
    loadMore,
    refetch,
    setAdditionalFilter,
    setSearch,
    isLoading,
    setIsLoading
  } = useFetchList<ResourceItem>(API_LIST.GET_ALL_SITE_RESOURCES, {
    limit: ITEMS_PER_LOAD,
    additionalFilter: {
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    },
  })

  const { showLoader, hideLoader } = useLoader();

  // Convert resources to match ReusableTable's type requirements
  const tableResources: TableResourceItem[] = resources?.map(resource => ({
    ...resource,
    id: resource.id?.toString(),
  }))

  const handleUploadFile = async (newResource: ResourceData & { file?: File }): Promise<EAdditionalFieldError | undefined> => {
    try { 
      setIsLoading(true)
      const formData = new FormData()      
      if (!newResource.file) {
        throw new Error('File is required')
      }
      const imageFile = new File([newResource.file], newResource.file.name, {
        type: "image/png" 
      })
      
      formData.append("file", imageFile)
      if (!newResource.resourceName) {
        throw new Error('Resource name is required')
      }
      formData.append('resourceName', newResource.resourceName)
      if (newResource.description) {
        formData.append('description', newResource.description)
      }
      if (newResource.tags && newResource.tags.length > 0) {
        newResource.tags.forEach(tag => {
          formData.append('tags[]', tag)
        })
      }
      const response: CustomAxiosResponse<UploadResponse> = await apiService.post(
        API_LIST.UPLOAD_SITE_RESOURCE, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-Skip-Toast': 'false'
          },
        }
      )
      refetch()
      if(response?.success){
        setShowUploadModal(false)
      }
      return undefined
    } 
    catch (error) {
      if(error instanceof AxiosError){
        const errorMessage: EAdditionalFieldError | undefined = 
        (error.response?.data as { additionalContext?: EAdditionalFieldError })?.additionalContext ?? undefined;
        return errorMessage;
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleDeleteClick = (id: string) => {
    setResourceToDelete(id)
    setDeleteModalOpen(true)
    setPdfViewerOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return

    try {
      setIsLoading(true)
      await apiService.put(API_LIST.DELETE_SITE_RESOURCE, resourceToDelete, undefined, {
        headers: {
          'X-Skip-Toast': 'false'
        }
      })
      setDeleteModalOpen(false)
      setResourceToDelete(null)
      refetch()
    } catch {
    } finally {
      setIsLoading(false)
    }
  }
    
  const handlePdfClick = (resource: TableResourceItem) => {
    setSelectedPdf(resource)
    setPdfViewerOpen(true)
  }

  const handleDownload = (resource: TableResourceItem) => {
    void (async () => {
      try {
        setIsLoading(true)
        const response = await apiService.get<ResourceFileResponse>(
          `${API_LIST.GET_SITE_RESOURCE_FILE}/${ResourceType.SITE_RESOURCE}/${resource.id}`,
          undefined,
          {
            headers: {
              'X-Skip-Toast': 'false'
            }
          } as AxiosRequestConfig
        )

        const bufferData = new Uint8Array(response?.data?.buffer?.data)
        const blob = new Blob([bufferData], { type: resource.fileType })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = resource.resourceName ?? 'downloaded_file'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch {
      } finally {
        setIsLoading(false)
      }
    })()
  }

  const handleFilterChange = (tags: string[]) => {
    setSelectedTags(tags)
    setAdditionalFilter({
      tags: tags.length > 0 ? tags : undefined,
    })
  }

  const handleClearAll = () => {
    setSelectedTags([])
    setAdditionalFilter({
      tags: undefined,
    })
  }
  const capitalize = (str?: string | null): string =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

  const columns = getResourceTableColumns({
    handlePdfClick,
    handleDownload,
    handleDeleteClick,
    capitalize,
  })

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  return (
    <div className="mx-[2px]">
      {/* Row for Heading */}
        <SubheadingDivider >
          Site Resources
        </SubheadingDivider>

      <div className="flex justify-between items-start my-2 px-0">
        <div className="flex flex-col items-start gap-2">
          <Button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="bg-primary-500 text-white h-[38px] w-[130px] px-4 rounded-sm flex items-center gap-2 cursor-pointer"
            data-testid={siteResource.uploadButton}
          >
            <Upload className="h-5 w-5"/> Upload File
          </Button>
          <p className="text-input-placeholder text-xs font-normal my-2 ">
            **Disclaimer: These resources have not been evaluated or approved by the FDA.
          </p>
        </div>

        <div className="flex items-center gap-2 justify-end relative">
          <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`border h-[30px] w-[32px] rounded-lg ${
                  isFilterOpen || selectedTags.length > 0
                    ? "bg-[#1454CC80] border-primary text-primary hover:bg-[#1454CC80]"
                    : "text-gray-600 bg-white border-neutral-300 hover:bg-white hover:text-gray-600"
                } relative`}
                data-testid={siteResource.filterButton}
              >
                <Filter 
                  className="h-4 w-4" 
                  stroke={isFilterOpen || selectedTags.length > 0 ? "var(--primary)" : "var(--neutral-500)"} 
                />
                {selectedTags.length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-blue-100 text-blue-600 rounded-sm h-4 w-4 flex items-center justify-center text-xs font-medium">
                    {selectedTags.length}
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="p-0 bg-transparent border-none shadow-none"
              align="end"
              sideOffset={8}
              data-testid={siteResource.filterDropdownModal}
            >
              <FilterDropdown
                selectedTags={selectedTags}
                onTagsChange={handleFilterChange}
                onClose={() => setIsFilterOpen(false)}
                handleClearAll={handleClearAll}
              />
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="relative">
            <SearchBar
              placeholder="Search Doc name"
              onSearch={setSearch}
              className="text-sm rounded-lg bg-white placeholder:italic placeholder:text-input-placeholder placeholder:text-xs placeholder:font-normal font-normal text-input-label"
              data-testid={siteResource.searchInput}
            />
          </div>
        </div>
      </div>

      <div className="bg-white border-gray-200 overflow-hidden">
        <ReusableTable
          data={tableResources}
          columns={columns}
          isLoadingMore={isLoadingMore}
          handleLoadMore={loadMore}
          tableHeight="calc(100vh - 212px)"
        />
      </div>

      {showUploadModal && (
        <UploadFileModal 
          onClose={() => setShowUploadModal(false)} 
          onUpload={handleUploadFile}
          data-testid={siteResource.uploadModal}
        />
      )}


      <DeleteDialog
        open={deleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        title={`Delete Resource?`}
        message={`Deleting a site resource cannot be undone.`}
        data-testid={siteResource.deleteConfirmationModal}
      />

      {pdfViewerOpen && selectedPdf && (
        <PdfViewerModal 
          resource={convertToResourceItem(selectedPdf)} 
          onClose={() => setPdfViewerOpen(false)} 
          data-testid={siteResource.pdfViewerModal}
        />
      )}
    </div>
  )
}