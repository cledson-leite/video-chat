'use client'

import React from 'react'
import Container from './Container'
import { useRouter } from 'next/navigation'
import { FaVideo } from "react-icons/fa";
import { SignedIn, useAuth, UserButton , SignedOut} from '@clerk/nextjs';
import { Button } from './ui/button';

export default function NavBar() {
  const router = useRouter()
  const {userId} = useAuth()
  return (
    <div className='sticky top-0 border border-b-primary/10'>
      <Container>
        <div className='flex items-center justify-between py-4'>
          <div className='flex items-center gap-4 cursor-pointer' onClick={() => router.push('/')}>
            <FaVideo />
            <div className='text-xl font-bold'>Video Chat</div>
          </div>
          <div className='flex items-center gap-4'>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
                  <Button size='sm' variant='outline' onClick={() => router.push('/login')}>Login</Button>
                  <Button size='sm' onClick={() => router.push('/sign-up')}>Sign Up</Button>
            </SignedOut>
          </div>
        </div>
      </Container>
    </div>
  )
}
