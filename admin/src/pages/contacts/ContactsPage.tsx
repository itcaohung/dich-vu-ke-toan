import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Search, Trash2, Phone, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchContacts, updateContact, deleteContact } from '../../api'
import { PageHeader, Card, Spinner, Table, Btn, Badge, Modal, FormField, Textarea, Select } from '../../components/ui'
import type { Contact } from '../../types'

const statusMap: Record<Contact['status'], { label: string; variant: 'blue' | 'yellow' | 'green' | 'red' }> = {
  NEW: { label: 'Mới', variant: 'blue' },
  CONTACTED: { label: 'Đã liên hệ', variant: 'yellow' },
  DONE: { label: 'Hoàn thành', variant: 'green' },
  CANCELLED: { label: 'Hủy', variant: 'red' },
}

export default function ContactsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<{ open: boolean; item?: Contact }>({ open: false })

  const { data, isLoading } = useQuery({
    queryKey: ['contacts', { page, search, status }],
    queryFn: () => fetchContacts({ page, limit: 20, search, status: status || undefined }),
  })

  const { register, handleSubmit, reset } = useForm<{ status: Contact['status']; note: string }>()

  const { mutate: save, isPending } = useMutation({
    mutationFn: ({ status, note }: { status: Contact['status']; note: string }) =>
      updateContact(modal.item!.id, { status, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Đã cập nhật')
      setModal({ open: false })
    },
    onError: () => toast.error('Cập nhật thất bại'),
  })

  const { mutate: remove } = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contacts'] }); toast.success('Đã xóa') },
    onError: () => toast.error('Xóa thất bại'),
  })

  function openEdit(item: Contact) {
    reset({ status: item.status, note: item.note ?? '' })
    setModal({ open: true, item })
  }

  return (
    <div className="p-6">
      <PageHeader title="Liên hệ" />

      <Card>
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tìm tên, SĐT..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="NEW">Mới</option>
            <option value="CONTACTED">Đã liên hệ</option>
            <option value="DONE">Hoàn thành</option>
            <option value="CANCELLED">Hủy</option>
          </select>
          {data && <span className="text-xs text-gray-400">{data.meta.total} liên hệ</span>}
        </div>

        {isLoading ? <Spinner /> : (
          <Table headers={['Khách hàng', 'Dịch vụ', 'Tin nhắn', 'Trạng thái', 'Ngày', '']}>
            {data?.data.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openEdit(c)}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Phone size={11} />{c.phone}</span>
                    {c.email && <span className="text-xs text-gray-400 flex items-center gap-1"><Mail size={11} />{c.email}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{c.service ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
                  <p className="line-clamp-2">{c.message ?? '—'}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge label={statusMap[c.status].label} variant={statusMap[c.status].variant} />
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <Btn variant="ghost" size="sm" onClick={() => { if (confirm('Xóa liên hệ này?')) remove(c.id) }}>
                    <Trash2 size={14} className="text-red-400" />
                  </Btn>
                </td>
              </tr>
            ))}
          </Table>
        )}

        {data && data.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Trang {data.meta.page} / {data.meta.totalPages}</span>
            <div className="flex gap-2">
              <Btn size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trước</Btn>
              <Btn size="sm" variant="secondary" disabled={page === data.meta.totalPages} onClick={() => setPage(p => p + 1)}>Sau</Btn>
            </div>
          </div>
        )}
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false })} title="Chi tiết liên hệ">
        {modal.item && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Họ tên:</span>
                <span className="text-sm font-medium">{modal.item.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Điện thoại:</span>
                <span className="text-sm font-medium">{modal.item.phone}</span>
              </div>
              {modal.item.email && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Email:</span>
                  <span className="text-sm">{modal.item.email}</span>
                </div>
              )}
              {modal.item.service && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Dịch vụ:</span>
                  <span className="text-sm">{modal.item.service}</span>
                </div>
              )}
              {modal.item.message && (
                <div>
                  <span className="text-sm text-gray-500">Tin nhắn:</span>
                  <p className="text-sm mt-1 text-gray-700">{modal.item.message}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(({ status, note }) => save({ status, note }))} className="space-y-3">
              <FormField label="Cập nhật trạng thái">
                <Select {...register('status')}>
                  <option value="NEW">Mới</option>
                  <option value="CONTACTED">Đã liên hệ</option>
                  <option value="DONE">Hoàn thành</option>
                  <option value="CANCELLED">Hủy</option>
                </Select>
              </FormField>
              <FormField label="Ghi chú nội bộ">
                <Textarea {...register('note')} rows={3} placeholder="Ghi chú xử lý..." />
              </FormField>
              <div className="flex justify-end gap-2">
                <Btn variant="secondary" onClick={() => setModal({ open: false })}>Đóng</Btn>
                <Btn type="submit" variant="primary" disabled={isPending}>{isPending ? 'Đang lưu...' : 'Cập nhật'}</Btn>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}
