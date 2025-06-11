"use client";
import Image from "next/image";
import { CircleUserRound, LogOut } from "lucide-react";
import { DialogTrigger, Dialog, DialogOverlay } from "@/components/ui/dialog";
import { LogoutDialog } from "./logout-dropdown";
import { useAuth } from "@/context/auth-provider";
import { FORM_CONFIGURATION } from "@/lib/variables";
import EventBus from "../reusables/eventbus";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const displayName = user ? `${user.firstName} ${user.lastName ?? ''}`.trim() : '';

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
      <div className="w-full h-12 flex justify-between py-2 px-1.5 border-b-1 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.1)] z-10 bg-light-100">
      <button onClick={() => handleItemClick('/')}>
        <Image
          src="/images/OMAI-Logo-RGB-Color.svg"
          className="w-fit"
          alt="My Image"
          width={300}
          height={300}
        />
      </button>

      <div className="h-full flex justify-between items-center gap-4">
        <CircleUserRound className="w-7 aspect-square" />

        <p className="text-neutral-700 font-normal text-success text-sm">
          {displayName}
        </p>

        <div className="w-0.5 h-full bg-light-500"></div>

        <Dialog>
          <DialogOverlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-3xs" />
          <DialogTrigger asChild>
            <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Logout">
              <LogOut size={20} />
            </button>
          </DialogTrigger>
          <LogoutDialog onLogout={logout} />
        </Dialog>
      </div>

    </div>
  );
}
