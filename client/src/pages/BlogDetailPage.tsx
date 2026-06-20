import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Calendar, Eye, Tag, FileText } from 'lucide-react'
import { fetchPost, API_BASE } from '../api'
import ContactForm from '../components/ui/ContactForm'

function imgUrl(path?: string) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${API_BASE}${path}`
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => fetchPost(slug!),
    enabled: !!slug,
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
    </div>
  )

  if (isError || !post) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-gray-500">Không tìm thấy bài viết này.</p>
      <Link to="/tin-tuc" className="text-blue-600 hover:underline flex items-center gap-1"><ArrowLeft size={15} /> Quay lại tin tức</Link>
    </div>
  )

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <Link to="/tin-tuc" className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 text-sm mb-6 transition-colors">
          <ArrowLeft size={15} /> Quay lại tin tức
        </Link>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Article */}
          <article className="flex-1 min-w-0">
            {post.category && (
              <Link to={`/tin-tuc?category=${post.category.slug}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-4 hover:bg-blue-100 transition-colors">
                <Tag size={11} /> {post.category.name}
              </Link>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {new Date(post.publishedAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Eye size={13} /> {post.views} lượt xem
              </span>
            </div>

            {post.thumbnail && (
              <img src={imgUrl(post.thumbnail)} alt={post.title}
                className="w-full h-64 md:h-80 object-cover rounded-2xl mb-8" />
            )}

            {post.excerpt && (
              <p className="text-lg text-gray-600 leading-relaxed border-l-4 border-blue-500 pl-5 mb-8 bg-blue-50 py-3 rounded-r-xl">
                {post.excerpt}
              </p>
            )}

            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content.replace(/src="\/uploads\//g, `src="${API_BASE}/uploads/`) }} />

            {/* Related */}
            {post.related && post.related.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-5">Bài viết liên quan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {post.related.map((r) => (
                    <Link key={r.id} to={`/tin-tuc/${r.slug}`}
                      className="flex gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group">
                      {r.thumbnail
                        ? <img src={imgUrl(r.thumbnail)} alt={r.title} className="w-20 h-16 object-cover rounded-lg shrink-0" />
                        : <div className="w-20 h-16 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <FileText size={20} className="text-blue-400" />
                          </div>
                      }
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{r.title}</p>
                        {r.publishedAt && <p className="text-xs text-gray-400 mt-1">{new Date(r.publishedAt).toLocaleDateString('vi-VN')}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              <ContactForm title="Cần tư vấn?" subtitle="Để lại thông tin, chúng tôi gọi lại ngay" compact />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
