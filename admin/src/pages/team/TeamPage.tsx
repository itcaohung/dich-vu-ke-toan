import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, uploadImage } from '../../api'
import { API_BASE } from '../../api/client'
import { PageHeader, Card, Spinner, Btn, Modal, FormField, Input, Textarea, Select } from '../../components/ui'
import type { TeamMember } from '../../types'
const imgUrl = (p?: string | null) => !p ? '' : p.startsWith('http') ? p : `${API_BASE}${p}`

const AVATAR_COLORS = ['bg-blue-600','bg-emerald-600','bg-violet-600','bg-rose-500','bg-amber-500','bg-teal-600']
const avatarColor = (name: string) => AVATAR_COLORS[name.length % AVATAR_COLORS.length]
const initials = (name: string) => name.split(' ').slice(-2).map((w) => w[0]).join('')

const schema = z.object({
  name:     z.string().min(1, 'Vui lòng nhập tên'),
  title:    z.string().min(1, 'Vui lòng nhập chức danh'),
  bio:      z.string().optional().nullable(),
  avatar:   z.string().optional().nullable(),
  order:    z.number().int(),
  isActive: z.boolean(),
})
type FormData = z.infer<typeof schema>

export default function TeamPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; item?: TeamMember }>({ open: false })
  const [avatarPreview, setAvatarPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team'],
    queryFn: fetchTeamMembers,
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { order: 0, isActive: true },
  })
  const avatarValue = watch('avatar') ?? ''

  async function handleAvatarUpload(file: File) {
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setValue('avatar', url)
      setAvatarPreview(imgUrl(url))
      toast.success('Upload thành công')
    } catch { toast.error('Upload thất bại') }
    finally { setUploading(false) }
  }

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: FormData) => modal.item
      ? updateTeamMember(modal.item.id, data)
      : createTeamMember(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team'] })
      toast.success(modal.item ? 'Đã cập nhật' : 'Đã thêm thành viên')
      setModal({ open: false })
    },
    onError: () => toast.error('Lưu thất bại'),
  })

  const { mutate: remove } = useMutation({
    mutationFn: deleteTeamMember,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team'] }); toast.success('Đã xóa') },
    onError: () => toast.error('Xóa thất bại'),
  })

  function openCreate() {
    reset({ name: '', title: '', bio: '', avatar: '', order: members.length + 1, isActive: true })
    setAvatarPreview('')
    setModal({ open: true })
  }

  function openEdit(item: TeamMember) {
    reset({ name: item.name, title: item.title, bio: item.bio ?? '', avatar: item.avatar ?? '', order: item.order, isActive: item.isActive })
    setAvatarPreview(imgUrl(item.avatar))
    setModal({ open: true, item })
  }

  return (
    <div className="p-6">
      <PageHeader title="Đội ngũ">
        <Btn variant="primary" onClick={openCreate}><Plus size={16} /> Thêm thành viên</Btn>
      </PageHeader>

      <Card>
        {isLoading ? <Spinner /> : members.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="mb-4">Chưa có thành viên nào.</p>
            <Btn variant="primary" onClick={openCreate}><Plus size={16} /> Thêm thành viên đầu tiên</Btn>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-5">
            {members.map((m) => (
              <div key={m.id} className={`relative bg-gray-50 rounded-2xl p-4 text-center border border-gray-100 ${!m.isActive ? 'opacity-50' : ''}`}>
                {/* Avatar */}
                {m.avatar
                  ? <img src={imgUrl(m.avatar)} alt={m.name} className="w-14 h-14 rounded-full object-cover mx-auto mb-2" />
                  : <div className={`w-14 h-14 ${avatarColor(m.name)} rounded-full flex items-center justify-center text-white font-bold text-base mx-auto mb-2`}>
                      {initials(m.name)}
                    </div>
                }
                <p className="font-semibold text-gray-900 text-xs leading-snug">{m.name}</p>
                <p className="text-xs text-blue-600 mt-0.5 leading-snug">{m.title}</p>
                {!m.isActive && <p className="text-xs text-gray-400 mt-1">Ẩn</p>}
                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                </div>
                <div className="flex justify-center gap-1 mt-3">
                  <Btn variant="ghost" size="sm" onClick={() => openEdit(m)}><Pencil size={12} /></Btn>
                  <Btn variant="ghost" size="sm" onClick={() => confirm(`Xóa "${m.name}"?`) && remove(m.id)}>
                    <Trash2 size={12} className="text-red-400" />
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false })}
        title={modal.item ? 'Chỉnh sửa thành viên' : 'Thêm thành viên'}>
        <form onSubmit={handleSubmit((d) => save(d))} className="space-y-4">
          {/* Avatar upload */}
          <FormField label="Ảnh đại diện">
            <div className="flex items-center gap-3">
              {avatarPreview
                ? <img src={avatarPreview} alt="" className="w-14 h-14 rounded-full object-cover border border-gray-200" />
                : <div className={`w-14 h-14 ${avatarColor(watch('name') || 'A')} rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                    {initials(watch('name') || 'A')}
                  </div>
              }
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <Input value={avatarValue} onChange={(e) => { setValue('avatar', e.target.value); setAvatarPreview(e.target.value ? imgUrl(e.target.value) : '') }}
                    placeholder="/uploads/... hoặc URL" className="flex-1 text-xs" />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="shrink-0 flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60">
                    <Upload size={12} /> {uploading ? '...' : 'Upload'}
                  </button>
                </div>
                {avatarPreview && (
                  <button type="button" onClick={() => { setValue('avatar', ''); setAvatarPreview('') }}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                    <X size={12} /> Xóa ảnh
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); e.target.value = '' }} />
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Họ tên" error={errors.name?.message}>
              <Input {...register('name')} placeholder="Nguyễn Thị A" autoFocus />
            </FormField>
            <FormField label="Chức danh" error={errors.title?.message}>
              <Input {...register('title')} placeholder="Trưởng BP Kế Toán" />
            </FormField>
          </div>
          <FormField label="Giới thiệu ngắn">
            <Textarea {...register('bio')} rows={2} placeholder="Mô tả ngắn về thành viên..." />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
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
