import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Phone, Menu, X, ChevronDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchSettings, API_BASE } from '../../api'
import api from 'axios'

interface MenuItem {
  id: number
  label: string
  url: string
  openNew: boolean
  children: MenuItem[]
}

const DEFAULT_MENU: MenuItem[] = [
  { id: 0, label: 'Trang chủ', url: '/', openNew: false, children: [] },
  { id: 1, label: 'Dịch vụ', url: '/dich-vu', openNew: false, children: [] },
  { id: 2, label: 'Tin tức', url: '/tin-tuc', openNew: false, children: [] },
  { id: 3, label: 'Giới thiệu', url: '/gioi-thieu', openNew: false, children: [] },
  { id: 4, label: 'Liên hệ', url: '/lien-he', openNew: false, children: [] },
]

const fetchMenu = () =>
  api.get<MenuItem[]>(`${import.meta.env.VITE_API_URL ?? 'http://localhost:4001/api'}/menu`)
    .then((r) => r.data)

function isExternal(url: string) {
  return url.startsWith('http://') || url.startsWith('https://')
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)

  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const { data: menuItems, isError: menuError } = useQuery({ queryKey: ['menu'], queryFn: fetchMenu })

  // Chỉ fallback về DEFAULT_MENU khi API lỗi (server down), không phải khi array rỗng
  const navItems = menuError ? DEFAULT_MENU : (menuItems ?? DEFAULT_MENU)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const linkProps = (item: MenuItem) => ({
    target: item.openNew ? '_blank' : undefined,
    rel: item.openNew ? 'noreferrer' : undefined,
  })

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm border-b border-gray-200/70'}`}>
      {/* Top bar */}
      <div className="bg-blue-700 text-white text-xs py-1.5 hidden md:block">
        <div className="max-w-site mx-auto px-4 flex items-center justify-between">
          <span>Tư vấn miễn phí — Gọi ngay: <strong>{settings?.hotline ?? '0901 234 567'}</strong></span>
          <div className="flex items-center gap-4">
            {settings?.email && <span>{settings.email}</span>}
            {settings?.facebook && <a href={settings.facebook} target="_blank" rel="noreferrer" className="hover:text-blue-200">Facebook</a>}
            {settings?.zalo && <a href={`https://zalo.me/${settings.zalo}`} target="_blank" rel="noreferrer" className="hover:text-blue-200">Zalo</a>}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-site mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            {settings?.logo
              ? <img src={settings.logo.startsWith('http') ? settings.logo : `${API_BASE}${settings.logo}`}
                  alt={settings.site_name} className="h-10 object-contain" />
              : <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Kế Toán Minh Châu" className="h-10 object-contain" />
                </div>
            }
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.id} className="relative"
                onMouseEnter={() => item.children.length > 0 && setOpenDropdown(item.id)}
                onMouseLeave={() => setOpenDropdown(null)}>
                {isExternal(item.url) ? (
                  <a href={item.url} {...linkProps(item)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium uppercase tracking-wide text-gray-700 hover:text-blue-600 transition-colors">
                    {item.label}
                    {item.children.length > 0 && <ChevronDown size={13} />}
                  </a>
                ) : (
                  <NavLink to={item.url} end={item.url === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium uppercase tracking-wide transition-colors ${
                        isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                      }`
                    }>
                    {item.label}
                    {item.children.length > 0 && <ChevronDown size={13} />}
                  </NavLink>
                )}

                {/* Dropdown */}
                {item.children.length > 0 && openDropdown === item.id && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    {item.children.map((child) => (
                      isExternal(child.url) ? (
                        <a key={child.id} href={child.url} {...linkProps(child)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          {child.label}
                        </a>
                      ) : (
                        <NavLink key={child.id} to={child.url}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setOpenDropdown(null)}>
                          {child.label}
                        </NavLink>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href={`tel:${settings?.hotline ?? '0901234567'}`}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <Phone size={15} />
              {settings?.hotline ?? '0901 234 567'}
            </a>
          </div>

          <button className="md:hidden p-2 text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="max-w-site mx-auto px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <div key={item.id}>
                {isExternal(item.url) ? (
                  <a href={item.url} {...linkProps(item)}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </a>
                ) : (
                  <NavLink to={item.url} end={item.url === '/'}
                    className={({ isActive }) =>
                      `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                    onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </NavLink>
                )}
                {item.children.map((child) => (
                  isExternal(child.url) ? (
                    <a key={child.id} href={child.url} {...linkProps(child)}
                      className="block px-3 py-2 pl-8 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}>
                      └ {child.label}
                    </a>
                  ) : (
                    <NavLink key={child.id} to={child.url}
                      className="block px-3 py-2 pl-8 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
                      onClick={() => setMenuOpen(false)}>
                      └ {child.label}
                    </NavLink>
                  )
                ))}
              </div>
            ))}
            <a href={`tel:${settings?.hotline}`}
              className="mt-2 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg">
              <Phone size={15} /> Gọi ngay: {settings?.hotline ?? '0901 234 567'}
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
