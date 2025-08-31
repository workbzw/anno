'use client';

import { useState } from 'react';
import { getStorageInfo } from '../utils/audioUploadUnified';

export default function TOSTestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  const storageInfo = getStorageInfo();
  
  const testTOSUpload = async () => {
    setIsLoading(true);
    setTestResult('正在测试 TOS 上传...');
    
    try {
      // 创建一个测试音频文件
      const testAudioContent = new Uint8Array(1024); // 1KB 的测试数据
      testAudioContent.fill(0); // 填充为静音
      
      const testFile = new File([testAudioContent], 'test-audio.wav', {
        type: 'audio/wav'
      });
      
      // 创建 FormData
      const formData = new FormData();
      formData.append('audioFile', testFile);
      formData.append('walletAddress', '0x1234567890123456789012345678901234567890');
      formData.append('sentenceId', 'test_sentence_001');
      formData.append('sentenceText', '这是一个测试句子');
      formData.append('duration', '1.0');
      formData.append('audioQuality', 'test');
      
      // 发送到统一上传 API
      const response = await fetch('/api/wallet/upload-audio-unified', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTestResult(`✅ TOS 上传测试成功！

文件 URL: ${result.data.fileUrl}
文件大小: ${result.data.fileSize} bytes
存储提供商: ${result.data.storageProvider}`);
      } else {
        setTestResult(`❌ TOS 上传测试失败: ${result.message}
错误详情: ${result.error || '未知错误'}`);
      }
      
    } catch (error: any) {
      setTestResult(`❌ 测试过程出错: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">火山引擎 TOS 存储测试</h1>
        
        {/* 当前配置显示 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">当前存储配置</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-gray-700">存储提供商:</span>
                <div className={`inline-block ml-2 px-3 py-1 rounded text-sm ${
                  storageInfo.provider === 'tos' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {storageInfo.provider === 'tos' ? '🔥 火山引擎 TOS' : '🟢 Supabase Storage'}
                </div>
              </div>
              
              {storageInfo.bucketName && (
                <div>
                  <span className="font-medium text-gray-700">存储桶:</span>
                  <span className="ml-2 text-gray-600">{storageInfo.bucketName}</span>
                </div>
              )}
              
              {storageInfo.region && (
                <div>
                  <span className="font-medium text-gray-700">区域:</span>
                  <span className="ml-2 text-gray-600">{storageInfo.region}</span>
                </div>
              )}
              
              {storageInfo.endpoint && (
                <div>
                  <span className="font-medium text-gray-700">终端点:</span>
                  <span className="ml-2 text-gray-600 text-sm">{storageInfo.endpoint}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 测试按钮 */}
        <div className="mb-6">
          <button
            onClick={testTOSUpload}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? '测试中...' : '🚀 测试音频上传'}
          </button>
        </div>
        
        {/* 测试结果 */}
        {testResult && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">测试结果</h3>
            <div className={`rounded-lg p-4 ${
              testResult.includes('✅') 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <pre className="whitespace-pre-wrap text-sm font-mono">{testResult}</pre>
            </div>
          </div>
        )}
        
        {/* 配置说明 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">配置说明</h3>
          <div className="text-blue-700 space-y-2 text-sm">
            <p>• 如果当前使用的是 Supabase，需要在 .env.local 中设置 <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_STORAGE_PROVIDER=tos</code></p>
            <p>• TOS 配置需要以下环境变量：</p>
            <div className="bg-blue-100 p-3 rounded mt-2 font-mono text-xs">
              <div>TOS_REGION=cn-beijing</div>
              <div>TOS_ACCESS_KEY_ID=your_access_key_id</div>
              <div>TOS_ACCESS_KEY_SECRET=your_access_key_secret</div>
              <div>TOS_BUCKET_NAME=your_bucket_name</div>
              <div>TOS_ENDPOINT=https://tos-s3-cn-beijing.volces.com</div>
            </div>
            <p>• 配置完成后重启应用即可使用 TOS 存储</p>
          </div>
        </div>
        
        {/* 功能特性 */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">TOS 存储优势</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>高性能存储服务</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>多区域支持</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>自动备份和恢复</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>CDN 加速访问</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>成本优化</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>无缝兼容切换</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}