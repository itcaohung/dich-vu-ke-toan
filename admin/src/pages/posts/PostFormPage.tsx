import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, ImageIcon, X } from 'lucide-react'
import { fetchPost, createPost, updatePost, fetchCategories, uploadImage } from '../../api'
import { API_BASE } from '../../api/client'
import { PageHeader, Card, Spinner, Btn, FormField, Input, Textarea, Select } from '../../components/ui'
import RichEditor from '../../components/editor/RichEditor'

const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề'),
  slug: z.string().min(1, 'Vui lòng nhập slug'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Vui lòng nhập nội dung'),
  thumbnail: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  categoryId: z.number().optional(),
})

type FormData = z.infer<typeof schema>

function slugify(str: string) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
}

export default function PostFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)

  const { data: post, isLoading: loadingPost } = useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPost(Number(id)),
    enabled: isEdit,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'DRAFT', content: '' },
  })

  useEffect(() => {
    if (post) {
      setValue('title', post.title)
      setValue('slug', post.slug)
      setValue('excerpt', post.excerpt ?? '')
      setValue('content', post.content)
      setValue('thumbnail', post.thumbnail ?? '')
      setValue('status', post.status)
      setValue('categoryId', post.categoryId ?? undefined)
      if (post.thumbnail) setThumbnailPreview(post.thumbnail.startsWith('http') ? post.thumbnail : `${API_BASE}${post.thumbnail}`)
    }
  }, [post, setValue])

  const titleValue = watch('title')
  useEffect(() => {
    if (!isEdit && titleValue) setValue('slug', slugify(titleValue))
  }, [titleValue, isEdit, setValue])

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: FormData) => isEdit
      ? updatePost(Number(id), data)
      : createPost(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      toast.success(isEdit ? 'Đã cập nhật bài viết' : 'Đã tạo bài viết')
      navigate('/posts')
    },
    onError: () => toast.error('Lưu thất bại'),
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

  if (isEdit && loadingPost) return <div className="p-6"><Spinner /></div>

  return (
    <div className="p-6">
      <PageHeader title={isEdit ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}>
        <Btn variant="secondary" onClick={() => navigate('/posts')}><ArrowLeft size={16} /> Quay lại</Btn>
      </PageHeader>

      <form onSubmit={handleSubmit((d) => save(d))}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <Card className="p-5 space-y-4">
              <FormField label="Tiêu đề" error={errors.title?.message}>
                <Input {...register('title')} placeholder="Tiêu đề bài viết" />
              </FormField>
              <FormField label="Slug" error={errors.slug?.message}>
                <Input {...register('slug')} placeholder="slug-bai-viet" />
              </FormField>
              <FormField label="Mô tả ngắn">
                <Textarea {...register('excerpt')} rows={3} placeholder="Mô tả ngắn hiển thị ở danh sách..." />
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
          </div>

          <div className="space-y-4">
            <Card className="p-5 space-y-4">
              <FormField label="Trạng thái">
                <Select {...register('status')}>
                  <option value="DRAFT">Nháp</option>
                  <option value="PUBLISHED">Đăng ngay</option>
                </Select>
              </FormField>
              <FormField label="Danh mục">
                <Select {...register('categoryId', { setValueAs: (v) => v ? Number(v) : undefined })}>
                  <option value="">— Không có —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </FormField>
              <Btn type="submit" variant="primary" disabled={isPending} className="w-full justify-center">
                <Save size={16} /> {isPending ? 'Đang lưu...' : 'Lưu bài viết'}
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
