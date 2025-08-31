import { NextRequest, NextResponse } from 'next/server'
import { WalletDatabase } from '@/app/lib/supabase'
import { StorageFactory } from '@/app/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audioFile') as File
    const walletAddress = formData.get('walletAddress') as string
    const sentenceId = formData.get('sentenceId') as string
    const sentenceText = formData.get('sentenceText') as string
    const duration = parseFloat(formData.get('duration') as string || '0')
    const audioQuality = formData.get('audioQuality') as string || 'medium'

    // 验证必需字段
    if (!audioFile || !walletAddress || !sentenceId) {
      return NextResponse.json(
        { success: false, message: '缺少必需参数：audioFile, walletAddress, sentenceId' },
        { status: 400 }
      )
    }

    // 验证钱包地址格式
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { success: false, message: '无效的钱包地址格式' },
        { status: 400 }
      )
    }

    // 验证文件类型和大小
    const allowedTypes = ['audio/wav', 'audio/webm', 'audio/mp3', 'audio/ogg']
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { success: false, message: '不支持的音频文件格式' },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { success: false, message: '文件大小超过10MB限制' },
        { status: 400 }
      )
    }

    // 获取存储提供商（暂时注释 TOS，强制使用 Supabase）
    console.log('注意：TOS 存储功能已被注释，使用 Supabase 存储')
    // const storageProvider = await StorageFactory.getStorageProvider()
    
    // 强制使用 Supabase 存储
    const { SupabaseStorageProvider } = await import('@/app/lib/storage/supabaseStorage')
    const supabaseConfig = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      bucketName: 'audio-recordings'
    }
    const storageProvider = new SupabaseStorageProvider(supabaseConfig)
    
    // 生成文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileExtension = audioFile.name.split('.').pop() || 'wav'
    const fileName = `${walletAddress}/${sentenceId}_${timestamp}.${fileExtension}`

    console.log('开始上传音频文件:', {
      fileName,
      size: audioFile.size,
      type: audioFile.type,
      provider: process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'supabase'
    })

    // 上传文件到选定的存储服务
    const uploadResult = await storageProvider.upload(audioFile, fileName)

    if (!uploadResult.success) {
      console.error('文件上传失败:', uploadResult.error)
      return NextResponse.json(
        { success: false, message: '文件上传失败', error: uploadResult.error },
        { status: 500 }
      )
    }

    console.log('文件上传成功:', {
      key: uploadResult.key,
      url: uploadResult.url,
      size: uploadResult.size
    })

    // 在数据库中记录上传信息
    const recordingData = {
      wallet_address: walletAddress,
      sentence_id: sentenceId,
      sentence_text: sentenceText,
      duration: duration,
      audio_quality: audioQuality,
      file_path: uploadResult.key,
      file_url: uploadResult.url,
      file_size: uploadResult.size,
      file_type: audioFile.type,
      metadata: {
        type: 'audio_upload',
        original_filename: audioFile.name,
        uploaded_at: new Date().toISOString(),
        user_agent: request.headers.get('user-agent') || 'unknown',
        storage_provider: process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'supabase',
        upload_method: 'unified_api'
      }
    }

    const result = await WalletDatabase.addRecordingContribution(recordingData)

    return NextResponse.json({
      success: true,
      message: '音频文件上传成功',
      data: {
        id: result[0]?.id,
        walletAddress,
        sentenceId,
        fileName: uploadResult.key,
        fileUrl: uploadResult.url,
        fileSize: uploadResult.size,
        duration,
        uploadTime: new Date().toISOString(),
        storageProvider: process.env.NEXT_PUBLIC_STORAGE_PROVIDER || 'supabase'
      }
    })

  } catch (error: any) {
    console.error('音频上传API错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '服务器内部错误',
        error: error.message 
      },
      { status: 500 }
    )
  }
}