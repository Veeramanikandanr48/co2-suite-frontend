import { cn } from "@/lib/utils";

export default function Plus ({ className = '', stroke = 'white' }) {
  return (
<svg className={cn(className)} width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.5 14.5C11.8137 14.5 14.5 11.8137 14.5 8.5C14.5 5.18629 11.8137 2.5 8.5 2.5C5.18629 2.5 2.5 5.18629 2.5 8.5C2.5 11.8137 5.18629 14.5 8.5 14.5Z" stroke={stroke} strokeMiterlimit="10"/>
<path d="M6 8.5H11" stroke={stroke} strokeLinecap="round" strokeLinejoin="round"/>
<path d="M8.5 6V11" stroke={stroke} strokeLinecap="round" strokeLinejoin="round"/>
</svg>
)
};