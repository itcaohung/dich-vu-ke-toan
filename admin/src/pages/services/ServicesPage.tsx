import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchServices, deleteService } from '../../api'
import { PageHeader, Card, Spinner, Table, Btn, Badge } from '../../components/ui'

export default function ServicesPage() {
  const qc = useQueryClient()
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
  })

  const { mutate: remove } = useMutation({
    mutationFn: deleteService,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success('Đã xóa') },
    onError: () => toast.error('Xóa thất bại'),
  })

  return (
    <div className="p-6">
      <PageHeader title="Dịch vụ">
        <Link to="/services/new">
          <Btn variant="primary"><Plus size={16} /> Thêm dịch vụ</Btn>
        </Link>
      </PageHeader>

      <Card>
        {isLoading ? <Spinner /> : (
          <Table headers={['', 'Tên', 'Giá', 'Thứ tự', 'Trạng thái', '']}>
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-300"><GripVertical size={16} /></td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{s.title}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{s.slug}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.price ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{s.order}</td>
                <td className="px-4 py-3">
                  <Badge label={s.isActive ? 'Hoạt động' : 'Ẩn'} variant={s.isActive ? 'green' : 'gray'} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/services/${s.id}`}>
                      <Btn variant="ghost" size="sm"><Pencil size={14} /></Btn>
                    </Link>
                    <Btn variant="ghost" size="sm" onClick={() => {
                      if (confirm(`Xóa dịch vụ "${s.title}"?`)) remove(s.id)
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
    </div>
  )
}
