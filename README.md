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

