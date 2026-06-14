import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Pencil, Trash2, ExternalLink, Eye, EyeOff, RotateCcw, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/client'
import { PageHeader, Card, Spinner, Btn, Modal, FormField, Input, Select } from '../../components/ui'

interface MenuItem {
  id: number
  label: string
  url: string
  order: number
  isActive: boolean
  openNew: boolean
  parentId: number | null
  children: MenuItem[]
}

const DEFAULT_MENU = [
  { label: 'Trang chủ', url: '/', order: 1 },
  { label: 'Dịch vụ', url: '/dich-vu', order: 2 },
  { label: 'Tin tức', url: '/tin-tuc', order: 3 },
  { label: 'Giới thiệu', url: '/gioi-thieu', order: 4 },
  { label: 'Liên hệ', url: '/lien-he', order: 5 },
]

const fetchMenu = () => api.get<MenuItem[]>('/admin/menu').then((r) => r.data)
const createMenuItem = (data: Partial<MenuItem>) => api.post<MenuItem>('/admin/menu', data).then((r) => r.data)
const updateMenuItem = (id: number, data: Partial<MenuItem>) => api.put<MenuItem>(`/admin/menu/${id}`, data).then((r) => r.data)
const deleteMenuItem = (id: number) => api.delete(`/admin/menu/${id}`).then((r) => r.data)
const reorderMenu = (items: { id: number; order: number; parentId?: number | null }[]) =>
  api.put('/admin/menu/reorder', items).then((r) => r.data)

const schema = z.object({
  label: z.string().min(1, 'Vui lòng nhập tên hiển thị'),
  url: z.string().min(1, 'Vui lòng nhập đường dẫn'),
  order: z.number(),
  isActive: z.boolean(),
  openNew: z.boolean(),
  parentId: z.number().nullable().optional(),
})
type FormData = z.infer<typeof schema>

// ── Sortable row ──────────────────────────────────────────────────────────────
function SortableRow({
  item, depth, onEdit, onDelete, onToggle,
}: {
  item: MenuItem
  depth: number
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
  onToggle: (item: MenuItem) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50 group">
      <td className="px-4 py-3 w-8">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors touch-none"
          title="Kéo để sắp xếp"
        >
          <GripVertical size={16} />
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
          {depth > 0 && <span className="text-gray-300 text-xs">└</span>}
          <span className="font-medium text-gray-900">{item.label}</span>
          {item.openNew && <ExternalLink size={12} className="text-gray-400" />}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{item.url}</td>
      <td className="px-4 py-3 text-sm text-gray-400">{item.order}</td>
      <td className="px-4 py-3">
        <button onClick={() => onToggle(item)}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
            item.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}>
          {item.isActive ? <Eye size={11} /> : <EyeOff size={11} />}
          {item.isActive ? 'Hiển thị' : 'Ẩn'}
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <Btn variant="ghost" size="sm" onClick={() => onEdit(item)}><Pencil size={14} /></Btn>
          <Btn variant="ghost" size="sm" onClick={() => onDelete(item)}>
            <Trash2 size={14} className="text-red-400" />
          </Btn>
        </div>
      </td>
    </tr>
  )
}

// ── Children sortable group ───────────────────────────────────────────────────
function ChildrenGroup({
  children, onEdit, onDelete, onToggle, onChildrenReorder,
}: {
  children: MenuItem[]
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
  onToggle: (item: MenuItem) => void
  onChildrenReorder: (items: MenuItem[]) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = children.findIndex((c) => c.id === active.id)
    const newIdx = children.findIndex((c) => c.id === over.id)
    onChildrenReorder(arrayMove(children, oldIdx, newIdx))
  }

  if (children.length === 0) return null

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        {children.map((child) => (
          <SortableRow key={child.id} item={child} depth={1}
            onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
        ))}
      </SortableContext>
    </DndContext>
  )
}

// ── Wrapper renders parent row + its children group (avoids key-less fragment) ─
function SortableRowGroup({
  item, onEdit, onDelete, onToggle, onChildrenReorder,
}: {
  item: MenuItem
  onEdit: (item: MenuItem) => void
  onDelete: (item: MenuItem) => void
  onToggle: (item: MenuItem) => void
  onChildrenReorder: (items: MenuItem[]) => void
}) {
  return (
    <>
      <SortableRow item={item} depth={0} onEdit={onEdit} onDelete={onDelete} onToggle={onToggle} />
      <ChildrenGroup children={item.children} onEdit={onEdit} onDelete={onDelete}
        onToggle={onToggle} onChildrenReorder={onChildrenReorder} />
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MenuPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<{ open: boolean; item?: MenuItem }>({ open: false })
  const [localMenu, setLocalMenu] = useState<MenuItem[] | null>(null)

  const { data: serverMenu = [], isLoading } = useQuery({
    queryKey: ['admin-menu'],
    queryFn: fetchMenu,
  })

  // Sync local optimistic state từ server khi dữ liệu mới về
  useEffect(() => {
    if (serverMenu.length > 0) setLocalMenu(serverMenu)
  }, [serverMenu])

  const menu: MenuItem[] = localMenu ?? serverMenu

  const flatItems = menu.flatMap((m) => [m, ...m.children.flatMap((c) => [c, ...c.children])])

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { order: 0, isActive: true, openNew: false, parentId: null },
  })

  const { mutate: save, isPending } = useMutation({
    mutationFn: (data: FormData) => modal.item
      ? updateMenuItem(modal.item.id, data)
      : createMenuItem(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-menu'] })
      toast.success(modal.item ? 'Đã cập nhật' : 'Đã thêm menu item')
      setModal({ open: false })
    },
    onError: () => toast.error('Lưu thất bại'),
  })

  const { mutate: remove } = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-menu'] }); toast.success('Đã xóa') },
    onError: () => toast.error('Xóa thất bại'),
  })

  const { mutate: toggle } = useMutation({
    mutationFn: (item: MenuItem) => updateMenuItem(item.id, { ...item, isActive: !item.isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-menu'] }),
  })

  const { mutate: doReorder } = useMutation({
    mutationFn: reorderMenu,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-menu'] }),
    onError: () => { toast.error('Sắp xếp thất bại'); qc.invalidateQueries({ queryKey: ['admin-menu'] }) },
  })

  const { mutate: resetMenu, isPending: resetting } = useMutation({
    mutationFn: async () => {
      const topLevel = menu.filter((m) => !m.parentId)
      for (const item of topLevel) await deleteMenuItem(item.id)
      for (const item of DEFAULT_MENU) await createMenuItem({ ...item, isActive: true, openNew: false })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-menu'] }); toast.success('Đã khôi phục menu mặc định') },
    onError: () => toast.error('Khôi phục thất bại'),
  })

  // ── Drag handlers ──
  const topLevelSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleTopLevelDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = menu.findIndex((m) => m.id === active.id)
    const newIdx = menu.findIndex((m) => m.id === over.id)
    const reordered = arrayMove(menu, oldIdx, newIdx)
    setLocalMenu(reordered)
    doReorder(reordered.map((item, i) => ({ id: item.id, order: i + 1, parentId: item.parentId })))
  }

  function handleChildrenReorder(parentId: number, newChildren: MenuItem[]) {
    const updated = menu.map((m) =>
      m.id === parentId ? { ...m, children: newChildren } : m
    )
    setLocalMenu(updated)
    doReorder(newChildren.map((item, i) => ({ id: item.id, order: i + 1, parentId })))
  }

  // ── Modal helpers ──
  function openCreate() {
    reset({ label: '', url: '/', order: menu.length + 1, isActive: true, openNew: false, parentId: null })
    setModal({ open: true })
  }

  function openEdit(item: MenuItem) {
    reset({ label: item.label, url: item.url, order: item.order, isActive: item.isActive, openNew: item.openNew, parentId: item.parentId })
    setModal({ open: true, item })
  }

  function handleDelete(item: MenuItem) {
    const msg = item.children.length > 0
      ? `Xóa "${item.label}" sẽ xóa luôn ${item.children.length} menu con. Tiếp tục?`
      : `Xóa menu "${item.label}"?`
    if (confirm(msg)) remove(item.id)
  }

  return (
    <div className="p-6">
      <PageHeader title="Quản lý Menu">
        <Btn variant="secondary" onClick={() => confirm('Khôi phục menu về mặc định? Toàn bộ menu hiện tại sẽ bị xóa.') && resetMenu()} disabled={resetting}>
          <RotateCcw size={15} /> {resetting ? 'Đang khôi phục...' : 'Khôi phục mặc định'}
        </Btn>
        <Btn variant="primary" onClick={openCreate}><Plus size={16} /> Thêm menu</Btn>
      </PageHeader>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
        Kéo biểu tượng <GripVertical size={14} className="inline" /> để sắp xếp thứ tự. Menu con tối đa 2 cấp.
      </div>

      <Card>
        {isLoading ? <Spinner /> : menu.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="mb-4">Chưa có menu nào.</p>
            <Btn variant="primary" onClick={openCreate}><Plus size={16} /> Thêm menu đầu tiên</Btn>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="w-8 px-4 py-3" />
                  {['Tên hiển thị', 'URL', 'Order', 'Trạng thái', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <DndContext
                  sensors={topLevelSensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleTopLevelDragEnd}
                >
                  <SortableContext items={menu.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                    {menu.map((item) => (
                      <SortableRowGroup key={item.id} item={item}
                        onEdit={openEdit} onDelete={handleDelete} onToggle={toggle}
                        onChildrenReorder={(newChildren) => handleChildrenReorder(item.id, newChildren)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modal.open} onClose={() => setModal({ open: false })}
        title={modal.item ? 'Chỉnh sửa menu' : 'Thêm menu item'}>
        <form onSubmit={handleSubmit((d) => save(d))} className="space-y-4">
          <FormField label="Tên hiển thị" error={errors.label?.message}>
            <Input {...register('label')} placeholder="Ví dụ: Dịch vụ" autoFocus />
          </FormField>
          <FormField label="Đường dẫn (URL)" error={errors.url?.message}>
            <Input {...register('url')} placeholder="/dich-vu hoặc https://..." />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Thứ tự (Order)">
              <Input type="number" {...register('order', { valueAsNumber: true })} />
            </FormField>
            <FormField label="Menu cha">
              <Select {...register('parentId', { setValueAs: (v) => v ? Number(v) : null })}>
                <option value="">— Không có (cấp 1) —</option>
                {flatItems
                  .filter((f) => f.id !== modal.item?.id && !f.parentId)
                  .map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
              </Select>
            </FormField>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="w-4 h-4 rounded text-blue-600" />
              <span className="text-sm text-gray-700">Hiển thị</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('openNew')} className="w-4 h-4 rounded text-blue-600" />
              <span className="text-sm text-gray-700">Mở tab mới</span>
            </label>
          </div>
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
