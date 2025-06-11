type Configuration = {
  id?: number;
  name?: string;
  description?: string;
  ipAddress: string;
  port: string;
  aeTitle: string;
  verificationDetails?: string
}

type LastVerified = {
  ipAddress: string | null;
  port: string | null;
  aeTitle: string | null;
}

interface PacsConfigurationFormProps {
  id?: number;
  verifyStatus?: boolean;
  setVerifyStatus?: (status: boolean) => void;
  isVerified?: boolean;
  open?: boolean;
  onCancel?: () => void;
}

interface VerifyResponse {
  success: boolean;
  status: string;
  ip: string;
  port: number;
  ae_title: string;
}

interface AddRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
  existingRooms?: string[];
}

interface UsgData {
  usgId?: number;
  usgName: string;
  usgDescription?: string;
  usgIp: string;
  usgPort: string;
  usgAeTitle: string;
  roomId: number;
}

interface BlackboxData {
  blackboxId?: number;
  blackboxName: string;
  blackboxDescription?: string;
  blackboxIp: string;
  blackboxPort: string;
  blackboxAeTitle: string;
  roomId: number;
}

interface PacsConfigurationSummaryProps {
  connectionStatus: boolean;
  onConfigure: () => void;
  usgData?: UsgData;  
  blackboxData?: BlackboxData;
}

interface RoomNameType {
  name: string;
}

interface RoomItemProps {
  room: RoomData
  onDelete: (roomId: number) => void
}

interface RoomData {
  roomId: number;
  roomName: string;
  deviceCount: number;
  blackboxId: number;
  blackboxName: string;
  blackboxDescription?: string;
  blackboxIp: string;
  blackboxPort: number;
  blackboxAeTitle: string;
  blackboxVerificationDetails: string;
  usgId: number;
  usgName: string;
  usgDescription?: string;
  usgIp: string;
  usgPort: number;
  usgAeTitle: string;
  usgVerificationDetails: string;
  usgRegionOfInterest?: string;
}

interface RoomListResponse {
  listData: RoomData[];
  dataCount: number;
}

interface DicomPayload {
  ip: string;
  port: number;
  ae_title?: string;
  id?: number | null;
}

interface CropData {
  x: number
  y: number
  width: number
  height: number
}

interface ImageCropDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  initialCrop?: CropData
  onSave: (cropData: CropData) => void
  originalImageUrl?: string
}

interface WorkflowConfiguration {
  name: string;
  description: string;
}

interface SpecificErrorData {
  ipAddress?: string;
  aeTitle?: string;
}

export type {
  Configuration,
  PacsConfigurationFormProps,
  PacsConfigurationSummaryProps,
  LastVerified,
  AddRoomDialogProps,
  RoomNameType,
  RoomData,
  RoomItemProps,
  RoomListResponse,
  UsgData,
  BlackboxData,
  DicomPayload,
  VerifyResponse,
  CropData,
  ImageCropDialogProps,
  WorkflowConfiguration,
  SpecificErrorData
}
