# openXYOS

**語言 / Languages:** [簡體中文](README.md) · [繁體中文](README.zh-TW.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Français](README.fr.md) · [Español](README.es.md) · [安裝指南語言索引](docs/i18n/README.md) · [本地化政策](docs/i18n/POLICY.md)

原始碼倉庫：[github.com/XYAIStudio/openXYOS](https://github.com/XYAIStudio/openXYOS)

openXYOS 是從 XYOS 精簡而來的開源人機組織作業系統。它保留多層級組織、多租戶、模組化、人機共融共治、智慧體自訂、人機單聊／群聊，以及可二次開發的示例模組，面向開發者與社群共同演進。

> 目前狀態：社群發布候選版，適合本機開發、產品評估與協同完善；**尚不宣稱可直接用於生產**。

## 開發者交流

歡迎加入 **XYAI Founders 交流群**（企業微信），一起討論 openXYOS 的使用、二開與貢獻。請用企業微信掃碼；若二維碼失效，請看 [Discussions #12](https://github.com/XYAIStudio/openXYOS/discussions/12)。

<p align="center">
  <img src="docs/community/assets/xyai-founders-wecom-qr.png" width="240" alt="XYAI Founders 交流群（企業微信）二維碼" />
</p>

## 執行範圍

登入後提供十二個模組：工作臺、通知公告、組織架構、人機資源、技能外掛、溝通協作、智慧體自訂、任務管理、知識庫、反思引擎、治理引擎、系統設定。

租戶管理員可啟停可設定模組並重新命名標籤。工作臺與系統設定為基礎模組，不可關閉。示例模組保留完整前端／API／資料路徑，便於二次開發。

## 智慧體生命週期

使用者可定義智慧體名稱、定位、能力與經驗，上傳已獲授權的參考文件，並可關聯 ima 知識庫網址。檔案經安全檢查與文字抽取後進入藍圖與執行描述。

產生的顧問型智慧體會自動進入人才市場；招募後成為備選員工，管理員可指派職責與部門。高風險輸出預設需人工覆核。ima 網址為「已關聯、待驗證」，在連線器實際驗證前不會偽報成功。

## 快速開始

需要 Node.js 20.19 或更新版本。

```bash
npm ci
cp .env.example .env
npm run dev
```

啟動前請替換密鑰預留值。前端：`http://localhost:5174`；API：`http://localhost:3000/api`。

## 驗證

```bash
npm run lint
npm run typecheck
npm test
npm run verify:open-source
npm run build
```

請閱讀[社群指南](docs/community/README.md)、[語言索引](docs/i18n/README.md)、[開源範圍](docs/open-source-scope.md)、[安全政策](SECURITY.md)與[貢獻指南](CONTRIBUTING.md)。使用問題請到 [Discussions Q&A](https://github.com/XYAIStudio/openXYOS/discussions/new?category=q-a)。原始碼依 [Apache License 2.0](LICENSE) 授權。
