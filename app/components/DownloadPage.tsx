import GridItem from './GridItem';

// 下载页面的网格数据
const downloadGridItems = [
  { 
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
      </svg>
    ), 
    title: 'API接入', 
    description: '通过API接口获取数据和服务' 
  },
  { 
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    ), 
    title: '普通粤语语音', 
    description: '标准粤语语音数据集下载' 
  },
  { 
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C20.2 10.8 20 10.4 20 10c0-2.2-1.8-4-4-4s-4 1.8-4 4v2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h15v-3z"/>
        <circle cx="9" cy="12" r="1"/>
        <path d="M7 20.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5-.7-1.5-1.5-1.5S7 19.7 7 20.5z"/>
        <path d="M16 20.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5-.7-1.5-1.5-1.5S16 19.7 16 20.5z"/>
      </svg>
    ), 
    title: '车机粤语语音', 
    description: '车载设备专用粤语语音数据' 
  },
];

export default function DownloadPage() {
  const handleGridItemClick = (title: string) => {
    console.log(`点击了下载功能: ${title}`);
    // 这里可以添加具体的下载功能逻辑
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      {/* 页面标题 */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">数据下载</h1>
        <p className="text-lg text-gray-600">选择您需要的下载功能</p>
      </div>

      {/* 功能网格 - 统一为3列 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {downloadGridItems.map((item, index) => (
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