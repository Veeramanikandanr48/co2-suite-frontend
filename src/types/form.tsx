import { z } from "zod";
import { 
 LoginFormSchema
} from "@/lib/schemas";

type LoginFormType = z.infer<typeof LoginFormSchema>


export type {
    LoginFormType,
}
