"use client"

import { useRouter } from "next/navigation"
import { RoomItemProps } from "@/types/device"
import { Button } from "@/components/ui/button"
import { Probe, Barcode, Trash } from "../svg"


export default function RoomItem({ room, onDelete }: Readonly<RoomItemProps>) {
  const router = useRouter()

  const handleRoomClick = () => {
    router.push(`/device-integration/room-integration/room/${room.roomId}`)
  }

  return (
    <div className="p-1 m-[2px] bg-light-100 shadow-sm hover:bg-light-100 border border-light-400">
      <div
        className="px-2 py-[2px] bg-gray-100 flex justify-between items-center cursor-pointer"
        onClick={handleRoomClick}
      >
        <p className="font-black text-lg text-neutral-400 capitalize">{room.roomName}</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(room.roomId)
          }}
        >
          <Trash className="h-5 w-5" stroke="var(--negative-500)" />
        </Button>
      </div>

      <div className="m-2 py-1 px-1 flex items-center gap-2">
        <Probe className="h-4 w-4" stroke="var(--neutral-400)"/>
        <p className="font-normal text-xs text-neutral-400">
          {room.usgName}
        </p>
      </div>
      <div className="border-t border-light-400 h-[1px]"></div>
      <div className="m-2 py-1 px-1 flex items-center gap-2">
        <Barcode className="h-4 w-4" stroke="var(--neutral-400)"/>
        <p className="font-normal text-xs text-neutral-400">
          {room.blackboxName}
        </p>
      </div>      
    </div>
  )
}
