import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Save, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchAdminSettings, saveSettings, uploadImage } from '../../api'
import { API_BASE } from '../../api/client'
import { PageHeader, Card, Spinner, Btn, FormField, Input, Textarea } from '../../components/ui'
function imgUrl(path?: string) {
  if (!path) return ''
  return path.startsWith('http') ? path : `${API_BASE}${path}`
}

type SettingsForm = {
  site_name: string
  site_description: string
  hotline: string
  email: string
  address: string
  facebook: string
  youtube: string
  zalo: string
  logo: string
  favicon: string
  home_show_quick_services: string
  home_show_stats: string
  home_show_services: string
  home_show_why_us: string
  home_show_team: string
  home_show_blog: string
  home_show_testimonials: string
  home_show_contact: string
}

const HOME_SECTIONS = [
  { key: 'home_show_quick_services', label: '4 dịch vụ nổi bật' },
  { key: 'home_show_stats',          label: 'Thanh số liệu (16+ năm, 70.000+...)' },
  { key: 'home_show_services',       label: 'Tất cả dịch vụ' },
  { key: 'home_show_why_us',         label: 'Tại sao chọn chúng tôi' },
  { key: 'home_show_team',           label: 'Đội ngũ' },
  { key: 'home_show_blog',           label: 'Tin tức & kiến thức' },
  { key: 'home_show_testimonials',   label: 'Đánh giá khách hàng' },
  { key: 'home_show_contact',        label: 'Form liên hệ' },
] as const

function ImageUploadField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (url: string) => void
  placeholder?: string
  hint?: string
}) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const url = await uploadImage(file)
      onChange(url)
      toast.success('Upload thành công')
    } catch {
      toast.error('Upload thất bại')
    } finally {
      setUploading(false)
    }
  }

  return (
    <FormField label={label}>
      <div className="space-y-2">
        {/* Preview */}
        {value && (
          <div className="relative inline-flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg">
            <img src={imgUrl(value)} alt={label}
              className="h-10 max-w-[160px] object-contain rounded" />
            <button type="button" onClick={() => onChange('')}
              className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {/* URL input + upload button */}
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition-colors"
          >
            <Upload size={14} />
            {uploading ? 'Đang upload...' : 'Upload'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
          />
        </div>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    </FormField>
  )
}

export default function SettingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: fetchAdminSettings,
  })

  const { register, handleSubmit, reset, watch, setValue } = useForm<SettingsForm>()

  useEffect(() => {
    if (data) reset(data as SettingsForm)
  }, [data, reset])

  const { mutate: save, isPending } = useMutation({
    mutationFn: (values: SettingsForm) => saveSettings(values as Record<string, string>),
    onSuccess: () => toast.success('Đã lưu cài đặt'),
    onError: () => toast.error('Lưu thất bại'),
  })

  const logoValue = watch('logo') ?? ''
  const faviconValue = watch('favicon') ?? ''

  if (isLoading) return <div className="p-6"><Spinner /></div>

  return (
    <div className="p-6">
      <PageHeader title="Cài đặt website">
        <Btn type="submit" form="settings-form" variant="primary" disabled={isPending}>
          <Save size={16} /> {isPending ? 'Đang lưu...' : 'Lưu cài đặt'}
        </Btn>
      </PageHeader>

      <form id="settings-form" onSubmit={handleSubmit((d) => save(d))}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="p-5 space-y-4">
            <h2 className="font-medium text-gray-900 pb-2 border-b border-gray-100">Thông tin chung</h2>
            <FormField label="Tên website">
              <Input {...register('site_name')} placeholder="Kế Toán Việt Á Châu" />
            </FormField>
            <FormField label="Mô tả website">
              <Textarea {...register('site_description')} rows={3} placeholder="Mô tả ngắn hiển thị trên SEO..." />
            </FormField>
            <ImageUploadField
              label="Logo"
              value={logoValue}
              onChange={(url) => setValue('logo', url)}
              placeholder="/uploads/logo.png"
              hint="PNG/WebP nền trong suốt, tỉ lệ ngang, tối đa 5MB"
            />
            <ImageUploadField
              label="Favicon"
              value={faviconValue}
              onChange={(url) => setValue('favicon', url)}
              placeholder="/uploads/favicon.ico"
              hint="Khuyến nghị 32×32px hoặc 64×64px (PNG/ICO)"
            />
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="font-medium text-gray-900 pb-2 border-b border-gray-100">Liên hệ & Mạng xã hội</h2>
            <FormField label="Hotline">
              <Input {...register('hotline')} placeholder="0901 234 567" />
            </FormField>
            <FormField label="Email">
              <Input {...register('email')} type="email" placeholder="info@ketoanvietachau.vn" />
            </FormField>
            <FormField label="Địa chỉ">
              <Input {...register('address')} placeholder="123 Đường ABC, TP.HCM" />
            </FormField>
            <FormField label="Facebook">
              <Input {...register('facebook')} placeholder="https://facebook.com/ketoanvietachau" />
            </FormField>
            <FormField label="YouTube">
              <Input {...register('youtube')} placeholder="https://youtube.com/@ketoanvietachau" />
            </FormField>
            <FormField label="Zalo">
              <Input {...register('zalo')} placeholder="0901234567" />
            </FormField>
          </Card>
          <Card className="p-5 space-y-4 xl:col-span-2">
            <h2 className="font-medium text-gray-900 pb-2 border-b border-gray-100">Trang chủ — Ẩn / Hiện section</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HOME_SECTIONS.map(({ key, label }) => {
                const val = watch(key as keyof SettingsForm)
                const isOn = val !== 'false'
                return (
                  <label key={key} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer select-none">
                    <span className="text-sm text-gray-700">{label}</span>
                    <button
                      type="button"
                      onClick={() => setValue(key as keyof SettingsForm, isOn ? 'false' : 'true')}
                      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${isOn ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${isOn ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                    <input type="hidden" {...register(key as keyof SettingsForm)} />
                  </label>
                )
              })}
            </div>
          </Card>
        </div>
      </form>
    </div>
  )
}
