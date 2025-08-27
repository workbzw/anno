export default function AboutPage() {
  const teamMembers = [
    { 
      name: '张三', 
      role: '项目负责人', 
      avatar: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ), 
      description: '负责项目整体规划和管理' 
    },
    { 
      name: '李四', 
      role: '技术总监', 
      avatar: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polyline points="16,18 22,12 16,6"/>
          <polyline points="8,6 2,12 8,18"/>
        </svg>
      ), 
      description: '负责技术架构和开发' 
    },
    { 
      name: '王五', 
      role: '数据科学家', 
      avatar: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      ), 
      description: '负责数据分析和算法优化' 
    },
    { 
      name: '赵六', 
      role: 'UI/UX设计师', 
      avatar: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 19l7-7 3 3-7 7-3-3z"/>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
          <path d="M2 2l7.586 7.586"/>
          <circle cx="11" cy="11" r="2"/>
        </svg>
      ), 
      description: '负责用户界面和体验设计' 
    },
  ];

  const features = [
    { 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
        </svg>
      ), 
      title: '高质量数据', 
      description: '严格的质量控制确保数据准确性' 
    },
    { 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
        </svg>
      ), 
      title: '高效处理', 
      description: '先进的技术栈保证处理效率' 
    },
    { 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <circle cx="12" cy="16" r="1"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ), 
      title: '数据安全', 
      description: '完善的安全机制保护用户数据' 
    },
    { 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      ), 
      title: '开放共享', 
      description: '促进语音技术的开放发展' 
    },
  ];

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 标题区域 */}
      <div className="mb-12 text-center">
        <div className="w-16 h-1 bg-orange-500 mb-6 mx-auto"></div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">关于我们</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          YueLabs 专注于构建高质量的粤语语音数据集，传承粤语文化，推动粤语语音识别和合成技术的的创新
        </p>
      </div>

      {/* 公司介绍 */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">我们的使命</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <p className="text-gray-700 leading-relaxed mb-4">
              YueLabs 成立于2023年，是一家专注于粤语语音技术和数据服务的创新公司。我们的目标是通过构建高质量的粤语语音数据集，
              为粤语人工智能和语音技术的发展提供坚实的数据基础，让粤语在数字时代焕发新的活力。
            </p>
            <p className="text-gray-700 leading-relaxed">
              我们相信，优质的粤语数据是推动粤语AI技术进步的关键。通过Yue Voice平台，我们汇聚了来自粤港澳大湾区及全球的粤语使用者，
              共同构建多样化、高质量的粤语语音数据集，传承和发扬粤语文化。
            </p>
          </div>
          <div className="flex items-center justify-center">
            <svg className="w-24 h-24 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </div>
        </div>
      </div>

      {/* 核心特性 - 统一为3列 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">核心特性</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center border border-gray-100">
              <div className="text-orange-500 mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 团队介绍 - 统一为3列 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">团队成员</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center border border-gray-100">
              <div className="text-orange-500 mb-4 flex justify-center">{member.avatar}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
              <div className="text-sm text-orange-600 font-medium mb-2">{member.role}</div>
              <p className="text-sm text-gray-600">{member.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 联系信息 - 统一为3列 */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">联系我们</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-orange-500 mb-2 flex justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div className="font-medium text-gray-900">邮箱</div>
            <div className="text-gray-600">contact@yuelabs.com</div>
          </div>
          <div>
            <div className="text-orange-500 mb-2 flex justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div className="font-medium text-gray-900">网站</div>
            <div className="text-gray-600">www.yuelabs.com</div>
          </div>
          <div>
            <div className="text-orange-500 mb-2 flex justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div className="font-medium text-gray-900">微信</div>
            <div className="text-gray-600">YueLabs_Official</div>
          </div>
        </div>
      </div>
    </div>
  );
}