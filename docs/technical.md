# 技術ドキュメント

## 1. システム構成図

```
┌─────────────┐        ┌──────────────────────────────────────────────┐
│  LINE友だち  │        │                  Vercel                       │
│ (お客様)     │        │            (Next.js App Router)               │
└──────┬──────┘        │                                                │
       │ メッセージ送信  │  ┌────────────────────────────────────────┐  │
       ▼               │  │ POST /api/webhook                       │  │
┌─────────────┐  Webhook│  │  1. 署名検証(validateSignature)         │  │
│ LINE          │──────▶│  │  2. fetchFaqs() / fetchMenus() (並行) │  │
│ Messaging API │◀──────│  │  3. generateFaqResponse() (OpenAI)      │  │
└─────────────┘  返信    │  │  4. replyMessage() で即時返信            │  │
       ▲               │  │  5. conversationsへ記録                  │  │
       │ push通知        │  │  6. confidence=lowならオーナーへpush    │  │
┌─────────────┐        │  └────────────────────────────────────────┘  │
│ オーナーのLINE│◀───────┤                                                │
└─────────────┘        │  ┌────────────────────────────────────────┐  │
                        │  │ /admin 配下（管理画面・認証なし）        │  │
┌─────────────┐  操作   │  │  - FAQ一覧・編集・追加・無効化          │  │
│ オーナー      │───────▶│  │  - メニュー・料金 一覧・編集・追加・無効化│  │
│ (スマホ)      │        │  │  - お知らせ一斉配信                     │  │
└─────────────┘        │  │  - 会話ログ閲覧                          │  │
                        │  └────────────────────────────────────────┘  │
                        └───────────────┬────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
             ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
             │  Supabase    │    │   OpenAI     │    │ LINE          │
             │ (Postgres)   │    │ gpt-4o-mini  │    │ Messaging API │
             │ faqs         │    │ FAQ応答生成   │    │ reply/push/   │
             │ menus        │    │              │    │ broadcast     │
             │ conversations│    │              │    │               │
             └─────────────┘    └─────────────┘    └─────────────┘
```

## 2. API仕様（エンドポイント一覧）

### 2-1. LINE Webhook

| メソッド | パス | 説明 |
|---|---|---|
| POST | `/api/webhook` | LINEからのイベント受信。署名検証後、FAQ自動応答・会話ログ記録・低確信度時のオーナー通知を行う。常に200を返す（LINE側のリトライ抑止のため） |

### 2-2. 管理画面API（認証なし）

**FAQ**

| メソッド | パス | 説明 | リクエストボディ |
|---|---|---|---|
| GET | `/api/admin/faqs` | `is_active=true` のFAQ一覧取得 | - |
| POST | `/api/admin/faqs` | FAQ新規追加 | `{ question, answer, category?, priceNote? }` |
| PUT | `/api/admin/faqs/[id]` | FAQ更新 | `{ question, answer, category?, priceNote? }` |
| DELETE | `/api/admin/faqs/[id]` | 論理削除（`is_active=false`） | - |

**メニュー・料金**

| メソッド | パス | 説明 | リクエストボディ |
|---|---|---|---|
| GET | `/api/admin/menus` | `is_active=true` のメニュー一覧取得 | - |
| POST | `/api/admin/menus` | メニュー新規追加 | `{ name, price, durationMin, note? }` |
| PUT | `/api/admin/menus/[id]` | メニュー更新 | `{ name, price, durationMin, note? }` |
| DELETE | `/api/admin/menus/[id]` | 論理削除（`is_active=false`） | - |

**お知らせ配信**

| メソッド | パス | 説明 | リクエストボディ |
|---|---|---|---|
| POST | `/api/admin/broadcast` | LINE友だち全員へ一斉配信（`lineClient.broadcast()`） | `{ message }` |

**会話ログ**

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/admin/conversations` | 会話ログを`created_at`降順で最新100件取得 |

いずれのAPIも `any` 型を使わず、失敗時は `try/catch` で捕捉して以下の形式でエラーを返す。

```json
{ "error": "エラーメッセージ" }
```

バリデーションエラーは400、それ以外のサーバーエラーは500を返す。

## 3. DB設計（テーブル定義）

Supabase（Postgres）。定義は `supabase/schema.sql` を参照。

### faqs（FAQ）

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | 自動生成 |
| question | text not null | 質問文 |
| answer | text not null | 回答文 |
| category | text | 分類ラベル（任意） |
| price_note | text | 料金に関する補足（任意） |
| is_active | boolean default true | 論理削除フラグ。bot・管理画面一覧はtrueのみ参照 |
| created_at | timestamptz default now() | 作成日時 |
| updated_at | timestamptz default now() | 更新日時（更新時に手動でセット） |

### menus（メニュー・料金）

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | 自動生成 |
| name | text not null | メニュー名 |
| price | integer not null | 料金（円） |
| duration_min | integer not null | 施術時間（分） |
| note | text | 備考（任意） |
| is_active | boolean default true | 論理削除フラグ |
| created_at | timestamptz default now() | 作成日時 |
| updated_at | timestamptz default now() | 更新日時 |

### conversations（会話ログ）

| カラム | 型 | 説明 |
|---|---|---|
| id | uuid (PK) | 自動生成 |
| line_user_id | text not null | 発言者のLINE userId |
| user_message | text not null | お客様のメッセージ |
| bot_reply | text | botの返答 |
| is_resolved | boolean default true | `confidence !== "low"` の場合true。falseは要確認 |
| created_at | timestamptz default now() | 作成日時 |

## 4. 外部サービス連携一覧

| サービス | 用途 | 主な利用箇所 |
|---|---|---|
| LINE Messaging API (`@line/bot-sdk`) | Webhook受信・署名検証・返信・オーナーへのpush通知・一斉配信 | `src/lib/line.ts`, `src/app/api/webhook/route.ts`, `src/app/api/admin/broadcast/route.ts` |
| OpenAI API (`openai`, モデル: `gpt-4o-mini`) | FAQ・メニュー情報を根拠にした自動応答文の生成（JSON形式で`answer`と`confidence`を取得） | `src/lib/openai.ts` |
| Supabase (`@supabase/supabase-js`) | `faqs` / `menus` / `conversations` の永続化。サーバー側は`SUPABASE_SERVICE_ROLE_KEY`でRLSを経由せず操作 | `src/lib/supabase.ts`, `src/lib/faq.ts`, `src/lib/menu.ts`, `src/lib/conversation.ts` |
| Vercel | ホスティング・デプロイ・環境変数管理 | プロジェクト: `salon-bot-dev` |

## 5. 主なディレクトリ構成

```
src/
  app/
    api/
      webhook/route.ts           # LINE Webhook
      admin/
        faqs/route.ts            # FAQ一覧・追加
        faqs/[id]/route.ts       # FAQ更新・無効化
        menus/route.ts           # メニュー一覧・追加
        menus/[id]/route.ts      # メニュー更新・無効化
        broadcast/route.ts       # 一斉配信
        conversations/route.ts   # 会話ログ一覧
    admin/
      page.tsx                  # 管理画面トップ（FAQ一覧）
      _components/              # FAQ/メニューの共通フォーム
      faq/new, faq/[id]         # FAQ追加・編集画面
      menus, menus/new, menus/[id] # メニュー一覧・追加・編集画面
      broadcast/page.tsx        # お知らせ配信画面
      conversations/page.tsx    # 会話ログ画面
  lib/
    supabase.ts                 # Supabaseクライアント
    line.ts                     # LINEクライアント
    openai.ts                   # OpenAIによる応答生成
    faq.ts                      # FAQデータアクセス・バリデーション
    menu.ts                     # メニューデータアクセス・バリデーション
    conversation.ts             # 会話ログ取得
```

## 6. 既知の制約

- 管理画面（`/admin`以下）およびそのAPIに認証機能はない（Phase 2で対応予定）。
- 予約受付機能・顧客カルテ・決済機能はスコープ外（Phase 2以降）。
- OpenAIの応答は`response_format: json_object`でJSON形式を強制しているが、フォーマット不正時は例外を投げてイベント単位でエラーログに記録する設計（Webhook全体は落ちない）。
