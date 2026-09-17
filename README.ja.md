# openXYOS

**Languages:** [簡體中文](README.md) · [繁體中文](README.zh-TW.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Français](README.fr.md) · [Español](README.es.md) · [インストール言語索引](docs/i18n/README.md) · [ローカライズ方針](docs/i18n/POLICY.md)

ソースリポジトリ：[github.com/XYAIStudio/openXYOS](https://github.com/XYAIStudio/openXYOS)

openXYOS は XYOS から絞り込んだ、人機組織向けのオープンソース OS です。多階層組織、マルチテナント、モジュール化、統治可能な人機協働、エージェント作成、ダイレクト／グループチャット、二次開発可能なサンプルモジュールを備え、開発者とコミュニティの共創を目指します。

> 現状：コミュニティ向けリリース候補です。ローカル開発・評価・共同改善向けであり、**本番利用可能とは謳っていません**。

## 開発者コミュニティ

**XYAI Founders** 交流グループ（企業微信 / WeCom）へようこそ。openXYOS の利用・拡張・貢献について話し合えます。WeCom で QR をスキャンしてください。期限切れの場合は [Discussions #12](https://github.com/XYAIStudio/openXYOS/discussions/12) を確認してください。

<p align="center">
  <img src="docs/community/assets/xyai-founders-wecom-qr.png" width="240" alt="XYAI Founders WeCom QR" />
</p>

## 実行スコープ

サインイン後は次の 12 モジュールを利用できます：ワークスペース、お知らせ、組織、人機リソース、スキル／プラグイン、コラボレーション、エージェントスタジオ、タスク、ナレッジ、リフレクション、ガバナンス、設定。

テナント管理者は設定可能なモジュールのオン／オフと表示名変更ができます。ワークスペースと設定は基盤モジュールで無効化できません。

## エージェントのライフサイクル

名前・位置づけ・能力・経験を定義し、許可済みの参考資料をアップロードし、ima ナレッジ URL を任意で関連付けます。ファイルはセキュリティ検査とテキスト抽出を経てブループリントへ入ります。

生成されたコンサル型エージェントは人材マーケットへ自動登録され、採用後は候補従業員となり、管理者が職責と部門を付与できます。高リスク出力は人の確認が既定です。ima URL は検証済み接続になるまで「リンク済み・未検証」です。

## クイックスタート

Node.js 20.19 以降が必要です。

```bash
npm ci
cp .env.example .env
npm run dev
```

起動前にシークレットを置き換えてください。クライアント：`http://localhost:5174`、API：`http://localhost:3000/api`。

## 検証

```bash
npm run lint
npm run typecheck
npm test
npm run verify:open-source
npm run build
```

[コミュニティガイド](docs/community/README.md)、[言語索引](docs/i18n/README.md)、[オープンソース範囲](docs/open-source-scope.md)、[セキュリティ](SECURITY.md)、[コントリビューション](CONTRIBUTING.md) を参照し、使い方の質問は [Discussions Q&A](https://github.com/XYAIStudio/openXYOS/discussions/new?category=q-a) へ。[Apache License 2.0](LICENSE)。
