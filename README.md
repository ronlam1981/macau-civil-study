# 澳門民法研習室 — 全法典課程 1.0

範圍：邀請制澳門民法學習平台，提供法典原文、逐條教材、測驗、筆記、複習排程及學習進度。網站支援瀏覽器本機紀錄，亦已接通 Supabase Google OAuth、邀請名單及個人雲端同步。

## 網站

- GitHub Pages：由 `main` 分支更新後，透過 GitHub Actions 發佈 `dist/`。
- 原有 Sites 版本：https://macau-civil-study.ronlam1981.chatgpt.site
- 前端只包含 Supabase Project URL 及公開 publishable key；不得提交 Google Client Secret、Supabase secret key、service role key 或資料庫密碼。

## 已確認產品方向

- 基礎、實務、深入研習三層並存。
- 法典顺序與主題路線互通；總則同步推進，主題按生活樓宇、合同生意、家庭傳承依次完成。
- 彈性時間選擇，概念間隔複習，自由查閱。
- 免費優先，完整靜態教材與按需 AI（預設關閉）。
- 數碼書房與案例挑戰結合。
- 將來以 Google 帳戶白名單限制邀請存取，個人紀錄獨立。

## 資料

sources/official-snapshot.html 是 2026-09-22 從 https://bo.dsaj.gov.mo/bo/i/99/31/codcivcn/codciv0001.asp 取得的 Big5 官方頁面。
articles.json 從官方頁面解析，共 2119 項，包括三個合併的廢止條文組，覆蓋第1至2161條的全部編號。保留卷、編、分編、章、節、分節、目、分目層級。此為快照，不宣稱全部現行效力已核實。

課程在載入官方條文後建立，共 2,119 個課程項目、4,238 題，覆蓋第 1 至 2,161 條；其中 lessons.js 保留 23 個人工編寫的深入教材，其餘為按官方原文結構生成的逐條基礎課。基礎課明確標示尚未逐條專業校訂。

## 已實作

查閱與篩選、三層教材與原文對照、案例方向揭示、閱讀紀錄、概念測驗、答案解說、複習排程、收藏筆記、本機備份匯出與結構檢查後匯入。

複習依概念該輪全部題目答對與否：初次答對1日，後續跨日答對約2.3倍，最多60日；答錯10分鐘。相同日內提前重做不延長原有一日以上間隔。這是透明啟發式模型，不是校準後的遺忘曲線。大時段建議尚非完整多課課程排程。

## 驗證

已作 JS 語法檢查、10個視圖渲染模型檢查、搜尋與廢止範圍定位、測驗完成、排程跨日/同日/答錯、備份結構驗證。未作真實瀏覽器視覺檢查。WebMCP 搜尋工具有特性偵測；本環境沒有可用的合規瀏覽器上下文作其呼叫驗證。

## 後續

接通 Google/Supabase 與後端名單驗證、個人資料存取控制後才可供多位朋友獨立使用。需要管理者自行控制的服務帳戶與 OAuth 設定；不得用前端名單假裝保護。

## 0.2 更新

手機導覽改為三欄兩排，長目錄限制為容器寬度，手機學習分頁為兩欄兩排，內容卡片與來源表格可換行。使用版本化資源網址防止舊 CSS 快取。新增第1至6條教材，合共12課24題。新增按5/15/30/45分鐘估算、先複習後新課的順序安排，可逐步完成閱讀及测驗。本次仍未進行真實手機或瀏覽器視覺驗證；此靜態專案没有兼容的受控預覽服務。

## 0.3 update
- 17 learning units / 34 questions; articles 1–12 now have consecutive learning material.
- Two court cases with official summary/news links, separate decision/publication dates, and source limitations. Full judgments have not been independently audited.
- Optional Supabase Google OAuth + invite membership + per-user RLS setup in backend/supabase.sql; downloadable setup files in dist/setup. Configuration is intentionally empty, so live authentication/cloud sync is not enabled.
- Optimistic revision checks preserve local drafts on a conflicting cloud update; guest records are not automatically uploaded to a signed-in account.
- Validation: JavaScript syntax, mocked DOM route/quiz/plan/backup checks, mocked SDK invitation/conflict/draft/save checks passed. Live OAuth/database RLS require the user's configured project and two-account tests before enabling. Mobile CSS retains the responsive fixes from 0.2; no physical-device or managed-browser visual verification was completed.

## 0.4 update
- Added lessons 13–18, checked against the official public code text fetched on 2026-09-22. Total 23 lessons / 46 questions, with consecutive coverage of articles 1–18.
- Added standard/large reading text with local preference, numerical lesson navigation, and a mistake list based on each question's latest answer. Mistake practice retests complete concepts to preserve the existing scheduling semantics.
- Mobile account navigation spans its own row; reader buttons wrap into two columns without fixed overlays.
- Mocked DOM checks passed for consecutive lessons, question counts, latest-answer mistake resolution, reader class, existing search, quizzes, backups and study plans. No mobile/browser visual verification; live Google login and cloud sync remain unconfigured.

## Cloud connection preparation
Configured the user-supplied Supabase project URL and publishable key. Google provider remains disabled pending OAuth credentials and redirect setup. The login button is intentionally disabled and the account page distinguishes this from missing project configuration. No authenticated cloud sync has been verified yet.

## 1.0 全法典課程更新
- 將 2,119 個官方條文項目全部轉為可學習課程，覆蓋第 1 至 2,161 條及合併廢止條文組。
- 每個項目包含原文重點、分析框架、模擬情境、兩題測驗、筆記、收藏及間隔複習；共 4,238 題。
- 保留 23 個人工編寫深入教材，其他內容清楚標示為自動整理的逐條基礎課。
- 新增五卷課程目錄及每頁 24 課的分頁，避免在手機一次渲染全部課程。
- 首頁進度改按 2,161 個條號計算；搜尋結果標示教材級別；複習頁只載入到期或最近概念。
- 通過全量覆蓋、題庫、路由、搜尋、廢止範圍、測驗、學習計劃、錯題、備份及雲端同步模擬測試。
