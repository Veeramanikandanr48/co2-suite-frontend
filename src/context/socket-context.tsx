"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { io, type Socket } from "socket.io-client"

interface RoomData {
  userId?: string;
  roomId?: string;
  [key: string]: unknown;
}

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  joinRoom: (roomName: string, roomData: RoomData) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: ReactNode
  url?: string
  autoConnect?: boolean
}

export function SocketProvider({ children, url = (process.env.NEXT_PUBLIC_SOCKET_URL || process.env.SOCKET_URL || 'http://localhost:5000') as string, autoConnect = false }: Readonly<SocketProviderProps>) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const connect = useCallback(() => {
    if (!socket) {
      const token: string | null = localStorage.getItem('access_token')
      if (!token) {
        console.error("No token found")
        return
      }
      const newSocket = io(url, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        auth: {
          headers: token
        }
      })

      newSocket.on("connect", () => {
        console.warn("Socket connected:", newSocket.id)
        setIsConnected(true)
      })

      newSocket.on("disconnect", (reason) => {
        console.warn("Socket disconnected:", reason)
        setIsConnected(false)
      })

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
        setIsConnected(false)
      })

      newSocket.on("error", (error) => {
        console.error("Socket error:", error)
      })

      setSocket(newSocket)
    }
  }, [socket, url])

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [socket])

  const joinRoom = useCallback((roomName: string, roomData: RoomData) => {
    if (!socket?.connected) {
      console.warn("Cannot join room: Socket not connected")
      return
    }
    socket.emit(roomName, roomData)
  }, [socket])

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [autoConnect, connect, socket])


  const contextValue: SocketContextType = useMemo(() => ({
    socket,
    isConnected,
    connect,
    disconnect,
    joinRoom
  }), [socket, isConnected, connect, disconnect, joinRoom])

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}
