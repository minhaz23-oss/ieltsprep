import AuthForm from "@/components/AuthForm"
import { Suspense } from 'react'

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <div>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <AuthForm type='sign-in'/>
      </Suspense>
    </div>
  )
}

export default page
