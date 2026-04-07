import Link from 'next/link'

const FOOTER_LINKS = [
  { href: '/about', label: '關於我們' },
  { href: '/terms', label: '使用條款' },
  { href: '/privacy', label: '隱私權政策' },
  { href: '/contact', label: '聯絡我們' },
]

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 transition-colors hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-sm text-gray-400">
            &copy; 2026 BOARDTW. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
