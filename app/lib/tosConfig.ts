import { TOSStorageProvider } from '@/app/lib/storage/tosStorage'
import { getStorageInfo } from '@/app/utils/audioUploadUnified'

export class TOSConfigValidator {
  static async validateConfiguration(): Promise<{
    isValid: boolean
    errors: string[]
    warnings: string[]
    info: any
  }> {
    const errors: string[] = []
    const warnings: string[] = []
    const info: any = {}

    try {
      // 检查环境变量
      const requiredEnvVars = [
        'TOS_REGION',
        'TOS_ACCESS_KEY_ID', 
        'TOS_ACCESS_KEY_SECRET',
        'TOS_BUCKET_NAME'
      ]

      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          errors.push(`缺少环境变量: ${envVar}`)
        }
      }

      if (errors.length > 0) {
        return { isValid: false, errors, warnings, info }
      }

      // 创建 TOS 客户端实例
      const tosProvider = new TOSStorageProvider({
        region: process.env.TOS_REGION!,
        accessKeyId: process.env.TOS_ACCESS_KEY_ID!,
        accessKeySecret: process.env.TOS_ACCESS_KEY_SECRET!,
        bucketName: process.env.TOS_BUCKET_NAME!,
        endpoint: process.env.TOS_ENDPOINT
      })

      info.storageConfig = getStorageInfo()

      // 检查存储桶是否存在
      const bucketExists = await tosProvider.bucketExists()
      info.bucketExists = bucketExists

      if (!bucketExists) {
        warnings.push(`存储桶 "${process.env.TOS_BUCKET_NAME}" 不存在，将尝试自动创建`)
        
        // 尝试创建存储桶
        const created = await tosProvider.createBucketIfNotExists()
        info.bucketCreated = created
        
        if (!created) {
          errors.push(`无法创建存储桶 "${process.env.TOS_BUCKET_NAME}"`)
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        info
      }

    } catch (error: any) {
      errors.push(`TOS 配置验证失败: ${error.message}`)
      return { isValid: false, errors, warnings, info }
    }
  }

  static async testUpload(): Promise<{
    success: boolean
    message: string
    details?: any
  }> {
    try {
      // 创建测试文件
      const testContent = new TextEncoder().encode(`TOS 测试文件 - ${new Date().toISOString()}`)
      const testFile = new File([testContent], 'test-file.txt', { type: 'text/plain' })
      
      const tosProvider = new TOSStorageProvider({
        region: process.env.TOS_REGION!,
        accessKeyId: process.env.TOS_ACCESS_KEY_ID!,
        accessKeySecret: process.env.TOS_ACCESS_KEY_SECRET!,
        bucketName: process.env.TOS_BUCKET_NAME!,
        endpoint: process.env.TOS_ENDPOINT
      })

      const testKey = `test/${Date.now()}-test-file.txt`
      
      // 上传测试
      const uploadResult = await tosProvider.upload(testFile, testKey)
      
      if (!uploadResult.success) {
        return {
          success: false,
          message: `上传测试失败: ${uploadResult.error}`
        }
      }

      // 获取元数据测试
      const metadata = await tosProvider.getObjectMetadata(testKey)
      
      // 清理测试文件
      await tosProvider.delete(testKey)

      return {
        success: true,
        message: 'TOS 存储测试成功',
        details: {
          uploadKey: testKey,
          uploadUrl: uploadResult.url,
          fileSize: uploadResult.size,
          metadata
        }
      }

    } catch (error: any) {
      return {
        success: false,
        message: `TOS 测试失败: ${error.message}`
      }
    }
  }

  static getConfigurationGuide(): string[] {
    return [
      '1. 在火山引擎控制台创建 TOS 存储桶',
      '2. 获取访问密钥 (Access Key ID 和 Access Key Secret)',
      '3. 设置以下环境变量:',
      '   - TOS_REGION=cn-beijing (或其他区域)',
      '   - TOS_ACCESS_KEY_ID=your_access_key_id',
      '   - TOS_ACCESS_KEY_SECRET=your_access_key_secret',
      '   - TOS_BUCKET_NAME=your_bucket_name',
      '   - TOS_ENDPOINT=https://tos-s3-cn-beijing.volces.com (可选)',
      '4. 设置 NEXT_PUBLIC_STORAGE_PROVIDER=tos',
      '5. 确保存储桶有适当的访问权限设置'
    ]
  }
}