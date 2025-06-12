'use client'

import { ConnectionData, OngoingCall, Participants, PeerData, SocketUser } from "@/types";
import { useUser } from "@clerk/nextjs";
import {createContext, useCallback, useContext, useEffect, useState} from "react";
import { io, Socket } from "socket.io-client";
import Peer, { SignalData } from "simple-peer";

type SocketContextProps = {
  onlineUsers: SocketUser[] | null,
  onGoinCall: OngoingCall | null,
  localStream: MediaStream | null,
  peer: PeerData | null,
   handleCall: (user: SocketUser) => void,
   handleJoinCall: (onGoingCall: OngoingCall) => void,
   handleHangup: (data: {onGoingCall: OngoingCall | null, isEmitHangup?: boolean}) => void
  }

const SocketContext = createContext<SocketContextProps>({} as SocketContextProps)
export const SocketProvider = ({children}: Readonly<{children: React.ReactNode}>) => {
  const {user} = useUser()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[] | null>(null)
  const [onGoinCall, setOnGoingCall] = useState<OngoingCall | null>({
    participants: {} as Participants, isRinging: false
  })
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [peer, setPeer] = useState<PeerData | null>(null)
  const [isCallEnd, setIsCallEnd] = useState(false)
  
  const currentUser = onlineUsers?.find(userOnline => userOnline.userId === user?.id)

  const getMediaStream = useCallback(async (facingMode?: string ) => {
    if(localStream) return localStream
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: {min: 640, ideal: 1280, max: 1920},
          height: {min: 360, ideal: 720, max: 1080},
          frameRate: {min: 16, ideal: 30, max: 60},
          facingMode: videoDevices.length > 0 ? facingMode : undefined
        }, 
      })
      setLocalStream(stream)
      return stream
    } catch (error) {
      console.log('Failed to get media stream', error)
      setLocalStream(null)
      return null
    }
    
  }, [localStream])

  const handleCall = useCallback( async (user: SocketUser) => {
    setIsCallEnd(false)
    if(!currentUser || !socket) return

    const stream = await getMediaStream()
    if(!stream) return
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

  const handleHangup = useCallback((data: {onGoingCall?: OngoingCall | null, isEmitHangup?: boolean}) => {
    console.log(data.onGoingCall?.participants.origem.socketId)
    if(data?.onGoingCall && data?.isEmitHangup && socket && user) {
      socket.emit("hangup", {
        onGoinCall: data.onGoingCall,
        userHangingupId: user.id
      })
      setOnGoingCall(null)
      setPeer(null)
      if(localStream) {
        localStream.getTracks().forEach(track => track.stop())
        setLocalStream(null)
      }
      setIsCallEnd(true)
    }
  }, [socket, user, localStream])

  const createPeer  = useCallback((stream: MediaStream, initiator: boolean) => {
    const iceServers: RTCIceServer[] = [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
        ]
      },
    ]
    const peer = new Peer({
      stream,
      initiator,
      trickle: true,
      config: {iceServers},
    })
    peer.on("stream", stream => {
      setPeer(prevPeer => {
        if(prevPeer) return {...prevPeer, stream}
        return prevPeer
      })
    })
    peer.on('error', console.error)
    peer.on("close", handleHangup)

    const rtcPeerConnection: RTCPeerConnection = (peer as any)._pc
    rtcPeerConnection.oniceconnectionstatechange = async () => {
      if(
        rtcPeerConnection.iceConnectionState === 'disconnected' 
        || rtcPeerConnection.iceConnectionState === 'failed'
      ) {
        handleHangup({})
      }
    }
    return peer
  }, [onGoinCall, setPeer])

  const completePeerConnection = useCallback(async (connection: ConnectionData) => {
    if(!localStream) return
    if(peer){
       peer.peer.signal(connection.sdp)
       return
      }
      const newPeer = createPeer(localStream, true)
      setPeer({
        peer: newPeer,
        stream: localStream, 
        participantUser: connection.onGoingCall.participants.origem
      })

      newPeer.on("signal", (data: SignalData) => {
        if(socket) {
          socket.emit("webRTCSignal", {
            sdp: data,
            onGoinCall,
            isCaller: true
          })
        }
      })
    
  },[localStream, createPeer, onGoinCall, peer])

  const handleJoinCall = useCallback(async (onGoingCall: OngoingCall) => {
    setOnGoingCall(prev => {
      if(prev) return {...prev, isRinging: false}
      return onGoinCall
    })
    const stream = await getMediaStream()
    if(!stream) return
    const newPeer = createPeer(stream, true)
    setPeer({peer: newPeer, stream, participantUser: onGoingCall.participants.origem})

    newPeer.on("signal", (data: SignalData) => {
      if(socket) {
        socket.emit("webRTCSignal", {
          sdp: data,
          onGoingCall,
          isCaller: false
        })
      }
    })
  }, [socket, currentUser])

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
      socket.emit("create-room", user)
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
      socket.on("webRTCSignal", completePeerConnection)
      socket.on("hangup", handleHangup)
      return () => {
        socket.off("incomingCall")
        socket.off("webRTCSignal")
        socket.off("hangup")
      }
    }, [socket, isConnected, user, onIncomingCall])
  return (
    <SocketContext.Provider value={{
      onlineUsers,
      onGoinCall, 
      localStream,
      peer,
      handleCall,
      handleJoinCall,
      handleHangup,
    }}>{children}</SocketContext.Provider>
  )
}
export const useSocketContext = () => useContext(SocketContext)