# セットアップ手順書（引き継ぎ用）

このドキュメントは、開発を引き継ぐエンジニア向けの環境構築・デプロイ手順です。

## 1. システム概要

- Next.js（App Router）+ TypeScript で実装されたLINE公式アカウント用bot
- FAQ自動応答（OpenAI）、オーナー通知、お知らせ一斉配信、管理画面（FAQ・メニュー・会話ログ）を提供
- ホスティング: Vercel（プロジェクト名: `salon-bot-dev`）
- DB: Supabase（Postgres）

詳細なシステム構成は `docs/technical.md` を参照してください。

## 2. 必要なアカウント・APIキー一覧

| サービス | 用途 | 取得場所 |
|---|---|---|
| LINE Developers | Messaging APIのチャネル作成、Webhook設定 | https://developers.line.biz/ |
| OpenAI | FAQ自動応答の生成（gpt-4o-mini） | https://platform.openai.com/ |
| Supabase | FAQ・メニュー・会話ログの保存 | https://supabase.com/ |
| Vercel | ホスティング・デプロイ | https://vercel.com/ |
| GitHub | ソースコード管理（`koharu-aiengineer/salon-linebot`） | https://github.com/ |

引き継ぎ時は、上記アカウントへのアクセス権限（Supabaseプロジェクトのメンバー追加、Vercelチームへの招待、GitHubリポジトリのコラボレーター追加、LINE Developersのチャネル管理者追加）を依頼してください。

## 3. 開発環境の構築手順

### 3-1. 前提

- Node.js（`package.json` の動作確認バージョン: v24系。18以上を推奨）
- npm
- Git

### 3-2. リポジトリの取得

```bash
git clone https://github.com/koharu-aiengineer/salon-linebot.git
cd salon-linebot
```

### 3-3. 依存パッケージのインストール

```bash
npm install
```

### 3-4. 環境変数の設定

プロジェクト直下に `.env.local` を作成し、以下を設定します（値は本番運用者・前担当者から共有を受けてください）。

```bash
# LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=

# OpenAI
OPENAI_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# オーナー通知先（LINEのuserId）
OWNER_LINE_USER_ID=
```

> `SUPABASE_SERVICE_ROLE_KEY` はDBの制限（RLS）を無視して全操作できる強い権限のキーです。
> クライアント（ブラウザ）側には絶対に露出させず、サーバー専用（API Route内）でのみ使用してください。
> `NEXT_PUBLIC_` が付く変数はブラウザにも公開される点に注意してください。

### 3-5. Supabaseのテーブル作成

`supabase/schema.sql` の内容を、SupabaseダッシュボードのSQL Editorで実行してテーブルを作成します（`faqs` / `conversations` / `menus`）。

### 3-6. ローカル開発サーバーの起動

```bash
npm run dev
```

`http://localhost:3000` で起動します（ポートが使用中の場合は自動的に別ポートに切り替わります）。管理画面は `/admin` です。

### 3-7. LINE Webhookのローカル確認（任意）

LINEからのWebhookをローカルで受けたい場合は、`ngrok` 等でローカルサーバーを一時公開し、LINE Developersコンソールの Webhook URL に `https://<公開URL>/api/webhook` を設定してください（本番運用中のチャネルに対して行う場合は影響に注意してください）。

## 4. デプロイ手順

### 4-1. 通常のデプロイフロー

```bash
git add .
git commit -m "変更内容"
git push
vercel --prod
```

- `git push` で GitHub の `main` ブランチに反映されます。
- `vercel --prod` で Vercel の本番環境（`salon-bot-dev` プロジェクト）にデプロイされます。
- 本番URL: `https://salon-bot-dev.vercel.app`

### 4-2. Vercel CLIのセットアップ（初回のみ）

```bash
npm i -g vercel
vercel link   # プロジェクトとの紐付け（koharu-s-projects1 / salon-bot-dev を選択）
```

### 4-3. Vercel側の環境変数

ローカルの `.env.local` と同じ変数を、Vercelプロジェクトの Production / Preview 環境にも設定する必要があります。

```bash
vercel env ls                          # 設定済み環境変数の確認
vercel env add <変数名> production     # 追加（標準入力から値を渡す想定）
vercel env add <変数名> preview
```

### 4-4. デプロイ後の確認

- `/admin` にアクセスできるか
- LINEで実際にメッセージを送り、bot が応答するか
- Vercelダッシュボードでビルドログ・実行時エラーを確認（`vercel logs <URL> --level error`）

## 5. 注意事項

- 管理画面（`/admin` 以下）には**認証機能がありません**（Phase 2で追加予定）。URLを不用意に共有しないでください。
- 一斉配信機能はLINE友だち全員に届くため、開発中の動作確認では実行しないよう注意してください。
