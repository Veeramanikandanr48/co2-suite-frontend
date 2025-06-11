interface ResourceData {
    id: string
    resourceName: string
    description: string
    tags: string[]
    attachmentKey: string
    fileType: string
    displayName: string
    file?: File
  }
  
  interface ResourceItem {
    id: number;
    resourceName: string;
    description: string;
    tags: string[];
    fileType: string;
    displayName: string;
  }
  interface PdfViewerModalProps {
    resource: ResourceItem;
    onClose: () => void;
  }
 
  interface ApiResourceData {
    id: number
    resourceName: string
    description: string
    tags: string
    attachmentKey: string
  }
  
  interface ResourceListResponse {
    data: {
      listData: ApiResourceData[]
      dataCount: number
    }
  }

  interface BufferResponse {
    type: string
    data: Uint8Array
  }

  interface ResourceFileResponse {
    buffer: BufferResponse
  }
  interface UploadResponse {
    success: boolean;
    message: string;
    data?: ResourceData;
  }

  interface TableResourceItem {
    id: string
    resourceName: string
    description: string
    tags: string[]
    displayName?: string
    fileType?: string
  }

  interface SiteResource {
    tags: string[];
  }
  
  interface GetSiteResourceResponse {
    listData: SiteResource[];
  }
  
  
  export type {
    ResourceData,
    ApiResourceData,
    ResourceListResponse,
    ResourceFileResponse,
    ResourceItem,
    PdfViewerModalProps,
    UploadResponse,
    TableResourceItem,
    GetSiteResourceResponse,
    SiteResource
  }
  