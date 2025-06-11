import { cn } from "@/lib/utils";
export default function NotVerified ({ className = '', stroke = '#ACB6BF'}) {
  return (
    <svg className={cn(className)} width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.20312 6.94728C2.47482 5.92944 3.01091 5.00157 3.75701 4.25781" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.75631 12.7432C3.01068 11.999 2.47516 11.0707 2.2041 10.0527" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.55335 14.2969C8.53603 14.5705 7.46442 14.5702 6.44727 14.2959" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.7961 10.0527C13.5244 11.0706 12.9883 11.9984 12.2422 12.7422" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.2432 4.25684C12.9888 5.00105 13.5243 5.92926 13.7954 6.94727" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.44727 2.70302C7.46459 2.42939 8.5362 2.42973 9.55335 2.70399" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};