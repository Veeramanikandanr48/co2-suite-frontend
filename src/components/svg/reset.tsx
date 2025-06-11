import { cn } from "@/lib/utils";

export default function reset({ className = '', stroke='#1454CC'}) {
  return (
    <svg className={cn(className)} width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5117 6.33203H14.5117V3.33203" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4.61133 4.21052C5.12205 3.6998 5.72837 3.29467 6.39566 3.01827C7.06295 2.74187 7.77815 2.59961 8.50042 2.59961C9.22269 2.59961 9.93788 2.74187 10.6052 3.01827C11.2725 3.29467 11.8788 3.6998 12.3895 4.21052L14.5108 6.33184" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5.48828 9.86719H2.48828V12.8672" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12.3878 11.9885C11.8771 12.4992 11.2707 12.9044 10.6034 13.1808C9.93616 13.4572 9.22096 13.5994 8.49869 13.5994C7.77642 13.5994 7.06122 13.4572 6.39393 13.1808C5.72664 12.9044 5.12032 12.4992 4.6096 11.9885L2.48828 9.86719" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
