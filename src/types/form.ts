import { z } from "zod";
import { 
 LoginFormSchema,
 UserFormSchema
} from "@/lib/schemas/schemas";

type LoginFormType = z.infer<typeof LoginFormSchema>
type UserFormType = z.infer<typeof UserFormSchema>


export type {
    LoginFormType,
    UserFormType
}
