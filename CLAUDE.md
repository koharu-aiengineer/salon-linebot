# CLAUDE.md

## プロジェクト概要
美容室向け LINE bot（FAQ自動応答 + オーナー通知 + お知らせ配信）

## 技術スタック
- Next.js 14（App Router）/ TypeScript / Tailwind CSS
- LINE Messaging API（@line/bot-sdk）
- OpenAI API（gpt-4o-mini）
- Supabase（DB）
- Vercel（ホスティング）

## ディレクトリ構成
src/
  app/
    api/
      webhook/      # LINE Webhookエンドポイント
      notify/       # オーナー通知
      broadcast/    # お知らせ一斉配信
    admin/          # 管理画面（FAQ更新）
  lib/
    supabase.ts     # Supabaseクライアント
    openai.ts       # OpenAIクライアント
    line.ts         # LINEクライアント

## 命名規則
- ファイル名: kebab-case（例: webhook-handler.ts）
- 関数名: camelCase（例: handleWebhook）
- 型名: PascalCase（例: FaqItem）
- 環境変数: UPPER_SNAKE_CASE

## 配色（管理画面）
- プライマリ: #06C755（LINEグリーン）
- テキスト: #111827
- 背景: #F9FAFB

## コーディング規約
- async/awaitを使用（thenチェーンは使わない）
- エラーハンドリングは必ずtry/catchで行う
- 環境変数は必ず.env.localから読み込む
- console.logは開発中のみ、本番では使わない

# CLAUDE.md に追記する内容

## プロジェクト要件

### クライアント
個人経営の美容室オーナー（40代女性）

### Phase 1 スコープ
- FAQ自動応答（営業時間・カット料金・予約可否・パーマ+カラー同時施術・駐車場）
- 答えられない質問はオーナーのLINEへ通知
- スマホから更新できる管理画面
- 友だち300人へのお知らせ一斉配信

### やらないこと
- 予約受付機能（Phase 2）
- 顧客カルテ・決済機能

### 制約
- 初期費用: 9万円前後（税込）
- 月額保守: 3,000〜4,000円
- LINE公式アカウント: 既存アカウント活用（友だち300人）