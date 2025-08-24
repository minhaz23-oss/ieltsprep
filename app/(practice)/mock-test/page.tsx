import React from 'react'
import Link from 'next/link'
import { FaArrowLeft } from "react-icons/fa6";

const page = () => {
  return (
    <div className=' w-full h-screen flex items-center justify-center   '>
      <Link href={'/'} className='btn-primary flex gap-3 items-center absolute top-[20px] left-[30px] font-normal'><span className=' text-white'><FaArrowLeft/></span>Back to homepage</Link>
      <h1 className='text-2xl font-bold'>

      The mock test page is in <span className=" p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">development</span>. we will make this ready real soon. so , sorry for any inconvenience.
      </h1>
    </div>
  )
}

export default page
