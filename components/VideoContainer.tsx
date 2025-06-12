import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'

type VideoProps = {
  stream: MediaStream | null
  isLocalStream: boolean
  isOnCall: boolean
}

export default function VideoContainer({stream, isLocalStream, isOnCall}: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if(videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])
  return (
    <video 
      className={cn('rouded border w-[800px]', 
        isLocalStream && isOnCall && 'w-[200px] h-auto absolute border-purple-500 border-2')}
      ref={videoRef} 
      autoPlay
      playsInline
      muted={isLocalStream}
       />
  )
}
