"use client";
import Image from "next/image";
import { FORM_CONFIGURATION } from "@/lib/variables";
import EventBus from "../../lib/eventbus";
import { usePathname, useRouter } from "next/navigation";
import { NotificationIcon } from "../svg";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const handleItemClick = (requestHref: string) => {
    const currentroute: string = pathname;
    let modifiedRoute = currentroute;
    modifiedRoute = modifiedRoute.replace(/\d+/g, '[id]');
    const formExit: boolean = FORM_CONFIGURATION[modifiedRoute];
    if (formExit) {
      EventBus.$emit(`${currentroute}`, requestHref);
    } else {
      router.push(requestHref);
    }
  };

  return (
    <div className="w-full h-[42px] flex justify-between py-2 px-1.5 border-b-1 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.1)] z-10 bg-light-100">
      <button className="flex items-center gap-3" onClick={() => handleItemClick('/')}>
        <Image
          src="/images/CMP.svg"
          className="w-fit"
          alt="My Image"
          width={300}
          height={300}
        />
        <p className="text-[28px] font-light">
          CMP
        </p>
      </button>

      <div className="h-full flex justify-between items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Logout">
          <NotificationIcon />
        </button>
      </div>

    </div>
  );
}
