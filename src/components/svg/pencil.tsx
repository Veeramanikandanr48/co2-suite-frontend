import { cn } from "@/lib/utils";

export default function Pencil({ className = '', stroke = 'var(--light-100)'}) {
  return (
    <svg
      className={cn(className)}
      width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.517 15.6889H3.375C3.22582 15.6889 3.08274 15.6296 2.97725 15.5241C2.87176 15.4186 2.8125 15.2756 2.8125 15.1264V11.9844C2.8125 11.9105 2.82705 11.8374 2.85532 11.7691C2.88359 11.7009 2.92502 11.6389 2.97725 11.5866L11.4148 3.14913C11.5202 3.04364 11.6633 2.98437 11.8125 2.98438C11.9617 2.98438 12.1048 3.04364 12.2102 3.14913L15.3523 6.29113C15.4577 6.39662 15.517 6.5397 15.517 6.68888C15.517 6.83806 15.4577 6.98114 15.3523 7.08663L6.91475 15.5241C6.86252 15.5764 6.80051 15.6178 6.73227 15.6461C6.66402 15.6743 6.59087 15.6889 6.517 15.6889Z" stroke={stroke} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.5625 5L13.5 8.9375" stroke={stroke} strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.71442 15.6509L2.84863 11.7852" stroke={stroke} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      
)}