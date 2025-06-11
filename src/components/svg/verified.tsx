import { cn } from "@/lib/utils";
export default function Verified ({ className = '', stroke = '#18B169'}) {
  return (
    <svg className={cn(className)} width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.25 6.80664L7.58331 10.3066L5.75 8.55664" stroke={stroke} strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.5 14.3066C11.8137 14.3066 14.5 11.6203 14.5 8.30664C14.5 4.99293 11.8137 2.30664 8.5 2.30664C5.18629 2.30664 2.5 4.99293 2.5 8.30664C2.5 11.6203 5.18629 14.3066 8.5 14.3066Z" stroke={stroke} strokeWidth="1.625" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};