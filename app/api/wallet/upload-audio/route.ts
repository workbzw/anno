import { NextRequest, NextResponse } from 'next/server'
import { WalletDatabase } from '@/app/lib/supabase'

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

    // 创建 Supabase 客户端
    const { supabase } = await import('@/app/lib/supabase')
    
    // 生成文件名
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileExtension = audioFile.name.split('.').pop() || 'wav'
    const fileName = `${walletAddress}/${sentenceId}_${timestamp}.${fileExtension}`

    // 将文件转换为 ArrayBuffer
    const arrayBuffer = await audioFile.arrayBuffer()

    // 上传文件到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-recordings')
      .upload(fileName, arrayBuffer, {
        contentType: audioFile.type,
        duplex: 'half'
      })

    if (uploadError) {
      console.error('文件上传错误:', uploadError)
      return NextResponse.json(
        { success: false, message: '文件上传失败', error: uploadError.message },
        { status: 500 }
      )
    }

    // 获取文件的公开URL
    const { data: urlData } = supabase.storage
      .from('audio-recordings')
      .getPublicUrl(fileName)

    // 在数据库中记录上传信息
    const recordingData = {
      wallet_address: walletAddress,
      sentence_id: sentenceId,
      sentence_text: sentenceText,
      duration: duration,
      audio_quality: audioQuality,
      file_path: fileName,
      file_url: urlData.publicUrl,
      file_size: audioFile.size,
      file_type: audioFile.type,
      metadata: {
        type: 'audio_upload',
        original_filename: audioFile.name,
        uploaded_at: new Date().toISOString(),
        user_agent: request.headers.get('user-agent') || 'unknown'
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
        fileName,
        fileUrl: urlData.publicUrl,
        fileSize: audioFile.size,
        duration,
        uploadTime: new Date().toISOString()
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