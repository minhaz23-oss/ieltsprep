import Navbar from '@/components/Navbar';
import React, { ReactNode } from 'react'

const RootLayout = async ({children} : {children: ReactNode}) => {
  
    

  return (
    <div className='w-full min-h-screen '>
       <Navbar />
      {children}
    </div>
  )
}

export default RootLayout;
