import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../../api'
import { PageHeader, Card, Spinner, Btn, Modal, FormField, Input, Textarea, Select } from '../../components/ui'
import type { Testimonial } from '../../types'

const schema = z.object({
  name:     z.string().min(1, 'Vui lòng nhập tên'),
  role:     z.string().min(1, 'Vui lòng nhập chức vụ'),
  company:  z.string().min(1, 'Vui lòng nhập tên công ty'),
  text:     z.string().min(1, 'Vui lòng nhập nội dung đánh giá'),
  rating:   z.number().int().min(1).max(5),
  order:    z.number().int(),
  isActive: z.boolean(),
})
type FormData = z.infer<typeof schema>

export default function TestimonialsPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; item?: Testimonial }>({ open: false })

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: fetchTestimonials,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 5, order: 0, isActive: true },
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: FormData) => modal.item
      ? updateTestimonial(modal.item.id, data)
      : createTestimonial(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['testimonials'] })
      toast.success(modal.item ? 'Đã cập nhật' : 'Đã thêm đánh giá')
      setModal({ open: false })
    },
    onError: () => toast.error('Lưu thất bại'),
  })

  const { mutate: remove } = useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['testimonials'] }); toast.success('Đã xóa') },
    onError: () => toast.error('Xóa thất bại'),
  })

  function openCreate() {
    reset({ name: '', role: '', company: '', text: '', rating: 5, order: items.length + 1, isActive: true })
    setModal({ open: true })
  }

  function openEdit(item: Testimonial) {
    reset({ name: item.name, role: item.role, company: item.company, text: item.text, rating: item.rating, order: item.order, isActive: item.isActive })
    setModal({ open: true, item })
  }

  return (
    <div className="p-6">
      <PageHeader title="Đánh giá khách hàng">
        <Btn variant="primary" onClick={openCreate}><Plus size={16} /> Thêm đánh giá</Btn>
      </PageHeader>

      <Card>
        {isLoading ? <Spinner /> : items.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="mb-4">Chưa có đánh giá nào.</p>
            <Btn variant="primary" onClick={openCreate}><Plus size={16} /> Thêm đánh giá đầu tiên</Btn>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {item.name.split(' ').pop()?.charAt(0)}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    <span className="text-xs text-gray-400">{item.role} — {item.company}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.isActive ? 'Hiển thị' : 'Ẩn'}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">"{item.text}"</p>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Btn variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil size={14} /></Btn>
                  <Btn variant="ghost" size="sm" onClick={() => confirm(`Xóa đánh giá của "${item.name}"?`) && remove(item.id)}>
                    <Trash2 size={14} className="text-red-400" />
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false })}
        title={modal.item ? 'Chỉnh sửa đánh giá' : 'Thêm đánh giá'}>
        <form onSubmit={handleSubmit((d) => save(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Họ tên" error={errors.name?.message}>
              <Input {...register('name')} placeholder="Nguyễn Văn A" autoFocus />
            </FormField>
            <FormField label="Chức vụ" error={errors.role?.message}>
              <Input {...register('role')} placeholder="Giám Đốc" />
            </FormField>
          </div>
          <FormField label="Công ty" error={errors.company?.message}>
            <Input {...register('company')} placeholder="CTY TNHH ABC" />
          </FormField>
          <FormField label="Nội dung đánh giá" error={errors.text?.message}>
            <Textarea {...register('text')} rows={3} placeholder="Nội dung nhận xét..." />
          </FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Số sao (1–5)">
              <Select {...register('rating', { valueAsNumber: true })}>
                {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} sao</option>)}
              </Select>
            </FormField>
            <FormField label="Thứ tự">
              <Input type="number" {...register('order', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Trạng thái">
              <Select {...register('isActive', { setValueAs: (v) => v === 'true' || v === true })}>
                <option value="true">Hiển thị</option>
                <option value="false">Ẩn</option>
              </Select>
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
