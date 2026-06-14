import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../api'
import { PageHeader, Card, Spinner, Table, Btn, Modal, FormField, Input } from '../../components/ui'
import type { Category } from '../../types'

const schema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên'),
  slug: z.string().min(1, 'Vui lòng nhập slug'),
})
type FormData = z.infer<typeof schema>

function slugify(str: string) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
}

export default function CategoriesPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; item?: Category }>({ open: false })

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: FormData) => modal.item
      ? updateCategory(modal.item.id, data)
      : createCategory(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      toast.success(modal.item ? 'Đã cập nhật' : 'Đã tạo danh mục')
      setModal({ open: false })
      reset()
    },
    onError: () => toast.error('Lưu thất bại'),
  })

  const { mutate: remove } = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Đã xóa') },
    onError: () => toast.error('Xóa thất bại'),
  })

  function openCreate() {
    reset({ name: '', slug: '' })
    setModal({ open: true })
  }

  function openEdit(item: Category) {
    reset({ name: item.name, slug: item.slug })
    setModal({ open: true, item })
  }

  return (
    <div className="p-6">
      <PageHeader title="Danh mục">
        <Btn variant="primary" onClick={openCreate}><Plus size={16} /> Thêm danh mục</Btn>
      </PageHeader>

      <Card>
        {isLoading ? <Spinner /> : (
          <Table headers={['Tên', 'Slug', 'Bài viết', 'Ngày tạo', '']}>
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500 font-mono">{c.slug}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{c._count?.posts ?? 0}</td>
                <td className="px-4 py-3 text-sm text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Btn variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil size={14} /></Btn>
                    <Btn variant="ghost" size="sm" onClick={() => {
                      if (confirm(`Xóa danh mục "${c.name}"?`)) remove(c.id)
                    }}>
                      <Trash2 size={14} className="text-red-400" />
                    </Btn>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.item ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
      >
        <form onSubmit={handleSubmit((d) => save(d))} className="space-y-4">
          <FormField label="Tên danh mục" error={errors.name?.message}>
            <Input
              {...register('name')}
              placeholder="Ví dụ: Tin tức"
              onChange={(e) => {
                setValue('name', e.target.value)
                if (!modal.item) setValue('slug', slugify(e.target.value))
              }}
            />
          </FormField>
          <FormField label="Slug" error={errors.slug?.message}>
            <Input {...register('slug')} placeholder="tin-tuc" />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={() => setModal({ open: false })}>Hủy</Btn>
            <Btn type="submit" variant="primary" disabled={isPending}>
              {isPending ? 'Đang lưu...' : 'Lưu'}
            </Btn>
          </div>
        </form>
      </Modal>
    </div>
  )
}
