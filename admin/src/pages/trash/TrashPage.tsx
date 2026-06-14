import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, RotateCcw, Search, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchTrashCount, fetchTrashItems, restoreTrashItem, bulkRestoreTrashItems,
  permanentDeleteTrashItem, bulkPermanentDeleteTrashItems, emptyTrashType,
} from '../../api'
import type { TrashType } from '../../api'
import { PageHeader, Card, Spinner, Btn } from '../../components/ui'

// ── Tab definitions ────────────────────────────────────────────────────────

const TABS: { type: TrashType; label: string }[] = [
  { type: 'post',        label: 'Bài viết' },
  { type: 'page',        label: 'Trang' },
  { type: 'service',     label: 'Dịch vụ' },
  { type: 'team',        label: 'Đội ngũ' },
  { type: 'testimonial', label: 'Đánh giá KH' },
  { type: 'office',      label: 'Chi nhánh' },
  { type: 'banner',      label: 'Banner' },
]

// ── TrashTab — the per-type content panel ──────────────────────────────────

function TrashTab({ type }: { type: TrashType }) {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['trash', type] })
    qc.invalidateQueries({ queryKey: ['trashCount'] })
    // Invalidate the source list so restored items reappear
    qc.invalidateQueries({ queryKey: [type === 'post' ? 'posts' : type === 'page' ? 'pages' : type + 's'] })
  }, [qc, type])

  const { data, isLoading } = useQuery({
    queryKey: ['trash', type, { page, search }],
    queryFn: () => fetchTrashItems(type, { page, limit: 20, search }),
  })

  const items = data?.data ?? []
  const total = data?.meta.total ?? 0

  // ── Mutations ──────────────────────────────────────────────
  const { mutate: restore } = useMutation({
    mutationFn: (id: number) => restoreTrashItem(type, id),
    onSuccess: () => { invalidate(); toast.success('Đã khôi phục') },
    onError: () => toast.error('Khôi phục thất bại'),
  })

  const { mutate: bulkRestore, isPending: bulkRestorePending } = useMutation({
    mutationFn: (ids: number[]) => bulkRestoreTrashItems(type, ids),
    onSuccess: (res) => { invalidate(); setSelected(new Set()); toast.success(`Đã khôi phục ${res.restored} mục`) },
    onError: () => toast.error('Khôi phục thất bại'),
  })

  const { mutate: permDelete } = useMutation({
    mutationFn: (id: number) => permanentDeleteTrashItem(type, id),
    onSuccess: () => { invalidate(); toast.success('Đã xóa vĩnh viễn') },
    onError: () => toast.error('Xóa thất bại'),
  })

  const { mutate: bulkPermDelete, isPending: bulkDeletePending } = useMutation({
    mutationFn: (ids: number[]) => bulkPermanentDeleteTrashItems(type, ids),
    onSuccess: (res) => { invalidate(); setSelected(new Set()); toast.success(`Đã xóa vĩnh viễn ${res.deleted} mục`) },
    onError: () => toast.error('Xóa thất bại'),
  })

  const { mutate: doEmpty, isPending: emptyPending } = useMutation({
    mutationFn: () => emptyTrashType(type),
    onSuccess: (res) => { invalidate(); setSelected(new Set()); toast.success(`Đã dọn sạch (${res.deleted} mục)`) },
    onError: () => toast.error('Thất bại'),
  })

  // ── Checkbox helpers ───────────────────────────────────────
  const pageIds = items.map((i) => i.id)
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const someSelected = pageIds.some((id) => selected.has(id))

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

  function handlePermDelete(id: number, label: string) {
    if (confirm(`Xóa vĩnh viễn "${label}"? Hành động này không thể hoàn tác.`)) permDelete(id)
  }

  function handleBulkPermDelete() {
    const ids = Array.from(selected)
    if (confirm(`Xóa vĩnh viễn ${ids.length} mục? Hành động này không thể hoàn tác.`)) bulkPermDelete(ids)
  }

  function handleEmpty() {
    if (total === 0) return
    if (confirm(`Xóa vĩnh viễn tất cả ${total} mục? Hành động này không thể hoàn tác.`)) doEmpty()
  }

  if (!isLoading && total === 0 && !search) {
    return (
      <div className="py-16 flex flex-col items-center gap-2 text-center">
        <Trash2 size={40} className="text-gray-200" />
        <p className="text-gray-500 text-sm font-medium">Không có mục nào trong thùng rác</p>
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3 min-h-[60px] flex-wrap">
        {selected.size > 0 ? (
          <>
            <span className="text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
              Đã chọn {selected.size} mục
            </span>
            <Btn variant="secondary" size="sm" onClick={() => bulkRestore(Array.from(selected))} disabled={bulkRestorePending}>
              <RotateCcw size={14} /> Khôi phục
            </Btn>
            <Btn variant="danger" size="sm" onClick={handleBulkPermDelete} disabled={bulkDeletePending}>
              <Trash2 size={14} /> Xóa vĩnh viễn
            </Btn>
            <Btn variant="ghost" size="sm" onClick={() => setSelected(new Set())}>Bỏ chọn</Btn>
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
            {data && <span className="text-xs text-gray-400">{total} mục</span>}
            <div className="ml-auto">
              {total > 0 && (
                <Btn variant="danger" size="sm" onClick={handleEmpty} disabled={emptyPending}>
                  <Trash2 size={14} />
                  {emptyPending ? 'Đang dọn...' : `Dọn sạch (${total})`}
                </Btn>
              )}
            </div>
          </>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                      onChange={(e) => toggleAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Chi tiết</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông tin</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày xóa</th>
                  <th className="px-4 py-3 w-28"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${selected.has(item.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggleOne(item.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-700 line-clamp-1">{item.label}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">{item.subtitle ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{item.meta ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(item.deletedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Btn variant="ghost" size="sm" onClick={() => restore(item.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50">
                          <RotateCcw size={14} /> Khôi phục
                        </Btn>
                        <Btn variant="ghost" size="sm" onClick={() => handlePermDelete(item.id, item.label)}>
                          <Trash2 size={14} className="text-red-400" />
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">Trang {data.meta.page} / {data.meta.totalPages}</span>
              <div className="flex gap-2">
                <Btn size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trước</Btn>
                <Btn size="sm" variant="secondary" disabled={page === data.meta.totalPages} onClick={() => setPage(p => p + 1)}>Sau</Btn>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function TrashPage() {
  const [activeTab, setActiveTab] = useState<TrashType>('post')

  const { data: countData } = useQuery({
    queryKey: ['trashCount'],
    queryFn: fetchTrashCount,
    refetchInterval: 30_000,
  })

  const byType = countData?.byType
  const total = countData?.total ?? 0

  return (
    <div className="p-6">
      <PageHeader title="Thùng rác" />

      {/* Type tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {TABS.map(({ type, label }) => {
          const count = byType?.[type] ?? 0
          const isActive = activeTab === type
          return (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none ${
                  isActive ? 'bg-blue-400 text-white' : 'bg-red-500 text-white'
                }`}>
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <Card>
        <TrashTab key={activeTab} type={activeTab} />
      </Card>

      {total > 0 && (
        <div className="mt-4 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>Nội dung trong thùng rác sẽ không hiển thị trên website. Bạn có thể khôi phục hoặc xóa vĩnh viễn bất kỳ lúc nào.</span>
        </div>
      )}
    </div>
  )
}
