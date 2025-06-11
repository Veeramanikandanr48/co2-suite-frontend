"use client";

import { X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import type { PdfViewerModalProps, ResourceFileResponse } from "@/types/resource";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { ResourceType } from "@/enums/base-enum";
import Image from "next/image";
import siteResource from "@/components/test-ids/site-resource.ids";
import { Button } from "../ui/button";
import { Loader } from "../loader";

export default function PdfViewerModal({
  resource,
  onClose,
}: Readonly<PdfViewerModalProps>) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.get<ResourceFileResponse>(
          `${API_LIST.GET_SITE_RESOURCE_FILE}/${ResourceType.SITE_RESOURCE}/${resource.id}`
        );
        const bufferData = new Uint8Array(response.data.buffer.data);
        const blob = new Blob([bufferData], { type: resource.fileType });
        const url = URL.createObjectURL(blob);
        setFileUrl(url);
        setIsLoading(false);
      } catch {
      }
    };

    fetchFile();

    return () => {
      setFileUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return null;
      });
    };
  }, [resource.id, resource.fileType]);

  const renderContent = useMemo(() => {

    if (isLoading) {
      return <Loader />
    }

    if (!fileUrl) {
      return <div className="text-center text-gray-300">Failed to load file</div>;
    }

    if (resource.fileType.includes("pdf")) {
      return (
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            title={resource.resourceName}
            className="w-full max-w-[60%] h-[86vh] mx-auto flex justify-center items-center border-0 bg-transparent pt-16 "
            allowFullScreen
          />
      );
    }
    
    if (resource.fileType.includes("image")) {
      return (
        <Image
          src={fileUrl}
          alt={resource.resourceName}
          width={800}
          height={600}
          className="w-full max-w-[60%] h-[86vh] object-contain"
          unoptimized
        />
      );
    }
  }, [fileUrl, resource.fileType, resource.resourceName, isLoading]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center">
      <div className="relative shadow-2xl w-full max-w-[100vw] max-h-[97vh] overflow-hidden mt-14 flex flex-col bg-preview backdrop-blur-md " data-testid={siteResource.pdfViewerModal}>
        <Button
          onClick={() => {
            console.log("Close clicked");
            onClose?.();
          }}
          className="absolute top-2 right-4 text-white bg-transparent p-2 z-50 pointer-events-auto"
          data-testid={siteResource.closeButton}
          title="Close"
        >
          <X className="h-5 w-5 text-white cursor-pointer" />
        </Button>
        

        <div className="flex justify-between items-start px-8 pt-6 pb-3 flex-shrink-0">
          <h2 className="text-lg font-semibold truncate text-white  max-w-[calc(100vw-100px)] overflow-hidden break-words" data-testid={siteResource.pdfViewerTitle} >
         {(resource.resourceName) }
          </h2>
        </div>

        <div className="flex items-center justify-center bg-preview backdrop-blur-md flex-grow w-full p-4">
          {renderContent}
        </div>
      </div>
    </div>
  );
}
