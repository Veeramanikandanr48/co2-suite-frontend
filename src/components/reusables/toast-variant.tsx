import { toast } from "@/hooks/use-toast"
import { Warning, WavyCircle, XCircle } from "~/components/svg"
import { ToastType } from "@/enums/base-enum"

const showSuccessToast = (message: string) => {
  toast({
    variant: "default",
    description: (
      <div className="flex items-start gap-2 mr-2">
        <WavyCircle className="h-[22px] w-[22px]" stroke="var(--positive-600)" />
        <span>{message}</span>
      </div>
    ),
    className: "bg-light-250 border-positive-600 text-positive-600 min-h-[54px] items-center",
    duration: ToastType.DURATION,
  })
}

const showErrorToast = (message: string) => {
  toast({
    variant: "destructive",
    description: (
      <div className="flex items-start gap-2 mr-2">
        <XCircle className="h-[22px] w-[22px]" stroke="var(--negative-300)"/>
        <span>ERROR: {message}</span>
      </div>
    ),
    className: "bg-negative-50 border-negative-300 text-negative-300 min-h-[54px] items-center",
    duration: ToastType.DURATION,
  })
}

const showWarningToast = (message: string) => {
  toast({
    variant: "warning",
    description: (
      <div className="flex items-start gap-2 mr-2">
        <Warning className="h-[22px] w-[22px]" stroke="var(--warning-600)"/>
        <span>{message}</span>
      </div>
    ),
    className: "bg-warning-50 border-warning-600 text-warning-600 min-h-[54px] items-center",
    duration: ToastType.DURATION,
  })
}

export {
  showSuccessToast,
  showErrorToast,
  showWarningToast
}