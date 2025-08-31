# TOS 存储配置修复指南

## 问题描述

遇到错误：`Error: do not support s3 endpoint, please use tos endpoint.`

这个错误是因为TOS SDK不支持S3兼容格式的endpoint，需要使用TOS专用的endpoint格式。

## 解决方案

### 1. 检查环境变量配置

检查您的 `.env.local` 或环境变量中的 `TOS_ENDPOINT` 配置：

**❌ 错误的配置（S3兼容格式）：**
```
TOS_ENDPOINT=https://tos-s3-cn-guangzhou.volces.com
```

**✅ 正确的配置（TOS专用格式）：**
```
TOS_ENDPOINT=https://tos-cn-guangzhou.volces.com
```

### 2. 完整的环境变量配置示例

```bash
# TOS 存储配置
NEXT_PUBLIC_STORAGE_PROVIDER=tos
TOS_REGION=cn-guangzhou
TOS_BUCKET_NAME=yyanno
TOS_ENDPOINT=https://tos-cn-guangzhou.volces.com
TOS_ACCESS_KEY_ID=your_access_key_id
TOS_ACCESS_KEY_SECRET=your_access_key_secret
```

### 3. 不同地区的正确 TOS Endpoint 格式

| 地区 | TOS Endpoint |
|------|-------------|
| 华南1（广州） | https://tos-cn-guangzhou.volces.com |
| 华北2（北京） | https://tos-cn-beijing.volces.com |
| 华东2（上海） | https://tos-cn-shanghai.volces.com |

### 4. 自动修复功能

代码已经添加了自动检测和转换功能：
- 如果检测到S3格式的endpoint（包含`tos-s3-`），会自动转换为TOS格式
- 转换过程会在控制台输出日志，方便调试

### 5. 验证配置

修改环境变量后：

1. 重启开发服务器：
   ```bash
   npm run dev
   ```

2. 检查控制台日志，应该看到：
   ```
   自动转换 TOS endpoint: https://tos-s3-cn-guangzhou.volces.com -> https://tos-cn-guangzhou.volces.com
   TOS 存储客户端已初始化: { region: 'cn-guangzhou', bucket: 'yyanno', endpoint: 'https://tos-cn-guangzhou.volces.com' }
   ```

3. 尝试上传音频文件，确认不再出现错误

## 技术说明

### 为什么会出现这个问题？

1. **火山引擎TOS有两套API**：
   - S3兼容API：使用 `tos-s3-{region}.volces.com` 格式
   - TOS原生API：使用 `tos-{region}.volces.com` 格式

2. **TOS SDK要求**：
   - `@volcengine/tos-sdk` 只支持TOS原生API的endpoint格式
   - 不能使用S3兼容的endpoint格式

3. **解决方案**：
   - 使用正确的TOS endpoint格式
   - 或者使用S3兼容的SDK（如aws-sdk）配合S3兼容的endpoint

## 相关文件

- `/app/lib/storage.ts` - 存储工厂，包含自动endpoint转换逻辑
- `/app/lib/storage/tosStorage.ts` - TOS存储提供程序，包含endpoint验证
- `.env.local` - 环境变量配置文件

## 参考链接

- [火山引擎TOS文档](https://www.volcengine.com/docs/6349)
- [TOS JavaScript SDK文档](https://www.volcengine.com/docs/6349/74869)