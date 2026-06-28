import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, ImageIcon, X, ExternalLink } from 'lucide-react'
import { fetchPage, createPage, updatePage, uploadImage } from '../../api'
import { API_BASE } from '../../api/client'
import { PageHeader, Card, Spinner, Btn, FormField, Input, Textarea, Select } from '../../components/ui'
import RichEditor from '../../components/editor/RichEditor'

const schema = z.object({
  title:          z.string().min(1, 'Vui lòng nhập tiêu đề'),
  slug:           z.string().min(1, 'Vui lòng nhập slug').regex(/^[a-z0-9-]+$/, 'Slug chỉ gồm a-z, 0-9, dấu -'),
  excerpt:        z.string().optional(),
  content:        z.string(),
  thumbnail:      z.string().optional(),
  status:         z.enum(['DRAFT', 'PUBLISHED']),
  seoTitle:       z.string().optional(),
  seoDescription: z.string().optional(),
  order:          z.number().int(),
})

type FormData = z.infer<typeof schema>

function slugify(str: string) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
}

export default function PageFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  const { data: page, isLoading } = useQuery({
    queryKey: ['page', id],
    queryFn: () => fetchPage(Number(id)),
    enabled: isEdit,
  })

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'DRAFT', content: '', order: 0 },
  })

  useEffect(() => {
    if (page) {
      setValue('title', page.title)
      setValue('slug', page.slug)
      setValue('excerpt', page.excerpt ?? '')
      setValue('content', page.content)
      setValue('thumbnail', page.thumbnail ?? '')
      setValue('status', page.status)
      setValue('seoTitle', page.seoTitle ?? '')
      setValue('seoDescription', page.seoDescription ?? '')
      setValue('order', page.order)
      if (page.thumbnail) {
        setThumbnailPreview(
          page.thumbnail.startsWith('http') ? page.thumbnail : `${API_BASE}${page.thumbnail}`
        )
      }
    }
  }, [page, setValue])

  const titleValue = watch('title')
  useEffect(() => {
    if (!isEdit && titleValue) setValue('slug', slugify(titleValue))
  }, [titleValue, isEdit, setValue])

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? updatePage(Number(id), data) : createPage(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages'] })
      toast.success(isEdit ? 'Đã cập nhật trang' : 'Đã tạo trang')
      navigate('/pages')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Lưu thất bại')
    },
  })

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setValue('thumbnail', url)
      setThumbnailPreview(`${API_BASE}${url}`)
    } catch {
      toast.error('Upload ảnh thất bại')
    } finally {
      setUploading(false)
    }
  }

  const slugValue = watch('slug')

  if (isEdit && isLoading) return <div className="p-6"><Spinner /></div>

  return (
    <div className="p-6">
      <PageHeader title={isEdit ? 'Chỉnh sửa trang' : 'Tạo trang mới'}>
        <Btn variant="secondary" onClick={() => navigate('/pages')}>
          <ArrowLeft size={16} /> Quay lại
        </Btn>
      </PageHeader>

      <form onSubmit={handleSubmit((d) => save(d))}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left: content */}
          <div className="xl:col-span-2 space-y-4">
            <Card className="p-5 space-y-4">
              <FormField label="Tiêu đề trang" error={errors.title?.message}>
                <Input {...register('title')} placeholder="Ví dụ: Giới thiệu công ty" />
              </FormField>

              <FormField label="Slug (đường dẫn)" error={errors.slug?.message}>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 whitespace-nowrap">ketoanvietachau.vn/trang/</span>
                  <Input {...register('slug')} placeholder="gioi-thieu-cong-ty" className="flex-1" />
                  {slugValue && page?.status === 'PUBLISHED' && (
                    <a
                      href={`http://localhost:5173/trang/${slugValue}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                      title="Xem trên website"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </FormField>

              <FormField label="Mô tả ngắn">
                <Textarea
                  {...register('excerpt')}
                  rows={2}
                  placeholder="Tóm tắt hiển thị ở trang danh sách..."
                />
              </FormField>
            </Card>

            <Card className="p-5">
              <FormField label="Nội dung" error={errors.content?.message}>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <RichEditor value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>
            </Card>

            {/* SEO */}
            <Card className="p-5 space-y-4">
              <p className="text-sm font-semibold text-gray-700">SEO</p>
              <FormField label="Tiêu đề SEO">
                <Input
                  {...register('seoTitle')}
                  placeholder="Để trống sẽ dùng tiêu đề trang"
                />
              </FormField>
              <FormField label="Mô tả SEO">
                <Textarea
                  {...register('seoDescription')}
                  rows={2}
                  placeholder="Mô tả ngắn hiển thị trên Google..."
                />
              </FormField>
            </Card>
          </div>

          {/* Right: settings */}
          <div className="space-y-4">
            <Card className="p-5 space-y-4">
              <FormField label="Trạng thái">
                <Select {...register('status')}>
                  <option value="DRAFT">Nháp</option>
                  <option value="PUBLISHED">Đã xuất bản</option>
                </Select>
              </FormField>

              <FormField label="Thứ tự">
                <Input
                  type="number"
                  {...register('order', { valueAsNumber: true })}
                />
              </FormField>

              <Btn type="submit" variant="primary" disabled={isPending} className="w-full justify-center">
                <Save size={16} />
                {isPending ? 'Đang lưu...' : 'Lưu trang'}
              </Btn>
            </Card>

            <Card className="p-5">
              <p className="text-sm font-medium text-gray-700 mb-3">Ảnh đại diện</p>
              {thumbnailPreview ? (
                <div className="relative">
                  <img src={thumbnailPreview} alt="" className="w-full h-40 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => { setThumbnailPreview(''); setValue('thumbnail', '') }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-gray-500 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                  {uploading ? (
                    <p className="text-sm text-gray-400">Đang upload...</p>
                  ) : (
                    <>
                      <ImageIcon size={24} className="text-gray-300 mb-2" />
                      <p className="text-sm text-gray-400">Click để chọn ảnh</p>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                </label>
              )}
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
