'use client';

import { useState } from 'react';
import GridItem from './GridItem';
import RecordingPage from './RecordingPage';

// 录入页面的网格数据 - 去掉字词录入，只保留句子录入和随机问答
const inputGridItems = [
  { 
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    ), 
    title: '句子录入', 
    description: '录入完整句子的语音和文本内容',
    disabled: false
  },
  { 
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
      </svg>
    ), 
    title: '随机问答', 
    description: '录入问答对话的语音交互数据',
    disabled: true,
    disabledText: '暂未开放，敬请期待'
  },
];

export default function InputPage() {
  const [currentView, setCurrentView] = useState<'grid' | 'recording'>('grid');

  const handleGridItemClick = (title: string) => {
    console.log(`点击了: ${title}`);
    if (title === '句子录入') {
      setCurrentView('recording');
    }
    // 这里可以添加其他功能的逻辑
  };

  const handleBackToGrid = () => {
    setCurrentView('grid');
  };

  // 如果当前视图是录音页面，显示录音组件
  if (currentView === 'recording') {
    return <RecordingPage onBack={handleBackToGrid} />;
  }

  // 默认显示网格视图
  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      {/* 页面标题 */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">数据录入</h1>
        <p className="text-lg text-gray-600">选择您需要的录入功能</p>
      </div>

      {/* 功能网格 - 调整为2列布局 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {inputGridItems.map((item, index) => (
          <GridItem
            key={index}
            icon={item.icon}
            title={item.title}
            description={item.description}
            disabled={item.disabled}
            disabledText={item.disabledText}
            onClick={() => handleGridItemClick(item.title)}
          />
        ))}
      </div>
    </div>
  );
}