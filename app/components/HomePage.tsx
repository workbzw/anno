'use client';

import { useState } from 'react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('voice');
  const [activeSection, setActiveSection] = useState('different-pronunciation');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - 100;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const voiceNavigationItems = [
    { id: 'different-pronunciation', label: '不同发音' },
    { id: 'offensive-content', label: '冒犯性内容' },
    { id: 'misreading', label: '误读' },
    { id: 'background-noise', label: '背景噪音' },
    { id: 'background-voices', label: '背景人声' },
    { id: 'volume', label: '音量' },
    { id: 'reader-factors', label: '朗读者因素' },
    { id: 'still-confused', label: '仍有不解之处？' }
  ];

  const sentenceNavigationItems = [
    { id: 'public-domain', label: '公有领域' },
    { id: 'citation', label: '引用语句' },
    { id: 'academic-reference', label: '学术参考文献' },
    { id: 'copyright-notice', label: '版权提醒' },
    { id: 'add-citation', label: '添加语句' },
    { id: 'length', label: '长度' },
    { id: 'symbols-numbers', label: '用字与数字符号' },
    { id: 'numbers', label: '数字' },
    { id: 'abbreviations', label: '缩写与缩略语' },
    { id: 'special-characters', label: '特殊字符与外文文字' },
    { id: 'punctuation', label: '标点符号' },
    { id: 'report-issues', label: '举报性内容' }
  ];

  const reviewNavigationItems = [
    { id: 'review-overview', label: '审核概述' },
    { id: 'audio-quality', label: '音频质量检查' },
    { id: 'text-accuracy', label: '文本准确性' },
    { id: 'pronunciation-review', label: '发音评估' },
    { id: 'content-appropriateness', label: '内容适宜性' },
    { id: 'technical-standards', label: '技术标准' },
    { id: 'review-decisions', label: '审核决策' },
    { id: 'feedback-guidelines', label: '反馈指导' }
  ];

  const getCurrentNavigationItems = () => {
    if (activeTab === 'voice') return voiceNavigationItems;
    if (activeTab === 'sentence') return sentenceNavigationItems;
    return reviewNavigationItems;
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    let firstItem = 'different-pronunciation';
    if (tab === 'sentence') firstItem = 'public-domain';
    if (tab === 'review') firstItem = 'review-overview';
    setActiveSection(firstItem);
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="w-16 h-1 bg-purple-500 mb-6"></div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">贡献准则</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          了解如何向 Yue Voice 数据集贡献及验证语句和录音片段
        </p>
      </div>

      <div className="mb-8">
        <div className="flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => handleTabChange('voice')}
            className={`pb-4 font-medium ${
              activeTab === 'voice'
                ? 'text-gray-900 border-b-2 border-purple-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            提交语音
          </button>
          <button 
            onClick={() => handleTabChange('sentence')}
            className={`pb-4 font-medium ${
              activeTab === 'sentence' 
                ? 'text-gray-900 border-b-2 border-purple-500' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            审核语音
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
            <nav className="space-y-2">
              {getCurrentNavigationItems().map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${activeSection === item.id
                      ? 'text-gray-900 bg-gray-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    } ${item.id === 'still-confused' || item.id === 'report-issues' || item.id === 'feedback-guidelines' ? 'italic' : ''}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {activeTab === 'voice' ? (
              <>
                {/* 收集语音的内容保持不变 */}
                <div id="different-pronunciation">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">不同发音</h2>

                  <div className="space-y-6 text-gray-700 leading-relaxed">
                    <p>
                      我们所寻求的不是同质化！在以粤语录音为营销课，将重音较在语调方面或语音显著不同的贡献者参与进来，
                      请谨慎行事。世界各地有各种各样发音，其中一些可能在您的地区并不常见，请为此类可能与您习惯的人，
                      下次录音的问题。
                    </p>

                    <p>
                      另一方面，如果您认为朗读者的朗读从未通过这个问题，只要在朗读时明了一个错误的发音，那么情况就错误。如果
                      您不确定，请点击"跳过"。
                    </p>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">示例</h3>
                    </div>
                  </div>


                  <div className="mt-8 space-y-4">

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                          <div className="text-gray-900 font-medium">路线还不清楚。</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">路线还不清楚。</span>
                          <span className="text-xs text-gray-500">[评语人对粤语发音"gm"]</span>
                        </div>
                      </div>
                    </div>


                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                          <div className="text-gray-900 font-medium">路线还不清楚。</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">路线还不清楚。</span>
                          <span className="text-xs text-gray-500">[评语人对粤语发音"ov"]</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="offensive-content" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">冒犯性内容</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      请勿含有过于社区进行审核，不过出现过无法确保的方式一失。如果您看到明显的到令您感到不快的内容（例如完整提及反
                      了解的时间区域与情况），请务必使用举报中的"举报"按钮举报来，您也可以通过 <a href="mailto:commonvoice@mozilla.com" className="text-blue-600 hover:text-blue-800">commonvoice@mozilla.com</a> 来
                      联系我们。
                    </p>
                  </div>
                </div>

                <div id="misreading" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">误读</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      完整朗读文字内容十分重要。在听听录音片段时，请注意录音内容是否与文字内容完全一致。如有漏字、漏字、间
                      将其跳过。
                    </p>
                    <p className="font-medium">常见的错误有：</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>录音开头有"嗯""啊"等附加音。</li>
                      <li>错读了某些词语，例如"美女"误读成"美上"。</li>
                      <li>错读了某些字，例如将"读音"读成"读音"或"读音注意事项"，反之亦然。</li>
                      <li>由于过长的停顿来录音没有音频人员在一个句。</li>
                      <li>朗读个人朗读时多次停顿。</li>
                    </ul>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">示例</h3>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                          <div className="text-gray-900 font-medium">我们要出去买咖啡。</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">我们要出去买咖啡。</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                          <div className="text-gray-900 font-medium">我们要出去买咖啡。</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">嗯，我们要出去买咖啡。</span>
                          <span className="text-xs text-gray-500">(录音开头有"嗯")</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                          <div className="text-gray-900 font-medium">我们要出去买咖啡。</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">我们要出去买茶。</span>
                          <span className="text-xs text-gray-500">(错读了"咖啡"为"茶")</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="background-noise" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">背景噪音</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      一定程度的噪音是可以接受的，但如果您听到朗读者中还有其他人在说话，则应该拒绝该音频。这种情况应该在另
                      边开着电视，或附近有其他人在交谈时发生。
                    </p>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">示例</h3>
                    </div>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                          <div className="text-gray-900 font-medium">三叠纪的巨型恐龙。</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">三叠纪的巨型恐龙。</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                          <div className="text-gray-900 font-medium">三叠纪的巨型恐龙。</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">三叠纪的巨型恐龙。[音乐声]</span>
                          <span className="text-xs text-gray-500">(背景有音乐)</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                          <div className="text-gray-900 font-medium">三叠纪的巨型恐龙。</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">三叠纪的巨型恐龙。[车声]</span>
                          <span className="text-xs text-gray-500">(背景有车辆噪音)</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                          <div className="text-gray-900 font-medium">三叠纪的巨型恐龙。</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">三叠纪的巨型恐龙。[电视声]</span>
                          <span className="text-xs text-gray-500">(背景有电视声音)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="background-voices" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">背景人声</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      一定程度的噪音是可以接受的，但如果您听到朗读者中还有其他人在说话，则应该拒绝该音频。这种情况应该在另
                      边开着电视，或附近有其他人在交谈时发生。
                    </p>

                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">示例</h3>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button className="w-10 h-10 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </button>
                          <div className="text-gray-900 font-medium">三叠纪的巨型恐龙。</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">三叠纪的巨型恐龙。[朗读者自己的声音]</span>
                          <span className="text-xs text-gray-500">(你过了吗？1分钟人在说话)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="volume" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">音量</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      朗读者之间的音量大小会有自然差异。只当音量大或小到手录音中断，或（更常见的情况）音量大小以至于不参考
                      书面文字您无法听清不当正在说的内容时，才跳过。
                    </p>
                  </div>
                </div>

                {/* 朗读者因素部分 */}
                <div id="reader-factors" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">朗读者因素</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      大多数录音都是人们自由朗读的语音，但您可以偶尔接受非常缓慢，即大幅大叫、低声或语调明显用明显"机械朗
                      读"的音频语音。请跳过明显机械的音频朗读或明显使用计算机成的声音。
                    </p>
                  </div>
                </div>
                <div id="still-confused" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">仍有不解之处？</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      如果遇到了这些准则没有涵盖的内容，请根据您认为的朗读质量来决定。如果您的无法决定，请使用跳过按钮，继
                      续到下一段录音。
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div id="public-domain">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">公有领域</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      请注意，由于 Common Voice 数据集采用 CC0 许可协议，因此提交的有关文本内容必须位于公有领域（按 CC0
                      许可协议授权），有任何版权限制的文本内容都不能上传，工作时请注意此限制。
                    </p>
                    <p>
                      用于和谐语音识别的训练语料库应当包含各种类型的句子，以下是一些建议的句子的方法：
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>自行撰写较短的句子（低于 15 字），或与朋友及其清洁工式样语句等。</li>
                      <li>与学者、翻译等人士协作，制作的口语化表达自己的一些句子作品或语料库等等</li>
                      <li>与政府门、慈善机构、媒体机构等合作，制作的口语化表达自己的公开内容，新闻报道等的音频
                        数公有领域</li>
                    </ul>
                  </div>
                </div>
                <div id="citation" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">引用语句</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>在上传语句时请注明出处，以方便我们确认其具有合适的授权许可协议</p>
                  </div>
                </div>
                <div id="academic-reference" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">学术参考文献</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      可以使用学术参考文献格式，例如如何标准格式：Mozilla (2021) Common Voice. Available at
                      https://commonvoice.mozilla.org/ (Accessed: 15th September 2021)
                    </p>
                  </div>
                </div>
                <div id="copyright-notice" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">版权提醒</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      对于没有明确标示为公有领域的文本，可以使用学术参考文献格式，例如如何标准格式：Jess (2021) My Public licence
                      poems
                    </p>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">示例</div>
                      <div className="text-lg font-medium text-gray-900">请确认</div>
                      <div className="text-sm text-gray-500 mt-2">如果您用自己写的句子，请确认这个句子。</div>
                    </div>
                  </div>
                </div>
                <div id="add-citation" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">添加语句</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>请写的句子 15 字。</p>
                  </div>
                </div>
                <div id="length" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">长度</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>请写的句子用于朗读。</p>
                  </div>
                </div>
                <div id="symbols-numbers" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">用字与数字符号</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      理想的文本应该只包含字母数字，以人类能够轻松朗读为准。如果您看到明显的令您感到不快的内容，但您也能够轻松朗读
                      请写的句子用于朗读（例如"240"可以读成"二百四十"），但您也能够轻松朗读。
                    </p>
                  </div>
                </div>
                <div id="numbers" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">数字</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      原始文本中的数字不应该包含数字，因为数字的朗读方式不同于文字朗读的方式。这意味着手册中包含的数字，可能会会
                      影响朗读准确性，例如，"240"可以读成"二百四十"，也可以读成"二四零"。
                    </p>
                  </div>
                </div>
                <div id="abbreviations" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">缩写与缩略语</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      原始文本中应该避免出现缩写和缩略语（例如"USA"和"ICE"），因为它们的朗读方式可能与其拼写方式不符。但是，如果
                      一个缩写有多种准确的朗读方式，那么所有这些朗读方式都应该在原始文本中。
                    </p>
                  </div>
                </div>
                <div id="special-characters" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">特殊字符与外文文字</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      关于外语文字的问题：字母文字的问题会有各种各样，因为外语数字不同于各种各样的朗读，但中文文字的问题，因此不应该在现
                      原始文字中。
                    </p>
                  </div>
                </div>

                {/* 标点符号部分 */}
                <div id="punctuation" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">标点符号</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>当地语言中可以适当使用标点符号。</p>
                  </div>
                </div>
                <div id="report-issues" className="mt-12 pt-8 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">举报性内容</h2>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      若发现有害或具有攻击性的语句内容（例如包含仇恨言论等内容），则应该使用举报按钮，您也可以通过
                      <a href="mailto:commonvoice@mozilla.com" className="text-blue-600 hover:text-blue-800 ml-1">commonvoice@mozilla.com</a> 联系我们反馈问题。
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>)
}
