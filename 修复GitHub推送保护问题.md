# 修复 GitHub 推送保护问题

## 问题说明

GitHub 检测到代码中包含了腾讯云 Secret ID 的示例格式，触发了推送保护。

## 已完成的修复

✅ 已移除文档中的示例 Secret ID 格式：
- `COS_SETUP.md`
- `如何获取COS配置参数.md`

✅ 已替换为更安全的占位符：
- 示例格式 → `你的实际SecretId`
- 示例格式 → `你的实际SecretKey`

## 解决方案

### 方案 1：推送到新分支（推荐）

由于 `main` 分支有保护规则，并且历史提交中包含敏感信息，建议：

1. **推送到新分支**
   ```bash
   git push -u origin feature/cos-upload-integration
   ```

2. **在 GitHub 上创建 Pull Request**
   - 打开仓库：https://github.com/workbzw/anno
   - 点击 "Compare & pull request"
   - 创建 PR 并合并

### 方案 2：修改历史提交（如果需要直接推送到 main）

如果必须推送到 main 分支，需要修改历史提交：

```bash
# 1. 使用 git filter-branch 移除敏感信息
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch COS_SETUP.md '如何获取COS配置参数.md'" \
  --prune-empty --tag-name-filter cat -- --all

# 2. 重新添加修复后的文件
git add COS_SETUP.md "如何获取COS配置参数.md"
git commit -m "docs: 添加COS配置文档（已移除敏感信息）"

# 3. 强制推送（需要权限）
git push origin main --force
```

⚠️ **注意**：强制推送会重写历史，如果其他人也在使用这个仓库，需要协调。

### 方案 3：使用 GitHub 的允许推送功能

GitHub 提供了临时允许推送的链接：
https://github.com/workbzw/anno/security/secret-scanning/unblock-secret/38Nqjaqcpa4O2INU1Do2NHqCmP5

⚠️ **注意**：只有在确认这些是示例值而非真实密钥时，才应该使用此功能。

## 当前状态

- ✅ 文档已修复，移除了示例 Secret ID
- ✅ 已创建新分支：`feature/cos-upload-integration`
- ✅ 已提交修复：`4190ed1`

## 下一步

推送到新分支：
```bash
git push -u origin feature/cos-upload-integration
```

然后在 GitHub 上创建 Pull Request 合并到 main。
