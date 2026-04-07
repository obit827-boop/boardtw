'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import type { UserRole } from '@/types/database'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('advertiser')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            BOARDTW
          </Link>
          <p className="text-gray-500 mt-2">建立新帳號</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">姓名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">我是</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('advertiser')}
                className={`border rounded-lg py-3 text-sm font-medium transition-all ${
                  role === 'advertiser'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'hover:border-gray-300'
                }`}
              >
                廣告主
              </button>
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`border rounded-lg py-3 text-sm font-medium transition-all ${
                  role === 'owner'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'hover:border-gray-300'
                }`}
              >
                看板主
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              '註冊'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          已有帳號？
          <Link href="/auth/login" className="text-blue-600 hover:underline ml-1">
            登入
          </Link>
        </p>
      </div>
    </div>
  )
}
