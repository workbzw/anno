import { createClient } from '@supabase/supabase-js'

// 从环境变量获取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库表类型定义
export interface WalletUser {
  id?: string
  wallet_address: string
  created_at?: string
  updated_at?: string
  user_info?: any
}

export interface RecordingContribution {
  id?: string
  wallet_address: string
  sentence_id?: string
  duration?: number
  audio_quality?: string
  language?: string
  created_at?: string
  metadata?: any
}

export interface ReviewActivity {
  id?: string
  wallet_address: string
  review_type?: 'voice' | 'text'
  items_reviewed?: number
  accuracy?: number
  created_at?: string
  metadata?: any
}

export interface UserStats {
  wallet_address: string
  total_recordings?: number
  total_reviews?: number
  total_contribution_time?: number
  accuracy_score?: number
  last_activity?: string
}

// 数据库操作函数
export class WalletDatabase {
  // 创建或更新用户
  static async upsertUser(walletAddress: string, userInfo: any = {}) {
    const { data, error } = await supabase
      .from('wallet_users')
      .upsert({
        wallet_address: walletAddress,
        user_info: userInfo,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'wallet_address'
      })
      .select()
    
    if (error) throw error
    return data
  }

  // 添加录音贡献记录
  static async addRecordingContribution(contribution: Omit<RecordingContribution, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('recording_contributions')
      .insert({
        ...contribution,
        created_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    return data
  }

  // 添加审核活动记录
  static async addReviewActivity(activity: Omit<ReviewActivity, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('review_activities')
      .insert({
        ...activity,
        created_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    return data
  }

  // 获取用户统计数据
  static async getUserStats(walletAddress: string): Promise<UserStats> {
    // 获取录音统计
    const { data: recordings, error: recordingsError } = await supabase
      .from('recording_contributions')
      .select('duration')
      .eq('wallet_address', walletAddress)
    
    if (recordingsError) throw recordingsError

    // 获取审核统计
    const { data: reviews, error: reviewsError } = await supabase
      .from('review_activities')
      .select('items_reviewed, accuracy')
      .eq('wallet_address', walletAddress)
    
    if (reviewsError) throw reviewsError

    // 获取最后活动时间
    const { data: lastActivity, error: lastActivityError } = await supabase
      .from('recording_contributions')
      .select('created_at')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (lastActivityError) throw lastActivityError

    // 计算统计数据
    const totalRecordings = recordings?.length || 0
    const totalReviews = reviews?.length || 0
    const totalContributionTime = recordings?.reduce((sum, r) => sum + (r.duration || 0), 0) || 0
    const averageAccuracy = reviews?.length > 0 
      ? reviews.reduce((sum, r) => sum + (r.accuracy || 0), 0) / reviews.length 
      : 0

    return {
      wallet_address: walletAddress,
      total_recordings: totalRecordings,
      total_reviews: totalReviews,
      total_contribution_time: totalContributionTime,
      accuracy_score: averageAccuracy,
      last_activity: lastActivity?.[0]?.created_at || null
    }
  }

  // 批量添加活动记录
  static async batchAddActivities(activities: any[]) {
    const { data, error } = await supabase
      .from('batch_activities')
      .insert(activities.map(activity => ({
        ...activity,
        created_at: new Date().toISOString()
      })))
      .select()
    
    if (error) throw error
    return data
  }
}