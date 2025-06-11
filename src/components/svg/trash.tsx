import { cn } from "@/lib/utils";
export default function Trash ({ className = '', stroke = '#FA2222'}) {
  return (
    <svg className={cn(className)} width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.8438 3.71875L3.15625 3.71876" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.40625 6.90625V11.1562" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.5938 6.90625V11.1562" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.7812 3.71875V13.8125C13.7812 13.9534 13.7253 14.0885 13.6257 14.1882C13.526 14.2878 13.3909 14.3438 13.25 14.3438H4.75C4.6091 14.3438 4.47398 14.2878 4.37435 14.1882C4.27472 14.0885 4.21875 13.9534 4.21875 13.8125V3.71875" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.6562 3.71875V2.65625C11.6562 2.37446 11.5443 2.10421 11.3451 1.90495C11.1458 1.70569 10.8755 1.59375 10.5938 1.59375H7.40625C7.12446 1.59375 6.85421 1.70569 6.65495 1.90495C6.45569 2.10421 6.34375 2.37446 6.34375 2.65625V3.71875" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};
