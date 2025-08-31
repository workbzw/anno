import { NextRequest, NextResponse } from 'next/server'
import { WalletDatabase } from '@/app/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, recordingData, ...metadata } = body

    // 验证必需字段
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: '钱包地址不能为空' },
        { status: 400 }
      )
    }

    // 提取录音数据
    const contribution = {
      wallet_address: walletAddress,
      sentence_id: recordingData?.sentenceId,
      duration: recordingData?.duration,
      audio_quality: recordingData?.audioQuality || 'medium',
      language: recordingData?.language || 'yue',
      metadata: {
        type: 'recording_contribution',
        ...recordingData,
        ...metadata,
        uploaded_at: new Date().toISOString()
      }
    }

    // 添加录音贡献记录
    const result = await WalletDatabase.addRecordingContribution(contribution)

    // 同时更新用户信息（最后活动时间）
    await WalletDatabase.upsertUser(walletAddress, {
      last_recording: new Date().toISOString(),
      total_recordings_increment: 1
    })

    return NextResponse.json({
      success: true,
      message: '录音贡献记录成功',
      data: {
        id: result[0]?.id,
        walletAddress,
        contribution: {
          sentenceId: contribution.sentence_id,
          duration: contribution.duration,
          quality: contribution.audio_quality,
          language: contribution.language
        },
        timestamp: result[0]?.created_at
      }
    })

  } catch (error: any) {
    console.error('录音贡献API错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '录音贡献记录失败',
        error: error.message 
      },
      { status: 500 }
    )
  }
}

// 获取用户的录音贡献记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: '缺少钱包地址参数' },
        { status: 400 }
      )
    }

    // 从数据库获取录音记录
    const { supabase } = await import('@/app/lib/supabase')
    const { data, error } = await supabase
      .from('recording_contributions')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: '获取录音记录成功',
      data: {
        records: data,
        pagination: {
          limit,
          offset,
          total: data.length
        }
      }
    })

  } catch (error: any) {
    console.error('获取录音记录错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '获取录音记录失败',
        error: error.message 
      },
      { status: 500 }
    )
  }
}