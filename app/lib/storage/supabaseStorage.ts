import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { StorageProvider, StorageUploadResult } from '../storage'

export class SupabaseStorageProvider implements StorageProvider {
  private client: SupabaseClient
  private bucketName: string

  constructor(config: {
    supabaseUrl: string
    supabaseAnonKey: string
    bucketName: string
  }) {
    this.client = createClient(config.supabaseUrl, config.supabaseAnonKey)
    this.bucketName = config.bucketName

    console.log('Supabase 存储客户端已初始化:', {
      url: config.supabaseUrl,
      bucket: config.bucketName
    })
  }

  async upload(file: File, key: string): Promise<StorageUploadResult> {
    try {
      console.log(`开始上传文件到 Supabase: ${key}`)
      
      // 将文件转换为 ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // 上传文件到 Supabase Storage
      const { data, error } = await this.client.storage
        .from(this.bucketName)
        .upload(key, arrayBuffer, {
          contentType: file.type,
          duplex: 'half'
        })

      if (error) {
        console.error('Supabase 上传错误:', error)
        return {
          success: false,
          key,
          url: '',
          size: 0,
          error: error.message
        }
      }

      // 获取公共 URL
      const publicUrl = this.getPublicUrl(key)

      return {
        success: true,
        key,
        url: publicUrl,
        size: file.size
      }

    } catch (error: any) {
      console.error('Supabase 上传失败:', error)
      return {
        success: false,
        key,
        url: '',
        size: 0,
        error: error.message || '上传到 Supabase 失败'
      }
    }
  }

  getPublicUrl(key: string): string {
    const { data } = this.client.storage
      .from(this.bucketName)
      .getPublicUrl(key)
    
    return data.publicUrl
  }

  async delete(key: string): Promise<boolean> {
    try {
      const { error } = await this.client.storage
        .from(this.bucketName)
        .remove([key])
      
      if (error) {
        console.error('Supabase 删除失败:', error)
        return false
      }
      
      console.log(`文件已从 Supabase 删除: ${key}`)
      return true
      
    } catch (error: any) {
      console.error('Supabase 删除失败:', error)
      return false
    }
  }

  // Supabase 特有的方法

  // 批量上传
  async uploadMultiple(files: Array<{ file: File; key: string }>): Promise<StorageUploadResult[]> {
    const results: StorageUploadResult[] = []
    
    // 串行上传以避免速率限制
    for (const { file, key } of files) {
      const result = await this.upload(file, key)
      results.push(result)
      
      // 添加小延迟以避免速率限制
      if (files.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }
    
    return results
  }

  // 获取文件元数据
  async getObjectMetadata(key: string): Promise<any> {
    try {
      const { data, error } = await this.client.storage
        .from(this.bucketName)
        .list('', {
          search: key
        })
      
      if (error) throw error
      
      const file = data?.find(f => f.name === key.split('/').pop())
      
      return {
        size: file?.metadata?.size,
        contentType: file?.metadata?.mimetype,
        lastModified: file?.updated_at,
        metadata: file?.metadata
      }
    } catch (error: any) {
      console.error('获取文件元数据失败:', error)
      throw new Error('获取文件元数据失败')
    }
  }

  // 列出指定前缀的文件
  async listObjects(prefix: string, maxKeys: number = 100): Promise<any[]> {
    try {
      const { data, error } = await this.client.storage
        .from(this.bucketName)
        .list(prefix, {
          limit: maxKeys
        })
      
      if (error) throw error
      
      return data || []
    } catch (error: any) {
      console.error('列出对象失败:', error)
      throw new Error('列出文件失败')
    }
  }

  // 创建签名 URL
  async createSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await this.client.storage
        .from(this.bucketName)
        .createSignedUrl(key, expiresIn)
      
      if (error) throw error
      
      return data.signedUrl
    } catch (error: any) {
      console.error('创建签名 URL 失败:', error)
      throw new Error('创建签名 URL 失败')
    }
  }
}
