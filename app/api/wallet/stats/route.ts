import { NextRequest, NextResponse } from 'next/server'
import { WalletDatabase } from '@/app/lib/supabase'

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

    // 验证钱包地址格式
    if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { success: false, message: '无效的钱包地址格式' },
        { status: 400 }
      )
    }

    // 获取用户统计数据
    const stats = await WalletDatabase.getUserStats(walletAddress)

    // 获取额外的统计信息
    const { supabase } = await import('@/app/lib/supabase')
    
    // 获取最近7天的活动
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: recentRecordings } = await supabase
      .from('recording_contributions')
      .select('created_at, duration')
      .eq('wallet_address', walletAddress)
      .gte('created_at', sevenDaysAgo.toISOString())

    const { data: recentReviews } = await supabase
      .from('review_activities')
      .select('created_at, items_reviewed')
      .eq('wallet_address', walletAddress)
      .gte('created_at', sevenDaysAgo.toISOString())

    // 计算活跃度指标
    const recentActivity = {
      recordings_this_week: recentRecordings?.length || 0,
      reviews_this_week: recentReviews?.length || 0,
      recording_time_this_week: recentRecordings?.reduce((sum, r) => sum + (r.duration || 0), 0) || 0
    }

    // 计算贡献排名（可选，如果需要）
    const { data: allUsers } = await supabase
      .from('wallet_users')
      .select('wallet_address')
      .order('created_at', { ascending: true })

    const userRank = (allUsers?.findIndex(u => u.wallet_address === walletAddress) ?? -1) + 1 || 0

    return NextResponse.json({
      success: true,
      message: '获取用户统计成功',
      data: {
        ...stats,
        recent_activity: recentActivity,
        user_rank: userRank,
        account_age_days: stats.last_activity 
          ? Math.floor((new Date().getTime() - new Date(stats.last_activity).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
        contribution_score: (stats.total_recordings || 0) * 10 + (stats.total_reviews || 0) * 5,
        retrieved_at: new Date().toISOString()
      }
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