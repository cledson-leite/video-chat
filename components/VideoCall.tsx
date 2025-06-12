'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useSocketContext } from '@/context/SocketContext'
import VideoContainer from './VideoContainer'
import { FaCameraRetro, FaMicrophone } from 'react-icons/fa6'
import { FaMicrophoneSlash } from 'react-icons/fa'
import { PiCameraSlashFill } from 'react-icons/pi'
import { MdCallEnd } from 'react-icons/md'

export default function VideoCall() {
  const {localStream, peer, onGoinCall, handleHangup} = useSocketContext()
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)

  const toggleCamera = useCallback(() => {
    if(localStream){
      const videoTrack = localStream.getVideoTracks()[0]
      videoTrack.enabled = !videoTrack.enabled
      setIsVideoOn(videoTrack.enabled)
    }
  }, [localStream])

  const toggleMic = useCallback(() => {
    if(localStream){
      const audioTrack = localStream.getAudioTracks()[0]
      audioTrack.enabled = !audioTrack.enabled
      setIsMicOn(audioTrack.enabled)
    }
  }, [localStream])

  const isOnCall = !!localStream && !!peer && !!onGoinCall

  useEffect(() => {
    if(localStream){
      const audioTrack = localStream.getAudioTracks()[0]
      setIsMicOn(audioTrack.enabled)
      const videoTrack = localStream.getVideoTracks()[0]
      setIsVideoOn(videoTrack.enabled)
    }
  })
  return (
    <div>
      <div className='mt-4 relative'>
        {localStream && <VideoContainer stream={localStream} isLocalStream={true} isOnCall={isOnCall} />}
        {peer && peer.stream && <VideoContainer stream={peer.stream} isLocalStream={false} isOnCall={isOnCall} />}
      </div>
      {localStream && peer && peer.stream && (
        <div className='mt-8 flex items-center justify-center'>
          <button onClick={toggleMic}>
            {
              isMicOn
                ? <FaMicrophoneSlash  size={28}/>
                : <FaMicrophone size={28} />
            }
          </button>
          <button onClick={() => handleHangup({
            onGoingCall: onGoinCall ? onGoinCall : null,
            isEmitHangup: true
          })} className='px-4 py-2 bg-red-500 text-white rounded-full mx-4'>
            <MdCallEnd size={28} />
          </button>
          <button onClick={toggleCamera}>
          {
              isVideoOn
                ? <PiCameraSlashFill  size={28}/>
                : <FaCameraRetro size={28} />
            }
          </button>
      </div>
    )}
    </div>
  )
}
