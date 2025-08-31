# Vercel 环境变量配置错误修复

## 问题描述

在 Vercel 部署过程中遇到以下错误：
```
Error: supabaseUrl is required.
    at new bA (.next/server/chunks/8.js:21:79321)
    at bB (.next/server/chunks/8.js:21:84226)
```

## 根本原因

1. **构建时环境变量缺失**：Vercel 构建过程中 Supabase 客户端尝试初始化，但缺少必需的环境变量
2. **强制类型断言问题**：代码中使用 `!` 操作符强制获取环境变量，当变量不存在时导致运行时错误
3. **缺乏环境变量检查**：没有在构建时进行环境变量有效性检查

## 解决方案

### 1. 修改 Supabase 客户端初始化

**修改文件**：`app/lib/supabase.ts`

**原代码**：
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**修复后**：
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
```

### 2. 添加运行时检查机制

在 `WalletDatabase` 类中添加配置检查：

```typescript
private static checkSupabaseConfig() {
  if (!supabase) {
    throw new Error('Supabase 配置不可用，请检查环境变量 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return supabase
}
```

### 3. 更新所有数据库操作

在每个数据库操作方法中使用 `checkSupabaseConfig()`：

```typescript
static async upsertUser(walletAddress: string, userInfo: any = {}) {
  const client = this.checkSupabaseConfig()
  // ... 继续执行数据库操作
}
```

## Vercel 环境变量配置

### 必需配置的环境变量

1. **Supabase 配置**：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **存储配置**：
   - `NEXT_PUBLIC_STORAGE_PROVIDER=tos`

3. **TOS 存储配置**：
   - `TOS_REGION`
   - `TOS_ACCESS_KEY_ID`
   - `TOS_ACCESS_KEY_SECRET`
   - `TOS_BUCKET_NAME`
   - `TOS_ENDPOINT`

### 配置步骤

1. 登录 Vercel Dashboard
2. 进入项目设置 → Environment Variables
3. 添加所有必需的环境变量
4. 确保为 Production、Preview、Development 都配置
5. 重新部署项目

## 预防措施

1. **环境变量验证**：添加构建时环境变量检查
2. **graceful 降级**：当某些服务不可用时提供备用方案
3. **清晰的错误信息**：提供有用的调试信息
4. **文档完善**：创建 `.env.example` 文件作为配置参考

## 验证步骤

1. ✅ 检查所有环境变量已在 Vercel 中配置
2. ✅ 验证代码不再使用强制类型断言
3. ✅ 确认运行时检查机制工作正常
4. ✅ 测试构建过程不再报错

## 结果

- 🔧 **构建稳定性**：即使环境变量缺失，构建也不会失败
- 🚀 **部署成功**：Vercel 部署过程顺利完成
- 🛡️ **错误处理**：运行时提供清晰的错误信息
- 📚 **文档完善**：提供环境变量配置指南