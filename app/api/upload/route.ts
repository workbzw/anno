import { NextRequest, NextResponse } from 'next/server';
import COS from 'cos-nodejs-sdk-v5';

// 初始化 COS 实例（使用永久密钥）
const cos = new COS({
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // 1. 获取表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const walletAddress = formData.get('walletAddress') as string;
    const sentenceText = formData.get('sentenceText') as string;
    const sentenceId = formData.get('sentenceId') as string;

    // 2. 验证钱包地址
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: '无效的钱包地址' },
        { status: 400 }
      );
    }

    // 3. 验证文件
    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      );
    }

    // 4. 验证文件类型
    if (file.type !== 'audio/wav' && !file.name.endsWith('.wav')) {
      return NextResponse.json(
        { error: '只支持 WAV 格式文件' },
        { status: 400 }
      );
    }

    // 5. 验证文件大小（最大 5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超过 5MB' },
        { status: 400 }
      );
    }

    // 6. 读取文件内容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 7. 生成对象键（文件路径）
    const timestamp = Date.now();
    // 清理文件名，移除中文和特殊字符，确保兼容性
    let safeFilename = file.name || `recording_${timestamp}.wav`;
    // 如果文件名包含非ASCII字符，使用安全的默认名称
    if (!/^[\x00-\x7F]+$/.test(safeFilename)) {
      safeFilename = `recording_${timestamp}.wav`;
    }
    // 移除路径分隔符等不安全字符
    safeFilename = safeFilename.replace(/[\/\\?%*:|"<>]/g, '_');
    const objectKey = `recordings/${walletAddress}/${timestamp}_${safeFilename}`;

    // 8. 上传到 COS（私有存储桶）
    // 注意：HTTP 请求头不能包含中文字符，所以不将包含中文的 sentenceText 放入元数据
    // 句子文本信息可以通过 objectKey 或其他方式获取，或存储在数据库中
    const result = await new Promise<any>((resolve, reject) => {
      cos.putObject(
        {
          Bucket: process.env.COS_BUCKET!,
          Region: process.env.COS_REGION!,
          Key: objectKey,
          Body: buffer,
          ContentType: 'audio/wav',
          // 设置 ACL 为私有（可选，因为存储桶已经是私有）
          ACL: 'private',
          // 只添加不包含中文的元数据
          'x-cos-meta-wallet-address': walletAddress,
          'x-cos-meta-sentence-id': sentenceId || '',
          'x-cos-meta-upload-time': new Date().toISOString(),
          // sentenceText 包含中文，不放入请求头，已在返回的 JSON 中包含
        },
        (err, data) => {
          if (err) {
            console.error('COS 上传失败:', err);
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    });

    // 9. 返回对象键（不返回直接 URL，因为需要预签名）
    return NextResponse.json({
      success: true,
      objectKey, // 文件路径
      walletAddress,
      sentenceText,
      sentenceId,
      size: file.size,
      uploadTime: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('上传错误:', error);
    return NextResponse.json(
      { error: error.message || '上传失败' },
      { status: 500 }
    );
  }
}
