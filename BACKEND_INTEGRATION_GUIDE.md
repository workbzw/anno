# Next.js + Supabase 后端集成完整指南

## 📋 概述

本项目已成功集成 Next.js API Routes + Supabase 作为完整的后端解决方案，支持钱包地址的存储、查询和统计功能。

## 🎯 已实现的功能

### 1. **完整的 API 路由**
- `POST /api/wallet` - 基础钱包地址上传
- `GET /api/wallet?walletAddress=0x...` - 获取用户基础信息
- `POST /api/wallet/auth` - 用户认证信息记录
- `POST /api/wallet/recording` - 录音贡献记录
- `GET /api/wallet/recording?walletAddress=0x...` - 获取录音历史
- `POST /api/wallet/review` - 审核活动记录
- `GET /api/wallet/review?walletAddress=0x...` - 获取审核历史
- `GET /api/wallet/stats?walletAddress=0x...` - 用户统计数据
- `POST /api/wallet/batch` - 批量活动上传
- `GET /api/wallet/batch?walletAddress=0x...` - 批量记录查询

### 2. **数据库设计**
- **wallet_users** - 钱包用户基础信息
- **recording_contributions** - 录音贡献记录
- **review_activities** - 审核活动记录  
- **batch_activities** - 批量操作记录
- **user_stats_view** - 用户统计视图

### 3. **前端集成**
- 全局钱包上下文 (`WalletContext`)
- 统一的 API 工具函数 (`walletApi.ts`)
- 交互式演示组件 (`WalletApiDemo`)
- 本地/外部 API 切换功能

## 🚀 快速开始

### 步骤 1: 设置 Supabase

1. **创建 Supabase 项目**
   ```bash
   # 访问 https://supabase.com/dashboard
   # 创建新项目并获取 URL 和 API Key
   ```

2. **配置环境变量**
   ```bash
   # 复制示例文件
   cp .env.example .env.local
   
   # 编辑 .env.local 文件
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **创建数据库表**
   ```sql
   -- 在 Supabase SQL Editor 中执行 supabase-schema.sql
   ```

### 步骤 2: 启动项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 步骤 3: 测试功能

1. 打开浏览器访问 http://localhost:3001
2. 连接 MetaMask 钱包
3. 点击"钱包API"标签页
4. 勾选"使用本地 Supabase API"
5. 测试各种 API 功能

## 💻 使用示例

### 在组件中获取钱包地址
```tsx
import { useWalletContext } from '../contexts/WalletContext';

function MyComponent() {
  const { account, isConnected } = useWalletContext();
  
  if (isConnected && account) {
    console.log('当前钱包地址:', account);
  }
}
```

### 使用便捷 API 函数
```tsx
import { walletApi } from '../utils/walletApi';

// 用户认证
await walletApi.auth(account, { browser: 'Chrome' });

// 录音贡献
await walletApi.recording(account, {
  sentenceId: 'sen_123',
  duration: 5.2,
  audioQuality: 'high'
});

// 获取统计
const stats = await walletApi.stats(account);
```

### 直接使用 API 端点
```tsx
// POST 请求
const response = await fetch('/api/wallet', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    walletAddress: account,
    additionalData: { action: 'login' }
  })
});

// GET 请求
const stats = await fetch(`/api/wallet/stats?walletAddress=${account}`);
```

## 📊 API 接口详情

### 基础钱包 API
```typescript
// POST /api/wallet
interface WalletRequest {
  walletAddress: string;
  timestamp: string;
  [key: string]: any;
}

interface WalletResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    walletAddress: string;
    timestamp: string;
  };
}
```

### 用户统计 API
```typescript
// GET /api/wallet/stats?walletAddress=0x...
interface StatsResponse {
  success: boolean;
  data: {
    wallet_address: string;
    total_recordings: number;
    total_reviews: number;
    total_contribution_time: number;
    accuracy_score: number;
    last_activity: string;
    recent_activity: {
      recordings_this_week: number;
      reviews_this_week: number;
      recording_time_this_week: number;
    };
    user_rank: number;
    contribution_score: number;
  };
}
```

## 🔧 高级配置

### 自定义 Supabase 客户端
```typescript
import { WalletDatabase } from '@/app/lib/supabase';

// 直接使用数据库操作类
const user = await WalletDatabase.upsertUser(walletAddress, userInfo);
const stats = await WalletDatabase.getUserStats(walletAddress);
```

### 环境特定配置
```javascript
// next.config.ts
const nextConfig = {
  env: {
    CUSTOM_API_ENDPOINT: process.env.CUSTOM_API_ENDPOINT,
  },
  async rewrites() {
    return [
      {
        source: '/api/wallet/:path*',
        destination: '/api/wallet/:path*',
      },
    ];
  },
};
```

## 🛡️ 安全考虑

### 1. 数据验证
所有 API 端点都包含：
- 钱包地址格式验证
- 输入数据清理
- 错误处理和日志记录

### 2. 行级安全性 (RLS)
```sql
-- 限制用户只能访问自己的数据
CREATE POLICY "用户访问限制" ON recording_contributions 
FOR ALL USING (wallet_address = current_user_wallet());
```

### 3. 速率限制 (可选)
```typescript
// 在 API 路由中添加速率限制
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 最多 100 次请求
});
```

## 📈 监控和调试

### 1. Supabase Dashboard
- **Logs** → **API** - API 请求日志
- **Table Editor** - 查看和编辑数据
- **SQL Editor** - 执行自定义查询

### 2. Next.js 开发工具
```typescript
// 在 API 路由中添加调试日志
console.log('API 请求:', {
  method: request.method,
  url: request.url,
  walletAddress: body.walletAddress
});
```

### 3. 前端调试
```typescript
// 在浏览器控制台查看 API 响应
const response = await walletApi.stats(account);
console.log('用户统计:', response);
```

## 🔄 数据迁移和备份

### 导出数据
```sql
-- 导出用户数据
COPY wallet_users TO '/tmp/wallet_users.csv' WITH CSV HEADER;

-- 导出录音数据
COPY recording_contributions TO '/tmp/recordings.csv' WITH CSV HEADER;
```

### 导入数据
```sql
-- 导入用户数据
COPY wallet_users FROM '/tmp/wallet_users.csv' WITH CSV HEADER;
```

## 🚀 部署到生产环境

### 1. 环境变量配置
```env
# .env.production.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### 2. Vercel 部署
```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel --prod
```

### 3. 域名配置
在 Supabase Dashboard 中配置生产域名的 CORS 设置。

## 🆘 故障排除

### 常见问题

1. **"钱包地址不能为空"**
   - 确认钱包已连接
   - 检查 `useWalletContext()` 返回的 `account` 值

2. **"服务器内部错误"**
   - 检查 Supabase 连接配置
   - 查看浏览器网络面板的错误信息
   - 检查 Supabase Dashboard 的日志

3. **"无效的钱包地址格式"**
   - 确认地址格式为 `0x` 开头的 40 位十六进制字符串

### 获取帮助
- 查看浏览器控制台错误
- 检查 Network 面板的 API 响应
- 查看 Supabase Dashboard 日志
- 参考 `SUPABASE_SETUP.md` 详细设置指南

## 📚 相关文档

- [Supabase 设置指南](./SUPABASE_SETUP.md)
- [钱包 API 使用指南](./WALLET_API_GUIDE.md)
- [数据库表结构](./supabase-schema.sql)
- [Next.js API Routes 文档](https://nextjs.org/docs/api-routes/introduction)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript)