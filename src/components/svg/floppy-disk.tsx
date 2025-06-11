import { cn } from "@/lib/utils";
export default function Gear ({ className = '', stroke = '#1454CC'}) {
  return (
    <svg className={cn(className)} width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 5.80672V13.0996C14 13.2322 13.9473 13.3594 13.8536 13.4532C13.7598 13.5469 13.6326 13.5996 13.5 13.5996H3.5C3.36739 13.5996 3.24021 13.5469 3.14645 13.4532C3.05268 13.3594 3 13.2322 3 13.0996V3.09961C3 2.967 3.05268 2.83982 3.14645 2.74606C3.24021 2.65229 3.36739 2.59961 3.5 2.59961H10.7929C10.8586 2.59961 10.9236 2.61254 10.9842 2.63767C11.0449 2.6628 11.1 2.69963 11.1464 2.74606L13.8536 5.45316C13.9 5.49959 13.9368 5.55471 13.9619 5.61537C13.9871 5.67604 14 5.74106 14 5.80672Z" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.5 13.6006V9.60059C5.5 9.46798 5.55268 9.3408 5.64645 9.24703C5.74021 9.15326 5.86739 9.10059 6 9.10059H11C11.1326 9.10059 11.2598 9.15326 11.3536 9.24703C11.4473 9.3408 11.5 9.46798 11.5 9.60059V13.6006" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 4.60059H6.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};
