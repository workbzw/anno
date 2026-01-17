import { NextRequest, NextResponse } from 'next/server';
import COS from 'cos-nodejs-sdk-v5';

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { objectKeys, expires = 3600 } = await request.json();

    if (!Array.isArray(objectKeys) || objectKeys.length === 0) {
      return NextResponse.json(
        { error: '未提供对象键列表' },
        { status: 400 }
      );
    }

    // 批量生成预签名 URL
    const urls = objectKeys.map((objectKey: string) => {
      const url = cos.getObjectUrl({
        Bucket: process.env.COS_BUCKET!,
        Region: process.env.COS_REGION!,
        Key: objectKey,
        Sign: true,
        Expires: expires,
      });

      return {
        objectKey,
        url,
        expiresIn: expires,
        expiresAt: new Date(Date.now() + expires * 1000).toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      urls,
    });
  } catch (error: any) {
    console.error('批量生成预签名 URL 错误:', error);
    return NextResponse.json(
      { error: error.message || '批量生成预签名 URL 失败' },
      { status: 500 }
    );
  }
}
