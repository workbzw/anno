import { NextRequest, NextResponse } from 'next/server'
import { WalletDatabase } from '@/app/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, activities, count, ...metadata } = body

    // 验证必需字段
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: '钱包地址不能为空' },
        { status: 400 }
      )
    }

    if (!activities || !Array.isArray(activities) || activities.length === 0) {
      return NextResponse.json(
        { success: false, message: '活动数据不能为空' },
        { status: 400 }
      )
    }

    // 验证活动数量限制
    if (activities.length > 100) {
      return NextResponse.json(
        { success: false, message: '单次最多只能上传100条记录' },
        { status: 400 }
      )
    }

    // 准备批量数据
    const batchData = activities.map((activity, index) => ({
      wallet_address: walletAddress,
      activity_type: activity.type || 'unknown',
      activity_data: activity,
      sequence_number: index + 1,
      metadata: {
        type: 'batch_activities',
        batch_id: `batch_${Date.now()}_${walletAddress.slice(-6)}`,
        total_count: activities.length,
        ...metadata,
        uploaded_at: new Date().toISOString()
      }
    }))

    // 批量插入数据
    const result = await WalletDatabase.batchAddActivities(batchData)

    // 更新用户信息
    await WalletDatabase.upsertUser(walletAddress, {
      last_batch_upload: new Date().toISOString(),
      total_batch_activities: activities.length
    })

    // 统计不同类型的活动
    const activityStats = activities.reduce((stats, activity) => {
      const type = activity.type || 'unknown'
      stats[type] = (stats[type] || 0) + 1
      return stats
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      message: `成功批量上传${activities.length}条活动记录`,
      data: {
        batch_id: batchData[0]?.metadata.batch_id,
        walletAddress,
        processed_count: result.length,
        activity_breakdown: activityStats,
        upload_time: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('批量活动API错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '批量上传失败',
        error: error.message 
      },
      { status: 500 }
    )
  }
}

// 获取批量上传历史
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

    // 从数据库获取批量记录
    const { supabase } = await import('@/app/lib/supabase')
    const { data, error } = await supabase
      .from('batch_activities')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // 按批次ID分组
    const batchGroups = data.reduce((groups, record) => {
      const batchId = record.metadata?.batch_id || 'unknown'
      if (!groups[batchId]) {
        groups[batchId] = []
      }
      groups[batchId].push(record)
      return groups
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      success: true,
      message: '获取批量记录成功',
      data: {
        batch_groups: batchGroups,
        total_batches: Object.keys(batchGroups).length,
        pagination: {
          limit,
          offset,
          total: data.length
        }
      }
    })

  } catch (error: any) {
    console.error('获取批量记录错误:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: '获取批量记录失败',
        error: error.message 
      },
      { status: 500 }
    )
  }
}