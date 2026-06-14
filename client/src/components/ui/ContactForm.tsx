import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send, CheckCircle } from 'lucide-react'
import { submitContact } from '../../api'

const schema = z.object({
  name: z.string().min(1, 'Vui lòng nhập họ tên'),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  service: z.string().optional(),
  message: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  title?: string
  subtitle?: string
  serviceDefault?: string
  compact?: boolean
}

export default function ContactForm({ title, subtitle, serviceDefault, compact = false }: Props) {
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { service: serviceDefault ?? '' },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      await submitContact({ ...data, email: data.email || undefined })
      setSuccess(true)
    } catch {
      alert('Gửi thất bại, vui lòng thử lại hoặc gọi trực tiếp.')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
      <CheckCircle size={48} className="text-green-500" />
      <h3 className="text-xl font-semibold text-gray-900">Gửi thành công!</h3>
      <p className="text-gray-500">Chúng tôi sẽ liên hệ bạn trong vòng 24 giờ.</p>
    </div>
  )

  return (
    <div>
      {(title || subtitle) && (
        <div className="mb-5">
          {title && <h2 className={`font-bold text-gray-900 ${compact ? 'text-xl' : 'text-2xl'}`}>{title}</h2>}
          {subtitle && <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className={compact ? '' : 'grid grid-cols-1 sm:grid-cols-2 gap-3'}>
          <div>
            <input {...register('name')} placeholder="Họ và tên *"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <input {...register('phone')} placeholder="Số điện thoại *" type="tel"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors" />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>
        </div>
        {!compact && (
          <>
            <input {...register('email')} placeholder="Email (không bắt buộc)" type="email"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors" />
            <input {...register('service')} placeholder="Dịch vụ quan tâm"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors" />
            <textarea {...register('message')} placeholder="Nội dung cần tư vấn..." rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors resize-none" />
          </>
        )}
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
          <Send size={15} />
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'}
        </button>
      </form>
    </div>
  )
}
