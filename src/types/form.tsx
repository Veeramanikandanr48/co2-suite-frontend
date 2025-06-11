import { z } from "zod";
import { 
  PacsConfigurationSchema,
  UserFormSchema,
  RoomConfigurationSchema,
  RoomNameSchema,
  UsgConfigurationSchema,
  BlackboxConfigurationSchema,
  UploadResourceSchema,
  WorkflowConfigurationSchema
} from "@/lib/schemas";

type UserFormType = z.infer<typeof UserFormSchema>;
type PacsConfigurationType = z.infer<typeof PacsConfigurationSchema>;
type UsgConfigurationType = z.infer<typeof UsgConfigurationSchema>;
type BlackboxConfigurationType = z.infer<typeof BlackboxConfigurationSchema>;
type RoomConfigurationType = z.infer<typeof RoomConfigurationSchema>;
type RoomNameType = z.infer<typeof RoomNameSchema>;
type UploadResourceType = z.infer<typeof UploadResourceSchema>;
type WorkflowConfigurationType = z.infer<typeof WorkflowConfigurationSchema>;


export type {
    UserFormType,
    PacsConfigurationType,
    RoomConfigurationType,
    RoomNameType,
    UsgConfigurationType,
    BlackboxConfigurationType,
    UploadResourceType,
    WorkflowConfigurationType
}
