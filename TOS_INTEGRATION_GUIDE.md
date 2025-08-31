# 火山引擎 TOS 存储集成指南

## 📋 概述

本项目已经集成了火山引擎 TOS (Torch Object Storage) 存储服务，支持将音频文件存储到 TOS 而不是 Supabase Storage。系统采用了存储抽象层设计，可以在 TOS 和 Supabase 之间无缝切换。

## 🏗️ 架构设计

### 存储抽象层
- `app/lib/storage.ts` - 存储工厂和接口定义
- `app/lib/storage/tosStorage.ts` - TOS 存储适配器
- `app/lib/storage/supabaseStorage.ts` - Supabase 存储适配器

### 统一 API
- `app/api/wallet/upload-audio-unified/route.ts` - 统一音频上传 API
- `app/utils/audioUploadUnified.ts` - 统一音频上传工具函数

### 配置和管理
- `app/lib/tosConfig.ts` - TOS 配置验证工具
- `app/components/StorageConfigPage.tsx` - 存储配置管理页面
- `app/api/storage/validate/route.ts` - 配置验证 API
- `app/api/storage/test/route.ts` - 上传测试 API

## ⚙️ 配置步骤

### 1. 安装依赖

TOS SDK 已经安装：
```bash
npm install @volcengine/tos-sdk
```

### 2. 环境变量配置

在 `.env.local` 文件中添加以下配置：

```env
# 存储配置 - 选择使用的存储服务
NEXT_PUBLIC_STORAGE_PROVIDER=tos

# 火山引擎 TOS 配置
TOS_REGION=cn-beijing
TOS_ACCESS_KEY_ID=your_access_key_id
TOS_ACCESS_KEY_SECRET=your_access_key_secret
TOS_BUCKET_NAME=yue-voice-audio
TOS_ENDPOINT=https://tos-s3-cn-beijing.volces.com

# 继续使用 Supabase 作为数据库
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 火山引擎控制台配置

1. **创建存储桶**：
   - 登录火山引擎控制台
   - 进入 TOS 服务
   - 创建新的存储桶（建议命名为 `yue-voice-audio`）
   - 设置适当的访问权限

2. **获取访问密钥**：
   - 在控制台中创建或获取 Access Key ID 和 Access Key Secret
   - 确保密钥有 TOS 读写权限

3. **权限配置**：
   - 设置存储桶为公共读取（用于音频文件访问）
   - 确保应用有上传权限

## 🚀 使用方式

### 切换存储提供商

只需修改环境变量 `NEXT_PUBLIC_STORAGE_PROVIDER`：
- `tos` - 使用火山引擎 TOS
- `supabase` - 使用 Supabase Storage

### 代码使用

在 `RecordingPage.tsx` 中已经自动切换到统一 API：

```typescript
import { uploadMultipleAudioFilesUnified } from '../utils/audioUploadUnified';

// 上传函数会自动根据配置选择存储服务
const uploadResult = await uploadMultipleAudioFilesUnified(
  audioUploadData,
  account,
  {
    audioQuality: 'high',
    onProgress: (completed, total, currentFile) => {
      // 进度回调
    },
    concurrent: false
  }
);
```

## 🛠️ 配置验证和测试

### 1. 访问配置页面

创建一个新的页面 `/storage-config` 来访问存储配置管理界面：

```typescript
// app/storage-config/page.tsx
import StorageConfigPage from '../components/StorageConfigPage';

export default function StorageConfig() {
  return <StorageConfigPage />;
}
```

### 2. 验证配置

在配置页面中：
- 点击"验证配置"检查 TOS 配置是否正确
- 点击"测试上传"执行实际的上传测试

### 3. 命令行验证

也可以直接调用 API 进行验证：

```bash
# 验证配置
curl -X POST http://localhost:3002/api/storage/validate

# 测试上传
curl -X POST http://localhost:3002/api/storage/test
```

## 📊 功能特性

### TOS 特有功能

1. **批量上传优化**：支持并发上传和串行上传
2. **预签名 URL**：支持客户端直接上传
3. **元数据管理**：完整的文件元数据支持
4. **存储桶管理**：自动创建和检查存储桶
5. **区域支持**：支持多个 TOS 区域

### 兼容性保证

1. **接口兼容**：与原有 Supabase 接口完全兼容
2. **数据库独立**：文件存储和数据库可以使用不同服务
3. **无缝切换**：通过环境变量快速切换存储服务
4. **渐进迁移**：可以逐步从 Supabase 迁移到 TOS

## 🔧 故障排除

### 常见问题

1. **权限错误**：
   - 检查 Access Key 是否有 TOS 权限
   - 确认存储桶权限设置正确

2. **网络连接问题**：
   - 检查 TOS_ENDPOINT 配置
   - 确认网络可以访问火山引擎服务

3. **存储桶不存在**：
   - 系统会自动尝试创建存储桶
   - 确保密钥有创建存储桶的权限

### 调试方法

1. **查看控制台日志**：
   ```typescript
   // 在浏览器控制台查看详细上传日志
   console.log('TOS 上传开始...');
   ```

2. **使用配置验证工具**：
   - 访问 `/storage-config` 页面
   - 使用内置的验证和测试功能

3. **检查环境变量**：
   ```typescript
   // 确认配置是否正确加载
   console.log('当前存储提供商:', process.env.NEXT_PUBLIC_STORAGE_PROVIDER);
   ```

## 📈 性能优化

### 上传策略

1. **串行上传**（推荐）：更稳定，避免速率限制
2. **限制并发**：设置 `maxConcurrency` 控制并发数
3. **失败重试**：自动重试失败的上传

### 存储优化

1. **文件命名**：使用时间戳和钱包地址的层次结构
2. **元数据**：添加丰富的文件元数据便于管理
3. **清理策略**：定期清理测试文件和失效数据

## 🔄 迁移指南

### 从 Supabase 迁移到 TOS

1. **配置 TOS 环境**：按照上述步骤配置 TOS
2. **验证 TOS 功能**：确保 TOS 配置正确
3. **切换存储提供商**：修改 `NEXT_PUBLIC_STORAGE_PROVIDER=tos`
4. **测试功能**：验证音频上传功能正常
5. **数据迁移**（可选）：如需迁移现有文件，需要单独的迁移脚本

### 回退到 Supabase

只需将 `NEXT_PUBLIC_STORAGE_PROVIDER` 改回 `supabase` 即可立即回退。

## 📝 注意事项

1. **成本考量**：TOS 的存储和传输费用与 Supabase 不同，需要评估成本
2. **区域选择**：选择离用户最近的 TOS 区域以获得最佳性能
3. **备份策略**：建议设置跨区域备份和版本控制
4. **监控告警**：设置存储用量和错误率监控

## 🎯 总结

通过这个集成方案，您可以：
- ✅ 使用火山引擎 TOS 存储音频文件
- ✅ 保持与原有系统的完全兼容
- ✅ 在不同存储服务间无缝切换
- ✅ 享受 TOS 的高性能和可靠性
- ✅ 获得完整的配置验证和测试工具

现在您可以开始使用 TOS 存储来替代 Supabase Storage，同时保持所有现有功能不变！