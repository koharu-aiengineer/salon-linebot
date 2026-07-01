-- FAQテーブル
create table faqs (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  answer text not null,
  category text,
  price_note text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 会話ログテーブル
create table conversations (
  id uuid default gen_random_uuid() primary key,
  line_user_id text not null,
  user_message text not null,
  bot_reply text,
  is_resolved boolean default true,
  created_at timestamp with time zone default now()
);
