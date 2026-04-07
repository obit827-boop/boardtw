'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Map, Search, PlusCircle, Menu, X, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/store/auth'

const NAV_LINKS = [
  { href: '/explore', label: '探索地圖', icon: Map },
  { href: '/search', label: '搜尋看板', icon: Search },
  { href: '/list', label: '上架看板', icon: PlusCircle },
]

export default function Navbar() {
  const { user, loading, initialize, clearUser } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    clearUser()
    setDropdownOpen(false)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-[#2563EB]">
            BOARDTW
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-[#2563EB]"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden items-center gap-3 md:flex">
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-100" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                      {user.name?.charAt(0) ?? user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate">{user.name ?? user.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        我的後台
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="h-4 w-4" />
                        登出
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  登入
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8]"
                >
                  註冊
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="rounded-lg p-2 text-gray-700 hover:bg-gray-50 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="開啟選單"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
              <span className="text-lg font-bold text-[#2563EB]">BOARDTW</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-50"
                aria-label="關閉選單"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col p-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}

              <hr className="my-3 border-gray-200" />

              {loading ? null : user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2563EB] text-xs font-bold text-white">
                        {user.name?.charAt(0) ?? user.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="truncate text-sm font-medium text-gray-900">
                      {user.name ?? user.email}
                    </span>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    我的後台
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileOpen(false)
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="h-5 w-5" />
                    登出
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 px-3">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    登入
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg bg-[#2563EB] px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-[#1d4ed8]"
                  >
                    註冊
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  )
}
