"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminDashboard from '@/components/admin/dashboard'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      console.log('Admin page loaded')
    }
  }, [])

  return <AdminDashboard />
}
