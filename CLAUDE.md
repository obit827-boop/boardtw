# BOARDTW - 台灣廣告看板媒合平台

## 技術架構
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Map**: Mapbox GL JS
- **Payment**: ECPay
- **Storage**: Supabase Storage
- **Deploy**: Vercel
- **Auth**: Supabase Auth

## 專案結構
```
src/
  app/
    (main)/          # 有 Navbar + Footer 的頁面
      page.tsx       # 首頁
      map/           # 地圖瀏覽
      billboards/    # 看板列表 + 詳情
      dashboard/     # 業主/廣告主後台
      bookings/      # 預訂詳情
      effect/        # 效果回饋
    list/            # 上架流程（5步驟，獨立 layout）
    auth/            # 登入/註冊
    api/             # API routes
  components/
    layout/          # Navbar, Footer
    billboard/       # BillboardCard, Filters
    map/             # MapView
    ui/              # StepIndicator, etc.
  lib/
    supabase/        # client, server, middleware
    constants.ts     # 常數
    pricing.ts       # 定價建議演算法
    traffic.ts       # 曝光估算
    motc.ts          # MOTC TDX API client
  types/
    database.ts      # 所有型別定義
  store/
    auth.ts          # Zustand auth store
  hooks/
supabase/
  migrations/        # SQL schema + RLS policies
```

## 開發指令
```bash
npm run dev    # 開發伺服器
npm run build  # 建置
npm run lint   # ESLint
```

## 環境變數
複製 `.env.local.example` 為 `.env.local` 並填入：
- Supabase URL + Keys
- Mapbox Token
- MOTC TDX 帳密
- ECPay 金鑰
- Google Maps Key

## 資料庫初始化
在 Supabase SQL Editor 依序執行：
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`

## 品牌色
- Primary: #2563EB (blue-600)
- Accent: #F59E0B (amber-500)
- Text: gray-900 / gray-500

## 平台費率
成交佣金 10%
