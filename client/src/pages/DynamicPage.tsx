import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { fetchPage, API_BASE } from '../api'
import ContactForm from '../components/ui/ContactForm'

function imgUrl(path?: string) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${API_BASE}${path}`
}

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: page, isLoading, isError } = useQuery({
    queryKey: ['page', slug],
    queryFn: () => fetchPage(slug!),
    enabled: !!slug,
  })

  useEffect(() => {
    if (!page) return
    document.title = page.seoTitle || page.title
    const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (metaDesc && page.seoDescription) metaDesc.content = page.seoDescription
  }, [page])

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
    </div>
  )

  if (isError || !page) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-4xl font-bold text-gray-200">404</p>
      <p className="text-gray-500">Không tìm thấy trang này.</p>
      <Link to="/" className="text-blue-600 hover:underline flex items-center gap-1">
        <ArrowLeft size={15} /> Về trang chủ
      </Link>
    </div>
  )

  return (
    <div className="py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Thumbnail hero */}
        {page.thumbnail && (
          <img
            src={imgUrl(page.thumbnail)}
            alt={page.title}
            className="w-full h-72 object-cover rounded-2xl mb-8"
          />
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{page.title}</h1>
        {page.excerpt && (
          <p className="text-lg text-gray-500 mb-8 leading-relaxed">{page.excerpt}</p>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-blue-600 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: page.content.replace(/src="\/uploads\//g, `src="${API_BASE}/uploads/`) }}
        />
      </div>

      {/* Contact CTA */}
      <div className="max-w-5xl mx-auto px-4 mt-16">
        <div className="bg-blue-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cần tư vấn thêm?</h2>
          <p className="text-gray-500 mb-6">Để lại thông tin, chúng tôi sẽ liên hệ bạn trong thời gian sớm nhất.</p>
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
