"use client";
import { NotificationIcon } from "../svg";

export default function Header() {
  return (
    <div className="w-full h-[42px] flex justify-end items-center py-[10px] px-5 border-b-1 shadow-[0px_4px_8px_0px_rgba(0,0,0,0.1)] z-10 bg-light-100">
        <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Logout">
          <NotificationIcon />
        </button>
    </div>
  );
}
