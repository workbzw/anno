import { NextRequest, NextResponse } from 'next/server'
import { WalletDatabase } from '@/app/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, reviewData, ...metadata } = body

    // 验证必需字段
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: '钱包地址不能为空' },
        { status: 400 }
      )
    }

    // 提取审核数据
    const activity = {
      wallet_address: walletAddress,
      review_type: reviewData?.reviewType || 'voice',
      items_reviewed: reviewData?.itemsReviewed || 1,
      accuracy: reviewData?.accuracy || 0,
      metadata: {
        type: 'review_activity',
        ...reviewData,
        ...metadata,
        uploaded_at: new Date().toISOString()
      }
    }

    // 添加审核活动记录
    const result = await WalletDatabase.addReviewActivity(activity)

    // 同时更新用户信息（最后活动时间）
    await WalletDatabase.upsertUser(walletAddress, {
      last_review: new Date().toISOString(),
      total_reviews_increment: activity.items_reviewed
    })

    return NextResponse.json({
      success: true,
      message: '审核活动记录成功',
      data: {
        id: result[0]?.id,
        walletAddress,
        activity: {
          reviewType: activity.review_type,
          itemsReviewed: activity.items_reviewed,
          accuracy: activity.accuracy
        },
        timestamp: result[0]?.created_at
      }
    })

  } catch (error: any) {
    console.error('审核活动API错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '审核活动记录失败',
        error: error.message 
      },
      { status: 500 }
    )
  }
}

// 获取用户的审核活动记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')
    const reviewType = searchParams.get('reviewType')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: '缺少钱包地址参数' },
        { status: 400 }
      )
    }

    // 从数据库获取审核记录
    const { supabase } = await import('@/app/lib/supabase')
    let query = supabase
      .from('review_activities')
      .select('*')
      .eq('wallet_address', walletAddress)

    if (reviewType) {
      query = query.eq('review_type', reviewType)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: '获取审核记录成功',
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
    console.error('获取审核记录错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '获取审核记录失败',
        error: error.message 
      },
      { status: 500 }
    )
  }
}