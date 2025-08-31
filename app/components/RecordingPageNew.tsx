'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import SentenceDisplay from './SentenceDisplay';
import RecordingControls from './RecordingControls';
import AudioPlayer from './AudioPlayer';
import { useRecordingState, useRecordingRefs, useRecordingLogic } from './RecordingHooks';
import { MAX_RECORDING_DURATION } from './RecordingTypes';
import ConfirmModal from './ConfirmModal';

interface RecordingPageProps {
  onBack: () => void;
}

export default function RecordingPage({ onBack }: RecordingPageProps) {
  // 使用自定义 hooks
  const state = useRecordingState();
  const refs = useRecordingRefs();
  const { startPreRecording } = useRecordingLogic(state, refs);
  
  // 添加确认弹窗状态
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // 开始录音函数
  const handleStartRecording = useCallback(async () => {
    if (!state.isSystemReady || !refs.preRecordingReadyRef.current) {
      console.log('系统未就绪，无法开始录音');
      state.setWarmupMessage('系统正在预热中，请稍候...');
      return;
    }

    try {
      console.log('开始正式录音...');
      
      if (!refs.streamRef.current) {
        throw new Error('音频流未准备好');
      }

      refs.audioChunksRef.current = [];
      
      const recorder = new MediaRecorder(refs.streamRef.current, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });

      refs.mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          refs.audioChunksRef.current.push(event.data);
          console.log('录音数据块大小:', event.data.size);
        }
      };

      recorder.onstop = () => {
        console.log('录音停止，处理音频数据...');
        const audioBlob = new Blob(refs.audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        state.setRecordedAudio(audioUrl);
        console.log('录音完成，音频URL已生成');
      };

      recorder.onerror = (event) => {
        console.error('录音错误:', event);
        state.setIsRecording(false);
      };

      recorder.start(100);
      state.setIsRecording(true);
      
      // 开始录音计时
      refs.recordingStartTimeRef.current = Date.now();
      state.setRecordingTime(0);
      
      refs.recordingTimerRef.current = setInterval(() => {
        const elapsed = (Date.now() - refs.recordingStartTimeRef.current) / 1000;
        state.setRecordingTime(elapsed);
        
        if (elapsed >= MAX_RECORDING_DURATION) {
          console.log('达到最大录音时长，自动停止');
          handleStopRecording();
        }
      }, 100);

      // 定期请求数据
      refs.requestDataIntervalRef.current = setInterval(() => {
        if (refs.mediaRecorderRef.current && refs.mediaRecorderRef.current.state === 'recording') {
          refs.mediaRecorderRef.current.requestData();
        }
      }, 1000);

      console.log('正式录音已开始');
      
    } catch (error) {
      console.error('开始录音失败:', error);
      state.setIsRecording(false);
    }
  }, [state, refs]);

  // 停止录音函数
  const handleStopRecording = useCallback(() => {
    try {
      console.log('停止录音...');
      
      // 清理录音计时器
      if (refs.recordingTimerRef.current) {
        clearInterval(refs.recordingTimerRef.current);
        refs.recordingTimerRef.current = null;
      }

      if (refs.mediaRecorderRef.current && refs.mediaRecorderRef.current.state === 'recording') {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            if (refs.mediaRecorderRef.current && refs.mediaRecorderRef.current.state === 'recording') {
              refs.mediaRecorderRef.current.requestData();
              console.log(`停止前请求数据 ${i + 1}/3`);
            }
          }, i * 50);
        }
        
        setTimeout(() => {
          if (refs.mediaRecorderRef.current && refs.mediaRecorderRef.current.state === 'recording') {
            refs.mediaRecorderRef.current.stop();
            console.log('MediaRecorder 已停止');
          }
          state.setIsRecording(false);
        }, 200);
      } else {
        state.setIsRecording(false);
        console.log('MediaRecorder 不在录音状态');
      }
      
      if (refs.requestDataIntervalRef.current) {
        clearInterval(refs.requestDataIntervalRef.current);
        refs.requestDataIntervalRef.current = null;
        console.log('数据请求定时器已清理');
      }
      
    } catch (error) {
      console.error('停止录音时出错:', error);
      state.setIsRecording(false);
      
      if (refs.recordingTimerRef.current) {
        clearInterval(refs.recordingTimerRef.current);
        refs.recordingTimerRef.current = null;
      }
    }
  }, [state, refs]);

  // 下一个按钮处理函数
  const handleNext = useCallback(() => {
    console.log('handleNext 被调用');
    
    if (state.recordedAudio) {
      console.log('开始保存录音，当前句子索引:', state.currentSentenceIndex);
      
      state.setSentenceAudios(prev => {
        const newAudios = [...prev];
        newAudios[state.currentSentenceIndex] = state.recordedAudio;
        console.log('保存录音到索引:', state.currentSentenceIndex);
        return newAudios;
      });
      
      state.setTempRecordings(prev => {
        const newTemp = [...prev];
        newTemp[state.currentSentenceIndex] = null;
        return newTemp;
      });
      
      state.setCompletedSentences(prev => {
        const newCompleted = [...prev];
        newCompleted[state.currentSentenceIndex] = true;
        console.log('标记句子为已完成:', state.currentSentenceIndex);
        return newCompleted;
      });
      
      state.setCompletedCount(prev => prev + 1);
      
      const canMoveToNext = state.currentSentenceIndex < state.sentences.length - 1;
      
      if (canMoveToNext) {
        const nextIndex = state.currentSentenceIndex + 1;
        console.log('切换到下一个句子:', nextIndex);
        state.setCurrentSentenceIndex(nextIndex);
        state.setRecordedAudio(null);
        console.log('切换到下一个句子完成');
      } else {
        console.log('已经是最后一个句子，不切换');
        state.setRecordedAudio(null);
      }
    } else {
      console.log('没有录音，无法切换到下一个');
    }
  }, [state]);

  // 播放/暂停音频
  const handlePlayPause = useCallback(() => {
    if (!state.recordedAudio) return;
    
    if (!refs.audioRef.current) {
      refs.audioRef.current = new Audio(state.recordedAudio);
      refs.audioRef.current.addEventListener('ended', () => {
        state.setIsPlaying(false);
      });
    }
    
    if (state.isPlaying) {
      refs.audioRef.current.pause();
      state.setIsPlaying(false);
    } else {
      refs.audioRef.current.play();
      state.setIsPlaying(true);
    }
  }, [state, refs]);

  // 跳过当前句子
  const handleSkip = useCallback(() => {
    state.setRecordedAudio(null);
    
    const nextIndex = state.completedSentences.findIndex((completed, index) => 
      !completed && index > state.currentSentenceIndex
    );
    
    if (nextIndex !== -1) {
      state.setCurrentSentenceIndex(nextIndex);
    } else {
      const firstIncompleteIndex = state.completedSentences.findIndex(completed => !completed);
      if (firstIncompleteIndex !== -1) {
        state.setCurrentSentenceIndex(firstIncompleteIndex);
      }
    }
    
    console.log('跳过当前句子');
  }, [state]);

  // 处理确认下一轮录音
  const handleConfirmNextRecording = () => {
    setIsConfirmModalOpen(false);
    // 重置录音状态，开始新一轮录音
    startNewRecording();
  };

  const startNewRecording = () => {
    // 重置所有录音相关状态
    state.setCurrentSentenceIndex(0);
    state.setRecordedAudio(null);
    state.setSentenceAudios(new Array(state.sentences.length).fill(null));
    state.setCompletedSentences(new Array(state.sentences.length).fill(false));
    state.setCompletedCount(0);
    state.setTempRecordings(new Array(state.sentences.length).fill(null));
    state.setRecordingTime(0);
    state.setRecordingDuration(0);
    
    // 重置录音状态
    state.setIsRecording(false);
    state.setIsPlaying(false);
    
    // 清理录音引用
    if (refs.mediaRecorderRef.current) {
      refs.mediaRecorderRef.current = null;
    }
    refs.audioChunksRef.current = [];
    
    console.log('开始新一轮录音，状态已重置');
  };

  // 下载所有录音
  const downloadAllRecordings = useCallback(async () => {
    try {
      console.log('开始下载所有录音...');
      
      const downloadButton = document.querySelector('[data-download-button]') as HTMLButtonElement;
      if (downloadButton) {
        downloadButton.textContent = '正在下载...';
        downloadButton.disabled = true;
      }

      let successCount = 0;
      let skippedCount = 0;
      const skippedFiles: string[] = [];

      for (let i = 0; i < state.sentenceAudios.length; i++) {
        const audio = state.sentenceAudios[i];
        if (audio) {
          const filename = `recording_${i + 1}.wav`;
          try {
            await convertToWav(audio, filename);
            successCount++;
          } catch (error) {
            console.error(`下载文件 ${filename} 失败:`, error);
            skippedCount++;
            skippedFiles.push(filename);
          }
        }
      }

      if (downloadButton) {
        downloadButton.textContent = '下载完成！';
        setTimeout(() => {
          downloadButton.textContent = '提交录音';
          downloadButton.disabled = false;
        }, 2000);
      }

      // 显示下载结果(已移除alert，直接显示弹窗)
      // let message = `下载完成！成功下载 ${successCount} 个文件`;
      // if (skippedCount > 0) {
      //   message += `\n跳过 ${skippedCount} 个超时文件:\n${skippedFiles.join('\n')}`;
      // }
      // message += '\n请检查浏览器的下载文件夹。';
      
      // alert(message); // 已移除此alert
      
      // 提交成功后直接显示确认弹窗，询问是否开始下一轮录音
      setIsConfirmModalOpen(true);
      
    } catch (error) {
      console.error('下载录音文件失败:', error);
      alert('下载失败，请重试。');
      
      const downloadButton = document.querySelector('[data-download-button]') as HTMLButtonElement;
      if (downloadButton) {
        downloadButton.textContent = '提交录音';
        downloadButton.disabled = false;
      }
    }
  }, [state]);

  // 转换音频为WAV格式
  const convertToWav = async (audioUrl: string, filename: string) => {
    try {
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const duration = audioBuffer.duration;
      console.log(`音频 ${filename} 时长: ${duration.toFixed(2)} 秒`);
      
      if (duration >= 16) {
        console.log(`跳过下载 ${filename}：时长超过16秒 (${duration.toFixed(2)}s)`);
        throw new Error(`音频时长超过16秒: ${duration.toFixed(2)}s`);
      }

      const wavBuffer = audioBufferToWav(audioBuffer);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      console.log(`${filename} 下载完成`);
      
    } catch (error) {
      console.error(`转换 ${filename} 失败:`, error);
      throw error;
    }
  };

  // 音频缓冲区转WAV格式
  const audioBufferToWav = (buffer: AudioBuffer) => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return arrayBuffer;
  };

  // 组件挂载时获取句子数据并初始化状态
  useEffect(() => {
    const storedSentences = localStorage.getItem('sentences');
    console.log('从 localStorage 获取的原始数据:', storedSentences);
    
    let sentencesToUse: string[] = [];
    let needsUpdate = false;
    
    if (storedSentences) {
      try {
        const parsedSentences = JSON.parse(storedSentences);
        console.log('解析后的句子数据:', parsedSentences);
        
        if (Array.isArray(parsedSentences) && parsedSentences.length > 0) {
          // 检查是否都是空字符串，如果是则需要更新
          const hasEmptyStrings = parsedSentences.some(sentence => sentence === '' || sentence.trim() === '');
          if (hasEmptyStrings) {
            console.log('检测到空句子，需要更新为粤语句子');
            needsUpdate = true;
          } else {
            sentencesToUse = parsedSentences;
          }
        } else {
          needsUpdate = true;
        }
      } catch (error) {
        console.error('解析句子数据失败:', error);
        needsUpdate = true;
      }
    } else {
      needsUpdate = true;
    }
    
    if (needsUpdate || sentencesToUse.length === 0) {
      sentencesToUse = [
        "你好，请问去机场点去？",
        "今日天气真系好靓，出去行下啦。",
        "我在做紧习作，等陣先联络你。",
        "唔好意思，就快到了，再等五分钟。",
        "啲，明日一齐食饭，你看点好？"
      ];
      console.log('使用默认粤语句子数据:', sentencesToUse);
      localStorage.setItem('sentences', JSON.stringify(sentencesToUse));
    }
    
    state.setSentences(sentencesToUse);
    state.setSentenceAudios(new Array(sentencesToUse.length).fill(null));
    state.setCompletedSentences(new Array(sentencesToUse.length).fill(false));
    
    console.log('初始化句子数据:', sentencesToUse);
    
    // 只在组件首次挂载时启动预录音
    const timer = setTimeout(() => {
      startPreRecording().catch(error => {
        console.error('初始预录音启动失败:', error);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []); // 移除依赖，只在组件挂载时执行一次

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (refs.streamRef.current) {
        refs.streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (refs.requestDataIntervalRef.current) {
        clearInterval(refs.requestDataIntervalRef.current);
      }
    };
  }, [refs]);

  // 键盘监听
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (state.isRecording) {
          handleStopRecording();
        } else {
          handleStartRecording();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [state.isRecording, handleStartRecording, handleStopRecording]);

  // 当切换句子时，加载对应的录音
  useEffect(() => {
    const timer = setTimeout(() => {
      const tempAudio = state.tempRecordings[state.currentSentenceIndex];
      const savedAudio = state.sentenceAudios[state.currentSentenceIndex];
      
      if (tempAudio && !state.recordedAudio) {
        console.log('加载句子', state.currentSentenceIndex + 1, '的临时录音');
        state.setRecordedAudio(tempAudio);
      } else if (savedAudio && !state.recordedAudio && !tempAudio) {
        console.log('加载句子', state.currentSentenceIndex + 1, '的已保存录音');
        state.setRecordedAudio(savedAudio);
      } else if (!tempAudio && !savedAudio) {
        console.log('句子', state.currentSentenceIndex + 1, '没有录音，可以开始录制');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [state.currentSentenceIndex, state.sentenceAudios, state.tempRecordings, state.recordedAudio, state]);

  // 检查是否所有句子都已完成
  const allSentencesCompleted = state.sentences.length > 0 && 
                                state.completedSentences.length === state.sentences.length && 
                                state.completedSentences.every(completed => completed) &&
                                state.sentenceAudios.length === state.sentences.length &&
                                state.sentenceAudios.every(audio => audio !== null);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'flex-start', 
      minHeight: '100vh',
      padding: '20px',
      position: 'relative'
    }}>
      {/* 返回按钮 */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        left: '20px', 
        zIndex: 1000 
      }}>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5"/>
            <path d="M12 19l-7-7 7-7"/>
          </svg>
          返回
        </button>
      </div>

      <div 
        style={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px 20px 20px', // 增加顶部padding为返回按钮留空间
          overflow: 'hidden',
          width: '100%'
        }}
      >
        <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          {/* 句子显示区域 */}
          <SentenceDisplay 
            sentences={state.sentences}
            currentSentenceIndex={state.currentSentenceIndex}
          />

          {/* 录音控制区域 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <RecordingControls
              isRecording={state.isRecording}
              isSystemReady={state.isSystemReady}
              recordingTime={state.recordingTime}
              warmupProgress={state.warmupProgress}
              warmupMessage={state.warmupMessage}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
            />
            
            {/* 如果系统未就绪且有错误消息，显示重试按钮 */}
            {!state.isSystemReady && state.warmupMessage && state.warmupMessage.includes('失败') && (
              <button
                onClick={() => {
                  // 重置状态并重试
                  refs.hasInitializedRef.current = false;
                  refs.isPreRecordingRef.current = false;
                  state.setWarmupMessage('正在重试初始化...');
                  state.setWarmupProgress(0);
                  
                  setTimeout(() => {
                    startPreRecording().catch(error => {
                      console.error('重试预录音启动失败:', error);
                    });
                  }, 500);
                }}
                className="mt-4 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                重试初始化
              </button>
            )}

            {/* 音频播放器 */}
            <AudioPlayer
              recordedAudio={state.recordedAudio}
              isPlaying={state.isPlaying}
              onPlayPause={handlePlayPause}
              audioRef={refs.audioRef}
              setIsPlaying={state.setIsPlaying}
            />

            {/* 操作按钮区域 */}
            <div className="flex gap-4 mt-6">
              {state.recordedAudio && (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  {state.currentSentenceIndex < state.sentences.length - 1 ? '下一个' : '完成'}
                </button>
              )}
              
              <button
                onClick={handleSkip}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                跳过
              </button>
              
              {allSentencesCompleted && (
                <button
                  onClick={downloadAllRecordings}
                  data-download-button
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  提交录音
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onConfirm={handleConfirmNextRecording}
        onCancel={() => setIsConfirmModalOpen(false)}
        message="此批次录音已完成，是否进行下一批次录音？"
      />
    </div>
  );
}