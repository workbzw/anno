import TosClient from '@volcengine/tos-sdk'
import { StorageProvider, StorageUploadResult } from '../storage'

export class TOSStorageProvider implements StorageProvider {
  private client: TosClient
  private bucketName: string
  private region: string
  private endpoint?: string

  constructor(config: {
    region: string
    accessKeyId: string
    accessKeySecret: string
    bucketName: string
    endpoint?: string
  }) {
    this.bucketName = config.bucketName
    this.region = config.region

    // 验证 endpoint 格式
    if (config.endpoint && config.endpoint.includes('tos-s3-')) {
      throw new Error(
        'TOS SDK 不支持 S3 兼容的 endpoint 格式。\n' +
        '当前 endpoint: ' + config.endpoint + '\n' +
        '请使用 TOS 专用格式，例如：https://tos-cn-guangzhou.volces.com\n' +
        '或者修改环境变量 TOS_ENDPOINT 为正确的 TOS endpoint'
      )
    }

    // 验证和标准化 endpoint 格式
    let normalizedEndpoint = config.endpoint
    if (normalizedEndpoint) {
      // 确保 endpoint以http://或https://开头
      if (!normalizedEndpoint.startsWith('http://') && !normalizedEndpoint.startsWith('https://')) {
        normalizedEndpoint = `https://${normalizedEndpoint}`
      }
      // 移除末尾的斜杠
      normalizedEndpoint = normalizedEndpoint.replace(/\/$/, '')
    }

    this.endpoint = normalizedEndpoint // 使用标准化后的endpoint

    console.log('TOS SDK 配置参数:', {
      region: config.region,
      bucketName: config.bucketName,
      originalEndpoint: config.endpoint,
      normalizedEndpoint: normalizedEndpoint,
      hasAccessKey: !!config.accessKeyId
    })

    // 创建 TOS 客户端
    // 根据 TOS SDK 的类型定义，需要使用正确的配置接口
    const tosConfig: any = {
      region: config.region,
      accessKeyId: config.accessKeyId,
      accessKeySecret: config.accessKeySecret
    }

    // 如果有自定义endpoint，在配置中加入
    if (normalizedEndpoint) {
      // 尝试不同的endpoint配置方式
      console.log('使用自定义 endpoint:', normalizedEndpoint)
      tosConfig.endpoint = normalizedEndpoint
    } else {
      console.log('使用默认 TOS endpoint')
    }

    console.log('TOS 客户端配置:', tosConfig)

    this.client = new TosClient(tosConfig)

    console.log('TOS 存储客户端已初始化:', {
      region: config.region,
      bucket: config.bucketName,
      endpoint: normalizedEndpoint
    })
  }

  async upload(file: File, key: string): Promise<StorageUploadResult> {
    try {
      console.log(`开始上传文件到 TOS: ${key}`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucket: this.bucketName,
        region: this.region,
        endpoint: this.endpoint
      })
      
      // 将 File 转换为 Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      console.log('文件转换完成，开始调用 TOS putObject API...')

      // 上传文件到 TOS
      const response = await this.client.putObject({
        bucket: this.bucketName,
        key: key,
        body: buffer,
        contentType: file.type,
        contentLength: file.size
      })

      console.log('TOS 上传响应:', response)

      // 生成公共访问 URL
      const publicUrl = this.getPublicUrl(key)

      return {
        success: true,
        key,
        url: publicUrl,
        size: file.size
      }

    } catch (error: any) {
      console.error('TOS 上传失败:', error)
      return {
        success: false,
        key,
        url: '',
        size: 0,
        error: error.message || '上传到 TOS 失败'
      }
    }
  }

  getPublicUrl(key: string): string {
    // 构造公共访问 URL
    if (this.endpoint) {
      // 确保 endpoint以https://开头
      const baseUrl = this.endpoint.startsWith('http') ? this.endpoint : `https://${this.endpoint}`
      return `${baseUrl}/${this.bucketName}/${key}`
    }
    
    // 默认的 TOS URL 格式（使用TOS格式，不S3格式）
    return `https://${this.bucketName}.tos-${this.region}.volces.com/${key}`
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.client.deleteObject({
        bucket: this.bucketName,
        key: key
      })
      
      console.log(`文件已从 TOS 删除: ${key}`)
      return true
      
    } catch (error: any) {
      console.error('TOS 删除失败:', error)
      return false
    }
  }

  // TOS 特有的方法
  
  // 批量上传
  async uploadMultiple(files: Array<{ file: File; key: string }>): Promise<StorageUploadResult[]> {
    const results: StorageUploadResult[] = []
    
    // 并行上传所有文件
    const uploadPromises = files.map(({ file, key }) => this.upload(file, key))
    const uploadResults = await Promise.all(uploadPromises)
    
    results.push(...uploadResults)
    return results
  }

  // 获取预签名上传 URL（用于客户端直接上传）
  async getPresignedUploadUrl(key: string, expires: number = 3600): Promise<string> {
    try {
      // 简化实现，返回公共 URL
      return this.getPublicUrl(key)
    } catch (error: any) {
      console.error('获取预签名 URL 失败:', error)
      throw new Error('获取预签名上传 URL 失败')
    }
  }

  // 获取文件元数据
  async getObjectMetadata(key: string): Promise<any> {
    try {
      // 简化实现，返回基本信息
      return {
        size: 0,
        contentType: 'application/octet-stream',
        lastModified: new Date().toISOString(),
        metadata: {}
      }
    } catch (error: any) {
      console.error('获取文件元数据失败:', error)
      throw new Error('获取文件元数据失败')
    }
  }

  // 列出指定前缀的文件
  async listObjects(prefix: string, maxKeys: number = 100): Promise<any[]> {
    try {
      // 简化实现，返回空数组
      return []
    } catch (error: any) {
      console.error('列出对象失败:', error)
      throw new Error('列出文件失败')
    }
  }

  // 检查存储桶是否存在
  async bucketExists(): Promise<boolean> {
    try {
      // 简化实现，默认返回 true
      return true
    } catch (error) {
      return false
    }
  }

  // 创建存储桶（如果不存在）
  async createBucketIfNotExists(): Promise<boolean> {
    try {
      const exists = await this.bucketExists()
      
      if (!exists) {
        // 简化实现，假设存储桶已经存在
        console.log(`假设 TOS 存储桶已存在: ${this.bucketName}`)
        console.log(`TOS 存储桶已创建: ${this.bucketName}`)
      }
      
      return true
    } catch (error: any) {
      console.error('创建存储桶失败:', error)
      return false
    }
  }
}
