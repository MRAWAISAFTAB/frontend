import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LuLayoutDashboard, LuTrendingUp, LuTrendingDown,
  LuLogOut, LuMenu, LuX, LuWallet, LuUser
} from 'react-icons/lu'

const NAV = [
  { label: 'Dashboard', icon: <LuLayoutDashboard />, path: '/dashboard' },
  { label: 'Income',    icon: <LuTrendingUp />,      path: '/income'    },
  { label: 'Expense',   icon: <LuTrendingDown />,    path: '/expense'   },
  { label: 'Profile',   icon: <LuUser />,            path: '/profile'   },
]

const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className='flex h-screen bg-[#fcfbfc] font-[Poppins,sans-serif] overflow-hidden'>

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100
        flex flex-col transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static
      `}>
        {/* Logo */}
        <div className='flex items-center gap-2.5 px-6 py-5 border-b border-slate-100'>
          <div className='w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center'>
            <LuWallet className='text-white text-sm' />
          </div>
          <span className='text-base font-semibold text-black'>FinTrack</span>
        </div>

        {/* Nav links */}
        <nav className='flex-1 px-3 py-5 flex flex-col gap-1'>
          {NAV.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all
                ${isActive
                  ? 'bg-violet-50 text-primary font-medium'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`
              }
            >
              <span className='text-base'>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className='p-4 border-t border-slate-100'>
          <div className='flex items-center gap-3 p-3 rounded-xl bg-slate-50'>
            <div className='w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-semibold text-primary shrink-0'>
              {initials}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-medium text-slate-700 truncate'>{user?.fullName || 'User'}</p>
              <p className='text-[11px] text-slate-400 truncate'>{user?.email || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              title='Logout'
              className='text-slate-400 hover:text-rose-500 transition-colors'
            >
              <LuLogOut />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className='fixed inset-0 z-30 bg-black/20 lg:hidden'
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Main content ── */}
      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        {/* Mobile topbar */}
        <header className='lg:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100'>
          <button onClick={() => setMobileOpen(true)} className='text-slate-500'>
            <LuMenu className='text-xl' />
          </button>
          <span className='font-semibold text-sm text-black'>FinTrack</span>
          <div className='w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-semibold text-primary'>
            {initials}
          </div>
        </header>

        <main className='flex-1 overflow-y-auto p-5 lg:p-8'>
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout