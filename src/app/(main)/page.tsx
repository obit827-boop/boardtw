import Link from 'next/link'
import { MapPin, TrendingUp, Shield, Search } from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-32">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            找看板，刊廣告
            <br />
            全台最透明的媒合平台
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl">
            即時車流數據、AI 建議定價、效果回饋評分。
            讓每一塊錢廣告預算都花在刀口上。
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/billboards"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <Search className="w-5 h-5" />
              搜尋看板
            </Link>
            <Link
              href="/list/step-1"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 text-white font-semibold px-8 py-4 rounded-xl hover:bg-amber-400 transition-colors"
            >
              <MapPin className="w-5 h-5" />
              上架我的看板
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: '1,200+', label: '上架看板' },
            { num: '85%', label: '成交率' },
            { num: '48hr', label: '平均成交時間' },
            { num: '4.6/5', label: '廣告主滿意度' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-blue-600">{stat.num}</div>
              <div className="text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          為什麼選擇 BOARDTW
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: TrendingUp,
              title: '即時車流數據',
              desc: '串接交通部 TDX 開放數據，自動計算每日曝光量。不再靠感覺估價。',
            },
            {
              icon: Shield,
              title: 'AI 建議定價',
              desc: '根據地段、面積、車流、設備，提供合理的市場參考價格。',
            },
            {
              icon: MapPin,
              title: '地圖即時瀏覽',
              desc: '在地圖上瀏覽全台看板位置，篩選類型、價格，一目瞭然。',
            },
          ].map((feat) => (
            <div
              key={feat.title}
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
            >
              <feat.icon className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
              <p className="text-gray-600">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">
            有閒置看板？讓它開始賺錢
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            免費上架，成交才收取 10% 平台服務費。
          </p>
          <Link
            href="/list/step-1"
            className="inline-flex items-center gap-2 bg-amber-500 text-white font-semibold px-8 py-4 rounded-xl hover:bg-amber-400 transition-colors"
          >
            立即上架
          </Link>
        </div>
      </section>
    </div>
  )
}
