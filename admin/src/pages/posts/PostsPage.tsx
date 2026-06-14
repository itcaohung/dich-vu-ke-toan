import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Eye, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchPosts, deletePost, bulkDeletePosts, fetchCategories } from '../../api'
import { PageHeader, Card, Spinner, Badge, Table, Btn } from '../../components/ui'

const statusLabel: Record<string, { label: string; variant: 'green' | 'gray' }> = {
  PUBLISHED: { label: 'Đã đăng', variant: 'green' },
  DRAFT: { label: 'Nháp', variant: 'gray' },
}

export default function PostsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['posts', { page, search, categoryId }],
    queryFn: () => fetchPosts({ page, limit: 20, search, ...(categoryId ? { categoryId } : {}) }),
  })

  const posts = data?.data ?? []

  // Reset selection when page/filter changes
  function switchTab(id: number | null) {
    setCategoryId(id)
    setPage(1)
    setSearch('')
    setSelected(new Set())
  }

  // ── Single delete ──────────────────────────────────────────
  const { mutate: remove } = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Đã xóa bài viết')
    },
    onError: () => toast.error('Xóa thất bại'),
  })

  // ── Bulk delete ────────────────────────────────────────────
  const { mutate: bulkRemove, isPending: bulkPending } = useMutation({
    mutationFn: bulkDeletePosts,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      setSelected(new Set())
      toast.success(`Đã xóa ${res.deleted} bài viết`)
    },
    onError: () => toast.error('Xóa thất bại'),
  })

  function handleDelete(id: number, title: string) {
    if (confirm(`Xóa bài viết "${title}"?`)) remove(id)
  }

  function handleBulkDelete() {
    const ids = Array.from(selected)
    if (!confirm(`Xóa ${ids.length} bài viết đã chọn? Hành động này không thể hoàn tác.`)) return
    bulkRemove(ids)
  }

  // ── Checkbox helpers ───────────────────────────────────────
  const pageIds = posts.map((p) => p.id)
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const somePageSelected = pageIds.some((id) => selected.has(id))

  function toggleAll(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) pageIds.forEach((id) => next.add(id))
      else pageIds.forEach((id) => next.delete(id))
      return next
    })
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="p-6">
      <PageHeader title="Bài viết">
        <Link to="/posts/new">
          <Btn variant="primary"><Plus size={16} /> Tạo bài viết</Btn>
        </Link>
      </PageHeader>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
        {[{ id: null, name: 'Tất cả' }, ...categories].map((cat) => (
          <button
            key={cat.id ?? 'all'}
            onClick={() => switchTab(cat.id)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryId === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <Card>
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 min-h-[60px]">
          {selected.size > 0 ? (
            <>
              <span className="text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                Đã chọn {selected.size} bài viết
              </span>
              <Btn variant="danger" size="sm" onClick={handleBulkDelete} disabled={bulkPending}>
                <Trash2 size={14} />
                {bulkPending ? 'Đang xóa...' : `Xóa ${selected.size} bài`}
              </Btn>
              <Btn variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                Bỏ chọn
              </Btn>
            </>
          ) : (
            <>
              <div className="relative flex-1 max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tìm kiếm..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); setSelected(new Set()) }}
                />
              </div>
              {data && <span className="text-xs text-gray-400">{data.meta.total} bài viết</span>}
            </>
          )}
        </div>

        {isLoading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      ref={(el) => { if (el) el.indeterminate = somePageSelected && !allPageSelected }}
                      onChange={(e) => toggleAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  {['Tiêu đề', 'Danh mục', 'Trạng thái', 'Lượt xem', 'Ngày tạo', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className={`hover:bg-gray-50 transition-colors ${selected.has(post.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(post.id)}
                        onChange={() => toggleOne(post.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{post.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{post.category?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge label={statusLabel[post.status].label} variant={statusLabel[post.status].variant} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 flex items-center gap-1">
                      <Eye size={13} /> {post.views}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/posts/${post.id}`}>
                          <Btn variant="ghost" size="sm"><Pencil size={14} /></Btn>
                        </Link>
                        <Btn variant="ghost" size="sm" onClick={() => handleDelete(post.id, post.title)}>
                          <Trash2 size={14} className="text-red-400" />
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Trang {data.meta.page} / {data.meta.totalPages}
            </span>
            <div className="flex gap-2">
              <Btn size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trước</Btn>
              <Btn size="sm" variant="secondary" disabled={page === data.meta.totalPages} onClick={() => setPage(p => p + 1)}>Sau</Btn>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
