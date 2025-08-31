# TOS 存储功能暂时注释状态

## 📋 当前状态

TOS 存储功能已被暂时注释，系统自动回退到使用 Supabase 存储。

## 🔧 已注释的功能

### 1. 存储工厂 (`app/lib/storage.ts`)
- ✅ TOS 存储提供商创建逻辑已注释
- ✅ 自动回退到 Supabase 存储
- ✅ 添加了控制台警告信息

### 2. 统一上传API (`app/api/wallet/upload-audio-unified/route.ts`)
- ✅ StorageFactory 自动选择逻辑已注释
- ✅ 强制使用 Supabase 存储提供商
- ✅ 添加了状态说明注释

### 3. 录音页面 (`app/components/RecordingPage.tsx`)
- ✅ 添加了TOS功能已注释的提示注释
- ⚠️ 实际上传功能仍然正常工作（使用Supabase）

## 📝 注释详情

### 存储工厂修改
```typescript
// 原代码
case 'tos':
  const { TOSStorageProvider } = await import('@/app/lib/storage/tosStorage')
  this.instance = new TOSStorageProvider(config.config as any)
  break

// 注释后
case 'tos':
  // 暂时注释 TOS 存储功能
  console.log('注意：TOS 存储功能已被注释，自动回退到 Supabase 存储')
  // const { TOSStorageProvider } = await import('@/app/lib/storage/tosStorage')
  // this.instance = new TOSStorageProvider(config.config as any)
  // 回退到 Supabase
  const { SupabaseStorageProvider: FallbackSupabaseProvider } = await import('@/app/lib/storage/supabaseStorage')
  const supabaseConfig = this.getStorageConfig('supabase')
  this.instance = new FallbackSupabaseProvider(supabaseConfig.config as any)
  break
```

### API路由修改
```typescript
// 原代码
const storageProvider = await StorageFactory.getStorageProvider()

// 注释后
console.log('注意：TOS 存储功能已被注释，使用 Supabase 存储')
// const storageProvider = await StorageFactory.getStorageProvider()

// 强制使用 Supabase 存储
const { SupabaseStorageProvider } = await import('@/app/lib/storage/supabaseStorage')
const supabaseConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  bucketName: 'audio-recordings'
}
const storageProvider = new SupabaseStorageProvider(supabaseConfig)
```

## ✅ 当前工作状态

### 正常工作的功能
- ✅ 音频录制功能
- ✅ 本地WAV文件下载
- ✅ Supabase 云端上传
- ✅ 钱包地址记录
- ✅ 数据库存储记录
- ✅ 录音状态管理
- ✅ 批次确认弹窗

### 被注释的功能
- ❌ TOS 存储上传
- ❌ TOS 配置验证
- ❌ TOS 错误处理

## 🔄 如何恢复TOS功能

当TOS配置问题解决后，可以按以下步骤恢复：

### 1. 恢复存储工厂
在 `app/lib/storage.ts` 中：
```typescript
case 'tos':
  const { TOSStorageProvider } = await import('@/app/lib/storage/tosStorage')
  this.instance = new TOSStorageProvider(config.config as any)
  break
```

### 2. 恢复API路由
在 `app/api/wallet/upload-audio-unified/route.ts` 中：
```typescript
const storageProvider = await StorageFactory.getStorageProvider()
```

### 3. 移除强制Supabase配置
删除临时添加的强制Supabase配置代码。

### 4. 恢复TOS配置
取消注释 `getStorageConfig()` 方法中的TOS配置部分。

## 🚨 注意事项

1. **环境变量**：
   - `NEXT_PUBLIC_STORAGE_PROVIDER=tos` 仍然有效
   - 但系统会忽略并使用Supabase

2. **错误处理**：
   - 不会再出现TOS相关的DNS错误
   - 所有上传都通过Supabase进行

3. **数据一致性**：
   - 上传的文件会保存在Supabase Storage
   - 数据库记录会显示 `storage_provider: 'supabase'`

4. **日志信息**：
   - 控制台会显示TOS功能已注释的提示
   - 有助于调试和状态确认

## 📋 TODO

解决TOS配置问题后的恢复清单：
- [ ] 修复TOS endpoint配置问题
- [ ] 验证TOS连接正常
- [ ] 恢复存储工厂中的TOS代码
- [ ] 恢复API路由中的自动选择逻辑
- [ ] 测试TOS上传功能
- [ ] 更新文档状态