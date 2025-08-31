import { NextRequest, NextResponse } from 'next/server'
import { WalletDatabase } from '@/app/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, userInfo, ...metadata } = body

    // 验证必需字段
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: '钱包地址不能为空' },
        { status: 400 }
      )
    }

    // 提取用户信息
    const authInfo = {
      browser: userInfo?.browser || metadata.browser,
      language: userInfo?.language || metadata.language,
      platform: userInfo?.platform || metadata.platform,
      timestamp: new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    }

    // 创建或更新用户认证信息
    const result = await WalletDatabase.upsertUser(walletAddress, {
      type: 'authentication',
      auth_info: authInfo,
      ...metadata
    })

    return NextResponse.json({
      success: true,
      message: '用户认证记录成功',
      data: {
        id: result[0]?.id,
        walletAddress,
        authTime: authInfo.timestamp,
        sessionInfo: {
          browser: authInfo.browser,
          language: authInfo.language,
          platform: authInfo.platform
        }
      }
    })

  } catch (error: any) {
    console.error('用户认证API错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '用户认证失败',
        error: error.message 
      },
      { status: 500 }
    )
  }
}