import React from 'react'

export default function Container({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <div className='w-full max-w-[1920px] mx-auto xl:pz-20 px-4 py-4'>{children}</div>
  )
}
