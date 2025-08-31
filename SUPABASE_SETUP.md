# Supabase 后端设置指南

本指南将帮您在 Yue Voice 项目中设置 Supabase 作为后端数据库。

## 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project"
3. 选择组织并输入项目信息：
   - **Project Name**: `yue-voice-backend`
   - **Database Password**: 创建一个强密码
   - **Region**: 选择距离用户最近的区域
4. 点击 "Create new project" 并等待项目创建完成

## 2. 获取项目配置

项目创建完成后，在 Supabase Dashboard 中：

1. 进入 **Settings** → **API**
2. 复制以下信息：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGc...` (公钥，用于客户端)
   - **service_role key**: `eyJhbGc...` (私钥，用于服务端，可选)

## 3. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# 可选：服务端密钥（如需要管理员权限）
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development
```

## 4. 创建数据库表

在 Supabase Dashboard 中：

1. 进入 **SQL Editor**
2. 点击 "New query"
3. 复制 `supabase-schema.sql` 文件的内容
4. 粘贴到编辑器中并点击 "Run" 执行

这将创建以下表：
- `wallet_users` - 钱包用户信息
- `recording_contributions` - 录音贡献记录
- `review_activities` - 审核活动记录
- `batch_activities` - 批量活动记录

## 5. 验证设置

1. 启动开发服务器：`npm run dev`
2. 在浏览器中访问 http://localhost:3001
3. 连接钱包后，点击首页的"钱包API"标签
4. 勾选"使用本地 Supabase API"
5. 点击各种测试按钮验证功能

## 6. 查看数据

在 Supabase Dashboard 中：

1. 进入 **Table Editor**
2. 选择相应的表查看数据
3. 可以直接在界面中查看、编辑、删除记录

## 7. 监控和调试

### API 日志
- **Logs** → **API** - 查看 API 请求日志
- **Logs** → **Database** - 查看数据库操作日志

### 性能监控
- **Reports** - 查看数据库性能报告
- **Monitoring** - 实时监控指标

## 8. 安全配置

### 行级安全性 (RLS)
项目已启用 RLS 并配置了基本策略。您可以根据需要调整：

```sql
-- 例：限制用户只能访问自己的数据
CREATE POLICY "用户只能访问自己的录音" ON recording_contributions 
  FOR ALL USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');
```

### API 密钥管理
- **anon key** - 用于客户端，权限受 RLS 限制
- **service_role key** - 绕过 RLS，仅用于服务端

## 9. 生产环境配置

### 环境变量
更新生产环境的 `.env.production.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### 域名配置
在 Supabase Dashboard **Settings** → **API** 中配置允许的域名。

## 10. 备份和恢复

### 自动备份
Supabase 免费计划包含 7 天的自动备份。

### 手动备份
```bash
# 使用 pg_dump 备份数据库
pg_dump "postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres" > backup.sql
```

## 常见问题

### Q: 连接失败
A: 检查环境变量是否正确配置，确保 URL 和密钥正确。

### Q: 权限错误
A: 确认 RLS 策略设置正确，或暂时禁用 RLS 进行测试。

### Q: 性能问题
A: 检查是否创建了必要的索引，考虑升级到付费计划获得更好性能。

## 支持

- [Supabase 文档](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com/)
- [GitHub Issues](https://github.com/supabase/supabase/issues)