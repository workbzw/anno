'use client';

import { useState } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { 
  uploadWalletAddress, 
  uploadUserAuth, 
  uploadRecordingContribution,
  uploadReviewActivity,
  fetchUserStats,
  walletApi
} from '../utils/walletApi';

export default function WalletApiDemo() {
  const { account, isConnected } = useWalletContext();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [apiEndpoint, setApiEndpoint] = useState('/api/wallet');
  const [useLocalApi, setUseLocalApi] = useState(true);

  // 基础上传示例
  const handleBasicUpload = async () => {
    if (!account) {
      setResult('请先连接钱包');
      return;
    }

    setLoading(true);
    try {
      const response = useLocalApi 
        ? await walletApi.upload(account, {
            action: 'basic_upload',
            pageVisit: window.location.pathname,
          })
        : await uploadWalletAddress(apiEndpoint, account, {
            action: 'basic_upload',
            pageVisit: window.location.pathname,
          });
      
      setResult(`上传结果: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`上传失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 上传用户认证信息
  const handleAuthUpload = async () => {
    if (!account) {
      setResult('请先连接钱包');
      return;
    }

    setLoading(true);
    try {
      const response = useLocalApi
        ? await walletApi.auth(account, {
            browser: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
          })
        : await uploadUserAuth(apiEndpoint + '/auth', account, {
            browser: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
          });
      
      setResult(`认证上传结果: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`认证上传失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 上传录音贡献
  const handleRecordingUpload = async () => {
    if (!account) {
      setResult('请先连接钱包');
      return;
    }

    setLoading(true);
    try {
      const response = useLocalApi
        ? await walletApi.recording(account, {
            sentenceId: 'sentence_123',
            duration: 5.2,
            audioQuality: 'high',
            language: 'yue',
          })
        : await uploadRecordingContribution(apiEndpoint + '/recording', account, {
            sentenceId: 'sentence_123',
            duration: 5.2,
            audioQuality: 'high',
            language: 'yue',
          });
      
      setResult(`录音贡献上传结果: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`录音贡献上传失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 上传审核活动
  const handleReviewUpload = async () => {
    if (!account) {
      setResult('请先连接钱包');
      return;
    }

    setLoading(true);
    try {
      const response = useLocalApi
        ? await walletApi.review(account, {
            reviewType: 'voice',
            itemsReviewed: 10,
            accuracy: 0.95,
          })
        : await uploadReviewActivity(apiEndpoint + '/review', account, {
            reviewType: 'voice',
            itemsReviewed: 10,
            accuracy: 0.95,
          });
      
      setResult(`审核活动上传结果: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`审核活动上传失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 获取用户统计
  const handleFetchStats = async () => {
    if (!account) {
      setResult('请先连接钱包');
      return;
    }

    setLoading(true);
    try {
      const response = useLocalApi
        ? await walletApi.stats(account)
        : await fetchUserStats(apiEndpoint + '/stats', account);
      setResult(`用户统计: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`获取统计失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">钱包API演示</h3>
        <p className="text-yellow-700">请先连接您的钱包以使用API功能</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">钱包API演示</h3>
      
      {/* 当前钱包地址显示 */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <div className="text-sm text-gray-600">当前钱包地址:</div>
        <div className="font-mono text-sm text-gray-900 break-all">{account}</div>
      </div>

      {/* API配置 */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="useLocalApi"
            checked={useLocalApi}
            onChange={(e) => setUseLocalApi(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="useLocalApi" className="text-sm font-medium text-gray-700">
            使用本地 Supabase API
          </label>
        </div>
        
        {!useLocalApi && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              外部API端点:
            </label>
            <input
              type="text"
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://your-api.example.com/wallet"
            />
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <button
          onClick={handleBasicUpload}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          基础上传
        </button>
        
        <button
          onClick={handleAuthUpload}
          disabled={loading}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          用户认证
        </button>
        
        <button
          onClick={handleRecordingUpload}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          录音贡献
        </button>
        
        <button
          onClick={handleReviewUpload}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          审核活动
        </button>
        
        <button
          onClick={handleFetchStats}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          获取统计
        </button>
      </div>

      {/* 加载指示器 */}
      {loading && (
        <div className="mb-4 flex items-center space-x-2 text-blue-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>处理中...</span>
        </div>
      )}

      {/* 结果显示 */}
      {result && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            执行结果:
          </label>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-60 whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">使用说明:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 选中"使用本地 Supabase API"则使用 Next.js 后端 + Supabase 数据库</li>
          <li>• 取消选中则可以测试外部API端点</li>
          <li>• 所有请求都会自动包含当前钱包地址</li>
          <li>• 查看下方结果区域了解请求详情</li>
          <li>• 本地API支持实时数据存储和查询</li>
        </ul>
      </div>
    </div>
  );
}