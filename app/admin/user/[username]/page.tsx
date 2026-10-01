'use client'

import { useParams } from 'next/navigation'
import AdminWrapper from '../../admin-wrapper'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import DynamicBackground from '@/components/DynamicBackground'
import UserAnalyticsView from '@/components/admin/UserAnalyticsView'

/** Per-trainee analytics: score over time, category trends, biggest weakness, script adherence. */
export default function UserAnalyticsPage() {
  const params = useParams<{ username: string }>()
  const router = useRouter()
  const username = decodeURIComponent(params?.username || '')
  return (
    <AdminWrapper>
      <div className="min-h-screen relative">
        <DynamicBackground />
        <section className="section pt-24 md:pt-32 px-3 md:px-6 relative z-10">
          <div className="container max-w-6xl">
            <button onClick={() => router.push('/admin')} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-4"><ArrowLeft className="w-4 h-4" /> Back to admin</button>
            <UserAnalyticsView username={username} />
          </div>
        </section>
      </div>
    </AdminWrapper>
  )
}
