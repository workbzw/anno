import GridItem from './GridItem';

// 审核页面的网格数据 - 只保留语音审核和文本审核
const reviewGridItems = [
  { 
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    ), 
    title: '语音审核', 
    description: '审核语音录制质量和准确性' 
  },
  { 
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <line x1="12" y1="9" x2="8" y2="9"/>
      </svg>
    ), 
    title: '文本审核', 
    description: '审核文本内容准确性和格式' 
  },
];

export default function ReviewPage() {
  const handleGridItemClick = (title: string) => {
    console.log(`点击了审核功能: ${title}`);
    // 这里可以添加具体的审核功能逻辑
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      {/* 页面标题 */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">数据审核</h1>
        <p className="text-lg text-gray-600">选择您需要的审核功能</p>
      </div>

      {/* 功能网格 - 统一为3列 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviewGridItems.map((item, index) => (
          <GridItem
            key={index}
            icon={item.icon}
            title={item.title}
            description={item.description}
            onClick={() => handleGridItemClick(item.title)}
          />
        ))}
      </div>
    </div>
  );
}