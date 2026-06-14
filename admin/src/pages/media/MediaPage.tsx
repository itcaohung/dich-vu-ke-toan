import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Trash2, Copy, Check, Search, X, ImageIcon, ChevronDown, CheckSquare, Square } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchMedia, deleteMedia, uploadImages } from '../../api'
import { API_BASE } from '../../api/client'
import { PageHeader, Spinner } from '../../components/ui'
import type { MediaFile } from '../../api'

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function MediaPage() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [folder, setFolder] = useState('')
  const [search, setSearch] = useState('')
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [preview, setPreview] = useState<MediaFile | null>(null)
  const [copied, setCopied] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['media', folder, search],
    queryFn: () => fetchMedia({ folder: folder || undefined, search: search || undefined }),
  })

  const { mutate: removeSingle } = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] })
      if (preview) setPreview(null)
      toast.success('Đã xóa')
    },
    onError: () => toast.error('Xóa thất bại'),
  })

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    setUploadPct(0)
    try {
      await uploadImages(Array.from(files), setUploadPct)
      await qc.invalidateQueries({ queryKey: ['media'] })
      toast.success(`Đã upload ${files.length} ảnh`)
    } catch {
      toast.error('Upload thất bại')
    } finally {
      setUploading(false)
      setUploadPct(0)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(`${API_BASE}${url}`)
    setCopied(url)
    setTimeout(() => setCopied(''), 2000)
    toast.success('Đã copy URL')
  }

  function toggleSelect(url: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(url) ? next.delete(url) : next.add(url)
      return next
    })
  }

  function toggleSelectAll() {
    const all = data?.files ?? []
    if (selected.size === all.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(all.map((f) => f.url)))
    }
  }

  async function bulkDelete() {
    if (!selected.size) return
    if (!confirm(`Xóa ${selected.size} ảnh đã chọn? Thao tác không thể hoàn tác.`)) return
    setBulkDeleting(true)
    try {
      await Promise.all([...selected].map((url) => deleteMedia(url)))
      await qc.invalidateQueries({ queryKey: ['media'] })
      toast.success(`Đã xóa ${selected.size} ảnh`)
      setSelected(new Set())
      setSelectMode(false)
    } catch {
      toast.error('Có lỗi khi xóa, vui lòng thử lại')
    } finally {
      setBulkDeleting(false)
    }
  }

  function exitSelectMode() {
    setSelectMode(false)
    setSelected(new Set())
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleUpload(e.dataTransfer.files)
  }, [])

  const files = data?.files ?? []
  const folders = data?.folders ?? []
  const allSelected = files.length > 0 && selected.size === files.length

  return (
    <div className="p-6 pb-28">
      <PageHeader title={`Media Library ${data ? `(${data.total})` : ''}`}>
        {/* Nút chọn nhiều */}
        <button
          onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
            selectMode
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {selectMode ? <CheckSquare size={16} /> : <Square size={16} />}
          {selectMode ? 'Đang chọn...' : 'Chọn nhiều'}
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-60 transition-colors"
        >
          <Upload size={16} />
          {uploading ? `Đang upload ${uploadPct}%` : 'Upload ảnh'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => handleUpload(e.target.files)} />
      </PageHeader>

      {/* Drop zone */}
      {!selectMode && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mb-4 border-2 border-dashed rounded-xl p-5 text-center text-sm transition-colors ${
            dragging ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400'
          }`}
        >
          <Upload size={18} className="mx-auto mb-1 opacity-50" />
          Kéo thả ảnh vào đây để upload
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="mb-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${uploadPct}%` }} />
        </div>
      )}

      {/* Select mode banner */}
      {selectMode && (
        <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
          <CheckSquare size={16} className="shrink-0" />
          <span className="flex-1">
            Click vào ảnh để chọn.
            {selected.size > 0 && <b className="ml-1">{selected.size} ảnh đã chọn.</b>}
          </span>
          <button
            onClick={toggleSelectAll}
            className="font-medium hover:text-blue-900 transition-colors"
          >
            {allSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${files.length})`}
          </button>
          <button onClick={exitSelectMode} className="text-blue-400 hover:text-blue-700 ml-1">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <select
            value={folder}
            onChange={(e) => { setFolder(e.target.value); setSelected(new Set()) }}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả tháng</option>
            {folders.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên file..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <ImageIcon size={40} className="mb-3 opacity-40" />
          <p>Không có ảnh nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {files.map((file) => {
            const isSelected = selected.has(file.url)
            return (
              <div
                key={file.url}
                onClick={() => selectMode ? toggleSelect(file.url) : setPreview(file)}
                className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                    : selectMode
                      ? 'border-gray-200 hover:border-blue-300'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {/* Ảnh */}
                <div className="aspect-square bg-gray-100 relative">
                  <img
                    src={`${API_BASE}${file.url}`}
                    alt={file.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />

                  {/* Overlay mờ khi chọn */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-blue-500/20" />
                  )}
                </div>

                {/* Checkbox — luôn hiển thị trong select mode */}
                {selectMode ? (
                  <div className={`absolute top-2 left-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shadow-sm ${
                    isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
                  }`}>
                    {isSelected && <Check size={13} className="text-white" strokeWidth={3} />}
                  </div>
                ) : (
                  // Hover-only checkbox khi không ở select mode
                  <div className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 bg-white/90 border-gray-300`} />
                )}

                {/* Actions nổi — chỉ khi không ở select mode */}
                {!selectMode && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 justify-end">
                    <button
                      onClick={(e) => { e.stopPropagation(); copyUrl(file.url) }}
                      title="Copy URL"
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white transition-colors"
                    >
                      {copied === file.url ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); confirm(`Xóa ${file.filename}?`) && removeSingle(file.url) }}
                      title="Xóa"
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500/80 text-white transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}

                {/* Tên file */}
                <div className="px-2 py-1.5 bg-white">
                  <p className="text-xs text-gray-600 truncate" title={file.filename}>{file.filename}</p>
                  <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Thanh action cố định phía dưới khi đang chọn ── */}
      {selectMode && (
        <div className={`fixed bottom-0 left-60 right-0 z-40 border-t transition-all duration-200 ${
          selected.size > 0 ? 'bg-white shadow-2xl' : 'bg-gray-50 shadow-md'
        }`}>
          <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center gap-4">
            {selected.size > 0 ? (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Check size={16} className="text-blue-600" />
                  </div>
                  <span className="font-semibold text-gray-900">
                    Đã chọn <span className="text-blue-600">{selected.size}</span> ảnh
                  </span>
                </div>
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  Bỏ chọn tất cả
                </button>
                <button
                  onClick={toggleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50"
                >
                  {allSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${files.length})`}
                </button>
                <button
                  onClick={exitSelectMode}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={bulkDelete}
                  disabled={bulkDeleting}
                  className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 transition-colors"
                >
                  <Trash2 size={16} />
                  {bulkDeleting ? 'Đang xóa...' : `Xóa ${selected.size} ảnh`}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 text-sm text-gray-500 w-full">
                <CheckSquare size={16} className="text-gray-400" />
                <span>Click vào ảnh để chọn, sau đó nhấn Xóa.</span>
                <button onClick={exitSelectMode} className="ml-auto text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  <X size={14} /> Thoát
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview modal */}
      {preview && !selectMode && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-100 flex items-center justify-center max-h-96 overflow-hidden">
              <img src={`${API_BASE}${preview.url}`} alt={preview.filename} className="max-h-96 object-contain" />
            </div>
            <div className="p-5 space-y-3">
              <p className="font-medium text-gray-900 break-all">{preview.filename}</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                <span>Thư mục: <b className="text-gray-700">{preview.folder}</b></span>
                <span>Kích thước: <b className="text-gray-700">{formatSize(preview.size)}</b></span>
                <span>Ngày tải lên: <b className="text-gray-700">{formatDate(preview.createdAt)}</b></span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                <code className="flex-1 text-xs text-gray-600 break-all">{`${API_BASE}${preview.url}`}</code>
                <button
                  onClick={() => copyUrl(preview.url)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg"
                >
                  {copied === preview.url ? <Check size={12} /> : <Copy size={12} />}
                  Copy URL
                </button>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => { confirm(`Xóa ${preview.filename}?`) && removeSingle(preview.url) }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={14} /> Xóa file
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
