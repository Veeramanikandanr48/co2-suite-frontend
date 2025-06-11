"use client"

import { useEffect, useRef } from "react"
import { useSocket } from "@/context/socket-context"

type SocketData = Record<string, unknown>;

export function useSocketEvent<T extends SocketData = SocketData>(event: string, handler: (data: T) => void) {
  const { socket } = useSocket()
  const handlerRef = useRef(handler)

  // Update the handler ref when it changes
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!socket) return

    const eventHandler = (data: T) => {
      handlerRef.current(data)
    }

    socket.on(event, eventHandler)

    return () => {
      socket.off(event, eventHandler)
    }
  }, [socket, event])
}
