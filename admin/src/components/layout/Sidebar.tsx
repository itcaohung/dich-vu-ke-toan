import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FileText, FolderOpen, Briefcase, MessageSquare,
  MapPin, Image, Settings, Users, LogOut, Menu, Star, UserRound, LayoutTemplate, Upload, Trash2, GalleryHorizontalEnd,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { fetchTrashCount } from '../../api'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tổng quan', end: true },
  { to: '/posts', icon: FileText, label: 'Bài viết' },
  { to: '/posts/import', icon: Upload, label: 'Nhập từ WordPress' },
  { to: '/categories', icon: FolderOpen, label: 'Danh mục' },
  { to: '/services', icon: Briefcase, label: 'Dịch vụ' },
  { to: '/contacts', icon: MessageSquare, label: 'Liên hệ' },
  { to: '/offices', icon: MapPin, label: 'Chi nhánh' },
  { to: '/banners', icon: Image, label: 'Banner' },
  { to: '/media', icon: GalleryHorizontalEnd, label: 'Media' },
  { to: '/menu', icon: Menu, label: 'Menu' },
  { to: '/pages', icon: LayoutTemplate, label: 'Trang' },
  { to: '/testimonials', icon: Star, label: 'Đánh giá KH' },
  { to: '/team', icon: UserRound, label: 'Đội ngũ' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
]

// Trash is rendered separately to support the count badge

const adminNavItems = [
  { to: '/users', icon: Users, label: 'Người dùng' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { data: trashData } = useQuery({
    queryKey: ['trashCount'],
    queryFn: fetchTrashCount,
    refetchInterval: 60_000,
  })
  const trashCount = trashData?.total ?? 0

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      <div className="px-4 py-5 border-b border-gray-700">
        <p className="font-bold text-lg">Kế Toán Việt Á Châu</p>
        <p className="text-xs text-gray-400 mt-0.5">Quản trị hệ thống</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink
              to="/trash"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Trash2 size={16} />
              <span className="flex-1">Thùng rác</span>
              {trashCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none">
                  {trashCount > 99 ? '99+' : trashCount}
                </span>
              )}
            </NavLink>
          </li>
        </ul>

        {user?.role === 'SUPER_ADMIN' && (
          <>
            <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mt-5 mb-1">Hệ thống</p>
            <ul className="space-y-0.5">
              {adminNavItems.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`
                    }
                  >
                    <Icon size={16} />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
        <p className="text-xs text-gray-400 truncate mb-3">{user?.email}</p>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <LogOut size={14} />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
