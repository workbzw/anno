import { NextRequest, NextResponse } from 'next/server';
import COS from 'cos-nodejs-sdk-v5';

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { objectKey, expires = 3600 } = await request.json();

    if (!objectKey) {
      return NextResponse.json(
        { error: '未提供对象键' },
        { status: 400 }
      );
    }

    // 生成预签名 URL（有效期默认 1 小时）
    const presignedUrl = cos.getObjectUrl({
      Bucket: process.env.COS_BUCKET!,
      Region: process.env.COS_REGION!,
      Key: objectKey,
      Sign: true, // 需要签名
      Expires: expires, // 有效期（秒）
    });

    return NextResponse.json({
      success: true,
      url: presignedUrl,
      expiresIn: expires,
      expiresAt: new Date(Date.now() + expires * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error('生成预签名 URL 错误:', error);
    return NextResponse.json(
      { error: error.message || '生成预签名 URL 失败' },
      { status: 500 }
    );
  }
}
