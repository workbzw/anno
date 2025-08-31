-- Supabase 数据库表结构
-- 在 Supabase Dashboard 的 SQL Editor 中执行以下脚本

-- 1. 钱包用户表
CREATE TABLE IF NOT EXISTS wallet_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  user_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 录音贡献表
CREATE TABLE IF NOT EXISTS recording_contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  sentence_id TEXT,
  sentence_text TEXT,
  duration NUMERIC,
  audio_quality TEXT DEFAULT 'medium',
  language TEXT DEFAULT 'yue',
  file_path TEXT,
  file_url TEXT,
  file_size BIGINT,
  file_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 审核活动表
CREATE TABLE IF NOT EXISTS review_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  review_type TEXT CHECK (review_type IN ('voice', 'text')) DEFAULT 'voice',
  items_reviewed INTEGER DEFAULT 1,
  accuracy NUMERIC CHECK (accuracy >= 0 AND accuracy <= 1),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 批量活动表
CREATE TABLE IF NOT EXISTS batch_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB NOT NULL,
  sequence_number INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_wallet_users_address ON wallet_users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_recording_contributions_wallet ON recording_contributions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_recording_contributions_created ON recording_contributions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_activities_wallet ON review_activities(wallet_address);
CREATE INDEX IF NOT EXISTS idx_review_activities_created ON review_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_activities_wallet ON batch_activities(wallet_address);
CREATE INDEX IF NOT EXISTS idx_batch_activities_created ON batch_activities(created_at DESC);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为 wallet_users 表添加自动更新 updated_at 的触发器
CREATE TRIGGER update_wallet_users_updated_at 
  BEFORE UPDATE ON wallet_users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全性 (RLS)
ALTER TABLE wallet_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recording_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_activities ENABLE ROW LEVEL SECURITY;

-- 创建安全策略（允许所有操作，您可以根据需要调整）
CREATE POLICY "允许所有用户操作 wallet_users" ON wallet_users FOR ALL USING (true);
CREATE POLICY "允许所有用户操作 recording_contributions" ON recording_contributions FOR ALL USING (true);
CREATE POLICY "允许所有用户操作 review_activities" ON review_activities FOR ALL USING (true);
CREATE POLICY "允许所有用户操作 batch_activities" ON batch_activities FOR ALL USING (true);

-- 创建视图：用户统计数据
CREATE OR REPLACE VIEW user_stats_view AS
SELECT 
  u.wallet_address,
  u.created_at as account_created,
  COALESCE(rc.total_recordings, 0) as total_recordings,
  COALESCE(rc.total_duration, 0) as total_recording_time,
  COALESCE(ra.total_reviews, 0) as total_reviews,
  COALESCE(ra.average_accuracy, 0) as average_accuracy,
  GREATEST(
    COALESCE(rc.last_recording, u.created_at),
    COALESCE(ra.last_review, u.created_at)
  ) as last_activity
FROM wallet_users u
LEFT JOIN (
  SELECT 
    wallet_address,
    COUNT(*) as total_recordings,
    SUM(duration) as total_duration,
    MAX(created_at) as last_recording
  FROM recording_contributions 
  GROUP BY wallet_address
) rc ON u.wallet_address = rc.wallet_address
LEFT JOIN (
  SELECT 
    wallet_address,
    COUNT(*) as total_reviews,
    AVG(accuracy) as average_accuracy,
    MAX(created_at) as last_review
  FROM review_activities 
  GROUP BY wallet_address
) ra ON u.wallet_address = ra.wallet_address;

-- 创建 Supabase Storage bucket（需要在 Supabase Dashboard 中手动创建）
-- Bucket 名称: 'audio-recordings'
-- 访问权限: 公开读取，认证用户上传

-- 存储策略（在 Supabase Dashboard 的 Storage > Policies 中设置）
/*
CREATE POLICY "允许公开读取音频文件" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio-recordings');

CREATE POLICY "允许认证用户上传音频文件" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio-recordings');

CREATE POLICY "允许用户删除自己的音频文件" ON storage.objects
  FOR DELETE USING (bucket_id = 'audio-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
*/

-- 插入示例数据（可选）
-- INSERT INTO wallet_users (wallet_address, user_info) VALUES 
-- ('0x1234567890123456789012345678901234567890', '{"browser": "Chrome", "platform": "macOS"}');

-- 查看表结构
-- \d wallet_users
-- \d recording_contributions
-- \d review_activities
-- \d batch_activities