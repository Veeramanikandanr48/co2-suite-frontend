import { cn } from "@/lib/utils";

export default function SaveIcon({ className = '', stroke='white'}) {
  return (
    <svg className={cn(className)} width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 6.20711V13.5C14 13.6326 13.9473 13.7598 13.8536 13.8536C13.7598 13.9473 13.6326 14 13.5 14H3.5C3.36739 14 3.24021 13.9473 3.14645 13.8536C3.05268 13.7598 3 13.6326 3 13.5V3.5C3 3.36739 3.05268 3.24021 3.14645 3.14645C3.24021 3.05268 3.36739 3 3.5 3H10.7929C10.8586 3 10.9236 3.01293 10.9842 3.03806C11.0449 3.06319 11.1 3.10002 11.1464 3.14645L13.8536 5.85355C13.9 5.89998 13.9368 5.9551 13.9619 6.01576C13.9871 6.07643 14 6.14145 14 6.20711Z" stroke={stroke} strokeWidth="0.969835" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.5 14V10C5.5 9.86739 5.55268 9.74021 5.64645 9.64645C5.74021 9.55268 5.86739 9.5 6 9.5H11C11.1326 9.5 11.2598 9.55268 11.3536 9.64645C11.4473 9.74021 11.5 9.86739 11.5 10V14" fill={stroke}/>
      <path d="M5.5 14V10C5.5 9.86739 5.55268 9.74021 5.64645 9.64645C5.74021 9.55268 5.86739 9.5 6 9.5H11C11.1326 9.5 11.2598 9.55268 11.3536 9.64645C11.4473 9.74021 11.5 9.86739 11.5 10V14" stroke={stroke} strokeWidth="0.969835" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 5H6.5" stroke={stroke} strokeWidth="0.969835" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
