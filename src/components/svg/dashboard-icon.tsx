import { cn } from "@/lib/utils";
export default function DashboardIcon ({ className = '', stroke='#5C5F66'}) : React.ReactElement {
  return (
    <svg className={cn(className)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M21.7502 5.25L12.7502 14.25L9.00024 10.5L2.25024 17.25" stroke={stroke} strokeLinecap="round" strokeLinejoin="round"/>
<path d="M21.7502 11.25V5.25H15.7502" stroke={stroke} strokeLinecap="round" strokeLinejoin="round"/>
</svg>

)
};