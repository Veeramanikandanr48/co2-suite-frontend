"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { apiService } from "@/lib/api-service"
import { API_LIST } from "@/lib/api-list"
import { SiteResource, GetSiteResourceResponse } from "@/types/resource"
import { CustomAxiosResponse } from "@/types"
import siteResource from "@/components/test-ids/site-resource.ids"
import { useLoader } from "@/context/loader-context";

interface FilterDropdownProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  onClose: () => void
  handleClearAll: () => void
}

const processResourceTags = (resources: SiteResource[]): string[] => {
  const tagMap: Map<string, string> = new Map<string, string>();
  
  resources.forEach((resource: SiteResource) => {
    if (!resource.tags || !Array.isArray(resource.tags)) return;
    
    resource.tags.forEach((tag: string) => {
      const lowerTag = tag.toLowerCase();
      if (!tagMap.has(lowerTag)) {
        tagMap.set(lowerTag, tag);
      }
    });
  });
  
  return Array.from(tagMap.values()).toSorted((a, b) => a.localeCompare(b));
};

export default function FilterDropdown({
  selectedTags,
  onTagsChange,
  onClose,
  handleClearAll,
}: Readonly<FilterDropdownProps>) {
  const [localSelectedTags, setLocalSelectedTags] = useState<string[]>(selectedTags)
  const [availableTags, setAvailableTags] = useState<string[]>()
  const { showLoader, hideLoader } = useLoader();
  const [isLoading, setIsLoading] = useState(false)

  const fetchAllTags = useCallback(async () => {
    try {
      setIsLoading(true)
      const filter = {
        searchInput: '',
        sortField: '',
        sortOrder: -1,
        additionalFilter: {
        }
      };

      const response: CustomAxiosResponse<GetSiteResourceResponse> = await apiService.post(API_LIST.GET_ALL_SITE_RESOURCES, filter, {
        params: {
          getAllTags: true
        }
      });
      
      if (response?.data?.listData) {
        const uniqueTags: string[] = processResourceTags(response.data.listData);
        const sortedTags: string[] = [...uniqueTags].toSorted((a, b) => a.localeCompare(b));
        setAvailableTags(sortedTags);
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, []);

  useEffect(() => {
    setLocalSelectedTags(selectedTags)
  }, [selectedTags])

  useEffect(() => {
    fetchAllTags()
  }, [fetchAllTags])

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  const handleTagToggle = (tag: string) => {
    setLocalSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag)
      }
      return [...prev, tag]
    })
  }

  const handleLocalClear = () => {
    setLocalSelectedTags([])
  }

  const handleDone = () => {
    if (localSelectedTags.length === 0) {
      handleClearAll()
    }
    onTagsChange(localSelectedTags)
    onClose()
  }


  return (
    <div className="bg-white rounded-lg shadow-lg border border-neutral-100 w-[250px] h-[200px] flex flex-col" data-testid={siteResource.filterDropdown}>
      <div className="flex-1 overflow-y-auto divide-y 
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-thumb]:rounded-full 
          [&::-webkit-scrollbar-track]:bg-gray-100 
          [&::-webkit-scrollbar-thumb]:bg-gray-300 
          hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
      {availableTags?.map((tag) => (
            <div key={tag} className="p-4 flex items-center font-normal text-lg">
              <Checkbox
                id={`tag-${tag}`}
                checked={localSelectedTags.includes(tag)}
                onCheckedChange={() => handleTagToggle(tag)}
                className="text-white mr-3 border border-gray-500 shadow-sm"
              />
              <Label htmlFor={`tag-${tag}`} className="cursor-pointer text-xs font-normal uppercase max-w-[120px] overflow-hidden break-words line-clamp-1" data-testid={`${siteResource.tagLabel}-${tag}`}>
                {tag}
              </Label>
            </div>
        ))}
      </div>
      <div className="flex justify-end gap-8 items-center px-6 py-2 rounded-b-lg bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLocalClear}
          className="font-normal text-base text-gray-500 px-0 hover:bg-transparent hover:text-gray-500"
          disabled={localSelectedTags.length === 0}
          data-testid={`${siteResource.clearAll}`}
        >
          Clear all
        </Button>
        <Button
          className="text-blue-600 font-normal text-base px-0 hover:bg-transparent hover:text-blue-600"
          variant="ghost"
          size="sm"
          onClick={handleDone}
        >
          Done
        </Button>
      </div>
    </div>
  )
}