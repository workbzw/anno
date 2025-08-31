# 钱包API使用指南

本文档展示如何在Yue Voice项目中的任何地方获取和使用钱包地址。

## 1. 快速开始

### 1.1 在组件中获取钱包地址

```tsx
import { useWalletContext } from '../contexts/WalletContext';

export default function MyComponent() {
  const { account, isConnected } = useWalletContext();

  if (!isConnected) {
    return <div>请先连接钱包</div>;
  }

  return (
    <div>
      <p>当前钱包地址：{account}</p>
    </div>
  );
}
```

### 1.2 上传钱包地址到API

```tsx
import { useWalletContext } from '../contexts/WalletContext';
import { uploadWalletAddress } from '../utils/walletApi';

export default function UploadExample() {
  const { account, isConnected } = useWalletContext();

  const handleUpload = async () => {
    if (!isConnected || !account) {
      alert('请先连接钱包');
      return;
    }

    try {
      const response = await uploadWalletAddress(
        'https://your-api.example.com/wallet',
        account,
        {
          action: 'user_login',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      );
      
      console.log('上传成功:', response);
    } catch (error) {
      console.error('上传失败:', error);
    }
  };

  return (
    <button onClick={handleUpload}>
      上传钱包地址
    </button>
  );
}
```

## 2. 预定义的API函数

### 2.1 用户认证
```tsx
import { uploadUserAuth } from '../utils/walletApi';

const response = await uploadUserAuth(
  'https://api.example.com/auth',
  account,
  {
    browser: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform
  }
);
```

### 2.2 录音贡献记录
```tsx
import { uploadRecordingContribution } from '../utils/walletApi';

const response = await uploadRecordingContribution(
  'https://api.example.com/recording',
  account,
  {
    sentenceId: 'sentence_123',
    duration: 5.2,
    audioQuality: 'high',
    language: 'yue'
  }
);
```

### 2.3 审核活动记录
```tsx
import { uploadReviewActivity } from '../utils/walletApi';

const response = await uploadReviewActivity(
  'https://api.example.com/review',
  account,
  {
    reviewType: 'voice',
    itemsReviewed: 10,
    accuracy: 0.95
  }
);
```

### 2.4 获取用户统计
```tsx
import { fetchUserStats } from '../utils/walletApi';

const stats = await fetchUserStats(
  'https://api.example.com/stats',
  account
);
```

## 3. API响应格式

所有API函数都返回标准格式的响应：

```tsx
interface WalletUploadResponse {
  success: boolean;
  message: string;
  data?: any;
}
```

成功响应示例：
```json
{
  "success": true,
  "message": "钱包地址上传成功",
  "data": {
    "id": "12345",
    "walletAddress": "0x...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

失败响应示例：
```json
{
  "success": false,
  "message": "HTTP 404: Not Found"
}
```

## 4. 错误处理

```tsx
try {
  const response = await uploadWalletAddress(endpoint, account, data);
  
  if (response.success) {
    console.log('上传成功:', response.data);
  } else {
    console.error('上传失败:', response.message);
  }
} catch (error) {
  console.error('网络错误:', error);
}
```

## 5. 在录音功能中集成

在录音完成后自动上传贡献记录：

```tsx
// 在 RecordingPage 组件中
import { useWalletContext } from '../contexts/WalletContext';
import { uploadRecordingContribution } from '../utils/walletApi';

const handleRecordingComplete = async (audioData, sentenceId) => {
  const { account, isConnected } = useWalletContext();
  
  if (isConnected && account) {
    await uploadRecordingContribution(
      process.env.NEXT_PUBLIC_API_ENDPOINT + '/recording',
      account,
      {
        sentenceId,
        duration: audioData.duration,
        audioQuality: 'high',
        language: 'yue'
      }
    );
  }
};
```

## 6. 环境变量配置

在 `.env.local` 文件中配置API端点：

```env
NEXT_PUBLIC_API_ENDPOINT=https://your-api.example.com
```

然后在代码中使用：

```tsx
const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT + '/wallet';
```

## 7. 注意事项

1. **钱包连接检查**：在使用钱包地址前，总是检查 `isConnected` 状态
2. **错误处理**：为所有API调用添加适当的错误处理
3. **用户体验**：为长时间运行的API调用显示加载状态
4. **安全性**：确保API端点支持HTTPS
5. **隐私**：只上传必要的用户信息