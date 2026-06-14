import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchCategories, importWordPress } from '../../api'
import { PageHeader, Card, Badge, Btn, Select } from '../../components/ui'

// ── WordPress XML parser (runs in browser via DOMParser) ──────────────────────

const WP_NS = 'http://wordpress.org/export/1.2/'
const CONTENT_NS = 'http://purl.org/rss/1.0/modules/content/'
const EXCERPT_NS = 'http://wordpress.org/export/1.2/excerpt/'

function ns(el: Element, namespace: string, local: string): string {
  return el.getElementsByTagNameNS(namespace, local)[0]?.textContent?.trim() ?? ''
}

function plain(el: Element, tag: string): string {
  return el.getElementsByTagName(tag)[0]?.textContent?.trim() ?? ''
}

export interface ParsedPost {
  title: string
  slug: string
  content: string
  excerpt: string
  publishedAt: string
  wpStatus: string
  thumbnailUrl: string   // external URL from WP attachment
  selected: boolean
}

// Lấy thumbnail_id từ postmeta của một item
function getThumbnailId(item: Element): string {
  const metas = Array.from(item.getElementsByTagNameNS(WP_NS, 'postmeta'))
  for (const meta of metas) {
    const key = meta.getElementsByTagNameNS(WP_NS, 'meta_key')[0]?.textContent?.trim()
    if (key === '_thumbnail_id') {
      return meta.getElementsByTagNameNS(WP_NS, 'meta_value')[0]?.textContent?.trim() ?? ''
    }
  }
  return ''
}

function parseWXR(xml: string): ParsedPost[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml')

  const parseError = doc.querySelector('parsererror')
  if (parseError) throw new Error('File XML không hợp lệ')

  const items = Array.from(doc.getElementsByTagName('item'))

  // Pass 1: xây map postId → attachment URL
  const attachmentMap = new Map<string, string>()
  for (const item of items) {
    if (ns(item, WP_NS, 'post_type') !== 'attachment') continue
    const postId = ns(item, WP_NS, 'post_id')
    const url = ns(item, WP_NS, 'attachment_url')
    if (postId && url) attachmentMap.set(postId, url)
  }

  // Pass 2: parse bài viết
  const posts: ParsedPost[] = []
  for (const item of items) {
    const postType = ns(item, WP_NS, 'post_type')
    if (postType !== 'post') continue

    const wpStatus = ns(item, WP_NS, 'status')
    if (wpStatus === 'auto-draft' || wpStatus === 'trash') continue

    const title = plain(item, 'title')
    const content = ns(item, CONTENT_NS, 'encoded')
    if (!title || !content) continue

    const rawDate = ns(item, WP_NS, 'post_date_gmt') || ns(item, WP_NS, 'post_date')
    const publishedAt = rawDate && rawDate !== '0000-00-00 00:00:00'
      ? new Date(rawDate.replace(' ', 'T') + 'Z').toISOString()
      : new Date().toISOString()

    const thumbnailId = getThumbnailId(item)
    const thumbnailUrl = thumbnailId ? (attachmentMap.get(thumbnailId) ?? '') : ''

    posts.push({
      title,
      slug: ns(item, WP_NS, 'post_name'),
      content,
      excerpt: ns(item, EXCERPT_NS, 'encoded'),
      publishedAt,
      wpStatus,
      thumbnailUrl,
      selected: true,
    })
  }

  return posts
}

// ── Component ──────────────────────────────────────────────────────────────────

type Phase = 'idle' | 'parsed' | 'done'

const WP_STATUS_LABEL: Record<string, { label: string; variant: 'green' | 'gray' | 'yellow' }> = {
  publish: { label: 'Đã đăng', variant: 'green' },
  draft: { label: 'Nháp', variant: 'gray' },
  private: { label: 'Riêng tư', variant: 'yellow' },
  pending: { label: 'Chờ duyệt', variant: 'yellow' },
}

export default function ImportWordPressPage() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [fileName, setFileName] = useState('')
  const [posts, setPosts] = useState<ParsedPost[]>([])
  const [categoryId, setCategoryId] = useState<string>('')
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED')
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })

  const { mutate: doImport, isPending } = useMutation({
    mutationFn: importWordPress,
    onSuccess: (data) => {
      setResult(data)
      setPhase('done')
      qc.invalidateQueries({ queryKey: ['posts'] })
      toast.success(`Nhập thành công ${data.imported} bài viết`)
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: { message?: string; errors?: { field: string; message: string }[] } } })?.response?.data
      if (data?.errors?.length) {
        const detail = data.errors.slice(0, 3).map((e) => `${e.field}: ${e.message}`).join('; ')
        toast.error(`Lỗi dữ liệu: ${detail}`, { duration: 8000 })
      } else {
        toast.error(data?.message ?? 'Nhập thất bại, vui lòng thử lại')
      }
    },
  })

  function handleFile(file: File) {
    if (!file.name.endsWith('.xml')) {
      toast.error('Vui lòng chọn file .xml export từ WordPress')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = parseWXR(e.target?.result as string)
        if (parsed.length === 0) {
          toast.error('Không tìm thấy bài viết nào trong file XML này')
          return
        }
        setPosts(parsed)
        setFileName(file.name)
        setPhase('parsed')
        setResult(null)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Lỗi đọc file XML')
      }
    }
    reader.readAsText(file, 'utf-8')
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function toggleAll(checked: boolean) {
    setPosts((p) => p.map((post) => ({ ...post, selected: checked })))
  }

  function toggleOne(idx: number) {
    setPosts((p) => p.map((post, i) => i === idx ? { ...post, selected: !post.selected } : post))
  }

  function handleImport() {
    const selected = posts.filter((p) => p.selected)
    if (selected.length === 0) { toast.error('Chưa chọn bài viết nào'); return }
    doImport({
      posts: selected.map(({ title, slug, content, excerpt, publishedAt, thumbnailUrl }) => ({
        title, slug, content, excerpt, publishedAt,
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
      })),
      categoryId: categoryId ? Number(categoryId) : null,
      status,
    })
  }

  function resetPage() {
    setPhase('idle')
    setPosts([])
    setFileName('')
    setResult(null)
    setExpandedIdx(null)
  }

  const selectedCount = posts.filter((p) => p.selected).length
  const allSelected = posts.length > 0 && selectedCount === posts.length

  return (
    <div className="p-6 max-w-5xl">
      <PageHeader title="Nhập từ WordPress XML">
        {phase !== 'idle' && (
          <Btn variant="secondary" onClick={resetPage}>
            <Upload size={14} /> Chọn file khác
          </Btn>
        )}
      </PageHeader>

      {/* ── Step 1: File upload ── */}
      {phase === 'idle' && (
        <div className="space-y-6">
          <Card>
            <div
              className={`m-6 border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer ${
                dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Upload size={28} className="text-blue-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-lg">Kéo thả file XML vào đây</p>
                <p className="text-gray-500 text-sm mt-1">hoặc click để chọn file</p>
                <p className="text-gray-400 text-xs mt-2">Chấp nhận file <code>.xml</code> export từ WordPress</p>
              </div>
              <input ref={fileRef} type="file" accept=".xml" className="hidden" onChange={onInputChange} />
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-medium text-gray-700 mb-3">Cách export XML từ WordPress</p>
            <ol className="text-sm text-gray-600 space-y-1.5 list-decimal list-inside">
              <li>Đăng nhập vào trang quản trị WordPress</li>
              <li>Vào <strong>Công cụ → Xuất</strong> (Tools → Export)</li>
              <li>Chọn <strong>"Bài viết"</strong> (Posts)</li>
              <li>Nhấn <strong>"Tải xuống file xuất"</strong> để tải file .xml</li>
              <li>Upload file đó lên đây</li>
            </ol>
          </Card>
        </div>
      )}

      {/* ── Step 2: Preview + config ── */}
      {phase === 'parsed' && (
        <div className="space-y-4">
          {/* Config bar */}
          <Card className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 mr-auto">
                <FileText size={16} className="text-blue-500" />
                <span className="font-medium text-gray-800">{fileName}</span>
                <span className="text-gray-400">—</span>
                <span><strong className="text-blue-600">{posts.length}</strong> bài viết</span>
                {posts.filter(p => p.thumbnailUrl).length > 0 && (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {posts.filter(p => p.thumbnailUrl).length} ảnh đại diện
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Chuyên mục</label>
                  <Select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-52"
                  >
                    <option value="">— Không chỉ định —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái</label>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'PUBLISHED' | 'DRAFT')}
                    className="w-36"
                  >
                    <option value="PUBLISHED">Đã đăng</option>
                    <option value="DRAFT">Nháp</option>
                  </Select>
                </div>

                <Btn
                  variant="primary"
                  onClick={handleImport}
                  disabled={isPending || selectedCount === 0}
                >
                  {isPending ? 'Đang nhập...' : `Nhập ${selectedCount} bài viết`}
                </Btn>
              </div>
            </div>
          </Card>

          {/* Posts table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => toggleAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 w-16"></th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Ngày đăng</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Trạng thái WP</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {posts.map((post, idx) => {
                    const statusInfo = WP_STATUS_LABEL[post.wpStatus] ?? { label: post.wpStatus, variant: 'gray' as const }
                    const isExpanded = expandedIdx === idx
                    return (
                      <>
                        <tr key={idx} className={`hover:bg-gray-50 ${!post.selected ? 'opacity-50' : ''}`}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={post.selected}
                              onChange={() => toggleOne(idx)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 w-16">
                            {post.thumbnailUrl
                              ? <img src={post.thumbnailUrl} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-100" />
                              : <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center"><FileText size={16} className="text-gray-300" /></div>
                            }
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900 line-clamp-1">{post.title}</p>
                            {post.slug && <p className="text-xs text-gray-400 mt-0.5 font-mono">{post.slug}</p>}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-4 py-3">
                            <Badge label={statusInfo.label} variant={statusInfo.variant} />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="Xem trước nội dung"
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${idx}-preview`}>
                            <td colSpan={5} className="px-6 pb-4 bg-gray-50">
                              {post.excerpt && (
                                <p className="text-sm text-gray-600 italic mb-3 border-l-4 border-blue-200 pl-3">{post.excerpt}</p>
                              )}
                              <div
                                className="prose prose-sm max-w-none text-gray-700 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                              />
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── Step 3: Result ── */}
      {phase === 'done' && result && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 flex items-center gap-4">
              <CheckCircle2 size={32} className="text-green-500 shrink-0" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{result.imported}</p>
                <p className="text-sm text-gray-500">Đã nhập thành công</p>
              </div>
            </Card>
            <Card className="p-5 flex items-center gap-4">
              <XCircle size={32} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{result.skipped}</p>
                <p className="text-sm text-gray-500">Bỏ qua (đã tồn tại)</p>
              </div>
            </Card>
            <Card className="p-5 flex items-center gap-4">
              <AlertCircle size={32} className={result.errors.length > 0 ? 'text-red-500 shrink-0' : 'text-gray-300 shrink-0'} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{result.errors.length}</p>
                <p className="text-sm text-gray-500">Lỗi</p>
              </div>
            </Card>
          </div>

          {result.errors.length > 0 && (
            <Card className="p-4">
              <p className="text-sm font-medium text-red-600 mb-2">Chi tiết lỗi:</p>
              <ul className="text-xs text-red-500 space-y-1">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </Card>
          )}

          <div className="flex gap-3">
            <Btn variant="primary" onClick={resetPage}>
              <Upload size={14} /> Nhập file khác
            </Btn>
            <a href="/posts">
              <Btn variant="secondary">Xem danh sách bài viết</Btn>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
