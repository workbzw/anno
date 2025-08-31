'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useWallet } from '../hooks/useWallet';

// 钱包上下文类型
interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isMetaMaskInstalled: boolean;
  formatAddress: (address: string) => string;
  // 新增上传钱包地址方法
  uploadWalletAddress: (endpoint: string, data?: any) => Promise<any>;
}

// 创建上下文
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// 钱包上下文提供者组件
interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const walletHook = useWallet();

  // 上传钱包地址到指定API端点
  const uploadWalletAddress = async (endpoint: string, additionalData: any = {}): Promise<any> => {
    if (!walletHook.account) {
      throw new Error('钱包未连接，无法上传地址');
    }

    try {
      const payload = {
        walletAddress: walletHook.account,
        timestamp: new Date().toISOString(),
        ...additionalData
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('钱包地址上传成功:', result);
      return result;
    } catch (error) {
      console.error('钱包地址上传失败:', error);
      throw error;
    }
  };

  const contextValue: WalletContextType = {
    ...walletHook,
    uploadWalletAddress,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

// 使用钱包上下文的Hook
export function useWalletContext(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext 必须在 WalletProvider 内部使用');
  }
  return context;
}

// 导出上下文以供其他地方使用
export { WalletContext };