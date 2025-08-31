# TOS DNS解析错误排查指南

## 错误信息分析

```
TOS 上传失败: [Error: getaddrinfo ENOTFOUND yyanno.https]
hostname: 'yyanno.https'
```

## 问题分析

### 1. 错误原因
错误显示hostname是 `yyanno.https`，这表明：
- TOS SDK在解析endpoint时出现问题
- 将bucket名称 `yyanno` 和协议 `https` 错误地组合成hostname
- 这可能是endpoint配置格式不正确导致的

### 2. 可能的根本原因

#### A. Endpoint格式问题
当前配置可能是：
```
TOS_ENDPOINT=https://tos-cn-guangzhou.volces.com
```

但TOS SDK可能期望的是：
```
TOS_ENDPOINT=tos-cn-guangzhou.volces.com  # 不带协议
```

#### B. SDK版本兼容性问题
- `@volcengine/tos-sdk` 版本可能不匹配
- 不同版本的SDK配置方式可能不同

#### C. 配置参数问题
- region配置可能不正确
- endpoint配置方式可能不符合SDK要求

## 排查步骤

### 1. 检查当前配置

查看控制台输出的TOS SDK配置参数：
```
TOS SDK 配置参数: {
  region: 'cn-guangzhou',
  bucketName: 'yyanno',
  originalEndpoint: 'https://tos-cn-guangzhou.volces.com',
  normalizedEndpoint: 'https://tos-cn-guangzhou.volces.com',
  hasAccessKey: true
}
```

### 2. 尝试不同的配置方式

#### 方式1：不带协议的endpoint
修改环境变量：
```bash
TOS_ENDPOINT=tos-cn-guangzhou.volces.com
```

#### 方式2：完全使用默认配置
暂时注释掉 `TOS_ENDPOINT` 环境变量，让SDK使用默认配置：
```bash
# TOS_ENDPOINT=tos-cn-guangzhou.volces.com
```

#### 方式3：检查region配置
确保region配置正确：
```bash
TOS_REGION=cn-guangzhou  # 确保与endpoint中的地区一致
```

### 3. 验证网络连接

#### 测试DNS解析
```bash
# 测试正确的hostname是否可以解析
nslookup tos-cn-guangzhou.volces.com
```

#### 测试HTTPS连接
```bash
# 测试能否正常访问TOS服务
curl -I https://tos-cn-guangzhou.volces.com
```

### 4. 检查TOS SDK版本

检查 package.json 中的TOS SDK版本：
```json
{
  "dependencies": {
    "@volcengine/tos-sdk": "^2.x.x"
  }
}
```

如果版本过旧，尝试升级：
```bash
npm update @volcengine/tos-sdk
```

## 解决方案

### 临时解决方案

1. **修改环境变量配置**：
   ```bash
   # 方式1：不带协议
   TOS_ENDPOINT=tos-cn-guangzhou.volces.com
   
   # 方式2：使用IP地址（如果域名解析有问题）
   # TOS_ENDPOINT=xxx.xxx.xxx.xxx
   
   # 方式3：使用完整URL但确保格式正确
   TOS_ENDPOINT=https://tos-cn-guangzhou.volces.com
   ```

2. **重启应用**：
   ```bash
   npm run dev
   ```

3. **查看新的调试日志**：
   检查控制台输出，确认配置是否正确应用

### 代码调试

已在代码中添加详细的调试信息：

1. **配置验证**：输出所有TOS配置参数
2. **Endpoint标准化**：自动处理endpoint格式
3. **上传过程跟踪**：详细记录上传过程的每个步骤

### 备用方案

如果TOS SDK持续有问题，可以考虑：

1. **使用S3兼容模式**：
   - 使用 `aws-sdk` 配合S3兼容的endpoint
   - endpoint: `https://tos-s3-cn-guangzhou.volces.com`

2. **使用HTTP直传**：
   - 实现基于HTTP的直接上传
   - 绕过SDK的配置问题

## 监控和日志

### 关键日志位置
- 浏览器控制台：TOS配置和上传日志
- 网络标签页：HTTP请求详情
- 服务器日志：API调用记录

### 需要收集的信息
- 完整的错误堆栈
- TOS SDK配置参数
- 网络请求详情
- 环境变量配置

## 下一步

1. 按照上述步骤逐一排查
2. 收集详细的调试日志
3. 如果问题持续，考虑联系火山引擎技术支持
4. 或者切换到备用存储方案