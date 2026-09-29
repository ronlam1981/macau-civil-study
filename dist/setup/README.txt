澳門民法研習室：Google 登入與同步接駁

此版本只有程式與資料庫腳本，尚未連接任何 Supabase 項目。

1. 在自己的 Supabase 帳戶建立 Free 項目。
2. SQL Editor 執行 supabase.sql 一次，建立受 RLS 保護的資料表及具版本檢查的儲存函數。
3. 另行執行：
   insert into public.civil_members(email) values(lower('你的Google電郵')) on conflict do nothing;
   每位朋友也要加入此名單。只能在管理介面增刪，不接受訪客自行加入。
4. 在 Google Cloud / Google Auth Platform 建立 OAuth 網頁應用程式，按 Supabase Google provider 頁面顯示的 callback URL 設定。
   Google client ID 和 client secret 只填到 Supabase Auth > Providers > Google。
   只要求 openid、email、profile；不要求 Gmail 或 Drive。
5. Supabase Auth URL Configuration 的 Site URL 和 Redirect URLs 使用：
   https://macau-civil-study.ronlam1981.chatgpt.site/
6. 交給網站設定的只有 Project URL 和 publishable key（或舊版 anon key）。
   不要交出 service_role、sb_secret、Google client secret 或資料庫密碼。
   將公開設定填入 cloud-config.js 後須重新發佈。
7. 本網站目前仍是 Sites 擁有人私人存取。Google 邀請名單不能取代 Sites 存取權。
   要邀請朋友，還需在 Sites 允許該訪客，或另行選擇合適的發布方式。
   本次更新沒有改變网站可見對象。
8. 啟用前先匯出本機紀錄。首次 Google 登入會載入該帳戶的雲端紀錄；如雲端是空白，明確匯入原備份後才上傳。
   這可避免將共享裝置上一位使用者的紀錄自動上傳給下一位。
9. 必須完成兩個獲邀測試帳戶的資料隔離、未獲邀帳戶拒絕、多裝置衝突及撤銷邀請測試，才可宣布同步正式啟用。

衝突處理：另一裝置已更新時，程式不會直接覆寫。先匯出草稿，再載入雲端版本，按需要整理筆記。

官方文件：
https://supabase.com/docs/guides/auth/social-login/auth-google
https://supabase.com/docs/guides/database/postgres/row-level-security

Supabase SDK 2.57.4, MIT license, https://github.com/supabase/supabase-js
