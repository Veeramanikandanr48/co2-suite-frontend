import * as React from "react"

import { cn } from "@/lib/utils/utils"

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "flex h-9 w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder:text-gray-400 transition-all outline-none hover:border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input, type InputProps }
