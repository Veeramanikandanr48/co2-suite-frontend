import { cn } from "@/lib/utils";
export default function DashboardIcon ({ className = '', stroke='#FFFFFF'}) : React.ReactElement {
  return (
    <svg className={cn(className)} width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3.66602" y="3.6665" width="5.5" height="6.41667" rx="0.916667" stroke={stroke} strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="3.66602" y="13.75" width="5.5" height="4.58333" rx="0.916667" stroke={stroke} strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="12.834" y="3.6665" width="5.5" height="4.58333" rx="0.916667" stroke={stroke} strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="12.834" y="11.9165" width="5.5" height="6.41667" rx="0.916667" stroke={stroke} strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};