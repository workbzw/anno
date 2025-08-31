import { NextRequest, NextResponse } from 'next/server'
import { TOSConfigValidator } from '@/app/lib/tosConfig'

export async function POST(request: NextRequest) {
  try {
    const result = await TOSConfigValidator.validateConfiguration()
    
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({
      isValid: false,
      errors: [`验证过程出错: ${error.message}`],
      warnings: [],
      info: {}
    }, { status: 500 })
  }
}