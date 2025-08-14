import React, { ReactNode } from 'react'

const PracticeLayout = async ({children} : {children: ReactNode}) => {

  return (
    <div>
      {children}
    </div>
  )
}

export default PracticeLayout;