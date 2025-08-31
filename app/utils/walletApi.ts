// HTTP工具函数库，用于处理钱包地址相关的API请求
// 现在使用 Next.js API 路由和 Supabase 后端

export interface WalletUploadResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface WalletUploadPayload {
  walletAddress: string;
  timestamp: string;
  [key: string]: any;
}

// 获取 API 基础 URL
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // 客户端：使用当前域名
    return window.location.origin;
  }
  // 服务端：使用环境变量或默认值
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
};

// 基础上传钱包地址函数
export async function uploadWalletAddress(
  endpoint: string,
  walletAddress: string,
  additionalData: Record<string, any> = {}
): Promise<WalletUploadResponse> {
  if (!walletAddress) {
    throw new Error('钱包地址不能为空');
  }

  const payload: WalletUploadPayload = {
    walletAddress,
    timestamp: new Date().toISOString(),
    ...additionalData,
  };

  try {
    // 如果是相对路径，使用本地 API
    const apiUrl = endpoint.startsWith('/api/') 
      ? `${getApiBaseUrl()}${endpoint}`
      : endpoint;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('钱包地址上传失败:', error);
    return {
      success: false,
      message: error.message || '上传失败',
    };
  }
}

// 上传用户认证信息
export async function uploadUserAuth(
  endpoint: string,
  walletAddress: string,
  userInfo: Record<string, any> = {}
): Promise<WalletUploadResponse> {
  // 使用本地 API 路由
  const apiEndpoint = endpoint.startsWith('/api/') ? endpoint : '/api/wallet/auth';
  
  return uploadWalletAddress(apiEndpoint, walletAddress, {
    type: 'authentication',
    userInfo,
  });
}

// 上传录音贡献记录
export async function uploadRecordingContribution(
  endpoint: string,
  walletAddress: string,
  recordingData: {
    sentenceId?: string;
    duration?: number;
    audioQuality?: string;
    [key: string]: any;
  }
): Promise<WalletUploadResponse> {
  // 使用本地 API 路由
  const apiEndpoint = endpoint.startsWith('/api/') ? endpoint : '/api/wallet/recording';
  
  return uploadWalletAddress(apiEndpoint, walletAddress, {
    type: 'recording_contribution',
    recordingData,
  });
}

// 上传审核活动记录
export async function uploadReviewActivity(
  endpoint: string,
  walletAddress: string,
  reviewData: {
    reviewType?: 'voice' | 'text';
    itemsReviewed?: number;
    accuracy?: number;
    [key: string]: any;
  }
): Promise<WalletUploadResponse> {
  // 使用本地 API 路由
  const apiEndpoint = endpoint.startsWith('/api/') ? endpoint : '/api/wallet/review';
  
  return uploadWalletAddress(apiEndpoint, walletAddress, {
    type: 'review_activity',
    reviewData,
  });
}

// 获取用户贡献统计
export async function fetchUserStats(
  endpoint: string,
  walletAddress: string
): Promise<WalletUploadResponse> {
  try {
    // 使用本地 API 路由
    const apiEndpoint = endpoint.startsWith('/api/') ? endpoint : '/api/wallet/stats';
    const apiUrl = apiEndpoint.startsWith('/api/') 
      ? `${getApiBaseUrl()}${apiEndpoint}?walletAddress=${encodeURIComponent(walletAddress)}`
      : `${apiEndpoint}?walletAddress=${encodeURIComponent(walletAddress)}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('获取用户统计失败:', error);
    return {
      success: false,
      message: error.message || '获取失败',
    };
  }
}

// 批量上传多个操作记录
export async function batchUploadActivities(
  endpoint: string,
  walletAddress: string,
  activities: Array<Record<string, any>>
): Promise<WalletUploadResponse> {
  // 使用本地 API 路由
  const apiEndpoint = endpoint.startsWith('/api/') ? endpoint : '/api/wallet/batch';
  
  return uploadWalletAddress(apiEndpoint, walletAddress, {
    type: 'batch_activities',
    activities,
    count: activities.length,
  });
}

// 便捷函数：使用默认本地 API 端点
export const walletApi = {
  // 基础上传
  upload: (walletAddress: string, data?: Record<string, any>) =>
    uploadWalletAddress('/api/wallet', walletAddress, data),
  
  // 用户认证
  auth: (walletAddress: string, userInfo?: Record<string, any>) =>
    uploadUserAuth('/api/wallet/auth', walletAddress, userInfo),
  
  // 录音贡献
  recording: (walletAddress: string, recordingData: Record<string, any>) =>
    uploadRecordingContribution('/api/wallet/recording', walletAddress, recordingData),
  
  // 审核活动
  review: (walletAddress: string, reviewData: Record<string, any>) =>
    uploadReviewActivity('/api/wallet/review', walletAddress, reviewData),
  
  // 获取统计
  stats: (walletAddress: string) =>
    fetchUserStats('/api/wallet/stats', walletAddress),
  
  // 批量上传
  batch: (walletAddress: string, activities: Array<Record<string, any>>) =>
    batchUploadActivities('/api/wallet/batch', walletAddress, activities),
};