'use client';

import { useState, useRef, useEffect } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { Wallet } from 'lucide-react';

export default function WalletButton() {
  const {
    account,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    isMetaMaskInstalled,
    formatAddress,
  } = useWalletContext();

  const [showDropdown, setShowDropdown] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 防止 Hydration 错误
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 点击外部区域关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // 复制地址到剪贴板
  const copyAddress = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account);
        // 这里可以添加复制成功的提示
        console.log('地址已复制到剪贴板');
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  };

  // 如果未连接，显示连接按钮
  if (!isMounted) {
    // 防止 Hydration 错误，在客户端挂载前显示占位符
    return (
      <div className="px-4 py-2 rounded-lg bg-gray-200 animate-pulse">
        <div className="h-4 w-20 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={connectWallet}
          disabled={isConnecting || !isMetaMaskInstalled}
          className={`
            transition-all duration-200 backdrop-blur-sm font-medium rounded-lg
            /* 移动端优化：更紧凑的尺寸 */
            px-2 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm
            ${isConnecting
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : isMetaMaskInstalled
              ? 'text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isConnecting ? (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="hidden sm:inline">连接中...</span>
              <span className="sm:hidden">连接</span>
            </div>
          ) : !isMetaMaskInstalled ? (
            <span className="hidden sm:inline">安装 MetaMask</span>
          ) : (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Wallet className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">连接钱包</span>
              <span className="sm:hidden">钱包</span>
            </div>
          )}
        </button>

        {/* 错误提示 - 移动端优化 */}
        {error && (
          <div className="absolute top-full right-0 mt-2 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm whitespace-normal z-50 max-w-xs sm:max-w-sm">
            <div className="font-medium mb-1">连接失败</div>
            <div className="text-xs leading-relaxed">
              {error}
            </div>
            {error.includes('正在处理') && (
              <div className="text-xs mt-2 text-red-600">
                💡 提示：请关闭MetaMask弹窗后重新尝试
              </div>
            )}
          </div>
        )}

        {/* 安装MetaMask提示 - 移动端优化 */}
        {!isMetaMaskInstalled && (
          <div className="absolute top-full right-0 mt-2 p-2 sm:p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-yellow-800 text-xs sm:text-sm z-50 max-w-xs sm:max-w-sm">
            <div className="font-medium mb-1">需要安装 MetaMask</div>
            <div className="text-xs">
              请访问{' '}
              <a
                href="https://metamask.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                metamask.io
              </a>
              {' '}安装钱包扩展
            </div>
          </div>
        )}
      </div>
    );
  }

  // 如果已连接，显示账户信息和下拉菜单
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
        /* 移动端优化：更紧凑的尺寸和间距 */
        space-x-1 px-2 py-1.5 text-xs sm:space-x-3 sm:px-4 sm:py-2 sm:text-sm"
      >
        <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-300 rounded-full"></div>
        </div>
        {/* 移动端显示更短的地址 */}
        <span className="font-medium hidden sm:inline">{account ? formatAddress(account) : ''}</span>
        <span className="font-medium sm:hidden">{account ? `${account.slice(0, 4)}...${account.slice(-2)}` : ''}</span>
        <svg
          className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 - 移动端优化 */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50
        /* 移动端优化：更窄的菜单 */
        w-56 sm:w-64">
          {/* 账户信息 */}
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
            <div className="text-xs sm:text-sm text-gray-500 mb-1">已连接账户</div>
            <div className="font-mono text-xs sm:text-sm text-gray-900 break-all">{account}</div>
          </div>

          {/* 菜单项 */}
          <div className="py-1">
            <button
              onClick={copyAddress}
              className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 sm:space-x-3"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>复制地址</span>
            </button>

            <a
              href={`https://etherscan.io/address/${account}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 sm:space-x-3"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>在 Etherscan 查看</span>
            </a>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={() => {
                disconnectWallet();
                setShowDropdown(false);
              }}
              className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 sm:space-x-3"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>断开连接</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}