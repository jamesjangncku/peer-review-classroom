# 課堂評量｜同儕互評

手機優先的學生互評網站，使用 Firebase Authentication、Cloud Firestore 即時監聽與 GitHub Pages 發佈。介面支援繁體中文、可調整評分規準、文字回饋、教師即時完成率及平均分統計。尚未設定 Firebase 時可用瀏覽器預覽模式體驗畫面。

## 本機預覽與檢查

需要 Node.js 18+。先執行 `npm test`。接著將 `firebase-config.js.example` 複製成 `firebase-config.js` 並填入 Firebase Web app 設定，使用任何靜態 HTTP server 開啟專案（ES modules 不支援直接用 `file://` 開啟）。未設定 Firebase 時，可以直接在本機 HTTP server 開啟 `index.html`，選擇「開啟預覽模式」。預覽資料存在瀏覽器 localStorage，不會送到 Firebase。

## Firebase 設定

1. 在 Firebase Console 建立專案與 Web app，啟用 **Authentication → Email/Password**，建立教師及學生登入帳號。
2. 建立 Cloud Firestore database，將本專案的 `firestore.rules` 發佈為 Firestore Rules。
3. 建立教師及學生登入帳號，並在 `users/{Firebase Auth UID}` 建立角色文件。教師文件例如 `{ "name": "林老師", "role": "teacher" }`；學生文件例如 `{ "name": "王小明", "role": "student", "className": "設計一甲" }`。學生的班級名稱需與教師建立評量時輸入的班級一致。Rules 以管理者建立的使用者文件判斷角色，無需設定 custom claim。
4. 本機設定 `firebase-config.js`（參考範例）。Firebase Web 設定會公開在網站中，資料保護依賴 Authentication 與 Firestore Rules，不依賴隱藏 API key。

## GitHub Pages 部署

此專案已推送到 [GitHub repository](https://github.com/jamesjangncku/peer-review-classroom) 的 `main` branch。Pages workflow 會在每次推送時部署網站。Firebase Web app 設定放在 `firebase-config.js`；這些前端設定會公開，不可在此檔案放服務帳戶私鑰。Firebase Authentication 的 Authorized domains 需加入 `jamesjangncku.github.io`。

## 評量資料與操作

教師登入後建立評量，輸入班級、評分項目（每行一項）、受評者（每行一位），設定每位學生互評份數。學生登入後收到依 UID 分配的同儕作品，完成每項 1–5 分及至少 8 字建議。每位學生對同一受評者只能送出一次；送出後不可修改。教師儀表板透過 Firestore `onSnapshot` 即時顯示評分數、完成率、平均分及各規準平均。回饋紀錄不顯示評分者姓名。

Firestore Rules 限制教師建立評量及讀取全班統計，學生只能讀取進行中的評量與自己的提交；評分只允許 1–5 分、至少 8 字回饋、本人提交、有效受評者、規準數量相符，且文件建立後不可修改或刪除。學生帳號及 `users` 文件須由教師預先建立，不提供公開註冊。

## 檢查範圍

`npm test` 會檢查 JavaScript 語法，並驗證主要介面入口、登入與即時更新程式路徑、Firestore 權限規則和 Pages workflow。實際 Firebase 登入與雙裝置即時同步需在設定 Firebase 專案和帳號後，以已部署網域操作確認。

## 學號登入

學生輸入學號與個人密碼；教師輸入原本 Email 與密碼。學號會去除前後空白並轉成小寫，再轉成 `學號@student.peer-review-classroom.invalid` 作為 Firebase Authentication 內部帳號。這是系統別名，不會寄信，也不代表學生的學校信箱。學生仍需預先建立 Authentication 帳號，並以該 UID 建立 users 文件（name、studentId、role: student、className）。現有真實 Email 帳號不會自動轉換。

每人使用不同的密碼，學號不可作為密碼。內部別名無法收取重設密碼信，忘記密碼需由管理者協助重設。修改登入畫面不會自動建立學生帳號或匯入名冊。

## 多課程、名冊與評量範本

教師登入後可新增課程，在「課程與名冊」選擇課程並貼上既有學生學號，儲存後同一學生可加入多門課，帳號與密碼沿用。課程名冊只由教師管理，學生只能看到自己加入的課程。新增尚未有帳號的學生仍需由管理者建立 Firebase Authentication 帳號與 users 文件，網頁會列出找不到的學號且不會部分儲存。

「評量範本」可新增、編輯、刪除常用評分項目與份數；建立評量時可套用範本並修改題目。選取既有評量後可複製到同一課或其他課程，或存為範本。複製會產生新的評量 ID，重新依所選課程名冊建立受評者與評分者快照，不複製任何成績或回饋。學生以姓名加學號區分同名者，教師可按課程查看獨立統計。

課程名冊後續變動不會改寫已發布評量的受評名單；移除成員後，該學生立即失去本課程的評量讀取與送分權限。要納入新同學，請複製評量重新發布。已發布評量不允許修改題目或評分規準，避免既有分數意義改變。

原有 115專題討論與17個學生帳號已遷移至 courses/115-seminar，既有評量保留ID與回饋。Firestore rules、course-model.js 與公開部署檔案須一起更新；GitHub Pages 僅發布明確列出的前端檔案，不發布 private 資料夾。新增邏輯測試：node scripts/course-test.mjs。

## 名冊網格

名冊以學號、姓名兩欄編輯，支援從 Excel 複製兩欄貼上（Tab分隔，可含學號與姓名標題列）。空白列忽略、清空整列代表移除，儲存前檢查重複學號、缺欄及既有帳號姓名是否一致；不會覆寫既有帳號姓名。預設25列，可增加至500列。新學號仍需先由管理者建立登入帳號。

## 草稿、學生畫面預覽、正式發布

新建或複製評量一律先儲存為草稿（status: draft、active: false）。教師可選取草稿後「編輯草稿」；在編輯表單或活動清單按「學生畫面預覽」，可選擇模擬學生試填，預覽與真實學生共用題目卡片與評分介面，試填不連接送分程序、不寫入成績。未儲存的預覽分配僅供示意，儲存後以評量ID固定分配。

確認後按「正式發布」，會提示確認並改為 published / active: true，學生清單僅查詢 active: true；Firestore規則同時拒絕學生直接讀取草稿和送分。發布後題目、規準及名單鎖定，需變更時使用複製建立新草稿；既有已發布活動保持原狀。