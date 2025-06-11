import Image from 'next/image'
import React from 'react'
import { FaUser } from 'react-icons/fa'

export default function Avatar({src}: {src: string}) {
  return src
    ? <Image src={src} alt='avatar' width={40} height={40} className='rounded-full' />
    : <FaUser size={40} />
  
}
