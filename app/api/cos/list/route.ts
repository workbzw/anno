import { NextRequest, NextResponse } from 'next/server';
import COS from 'cos-nodejs-sdk-v5';

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const prefix = searchParams.get('prefix') || 'recordings/';

    if (!walletAddress) {
      return NextResponse.json(
        { error: '未提供钱包地址' },
        { status: 400 }
      );
    }

    // 构建查询前缀
    const queryPrefix = `${prefix}${walletAddress}/`;

    // 获取文件列表
    const result = await new Promise<any>((resolve, reject) => {
      cos.getBucket(
        {
          Bucket: process.env.COS_BUCKET!,
          Region: process.env.COS_REGION!,
          Prefix: queryPrefix,
          MaxKeys: 1000, // 最多返回 1000 个文件
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });

    // 格式化返回数据
    const files = (result.Contents || []).map((item: any) => ({
      objectKey: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      etag: item.ETag,
    }));

    return NextResponse.json({
      success: true,
      files,
      count: files.length,
    });
  } catch (error: any) {
    console.error('获取文件列表错误:', error);
    return NextResponse.json(
      { error: error.message || '获取文件列表失败' },
      { status: 500 }
    );
  }
}
