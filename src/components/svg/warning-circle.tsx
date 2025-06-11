import { cn } from "@/lib/utils";
export default function WarningCircle ({ className = '', stroke = '#D95E45'}) {
  return (
    <svg className={cn(className)} width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.18309 10.8142C8.74414 10.8142 10.8203 8.73803 10.8203 6.17699C10.8203 3.61594 8.74414 1.53979 6.18309 1.53979C3.62204 1.53979 1.5459 3.61594 1.5459 6.17699C1.5459 8.73803 3.62204 10.8142 6.18309 10.8142Z" stroke={stroke} strokeWidth="1.23658" strokeMiterlimit="10"/>
      <path d="M6.18262 3.8584V6.56343" stroke="#D95E45" strokeWidth="1.23658" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.18316 8.8822C6.5033 8.8822 6.76281 8.62268 6.76281 8.30255C6.76281 7.98242 6.5033 7.7229 6.18316 7.7229C5.86303 7.7229 5.60352 7.98242 5.60352 8.30255C5.60352 8.62268 5.86303 8.8822 6.18316 8.8822Z" fill={stroke}/>
    </svg>
  )
};