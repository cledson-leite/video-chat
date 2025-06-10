'use client'

import { useUser } from "@clerk/nextjs";
import {createContext, useContext, useEffect, useState} from "react";
import { io, Socket } from "socket.io-client";

type SocketContextProps = {}

const SocketContext = createContext<SocketContextProps>({} as SocketContextProps)
export const SocketProvider = ({children}: Readonly<{children: React.ReactNode}>) => {
  const {user} = useUser()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const newSocket = io("http://localhost:3000")
    setSocket(newSocket)
    return () => {
      newSocket.disconnect()
    }
  }, [user])
    useEffect(() => {
      if(socket === null) return
      setIsConnected(socket.connected)
      const onConnected = ( ) => setIsConnected(true)
      const onDisconnected = ( ) => setIsConnected(false)
      socket.on("connect", onConnected)
      socket.on("disconnect", onDisconnected)
      return () => {
        socket.off("connect", onConnected)
        socket.off("disconnect", onDisconnected)
      }
    }, [socket])
    console.log("isConnected >>>>", isConnected)
  return (
    <SocketContext.Provider value={{}}>{children}</SocketContext.Provider>
  )
}
export const useSocketContext = () => useContext(SocketContext)