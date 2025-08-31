import { NextRequest, NextResponse } from 'next/server'
import { TOSConfigValidator } from '@/app/lib/tosConfig'

export async function POST(request: NextRequest) {
  try {
    const result = await TOSConfigValidator.testUpload()
    
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: `测试过程出错: ${error.message}`
    }, { status: 500 })
  }
}