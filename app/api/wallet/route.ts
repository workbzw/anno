import { NextRequest, NextResponse } from 'next/server'
import { WalletDatabase } from '@/app/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, timestamp, ...additionalData } = body

    // 验证必需字段
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: '钱包地址不能为空' },
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

    // 创建或更新用户记录
    const result = await WalletDatabase.upsertUser(walletAddress, {
      ...additionalData,
      last_access: timestamp || new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown'
    })

    return NextResponse.json({
      success: true,
      message: '钱包地址记录成功',
      data: {
        id: result[0]?.id,
        walletAddress,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('钱包API错误:', error)
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: '缺少钱包地址参数' },
        { status: 400 }
      )
    }

    // 获取用户统计数据
    const stats = await WalletDatabase.getUserStats(walletAddress)

    return NextResponse.json({
      success: true,
      message: '获取用户统计成功',
      data: stats
    })

  } catch (error: any) {
    console.error('获取用户统计错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '获取统计数据失败',
        error: error.message 
      },
      { status: 500 }
    )
  }
}