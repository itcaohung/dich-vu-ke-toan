import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, ImageIcon, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchBanners, createBanner, updateBanner, deleteBanner, uploadImage } from '../../api'
import { API_BASE } from '../../api/client'
import { PageHeader, Card, Spinner, Table, Btn, Badge, Modal, FormField, Input } from '../../components/ui'
import type { Banner } from '../../types'

const schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  image: z.string().min(1, 'Vui lòng upload ảnh'),
  link: z.string().optional(),
  order: z.number(),
  isActive: z.boolean(),
})
type FormData = z.infer<typeof schema>

export default function BannersPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; item?: Banner }>({ open: false })
  const [imgPreview, setImgPreview] = useState('')
  const [uploading, setUploading] = useState(false)

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: fetchBanners,
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: FormData) => modal.item
      ? updateBanner(modal.item.id, data)
      : createBanner(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['banners'] })
      toast.success(modal.item ? 'Đã cập nhật' : 'Đã thêm banner')
      setModal({ open: false })
    },
    onError: () => toast.error('Lưu thất bại'),
  })

  const { mutate: remove } = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['banners'] }); toast.success('Đã xóa') },
    onError: () => toast.error('Xóa thất bại'),
  })

  function openCreate() {
    reset({ title: '', subtitle: '', image: '', link: '', order: 0, isActive: true })
    setImgPreview('')
    setModal({ open: true })
  }

  function openEdit(item: Banner) {
    reset({ title: item.title ?? '', subtitle: item.subtitle ?? '', image: item.image, link: item.link ?? '', order: item.order, isActive: item.isActive })
    setImgPreview(item.image.startsWith('http') ? item.image : `${API_BASE}${item.image}`)
    setModal({ open: true, item })
  }

  async function handleImgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setValue('image', url)
      setImgPreview(`${API_BASE}${url}`)
    } catch {
      toast.error('Upload thất bại')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-6">
      <PageHeader title="Banner">
        <Btn variant="primary" onClick={openCreate}><Plus size={16} /> Thêm banner</Btn>
      </PageHeader>

      <Card>
        {isLoading ? <Spinner /> : (
          <Table headers={['Ảnh', 'Tiêu đề', 'Link', 'Thứ tự', 'Trạng thái', '']}>
            {banners.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <img
                    src={b.image.startsWith('http') ? b.image : `${API_BASE}${b.image}`}
                    alt=""
                    className="w-20 h-12 object-cover rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{b.title ?? '—'}</p>
                  {b.subtitle && <p className="text-xs text-gray-400 mt-0.5">{b.subtitle}</p>}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{b.link ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{b.order}</td>
                <td className="px-4 py-3">
                  <Badge label={b.isActive ? 'Hiển thị' : 'Ẩn'} variant={b.isActive ? 'green' : 'gray'} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Btn variant="ghost" size="sm" onClick={() => openEdit(b)}><Pencil size={14} /></Btn>
                    <Btn variant="ghost" size="sm" onClick={() => { if (confirm('Xóa banner này?')) remove(b.id) }}>
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
        title={modal.item ? 'Chỉnh sửa banner' : 'Thêm banner'}>
        <form onSubmit={handleSubmit((d) => save(d))} className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Ảnh banner *</p>
            {imgPreview ? (
              <div className="relative">
                <img src={imgPreview} alt="" className="w-full h-40 object-cover rounded-lg" />
                <button type="button" onClick={() => { setImgPreview(''); setValue('image', '') }}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
                {uploading ? <p className="text-sm text-gray-400">Đang upload...</p> : (
                  <><ImageIcon size={20} className="text-gray-300 mb-1" /><p className="text-xs text-gray-400">Click để upload ảnh</p></>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImgUpload} />
              </label>
            )}
            {errors.image && <p className="text-xs text-red-600 mt-1">{errors.image.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tiêu đề">
              <Input {...register('title')} placeholder="Tiêu đề banner" />
            </FormField>
            <FormField label="Phụ đề">
              <Input {...register('subtitle')} placeholder="Mô tả ngắn" />
            </FormField>
          </div>
          <FormField label="Link khi click">
            <Input {...register('link')} placeholder="https://..." />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Thứ tự">
              <Input type="number" {...register('order', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Trạng thái">
              <select {...register('isActive', { setValueAs: (v) => v === 'true' || v === true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="true">Hiển thị</option>
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
