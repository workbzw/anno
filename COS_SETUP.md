# 腾讯云 COS 配置指南

## 环境变量配置

请在项目根目录创建 `.env.local` 文件，并添加以下配置：

```bash
# 腾讯云 COS 配置
COS_SECRET_ID=your_secret_id_here
COS_SECRET_KEY=your_secret_key_here
COS_BUCKET=your-bucket-name-1250000000
COS_REGION=ap-beijing
```

## 获取配置信息

### 1. 获取 SecretId 和 SecretKey（API 密钥）

**步骤：**

1. **登录腾讯云控制台**
   - 访问：https://console.cloud.tencent.com/
   - 使用你的腾讯云账号登录

2. **进入访问管理页面**
   - 点击右上角头像 → 选择"访问管理"
   - 或直接访问：https://console.cloud.tencent.com/cam/capi

3. **查看或创建 API 密钥**
   - 在左侧菜单选择"API密钥管理"
   - 如果已有密钥，直接查看
   - 如果没有，点击"新建密钥"创建

4. **复制密钥信息**
   - **SecretId**：密钥 ID（格式：以 `AKID` 开头的字符串）
   - **SecretKey**：密钥 Key（长字符串）
   - ⚠️ **重要**：SecretKey 只显示一次，请妥善保存！

5. **配置到环境变量**
   ```bash
   COS_SECRET_ID=你的实际SecretId
   COS_SECRET_KEY=你的实际SecretKey
   ```

### 2. 获取存储桶名称（COS_BUCKET）和地域（COS_REGION）

**步骤：**

1. **进入对象存储控制台**
   - 访问：https://console.cloud.tencent.com/cos
   - 或从控制台首页搜索"对象存储"

2. **创建存储桶（如果还没有）**
   - 点击"创建存储桶"按钮
   - 填写存储桶信息：
     - **名称**：自定义（例如：`yue-voice-recordings`）
     - **所属地域**：选择就近地域（例如：北京、上海、广州）
     - **访问权限**：选择 **私有读写**（推荐）
   - 点击"创建"

3. **查看存储桶信息**
   - 在存储桶列表中，找到你创建的存储桶
   - 点击存储桶名称进入详情页

4. **获取存储桶名称（COS_BUCKET）**
   - 存储桶名称格式：`bucket-name-APPID`
   - 例如：`yue-voice-recordings-1250000000`
   - 其中 `1250000000` 是你的 APPID（在存储桶名称中会自动添加）
   - 完整名称可以在存储桶的"概览"页面看到

5. **获取地域（COS_REGION）**
   - 在存储桶"概览"页面可以看到"所属地域"
   - 常见地域代码：
     - 北京：`ap-beijing`
     - 上海：`ap-shanghai`
     - 广州：`ap-guangzhou`
     - 成都：`ap-chengdu`
     - 重庆：`ap-chongqing`
     - 更多地域代码：https://cloud.tencent.com/document/product/436/6224

6. **配置到环境变量**
   ```bash
   COS_BUCKET=yue-voice-recordings-1250000000
   COS_REGION=ap-beijing
   ```

### 3. 如何查看 APPID

如果存储桶名称中没有显示 APPID，可以通过以下方式查看：

1. **在控制台右上角**
   - 点击右上角头像
   - 在账号信息中可以看到 APPID

2. **在存储桶概览页面**
   - 进入存储桶详情
   - 在"基本信息"中可以看到完整的存储桶名称（包含 APPID）

### 4. 完整配置示例

创建 `.env.local` 文件，填入你的实际值：

```bash
# 从 https://console.cloud.tencent.com/cam/capi 获取
COS_SECRET_ID=你的实际SecretId
COS_SECRET_KEY=你的实际SecretKey

# 从 https://console.cloud.tencent.com/cos 获取
COS_BUCKET=你的存储桶名称-APPID
COS_REGION=你的地域代码
```

### 5. 验证配置

配置完成后，可以通过以下方式验证：

1. **检查环境变量是否加载**
   - 重启开发服务器：`npm run dev`
   - 查看控制台是否有错误

2. **测试上传功能**
   - 连接钱包
   - 录制音频并提交
   - 检查是否成功上传到 COS
   - 在腾讯云控制台查看存储桶中是否有文件

## 存储桶权限设置

**推荐设置：私有读写**

- 后端使用密钥上传文件
- 前端通过预签名 URL 访问文件
- 更安全，可以控制访问权限

## API 端点说明

### 上传文件
- **端点**: `POST /api/upload`
- **功能**: 上传音频文件到 COS
- **权限**: 需要钱包连接

### 获取预签名 URL
- **端点**: `POST /api/cos/presigned-url`
- **功能**: 生成访问私有文件的临时 URL
- **有效期**: 默认 1 小时

### 批量获取预签名 URL
- **端点**: `POST /api/cos/presigned-urls`
- **功能**: 批量生成预签名 URL

### 获取文件列表
- **端点**: `GET /api/cos/list?walletAddress=0x...`
- **功能**: 获取指定钱包地址的文件列表

## 使用流程

1. 用户录音并完成所有句子
2. 点击"提交录音"按钮
3. 系统自动下载 WAV 文件到本地
4. 如果已连接钱包，自动上传到 COS
5. 上传成功后，文件路径保存在 localStorage

## 安全注意事项

1. **不要将 `.env.local` 提交到 Git**
2. **密钥只在后端使用，不会暴露给前端**
3. **存储桶设置为私有读写，确保安全**
4. **预签名 URL 有时效性，默认 1 小时**

## 安装依赖

```bash
npm install cos-nodejs-sdk-v5
```

## 故障排查

### 上传失败
- 检查环境变量是否正确配置
- 检查存储桶名称和地域是否正确
- 检查密钥是否有上传权限
- 查看浏览器控制台和服务器日志

### 预签名 URL 无法访问
- 检查 URL 是否过期（默认 1 小时）
- 检查对象键（objectKey）是否正确
- 检查存储桶权限设置
