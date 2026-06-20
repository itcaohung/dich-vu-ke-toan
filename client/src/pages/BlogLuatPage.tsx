import { Link } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { FileText, ArrowRight, Eye } from 'lucide-react'
import { fetchPosts, API_BASE } from '../api'

function imgUrl(path?: string) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${API_BASE}${path}`
}

const SECTIONS = [
  { slug: 'luat-dn',            name: 'Luật Doanh Nghiệp',  path: '/luat-doanh-nghiep' },
  { slug: 'luat-thue',          name: 'Luật Thuế',           path: '/luat-thue' },
  { slug: 'luat-ke-toan',       name: 'Luật Kế Toán',        path: '/luat-ke-toan' },
  { slug: 'luat-lao-dong',      name: 'Luật Lao Động',       path: '/luat-lao-dong' },
  { slug: 'luat-quan-ly-chung', name: 'Luật Quản Lý Chung',  path: '/luat-quan-ly-chung' },
]

export default function BlogLuatPage() {
  const results = useQueries({
    queries: SECTIONS.map((s) => ({
      queryKey: ['posts', { category: s.slug, limit: 4 }],
      queryFn: () => fetchPosts({ category: s.slug, limit: 4, page: 1 }),
      staleTime: 60_000,
    })),
  })

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Blog Luật</h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Tổng hợp kiến thức pháp luật doanh nghiệp — thuế, kế toán, lao động và quản lý
          </p>
        </div>
      </section>

      {/* Category tabs */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {SECTIONS.map((s) => (
              <a key={s.slug} href={`#${s.slug}`}
                className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-nowrap">
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">
        {SECTIONS.map((section, idx) => {
          const { data, isLoading } = results[idx]
          const posts = data?.data ?? []
          const total = data?.meta.total ?? 0

          return (
            <section key={section.slug} id={section.slug}>
              {/* Section header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-7 bg-blue-600 rounded-full" />
                  <h2 className="text-xl font-bold text-gray-900">{section.name}</h2>
                  {total > 0 && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {total.toLocaleString('vi-VN')} bài
                    </span>
                  )}
                </div>
                <Link to={section.path}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group">
                  Xem tất cả
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Posts grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="flex items-center gap-3 py-8 text-gray-400">
                  <FileText size={20} className="opacity-40" />
                  <span className="text-sm">Chưa có bài viết trong danh mục này</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {posts.map((post) => (
                    <Link key={post.id} to={`/tin-tuc/${post.slug}`}
                      className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all group">
                      {post.thumbnail
                        ? <img src={imgUrl(post.thumbnail)} alt={post.title}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                            <FileText size={32} className="text-blue-300" />
                          </div>
                      }
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                          {post.title}
                        </h3>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-400">
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : ''}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Eye size={11} /> {post.views}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* View more link (mobile friendly) */}
              {posts.length > 0 && (
                <div className="mt-4 text-center lg:hidden">
                  <Link to={section.path}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                    Xem tất cả {total} bài <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
