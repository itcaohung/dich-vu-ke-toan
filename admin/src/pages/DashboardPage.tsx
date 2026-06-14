import { useQuery } from '@tanstack/react-query'
import { FileText, MessageSquare, Briefcase, TrendingUp, AlertCircle, Eye } from 'lucide-react'
import { fetchStats } from '../api'
import { Card, Spinner, Badge } from '../components/ui'

const statusMap: Record<string, { label: string; variant: 'blue' | 'yellow' | 'green' | 'red' }> = {
  NEW: { label: 'Mới', variant: 'blue' },
  CONTACTED: { label: 'Đã liên hệ', variant: 'yellow' },
  DONE: { label: 'Hoàn thành', variant: 'green' },
  CANCELLED: { label: 'Hủy', variant: 'red' },
}

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  })

  if (isLoading) return <div className="p-6"><Spinner /></div>
  if (isError) return (
    <div className="p-6 flex items-center gap-2 text-red-600">
      <AlertCircle size={16} /> Không thể tải dữ liệu thống kê
    </div>
  )

  const ov = stats!.overview
  const cards = [
    { label: 'Tổng bài viết', value: ov.totalPosts, sub: `${ov.publishedPosts} đã đăng`, icon: FileText, color: 'blue' },
    { label: 'Liên hệ', value: ov.totalContacts, sub: `${ov.newContacts} chưa xử lý`, icon: MessageSquare, color: 'green' },
    { label: 'Dịch vụ', value: ov.totalServices, sub: 'đang hoạt động', icon: Briefcase, color: 'purple' },
    { label: 'Tháng này', value: ov.contactsThisMonth, sub: `${ov.contactGrowth > 0 ? '+' : ''}${ov.contactGrowth}% so với tháng trước`, icon: TrendingUp, color: 'orange' },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Tổng quan</h1>
        <p className="text-sm text-gray-500 mt-1">Chào mừng trở lại! Đây là tình hình hiện tại.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
                <Icon size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={16} className="text-gray-400" />
            <h2 className="font-medium text-gray-900">Liên hệ gần đây</h2>
          </div>
          <div className="space-y-3">
            {stats?.recentContacts.length === 0 && (
              <p className="text-sm text-gray-400">Chưa có liên hệ nào</p>
            )}
            {stats?.recentContacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.phone} {c.service ? `· ${c.service}` : ''}</p>
                </div>
                <Badge
                  label={(statusMap[c.status] ?? statusMap.NEW).label}
                  variant={(statusMap[c.status] ?? statusMap.NEW).variant}
                />
              </div>
            ))}
          </div>
          <a href="/contacts" className="text-sm text-blue-600 hover:underline mt-3 inline-block">Xem tất cả →</a>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={16} className="text-gray-400" />
            <h2 className="font-medium text-gray-900">Bài viết nhiều lượt xem</h2>
          </div>
          <div className="space-y-3">
            {stats?.topPosts.length === 0 && (
              <p className="text-sm text-gray-400">Chưa có bài viết nào</p>
            )}
            {stats?.topPosts.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-700 line-clamp-1 flex-1">{p.title}</p>
                <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                  <Eye size={11} /> {p.views}
                </span>
              </div>
            ))}
          </div>
          <a href="/posts" className="text-sm text-blue-600 hover:underline mt-3 inline-block">Xem tất cả →</a>
        </Card>
      </div>
    </div>
  )
}
