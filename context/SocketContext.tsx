'use client'

import { OngoingCall, Participants, SocketUser } from "@/types";
import { useUser } from "@clerk/nextjs";
import {createContext, useCallback, useContext, useEffect, useState} from "react";
import { io, Socket } from "socket.io-client";

type SocketContextProps = {
  onlineUsers: SocketUser[] | null,
  onGoinCall: OngoingCall | null,
   handleCall: (user: SocketUser) => void
  }

const SocketContext = createContext<SocketContextProps>({} as SocketContextProps)
export const SocketProvider = ({children}: Readonly<{children: React.ReactNode}>) => {
  const {user} = useUser()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[] | null>(null)
  const [onGoinCall, setOnGoingCall] = useState<OngoingCall | null>({
    participants: {} as Participants, isRinging: false
    
  })
  const [isConnected, setIsConnected] = useState(false)
  
  const currentUser = onlineUsers?.find(userOnline => userOnline.userId === user?.id)

  const handleCall = useCallback((user: SocketUser) => {
    if(!currentUser || !socket) return

    const participants = {
      origem: currentUser,
      destino: user
    }
    const call: OngoingCall = {
      participants,
      isRinging: false
    }
    setOnGoingCall(call)
    socket.emit("call", participants)
  }, [socket, currentUser])

  const onIncomingCall = useCallback((participants: Participants) => {
    setOnGoingCall({
      participants,
      isRinging: true
    })
  }, [socket, user, onGoinCall])

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
  
    useEffect(() => {
      if(!socket || !isConnected) return
      socket.emit("join-room", user)
      socket.on("get-online-users", (users: SocketUser[]) => {
        setOnlineUsers(users)
      })
      return () => {
        socket.off("get-online-users")
      }
    }, [socket, isConnected, user])

    useEffect(() => {
      if(!socket || !isConnected) return
      socket.on("incomingCall", onIncomingCall)
      return () => {
        socket.off("incomingCall")
      }
    }, [socket, isConnected, user, onIncomingCall])
    console.log(onGoinCall?.isRinging)
  return (
    <SocketContext.Provider value={{onlineUsers,onGoinCall, handleCall}}>{children}</SocketContext.Provider>
  )
}
export const useSocketContext = () => useContext(SocketContext)