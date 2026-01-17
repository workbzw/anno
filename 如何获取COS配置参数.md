# 如何获取 COS 配置参数

## 📋 需要获取的 4 个参数

1. `COS_SECRET_ID` - API 密钥 ID
2. `COS_SECRET_KEY` - API 密钥 Key
3. `COS_BUCKET` - 存储桶名称
4. `COS_REGION` - 存储桶地域

---

## 🔑 步骤 1：获取 SecretId 和 SecretKey

### 方法一：通过控制台获取（推荐）

1. **登录腾讯云控制台**
   - 访问：https://console.cloud.tencent.com/
   - 使用你的账号登录

2. **进入 API 密钥管理页面**
   - 方式 A：点击右上角头像 → 选择"访问管理" → 左侧菜单"API密钥管理"
   - 方式 B：直接访问：https://console.cloud.tencent.com/cam/capi

3. **查看或创建密钥**
   - 如果已有密钥：直接查看并复制
   - 如果没有密钥：点击"新建密钥"按钮创建

4. **复制密钥信息**
   - **SecretId**：密钥 ID（格式：以 `AKID` 开头的字符串）
   - **SecretKey**：密钥 Key（长字符串）
   ⚠️ **注意**：SecretKey 只显示一次，请立即保存！

5. **填入环境变量**
   ```bash
   COS_SECRET_ID=你的实际SecretId
   COS_SECRET_KEY=你的实际SecretKey
   ```

### 方法二：通过子账号获取（更安全）

如果你使用子账号，需要：

1. 主账号创建子账号并授予 COS 权限
2. 子账号登录后按照方法一获取密钥
3. 这样更安全，避免使用主账号密钥

---

## 🪣 步骤 2：获取存储桶名称（COS_BUCKET）

### 创建存储桶

1. **进入对象存储控制台**
   - 访问：https://console.cloud.tencent.com/cos
   - 或从控制台首页搜索"对象存储 COS"

2. **创建存储桶**
   - 点击"创建存储桶"按钮
   - 填写信息：
     - **名称**：自定义（例如：`yue-voice-recordings`）
     - **所属地域**：选择就近地域
     - **访问权限**：选择 **私有读写** ⚠️
     - **其他设置**：使用默认即可
   - 点击"创建"

3. **查看存储桶名称**
   - 创建后，存储桶名称会自动添加 APPID
   - 格式：`你起的名称-APPID`
   - 例如：`yue-voice-recordings-1250000000`
   - 可以在存储桶列表或详情页看到完整名称

4. **填入环境变量**
   ```bash
   COS_BUCKET=yue-voice-recordings-1250000000
   ```

### 如果已有存储桶

1. 进入对象存储控制台
2. 在存储桶列表中找到你的存储桶
3. 点击存储桶名称进入详情页
4. 在"概览"页面可以看到完整的存储桶名称

---

## 🌍 步骤 3：获取地域（COS_REGION）

### 查看存储桶地域

1. **在存储桶详情页**
   - 进入存储桶 → "概览"页面
   - 可以看到"所属地域"

2. **常见地域代码对照表**

   | 地域名称 | 地域代码 | 说明 |
   |---------|---------|------|
   | 北京 | `ap-beijing` | 华北地区 |
   | 上海 | `ap-shanghai` | 华东地区 |
   | 广州 | `ap-guangzhou` | 华南地区 |
   | 成都 | `ap-chengdu` | 西南地区 |
   | 重庆 | `ap-chongqing` | 西南地区 |
   | 香港 | `ap-hongkong` | 港澳台地区 |
   | 新加坡 | `ap-singapore` | 东南亚地区 |
   | 首尔 | `ap-seoul` | 东北亚地区 |

3. **填入环境变量**
   ```bash
   COS_REGION=ap-beijing
   ```

### 如何查看完整地域列表

访问：https://cloud.tencent.com/document/product/436/6224

---

## 📝 步骤 4：如何查看 APPID

存储桶名称中的 APPID 是你的腾讯云账号 ID。

### 查看方法：

1. **控制台右上角**
   - 点击右上角头像
   - 在账号信息中可以看到 APPID（12 位数字）

2. **存储桶名称中**
   - 存储桶名称格式：`名称-APPID`
   - 例如：`yue-voice-1250000000`
   - 其中 `1250000000` 就是 APPID

---

## ✅ 完整配置示例

创建 `.env.local` 文件（在项目根目录），填入你的实际值：

```bash
# 从 https://console.cloud.tencent.com/cam/capi 获取
COS_SECRET_ID=你的实际SecretId
COS_SECRET_KEY=你的实际SecretKey

# 从 https://console.cloud.tencent.com/cos 获取
COS_BUCKET=你的存储桶名称-APPID
COS_REGION=你的地域代码
```

---

## 🔍 快速检查清单

- [ ] 已获取 SecretId（从 API 密钥管理页面）
- [ ] 已获取 SecretKey（从 API 密钥管理页面，已保存）
- [ ] 已创建存储桶（在对象存储控制台）
- [ ] 已获取存储桶名称（包含 APPID）
- [ ] 已获取地域代码（从存储桶详情页）
- [ ] 已创建 `.env.local` 文件
- [ ] 已填入所有配置参数
- [ ] 存储桶权限设置为"私有读写"

---

## 🚨 常见问题

### Q1: SecretKey 忘记了怎么办？
**A**: SecretKey 只显示一次，如果忘记需要：
1. 删除旧密钥
2. 创建新密钥
3. 更新环境变量

### Q2: 存储桶名称格式不对？
**A**: 确保格式是 `名称-APPID`，例如：`my-bucket-1250000000`

### Q3: 地域代码在哪里看？
**A**: 在存储桶的"概览"页面，可以看到"所属地域"，对照上面的表格找到对应的代码

### Q4: 如何知道 APPID？
**A**: 在控制台右上角点击头像，或在存储桶名称中可以看到

### Q5: 存储桶权限应该设置为什么？
**A**: 推荐设置为"私有读写"，这样更安全

---

## 📚 相关文档

- [腾讯云 API 密钥管理](https://console.cloud.tencent.com/cam/capi)
- [对象存储控制台](https://console.cloud.tencent.com/cos)
- [地域和访问域名](https://cloud.tencent.com/document/product/436/6224)
- [存储桶权限设置](https://cloud.tencent.com/document/product/436/13315)

---

## 🎯 配置完成后

1. 重启开发服务器：`npm run dev`
2. 连接钱包
3. 录制音频并提交
4. 检查是否成功上传到 COS（在控制台查看存储桶）
