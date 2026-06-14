import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchSettings, fetchServices, fetchOffices } from '../../api'

export default function Footer() {
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: fetchServices })
  const { data: offices = [] } = useQuery({ queryKey: ['offices'], queryFn: fetchOffices })

  const mainOffice = offices[0]

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">K</div>
              <span className="font-bold text-white text-lg">{settings?.site_name ?? 'Kế Toán Minh Châu'}</span>
            </div>
            <p className="text-sm leading-relaxed mb-5 text-gray-400">
              {settings?.site_description ?? 'Đơn vị tư vấn kế toán – thuế – pháp lý doanh nghiệp uy tín, chuyên nghiệp.'}
            </p>
            <div className="flex items-center gap-3">
              {settings?.facebook && (
                <a href={settings.facebook} target="_blank" rel="noreferrer"
                  className="w-9 h-9 bg-gray-700 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors text-xs font-bold text-white">
                  f
                </a>
              )}
              {settings?.youtube && (
                <a href={settings.youtube} target="_blank" rel="noreferrer"
                  className="w-9 h-9 bg-gray-700 hover:bg-red-600 rounded-lg flex items-center justify-center transition-colors text-xs font-bold text-white">
                  yt
                </a>
              )}
              {settings?.zalo && (
                <a href={`https://zalo.me/${settings.zalo}`} target="_blank" rel="noreferrer"
                  className="w-9 h-9 bg-gray-700 hover:bg-blue-400 rounded-lg flex items-center justify-center transition-colors text-xs font-bold text-white">
                  Zalo
                </a>
              )}
            </div>
          </div>

          {/* Dịch vụ */}
          <div>
            <h3 className="text-white font-semibold mb-4">Dịch vụ</h3>
            <ul className="space-y-2">
              {services.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <Link to={`/dich-vu/${s.slug}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liên kết */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Trang chủ' },
                { to: '/dich-vu', label: 'Dịch vụ' },
                { to: '/tin-tuc', label: 'Tin tức' },
                { to: '/gioi-thieu', label: 'Giới thiệu' },
                { to: '/lien-he', label: 'Liên hệ' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              {(mainOffice?.phone ?? settings?.hotline) && (
                <li className="flex items-start gap-2.5">
                  <Phone size={15} className="text-blue-400 mt-0.5 shrink-0" />
                  <a href={`tel:${mainOffice?.phone ?? settings?.hotline}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors">
                    {mainOffice?.phone ?? settings?.hotline}
                  </a>
                </li>
              )}
              {(mainOffice?.email ?? settings?.email) && (
                <li className="flex items-start gap-2.5">
                  <Mail size={15} className="text-blue-400 mt-0.5 shrink-0" />
                  <a href={`mailto:${mainOffice?.email ?? settings?.email}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors">
                    {mainOffice?.email ?? settings?.email}
                  </a>
                </li>
              )}
              {(mainOffice?.address ?? settings?.address) && (
                <li className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-400">{mainOffice?.address ?? settings?.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {settings?.site_name ?? 'Kế Toán Minh Châu'}. Tất cả quyền được bảo lưu.
          </p>
          <p className="text-xs text-gray-600">Thiết kế bởi đội ngũ kỹ thuật nội bộ</p>
        </div>
      </div>
    </footer>
  )
}
