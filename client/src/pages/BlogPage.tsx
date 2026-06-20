import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileText, Search, Eye } from 'lucide-react'
import { fetchPosts, fetchCategories, API_BASE } from '../api'

function imgUrl(path?: string) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${API_BASE}${path}`
}

export default function BlogPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['posts', { page, search, category }],
    queryFn: () => fetchPosts({ page, limit: 9, search, category: category || undefined }),
  })

  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })

  const posts = data?.data ?? []

  return (
    <div>
      <section className="bg-gradient-to-br from-blue-700 to-blue-800 text-white py-16">
        <div className="max-w-site mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Tin Tức & Kiến Thức</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Cập nhật thông tin mới nhất về kế toán, thuế và pháp luật doanh nghiệp
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-site mx-auto px-4">
          {/* Filter bar */}
          <div className="flex flex-wrap gap-3 mb-8">
            <div className="relative flex-1 min-w-60">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tìm kiếm bài viết..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setCategory(''); setPage(1) }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${!category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                Tất cả
              </button>
              {categories.map((c) => (
                <button key={c.id}
                  onClick={() => { setCategory(c.slug); setPage(1) }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${category === c.slug ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Posts grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p>Không tìm thấy bài viết nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link key={post.id} to={`/tin-tuc/${post.slug}`}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all group">
                  {post.thumbnail
                    ? <img src={imgUrl(post.thumbnail)} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <FileText size={40} className="text-blue-400" />
                      </div>
                  }
                  <div className="p-5">
                    {post.category && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">{post.category.name}</span>
                    )}
                    <h2 className="font-semibold text-gray-900 mt-2.5 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{post.title}</h2>
                    {post.excerpt && <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{post.excerpt}</p>}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-400">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Eye size={12} /> {post.views}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Trước
              </button>

              {(() => {
                const total = data.meta.totalPages
                const pages: (number | '...')[] = []
                if (total <= 7) {
                  for (let i = 1; i <= total; i++) pages.push(i)
                } else {
                  pages.push(1)
                  if (page > 3) pages.push('...')
                  for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i)
                  if (page < total - 2) pages.push('...')
                  pages.push(total)
                }
                return pages.map((p, i) =>
                  p === '...'
                    ? <span key={`ellipsis-${i}`} className="px-1 text-gray-400 text-sm">...</span>
                    : <button key={p} onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${p === page ? 'bg-blue-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                        {p}
                      </button>
                )
              })()}

              <button disabled={page === data.meta.totalPages} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Sau
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
