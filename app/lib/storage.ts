// 存储服务抽象接口
export interface StorageProvider {
  upload(file: File, key: string): Promise<StorageUploadResult>
  getPublicUrl(key: string): string
  delete(key: string): Promise<boolean>
}

export interface StorageUploadResult {
  success: boolean
  key: string
  url: string
  size: number
  error?: string
}

export interface StorageConfig {
  provider: 'supabase' | 'tos'
  config: Record<string, any>
}

// 存储工厂类
export class StorageFactory {
  private static instance: StorageProvider | null = null
  
  static async getStorageProvider(): Promise<StorageProvider> {
    if (!this.instance) {
      const config = this.getStorageConfig()
      
      switch (config.provider) {
        case 'tos':
          const { TOSStorageProvider } = await import('@/app/lib/storage/tosStorage')
          this.instance = new TOSStorageProvider(config.config as any)
          break
        case 'supabase':
        default:
          const { SupabaseStorageProvider } = await import('@/app/lib/storage/supabaseStorage')
          this.instance = new SupabaseStorageProvider(config.config as any)
          break
      }
    }
    
    return this.instance!
  }
  
  private static getStorageConfig(): StorageConfig {
    // 从环境变量或配置文件读取存储配置
    const provider = (process.env.NEXT_PUBLIC_STORAGE_PROVIDER as 'supabase' | 'tos') || 'supabase'
    
    if (provider === 'tos') {
      // 修复 TOS endpoint 配置问题
      // TOS SDK 需要使用 TOS 专用的 endpoint 格式，不是 S3 兼容格式
      let endpoint = process.env.TOS_ENDPOINT
      
      // 如果是 S3 格式的 endpoint，转换为 TOS 格式
      if (endpoint && endpoint.includes('tos-s3-')) {
        // 将 tos-s3-cn-guangzhou.volces.com 转换为 tos-cn-guangzhou.volces.com
        endpoint = endpoint.replace('tos-s3-', 'tos-')
        console.log('自动转换 TOS endpoint:', process.env.TOS_ENDPOINT, '->', endpoint)
      }
      
      return {
        provider: 'tos',
        config: {
          region: process.env.TOS_REGION || 'cn-beijing',
          accessKeyId: process.env.TOS_ACCESS_KEY_ID!,
          accessKeySecret: process.env.TOS_ACCESS_KEY_SECRET!,
          bucketName: process.env.TOS_BUCKET_NAME || 'yue-voice-audio',
          endpoint: endpoint
        }
      }
    }
    
    return {
      provider: 'supabase',
      config: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        bucketName: 'audio-recordings'
      }
    }
  }
  
  // 重置实例（用于切换存储提供商）
  static resetInstance() {
    this.instance = null
    console.log('StorageFactory 实例已重置，下次调用将使用新配置')
  }
}

// 立即重置实例以应用恢复的TOS配置
StorageFactory.resetInstance()