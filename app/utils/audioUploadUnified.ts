// 统一音频上传工具函数 - 支持 TOS 和 Supabase

export interface AudioUploadResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    walletAddress: string;
    sentenceId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    duration: number;
    uploadTime: string;
    storageProvider: string;
  };
  error?: string;
}

// 将音频URL转换为文件对象
export async function audioUrlToFile(
  audioUrl: string, 
  filename: string = 'recording.wav'
): Promise<File> {
  try {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    
    // 确定MIME类型
    let mimeType = 'audio/wav';
    if (filename.endsWith('.webm')) {
      mimeType = 'audio/webm';
    } else if (filename.endsWith('.mp3')) {
      mimeType = 'audio/mp3';
    } else if (filename.endsWith('.ogg')) {
      mimeType = 'audio/ogg';
    }
    
    const file = new File([arrayBuffer], filename, {
      type: mimeType,
      lastModified: Date.now()
    });
    
    return file;
  } catch (error) {
    console.error('转换音频URL为文件失败:', error);
    throw new Error('音频文件转换失败');
  }
}

// 单个音频文件上传（使用统一存储API）
export async function uploadAudioFileUnified(
  audioUrl: string,
  walletAddress: string,
  sentenceId: string,
  options: {
    sentenceText?: string;
    duration?: number;
    audioQuality?: 'low' | 'medium' | 'high';
    filename?: string;
  } = {}
): Promise<AudioUploadResponse> {
  try {
    // 参数验证
    if (!audioUrl || !walletAddress || !sentenceId) {
      throw new Error('缺少必需参数');
    }

    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error('无效的钱包地址格式');
    }

    // 转换音频URL为文件
    const filename = options.filename || `recording_${sentenceId}.wav`;
    const audioFile = await audioUrlToFile(audioUrl, filename);

    // 创建FormData
    const formData = new FormData();
    formData.append('audioFile', audioFile);
    formData.append('walletAddress', walletAddress);
    formData.append('sentenceId', sentenceId);
    formData.append('sentenceText', options.sentenceText || '');
    formData.append('duration', (options.duration || 0).toString());
    formData.append('audioQuality', options.audioQuality || 'medium');

    // 发送上传请求到统一API
    const response = await fetch('/api/wallet/upload-audio-unified', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;

  } catch (error: any) {
    console.error('音频文件上传失败:', error);
    return {
      success: false,
      message: error.message || '音频上传失败',
      error: error.message
    };
  }
}

// 批量上传多个音频文件
export async function uploadMultipleAudioFilesUnified(
  audioData: Array<{
    audioUrl: string;
    sentenceId: string;
    sentenceText?: string;
    duration?: number;
    filename?: string;
  }>,
  walletAddress: string,
  options: {
    audioQuality?: 'low' | 'medium' | 'high';
    onProgress?: (completed: number, total: number, currentFile?: string) => void;
    concurrent?: boolean;
    maxConcurrency?: number;
  } = {}
): Promise<{
  success: boolean;
  results: AudioUploadResponse[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    errors: string[];
  };
}> {
  const results: AudioUploadResponse[] = [];
  const errors: string[] = [];
  let successful = 0;
  let failed = 0;

  try {
    console.log(`开始批量上传 ${audioData.length} 个音频文件`);
    console.log('存储提供商:', process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'supabase');

    if (options.concurrent && options.maxConcurrency) {
      // 限制并发数的并发上传
      const chunks: Array<typeof audioData> = [];
      for (let i = 0; i < audioData.length; i += options.maxConcurrency) {
        chunks.push(audioData.slice(i, i + options.maxConcurrency));
      }

      for (const chunk of chunks) {
        const chunkPromises = chunk.map(async (item, chunkIndex) => {
          const globalIndex = chunks.indexOf(chunk) * options.maxConcurrency! + chunkIndex;
          
          if (options.onProgress) {
            options.onProgress(globalIndex, audioData.length, item.filename);
          }

          const result = await uploadAudioFileUnified(item.audioUrl, walletAddress, item.sentenceId, {
            sentenceText: item.sentenceText,
            duration: item.duration,
            audioQuality: options.audioQuality,
            filename: item.filename
          });

          if (result.success) {
            successful++;
          } else {
            failed++;
            if (result.error) errors.push(`文件${globalIndex + 1}: ${result.error}`);
          }

          return result;
        });

        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
      }
    } else if (options.concurrent) {
      // 完全并发上传
      const uploadPromises = audioData.map(async (item, index) => {
        const result = await uploadAudioFileUnified(item.audioUrl, walletAddress, item.sentenceId, {
          sentenceText: item.sentenceText,
          duration: item.duration,
          audioQuality: options.audioQuality,
          filename: item.filename
        });
        
        if (result.success) {
          successful++;
        } else {
          failed++;
          if (result.error) errors.push(`文件${index + 1}: ${result.error}`);
        }
        
        if (options.onProgress) {
          options.onProgress(successful + failed, audioData.length, item.filename);
        }
        
        return result;
      });

      const allResults = await Promise.all(uploadPromises);
      results.push(...allResults);
    } else {
      // 串行上传（推荐，更稳定）
      for (let i = 0; i < audioData.length; i++) {
        const item = audioData[i];
        
        if (options.onProgress) {
          options.onProgress(i, audioData.length, item.filename);
        }
        
        const result = await uploadAudioFileUnified(item.audioUrl, walletAddress, item.sentenceId, {
          sentenceText: item.sentenceText,
          duration: item.duration,
          audioQuality: options.audioQuality,
          filename: item.filename
        });
        
        results.push(result);
        
        if (result.success) {
          successful++;
          console.log(`文件 ${i + 1}/${audioData.length} 上传成功:`, result.data?.fileName);
        } else {
          failed++;
          if (result.error) errors.push(`文件${i + 1}: ${result.error}`);
          console.error(`文件 ${i + 1}/${audioData.length} 上传失败:`, result.error);
        }
        
        // 添加短暂延迟，避免请求过于频繁
        if (i < audioData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      if (options.onProgress) {
        options.onProgress(audioData.length, audioData.length);
      }
    }

    console.log(`批量上传完成: 成功 ${successful}/${audioData.length}, 失败 ${failed}`);

    return {
      success: successful > 0,
      results,
      summary: {
        total: audioData.length,
        successful,
        failed,
        errors
      }
    };

  } catch (error: any) {
    console.error('批量音频上传失败:', error);
    return {
      success: false,
      results,
      summary: {
        total: audioData.length,
        successful,
        failed,
        errors: [...errors, error.message]
      }
    };
  }
}

// 获取当前存储配置信息
export function getStorageInfo(): {
  provider: string;
  bucketName?: string;
  region?: string;
  endpoint?: string;
} {
  const provider = process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'supabase';
  
  if (provider === 'tos') {
    return {
      provider: 'tos',
      bucketName: process.env.TOS_BUCKET_NAME,
      region: process.env.TOS_REGION,
      endpoint: process.env.TOS_ENDPOINT
    };
  }
  
  return {
    provider: 'supabase',
    bucketName: 'audio-recordings'
  };
}

// 音频文件信息获取（支持不同存储）
export async function getAudioFileInfo(audioUrl: string): Promise<{
  duration: number;
  size: number;
  sampleRate: number;
  channels: number;
  format: string;
}> {
  try {
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    return {
      duration: audioBuffer.duration,
      size: arrayBuffer.byteLength,
      sampleRate: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels,
      format: 'PCM'
    };
  } catch (error) {
    console.error('获取音频信息失败:', error);
    throw new Error('无法获取音频文件信息');
  }
}