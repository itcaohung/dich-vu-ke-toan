import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { fetchPages, deletePage, updatePage } from '../../api'
import { PageHeader, Card, Spinner, Btn } from '../../components/ui'

export default function PagesListPage() {
  const qc = useQueryClient()
  const [deleting, setDeleting] = useState<number | null>(null)

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: fetchPages,
  })

  const { mutate: remove } = useMutation({
    mutationFn: (id: number) => deletePage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages'] })
      toast.success('Đã xóa trang')
      setDeleting(null)
    },
    onError: () => toast.error('Xóa thất bại'),
  })

  const { mutate: toggleStatus } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'DRAFT' | 'PUBLISHED' }) =>
      updatePage(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages'] }),
    onError: () => toast.error('Cập nhật thất bại'),
  })

  if (isLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title="Quản lý trang"
        subtitle={`${pages.length} trang`}
        action={
          <Link to="/pages/new">
            <Btn variant="primary" icon={<Plus size={16} />}>Thêm trang</Btn>
          </Link>
        }
      />

      <Card>
        {pages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">Chưa có trang nào.</p>
            <Link to="/pages/new">
              <Btn variant="primary" icon={<Plus size={16} />}>Tạo trang đầu tiên</Btn>
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase tracking-wider">
                <th className="pb-3 pr-4 font-medium">Tiêu đề</th>
                <th className="pb-3 pr-4 font-medium">Slug</th>
                <th className="pb-3 pr-4 font-medium">Trạng thái</th>
                <th className="pb-3 pr-4 font-medium">Thứ tự</th>
                <th className="pb-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-900">{page.title}</p>
                    {page.excerpt && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{page.excerpt}</p>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <code className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      /{page.slug}
                    </code>
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => toggleStatus({
                        id: page.id,
                        status: page.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
                      })}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium cursor-pointer transition-colors ${
                        page.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {page.status === 'PUBLISHED'
                        ? <><Eye size={12} /> Đã xuất bản</>
                        : <><EyeOff size={12} /> Bản nháp</>
                      }
                    </button>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">{page.order}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`http://localhost:5173/trang/${page.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Xem trên website"
                      >
                        <Eye size={16} />
                      </a>
                      <Link
                        to={`/pages/${page.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </Link>
                      {deleting === page.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => remove(page.id)}
                            className="text-xs text-red-600 font-medium hover:underline"
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={() => setDeleting(null)}
                            className="text-xs text-gray-500 hover:underline"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleting(page.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
