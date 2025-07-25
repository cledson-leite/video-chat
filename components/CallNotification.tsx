'use client'

import { useSocketContext } from '@/context/SocketContext'
import React from 'react'
import Avatar from './Avatar'
import { FaPhone, FaPhoneSlash } from 'react-icons/fa6'

export default function CallNotification() {
  const {onGoinCall, handleJoinCall, handleHangup} = useSocketContext()

  if(!onGoinCall?.isRinging) return null

  return (
    <div className='absolute bg-slate-500/70 w-screen  h-screen top-0 left-0 flex items-center justify-center'>
      <div className='bg-white min-w-[300px] min-h-[100px] flex flex-col items-center justify-center rounded p-4'>
        <div className='flex flex-col items-center'>
          <Avatar src={onGoinCall?.participants?.origem.profile.imageUrl!} />
          <h3>{onGoinCall?.participants?.origem.profile.firstName}</h3>
        </div>
        <p className='text-sm mb-2'>Incoming call</p>
        <div className='flex gap-6'>
          <button className='bg-green-500 text-white px-4 py-2 rounded-full' onClick={() =>handleJoinCall(onGoinCall)}>
            <FaPhone />
          </button>
          <button 
            onClick={() => handleHangup({onGoingCall: onGoinCall ? onGoinCall : null, isEmitHangup: true})}
            className='bg-red-500 text-white px-4 py-2 ml-2 rounded-full'>
            <FaPhoneSlash />
          </button>
        </div>
      </div>
    </div>
  )
}
