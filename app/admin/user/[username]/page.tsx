'use client'

import { useParams } from 'next/navigation'
import AdminWrapper from '../../admin-wrapper'
import UserAnalytics from '@/components/admin/UserAnalytics'

/** Per-trainee analytics: score over time, category trends, biggest weakness, script adherence. */
export default function UserAnalyticsPage() {
  const params = useParams<{ username: string }>()
  const username = decodeURIComponent(params?.username || '')
  return (
    <AdminWrapper>
      <UserAnalytics username={username} />
    </AdminWrapper>
  )
}
