interface UploadResult {
  success: boolean;
  objectKey: string;
  walletAddress: string;
  sentenceText: string;
  sentenceId: string;
  size: number;
  uploadTime: string;
}

interface PresignedUrlResult {
  success: boolean;
  url: string;
  expiresIn: number;
  expiresAt: string;
}

/**
 * 上传文件到 COS（通过后端）
 */
export const uploadToCOS = async (
  audioBlob: Blob,
  filename: string,
  walletAddress: string,
  sentenceText: string,
  sentenceId: string
): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', audioBlob, filename);
  formData.append('walletAddress', walletAddress);
  formData.append('sentenceText', sentenceText);
  formData.append('sentenceId', sentenceId);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '上传失败');
  }

  return await response.json();
};

/**
 * 获取预签名 URL（用于访问私有文件）
 */
export const getPresignedUrl = async (
  objectKey: string,
  expires: number = 3600
): Promise<string> => {
  const response = await fetch('/api/cos/presigned-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ objectKey, expires }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '获取预签名 URL 失败');
  }

  const result: PresignedUrlResult = await response.json();
  return result.url;
};

/**
 * 批量获取预签名 URL
 */
export const getPresignedUrls = async (
  objectKeys: string[],
  expires: number = 3600
): Promise<Record<string, string>> => {
  const response = await fetch('/api/cos/presigned-urls', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ objectKeys, expires }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '批量获取预签名 URL 失败');
  }

  const result = await response.json();
  const urlMap: Record<string, string> = {};
  result.urls.forEach((item: { objectKey: string; url: string }) => {
    urlMap[item.objectKey] = item.url;
  });

  return urlMap;
};

/**
 * 获取用户文件列表
 */
export const getUserFiles = async (walletAddress: string) => {
  const response = await fetch(
    `/api/cos/list?walletAddress=${walletAddress}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '获取文件列表失败');
  }

  return await response.json();
};
