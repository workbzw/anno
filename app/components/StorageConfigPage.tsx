'use client';

import { useState, useEffect } from 'react';
import { getStorageInfo } from '../utils/audioUploadUnified';

export default function StorageConfigPage() {
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    setStorageInfo(getStorageInfo());
  }, []);

  const validateConfiguration = async () => {
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      const response = await fetch('/api/storage/validate', {
        method: 'POST'
      });
      
      const result = await response.json();
      setValidationResult(result);
    } catch (error: any) {
      setValidationResult({
        isValid: false,
        errors: [`验证请求失败: ${error.message}`],
        warnings: [],
        info: {}
      });
    } finally {
      setIsValidating(false);
    }
  };

  const testUpload = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/storage/test', {
        method: 'POST'
      });
      
      const result = await response.json();
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `测试请求失败: ${error.message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">存储配置管理</h1>
        
        {/* 当前配置信息 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">当前存储配置</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            {storageInfo ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">存储提供商:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    storageInfo.provider === 'tos' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {storageInfo.provider === 'tos' ? '火山引擎 TOS' : 'Supabase Storage'}
                  </span>
                </div>
                {storageInfo.bucketName && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">存储桶:</span>
                    <span className="text-gray-700">{storageInfo.bucketName}</span>
                  </div>
                )}
                {storageInfo.region && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">区域:</span>
                    <span className="text-gray-700">{storageInfo.region}</span>
                  </div>
                )}
                {storageInfo.endpoint && (
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">终端点:</span>
                    <span className="text-gray-700">{storageInfo.endpoint}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">加载配置信息...</div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={validateConfiguration}
            disabled={isValidating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isValidating ? '验证中...' : '验证配置'}
          </button>
          
          <button
            onClick={testUpload}
            disabled={isTesting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isTesting ? '测试中...' : '测试上传'}
          </button>
        </div>

        {/* 验证结果 */}
        {validationResult && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">配置验证结果</h3>
            <div className={`rounded-lg p-4 ${
              validationResult.isValid 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  validationResult.isValid ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className={`font-medium ${
                  validationResult.isValid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {validationResult.isValid ? '配置有效' : '配置无效'}
                </span>
              </div>
              
              {validationResult.errors.length > 0 && (
                <div className="mb-3">
                  <div className="text-red-700 font-medium mb-1">错误:</div>
                  <ul className="list-disc list-inside text-red-600 space-y-1">
                    {validationResult.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validationResult.warnings.length > 0 && (
                <div className="mb-3">
                  <div className="text-yellow-700 font-medium mb-1">警告:</div>
                  <ul className="list-disc list-inside text-yellow-600 space-y-1">
                    {validationResult.warnings.map((warning: string, index: number) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {Object.keys(validationResult.info).length > 0 && (
                <div>
                  <div className="text-gray-700 font-medium mb-1">详细信息:</div>
                  <pre className="text-sm text-gray-600 bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(validationResult.info, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 测试结果 */}
        {testResult && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">上传测试结果</h3>
            <div className={`rounded-lg p-4 ${
              testResult.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  testResult.success ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className={`font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.message}
                </span>
              </div>
              
              {testResult.details && (
                <div>
                  <div className="text-gray-700 font-medium mb-1">测试详情:</div>
                  <pre className="text-sm text-gray-600 bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 配置指南 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">火山引擎 TOS 配置指南</h3>
          <div className="text-blue-700 space-y-2">
            <p>1. 在火山引擎控制台创建 TOS 存储桶</p>
            <p>2. 获取访问密钥 (Access Key ID 和 Access Key Secret)</p>
            <p>3. 在 .env 文件中设置以下环境变量:</p>
            <div className="bg-blue-100 p-3 rounded mt-2 font-mono text-sm">
              <div>NEXT_PUBLIC_STORAGE_PROVIDER=tos</div>
              <div>TOS_REGION=cn-beijing</div>
              <div>TOS_ACCESS_KEY_ID=your_access_key_id</div>
              <div>TOS_ACCESS_KEY_SECRET=your_access_key_secret</div>
              <div>TOS_BUCKET_NAME=your_bucket_name</div>
              <div>TOS_ENDPOINT=https://tos-s3-cn-beijing.volces.com (可选)</div>
            </div>
            <p>4. 重启应用以使配置生效</p>
          </div>
        </div>
      </div>
    </div>
  );
}