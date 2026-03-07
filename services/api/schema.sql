-- Aria API v3 relational schema (PostgreSQL)
-- This schema is for the next step when replacing JSON persistence with Postgres.

create table if not exists users (
  id text primary key,
  name text not null,
  is_guest boolean not null default true,
  platform text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists devices (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  platform text not null default 'unknown',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists preferences (
  user_id text primary key references users(id) on delete cascade,
  mode text not null default '陪伴',
  online boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists conversations (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  title text not null default '默认会话',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id text primary key,
  conversation_id text not null references conversations(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  role text not null check (role in ('user', 'aria', 'system')),
  content text not null,
  sent_at timestamptz not null default now()
);

create index if not exists idx_messages_user_sent_at on messages(user_id, sent_at desc);
create index if not exists idx_messages_conversation_sent_at on messages(conversation_id, sent_at desc);

create table if not exists memory_items (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  content text not null,
  source text not null default 'chat',
  importance integer not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_memory_items_user_created_at on memory_items(user_id, created_at desc);

create table if not exists engagement_state (
  user_id text primary key references users(id) on delete cascade,
  xp integer not null default 0,
  level integer not null default 1,
  streak_days integer not null default 0,
  last_active_day date,
  last_event_type text not null default '',
  last_event_at timestamptz,
  today_date date not null default current_date,
  today_message_count integer not null default 0,
  today_checkin_done boolean not null default false,
  today_quest_completed boolean not null default false,
  today_reward_claimed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists engagement_events (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  event_type text not null,
  xp_gain integer not null default 0,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_engagement_events_user_created_at
  on engagement_events(user_id, created_at desc);

create table if not exists proactive_state (
  user_id text primary key references users(id) on delete cascade,
  today_date date not null default current_date,
  sent_count integer not null default 0,
  max_daily integer not null default 3,
  cooldown_minutes integer not null default 90,
  quiet_start_hour integer not null default 23,
  quiet_end_hour integer not null default 7,
  last_sent_at timestamptz,
  last_type text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists proactive_events (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  event_type text not null,
  decision text not null,
  scene text not null default 'unknown',
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_proactive_events_user_created_at
  on proactive_events(user_id, created_at desc);

create table if not exists proactive_feedback (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  suggestion_id text not null,
  feedback_type text not null check (feedback_type in ('executed', 'ignored', 'dismissed')),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_proactive_feedback_user_created_at
  on proactive_feedback(user_id, created_at desc);

create table if not exists autonomy_state (
  user_id text primary key references users(id) on delete cascade,
  enabled boolean not null default true,
  tick_count integer not null default 0,
  generated_count integer not null default 0,
  last_tick_at timestamptz,
  last_repair_at timestamptz,
  last_learn_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists autonomy_inbox (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  suggestion_type text not null,
  title text not null,
  message text not null,
  cta_label text not null,
  prefill_text text not null,
  status text not null default 'pending' check (status in ('pending', 'acked', 'dismissed')),
  created_at timestamptz not null default now(),
  acked_at timestamptz
);

create index if not exists idx_autonomy_inbox_user_created_at
  on autonomy_inbox(user_id, created_at desc);

create table if not exists workday_state (
  user_id text primary key references users(id) on delete cascade,
  date_key date not null default current_date,
  clarity_score integer not null default 68,
  affection_score integer not null default 72,
  flow_streak_days integer not null default 0,
  flow_combo integer not null default 0,
  focus_minutes integer not null default 0,
  total_quest_xp integer not null default 0,
  completed_count integer not null default 0,
  last_checkin_at timestamptz,
  last_summary text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists workday_quests (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  date_key date not null default current_date,
  code text not null,
  title text not null,
  description text not null default '',
  category text not null default 'execution',
  minutes integer not null default 10,
  reward_xp integer not null default 10,
  care_bonus integer not null default 0,
  status text not null default 'todo' check (status in ('todo', 'done')),
  note text not null default '',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_workday_quests_user_date
  on workday_quests(user_id, date_key desc);

create table if not exists device_capability_permissions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  capability_id text not null,
  permission_status text not null check (permission_status in ('granted', 'blocked', 'prompt')),
  reason text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists idx_device_capability_permissions_user_updated
  on device_capability_permissions(user_id, updated_at desc);

create table if not exists device_tasks (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  task_type text not null,
  capability_id text not null,
  title text not null,
  summary text not null,
  target text not null default 'default',
  status text not null default 'planned' check (status in ('planned', 'needs_permission', 'running', 'completed', 'failed')),
  reason text not null default '',
  payload jsonb,
  output jsonb,
  requested_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index if not exists idx_device_tasks_user_requested
  on device_tasks(user_id, requested_at desc);

create table if not exists device_audit_events (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  event_type text not null,
  message text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_device_audit_events_user_created
  on device_audit_events(user_id, created_at desc);

create table if not exists hardware_snapshots (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  source text not null default 'bridge',
  summary text not null default '',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_hardware_snapshots_user_created
  on hardware_snapshots(user_id, created_at desc);

create table if not exists voice_events (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  event_type text not null check (event_type in ('tts', 'stt')),
  status text not null default 'done',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_voice_events_user_created
  on voice_events(user_id, created_at desc);
