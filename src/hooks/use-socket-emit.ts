"use client"

import { useCallback } from "react"
import { useSocket } from "@/context/socket-context"

type SocketData = Record<string, unknown>;
type SocketResponse = Record<string, unknown>;

export function useSocketEmit() {
  const { socket, isConnected } = useSocket()

  const emit = useCallback(
    <T extends SocketData = SocketData>(event: string, data?: T) => {
      if (socket && isConnected) {
        socket.emit(event, data)
        return true
      }
      console.warn("Socket not connected. Cannot emit event:", event)
      return false
    },
    [socket, isConnected],
  )

  const emitWithAck = useCallback(
    <T extends SocketData = SocketData, R extends SocketResponse = SocketResponse>(event: string, data?: T): Promise<R> => {
      return new Promise((resolve, reject) => {
        if (!socket || !isConnected) {
          reject(new Error("Socket not connected"))
          return
        }

        socket.emit(event, data, (response: R) => {
          resolve(response)
        })
      })
    },
    [socket, isConnected],
  )

  return { emit, emitWithAck, isConnected }
}
