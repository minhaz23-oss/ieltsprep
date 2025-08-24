import React, { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner';

const PracticeLayout = async ({children} : {children: ReactNode}) => {

  return (
    <div>
      {children}
      <Toaster position="top-center" />
    </div>
  )
}

export default PracticeLayout;