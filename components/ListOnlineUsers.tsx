'use client'

import { useSocketContext } from '@/context/SocketContext'
import { useUser } from '@clerk/nextjs'
import React from 'react'
import Avatar from './Avatar'

export default function ListOnlineUsers() {
  // const {user} = useUser()
  const {onlineUsers, handleCall} = useSocketContext()
  return (
    <div className='flex flex-col items-start justify-flex-start gap-4 w-full border border-b-primary/10' >{
        onlineUsers && onlineUsers.map( user => (
        <div 
          key={user.userId} 
          className='flex items-center gap-2 cursor-pointer' 
          onClick={() => handleCall(user)}
          >
          <Avatar src={user.profile.imageUrl} />
          <div>{user.profile.firstName}</div>
        </div>
        ))}
    </div>
  )
}
