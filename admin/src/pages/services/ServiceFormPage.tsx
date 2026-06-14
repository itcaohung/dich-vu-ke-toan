import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, X, ImageIcon } from 'lucide-react'
import { fetchService, createService, updateService, uploadImage } from '../../api'
import { API_BASE } from '../../api/client'
import { PageHeader, Card, Spinner, Btn, FormField, Input, Textarea, Select } from '../../components/ui'
import RichEditor from '../../components/editor/RichEditor'

function slugify(str: string) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
}

const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tên'),
  slug: z.string().min(1),
  description: z.string().min(1, 'Vui lòng nhập mô tả'),
  content: z.string().optional(),
  price: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  order: z.number(),
  isActive: z.boolean(),
})
type FormData = z.infer<typeof schema>

export default function ServiceFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [imgPreview, setImgPreview] = useState('')
  const [uploading, setUploading] = useState(false)

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: () => fetchService(Number(id)),
    enabled: isEdit,
  })

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { order: 0, isActive: true, content: '' },
  })

  useEffect(() => {
    if (service) {
      setValue('title', service.title)
      setValue('slug', service.slug)
      setValue('description', service.description)
      setValue('content', service.content ?? '')
      setValue('price', service.price ?? '')
      setValue('icon', service.icon ?? '')
      setValue('image', service.image ?? '')
      setValue('order', service.order)
      setValue('isActive', service.isActive)
      if (service.image) setImgPreview(service.image.startsWith('http') ? service.image : `${API_BASE}${service.image}`)
    }
  }, [service, setValue])

  const titleVal = watch('title')
  useEffect(() => {
    if (!isEdit && titleVal) setValue('slug', slugify(titleVal))
  }, [titleVal, isEdit, setValue])

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: FormData) => isEdit ? updateService(Number(id), data) : createService(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services'] })
      toast.success(isEdit ? 'Đã cập nhật' : 'Đã tạo dịch vụ')
      navigate('/services')
    },
    onError: () => toast.error('Lưu thất bại'),
  })

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

  if (isEdit && isLoading) return <div className="p-6"><Spinner /></div>

  return (
    <div className="p-6">
      <PageHeader title={isEdit ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ'}>
        <Btn variant="secondary" onClick={() => navigate('/services')}><ArrowLeft size={16} /> Quay lại</Btn>
      </PageHeader>

      <form onSubmit={handleSubmit((d) => save(d))}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <Card className="p-5 space-y-4">
              <FormField label="Tên dịch vụ" error={errors.title?.message}>
                <Input {...register('title')} placeholder="Ví dụ: Tư vấn dinh dưỡng Keto" />
              </FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Slug">
                  <Input {...register('slug')} placeholder="tu-van-dinh-duong-keto" />
                </FormField>
                <FormField label="Giá">
                  <Input {...register('price')} placeholder="Ví dụ: 500.000đ/tháng" />
                </FormField>
              </div>
              <FormField label="Mô tả ngắn" error={errors.description?.message}>
                <Textarea {...register('description')} rows={3} />
              </FormField>
            </Card>
            <Card className="p-5">
              <FormField label="Nội dung chi tiết">
                <Controller name="content" control={control}
                  render={({ field }) => <RichEditor value={field.value ?? ''} onChange={field.onChange} />}
                />
              </FormField>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5 space-y-4">
              <FormField label="Trạng thái">
                <Select {...register('isActive', { setValueAs: (v) => v === 'true' })}>
                  <option value="true">Hoạt động</option>
                  <option value="false">Ẩn</option>
                </Select>
              </FormField>
              <FormField label="Thứ tự hiển thị">
                <Input type="number" {...register('order', { valueAsNumber: true })} />
              </FormField>
              <FormField label="Icon (emoji hoặc tên)">
                <Input {...register('icon')} placeholder="🥗 hoặc leaf" />
              </FormField>
              <Btn type="submit" variant="primary" disabled={isPending} className="w-full justify-center">
                <Save size={16} /> {isPending ? 'Đang lưu...' : 'Lưu dịch vụ'}
              </Btn>
            </Card>

            <Card className="p-5">
              <p className="text-sm font-medium text-gray-700 mb-3">Ảnh đại diện</p>
              {imgPreview ? (
                <div className="relative">
                  <img src={imgPreview} alt="" className="w-full h-40 object-cover rounded-lg" />
                  <button type="button" onClick={() => { setImgPreview(''); setValue('image', '') }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-gray-500 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                  {uploading ? <p className="text-sm text-gray-400">Đang upload...</p> : (
                    <><ImageIcon size={24} className="text-gray-300 mb-2" /><p className="text-sm text-gray-400">Click để chọn ảnh</p></>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImgUpload} />
                </label>
              )}
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
