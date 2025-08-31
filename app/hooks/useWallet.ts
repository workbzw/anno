'use client';

import { useState, useEffect, useCallback } from 'react';

// 钱包状态接口
interface WalletState {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

// 声明 window.ethereum 类型
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

// 检查MetaMask状态的工具函数
const checkMetaMaskState = async () => {
  if (!window.ethereum) {
    return { available: false, error: 'MetaMask未安装' };
  }
  
  try {
    // 检查是否有待处理的请求
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return { available: true, accounts };
  } catch (error: any) {
    if (error.code === -32002) {
      return { available: false, error: '有待处理的连接请求，请稍候' };
    }
    return { available: true, accounts: [] };
  }
};

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  // 添加请求锁，防止重复请求
  const [isRequestPending, setIsRequestPending] = useState(false);

  // 检查MetaMask是否安装
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }, []);

  // 连接钱包
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setWalletState(prev => ({
        ...prev,
        error: '请安装 MetaMask 钱包扩展'
      }));
      return;
    }

    // 防止重复请求
    if (isRequestPending || walletState.isConnecting) {
      console.log('钱包连接请求正在处理中，请稍候...');
      setWalletState(prev => ({
        ...prev,
        error: '连接请求正在处理中，请稍候...'
      }));
      return;
    }

    // 检查MetaMask状态
    const metaMaskState = await checkMetaMaskState();
    if (!metaMaskState.available) {
      setWalletState(prev => ({
        ...prev,
        error: metaMaskState.error || 'MetaMask不可用'
      }));
      return;
    }

    try {
      setIsRequestPending(true);
      setWalletState(prev => ({
        ...prev,
        isConnecting: true,
        error: null
      }));

      // 先检查是否已经有连接的账户
      let accounts: string[] = metaMaskState.accounts || [];

      // 如果没有连接的账户，请求连接
      if (accounts.length === 0) {
        // 等待一小段时间，确保上一次请求完全结束
        await new Promise(resolve => setTimeout(resolve, 200));
        
        accounts = await window.ethereum!.request({
          method: 'eth_requestAccounts',
        });
      }

      if (accounts.length > 0) {
        const account = accounts[0];
        setWalletState({
          account,
          isConnected: true,
          isConnecting: false,
          error: null,
        });

        // 保存到本地存储
        localStorage.setItem('walletAccount', account);
        localStorage.setItem('walletConnected', 'true');
        console.log('钱包连接成功:', account);
      }
    } catch (error: any) {
      console.error('连接钱包失败:', error);
      
      // 处理特定的MetaMask错误
      let errorMessage = error.message || '连接钱包失败';
      
      if (error.code === -32002) {
        errorMessage = '钱包正在处理连接请求，请等待当前操作完成后重试';
      } else if (error.code === 4001) {
        errorMessage = '用户拒绝了钱包连接请求';
      } else if (error.code === -32603) {
        errorMessage = 'MetaMask内部错误，请重启浏览器后重试';
      }
      
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage
      }));
    } finally {
      // 清理请求锁
      setIsRequestPending(false);
    }
  }, [isMetaMaskInstalled, isRequestPending, walletState.isConnecting]);

  // 断开钱包连接
  const disconnectWallet = useCallback(() => {
    setWalletState({
      account: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });

    // 清除本地存储
    localStorage.removeItem('walletAccount');
    localStorage.removeItem('walletConnected');
  }, []);

  // 检查账户变化
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      // 用户断开了钱包连接
      disconnectWallet();
    } else if (accounts[0] !== walletState.account) {
      // 账户切换
      const newAccount = accounts[0];
      setWalletState(prev => ({
        ...prev,
        account: newAccount,
        isConnected: true,
      }));
      localStorage.setItem('walletAccount', newAccount);
    }
  }, [walletState.account, disconnectWallet]);

  // 初始化和事件监听
  useEffect(() => {
    // 检查是否已经连接过
    if (typeof window !== 'undefined') {
      const savedAccount = localStorage.getItem('walletAccount');
      const wasConnected = localStorage.getItem('walletConnected') === 'true';
      
      if (savedAccount && wasConnected && isMetaMaskInstalled()) {
        // 验证账户是否仍然可用
        window.ethereum!.request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts.includes(savedAccount)) {
              setWalletState({
                account: savedAccount,
                isConnected: true,
                isConnecting: false,
                error: null,
              });
            } else {
              // 账户不再可用，清除存储
              localStorage.removeItem('walletAccount');
              localStorage.removeItem('walletConnected');
            }
          })
          .catch(() => {
            // 如果请求失败，清除存储
            localStorage.removeItem('walletAccount');
            localStorage.removeItem('walletConnected');
          });
      }
    }

    // 监听账户变化
    if (isMetaMaskInstalled()) {
      window.ethereum!.on('accountsChanged', handleAccountsChanged);
    }

    // 清理事件监听器
    return () => {
      if (isMetaMaskInstalled()) {
        window.ethereum!.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [isMetaMaskInstalled, handleAccountsChanged]);

  // 格式化地址显示
  const formatAddress = useCallback((address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    formatAddress,
  };
}