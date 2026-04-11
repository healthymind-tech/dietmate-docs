// 靜態搜尋索引 — 從 _meta.json 編譯而來
// 開發和生產環境都可用，不依賴 pagefind build

export interface SearchEntry {
  title: string
  url: string
  section: string
}

export const SEARCH_INDEX: SearchEntry[] = [
  // 基礎入門
  { title: '說明中心', url: '/', section: '' },
  { title: '登入工作台', url: '/login/', section: '基礎入門' },
  { title: '工作台總覽', url: '/dashboard/', section: '基礎入門' },
  // 核心功能
  { title: '查看我的病患', url: '/my-patients/', section: '核心功能' },
  { title: '審核飲食分析', url: '/pending-review/', section: '核心功能' },
  { title: '與病患對話', url: '/patient-messages/', section: '核心功能' },
  // 進階功能
  { title: '病患健康數據', url: '/health-stats/', section: '進階功能' },
  { title: '健康目標管理', url: '/health-goals/', section: '進階功能' },
  { title: '每日熱量目標', url: '/nutrition-targets/', section: '進階功能' },
  { title: 'LINE Rich Menu', url: '/rich-menu/', section: '進階功能' },
  { title: '患者群組標籤', url: '/patient-groups/', section: '進階功能' },
  { title: '個人設定', url: '/settings/', section: '進階功能' },
  // 報表匯出
  { title: '飲食分析週報', url: '/weekly-report-export/', section: '報表匯出' },
  { title: '健康數據匯出', url: '/health-data-export/', section: '報表匯出' },
]
