import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchOffices, createOffice, updateOffice, deleteOffice } from '../../api'
import { PageHeader, Card, Spinner, Table, Btn, Badge, Modal, FormField, Input } from '../../components/ui'
import type { Office } from '../../types'

const schema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên'),
  address: z.string().min(1, 'Vui lòng nhập địa chỉ'),
  phone: z.string().optional(),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  zalo: z.string().optional(),
  mapUrl: z.string().optional(),
  order: z.number(),
  isActive: z.boolean(),
})
type FormData = z.infer<typeof schema>

export default function OfficesPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; item?: Office }>({ open: false })

  const { data: offices = [], isLoading } = useQuery({
    queryKey: ['offices'],
    queryFn: fetchOffices,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: FormData) => modal.item
      ? updateOffice(modal.item.id, data)
      : createOffice(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offices'] })
      toast.success(modal.item ? 'Đã cập nhật' : 'Đã thêm chi nhánh')
      setModal({ open: false })
    },
    onError: () => toast.error('Lưu thất bại'),
  })

  const { mutate: remove } = useMutation({
    mutationFn: deleteOffice,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['offices'] }); toast.success('Đã xóa') },
    onError: () => toast.error('Xóa thất bại'),
  })

  function openCreate() {
    reset({ name: '', address: '', phone: '', email: '', zalo: '', mapUrl: '', order: 0, isActive: true })
    setModal({ open: true })
  }

  function openEdit(item: Office) {
    reset({ name: item.name, address: item.address, phone: item.phone ?? '', email: item.email ?? '', zalo: item.zalo ?? '', mapUrl: item.mapUrl ?? '', order: item.order, isActive: item.isActive })
    setModal({ open: true, item })
  }

  return (
    <div className="p-6">
      <PageHeader title="Chi nhánh">
        <Btn variant="primary" onClick={openCreate}><Plus size={16} /> Thêm chi nhánh</Btn>
      </PageHeader>

      <Card>
        {isLoading ? <Spinner /> : (
          <Table headers={['Tên', 'Địa chỉ', 'Điện thoại', 'Thứ tự', 'Trạng thái', '']}>
            {offices.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{o.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{o.address}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{o.phone ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{o.order}</td>
                <td className="px-4 py-3">
                  <Badge label={o.isActive ? 'Hoạt động' : 'Ẩn'} variant={o.isActive ? 'green' : 'gray'} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Btn variant="ghost" size="sm" onClick={() => openEdit(o)}><Pencil size={14} /></Btn>
                    <Btn variant="ghost" size="sm" onClick={() => { if (confirm(`Xóa "${o.name}"?`)) remove(o.id) }}>
                      <Trash2 size={14} className="text-red-400" />
                    </Btn>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false })}
        title={modal.item ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh'}>
        <form onSubmit={handleSubmit((d) => save(d))} className="space-y-3">
          <FormField label="Tên chi nhánh" error={errors.name?.message}>
            <Input {...register('name')} placeholder="Ví dụ: Chi nhánh Hà Nội" />
          </FormField>
          <FormField label="Địa chỉ" error={errors.address?.message}>
            <Input {...register('address')} placeholder="123 Đường ABC, Quận XYZ" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Điện thoại">
              <Input {...register('phone')} placeholder="0901234567" />
            </FormField>
            <FormField label="Zalo">
              <Input {...register('zalo')} placeholder="0901234567" />
            </FormField>
          </div>
          <FormField label="Email" error={errors.email?.message}>
            <Input {...register('email')} type="email" placeholder="chinhanh@example.com" />
          </FormField>
          <FormField label="Link Google Maps">
            <Input {...register('mapUrl')} placeholder="https://maps.google.com/..." />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Thứ tự">
              <Input type="number" {...register('order', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Trạng thái">
              <select {...register('isActive', { setValueAs: (v) => v === 'true' || v === true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="true">Hoạt động</option>
                <option value="false">Ẩn</option>
              </select>
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={() => setModal({ open: false })}>Hủy</Btn>
            <Btn type="submit" variant="primary" disabled={isPending}>{isPending ? 'Đang lưu...' : 'Lưu'}</Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
