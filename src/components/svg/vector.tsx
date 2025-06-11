import { cn } from "@/lib/utils";
export default function Vector ({ className = '', stroke = '#17181A'}) {
  return (
    <svg className={cn(className)} width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.5 1.25L10.25 10L1.5 18.75" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};