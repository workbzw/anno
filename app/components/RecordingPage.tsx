'use client';

import { useState, useRef, useEffect } from 'react';

interface RecordingPageProps {
  onBack?: () => void;
}

export default function RecordingPage({ onBack }: RecordingPageProps) {
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [sentenceAudios, setSentenceAudios] = useState<(string | null)[]>([]);
  const [completedSentences, setCompletedSentences] = useState<boolean[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 新增：系统预热状态
  const [isSystemReady, setIsSystemReady] = useState(false);
  
  // 添加录音计时器相关状态
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  
  // 最大录音时长（15秒）
  const MAX_RECORDING_DURATION = 15;
  
  // 添加临时录音存储状态
  const [tempRecordings, setTempRecordings] = useState<(string | null)[]>([]);
  const [warmupProgress, setWarmupProgress] = useState(0);
  const [warmupMessage, setWarmupMessage] = useState('正在初始化录音系统...');

  // 引用
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestDataIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const preRecordingRef = useRef<MediaRecorder | null>(null);
  const isPreRecordingRef = useRef<boolean>(false);
  const preRecordingReadyRef = useRef<boolean>(false);

  // 错误边界处理 - 捕获JSON-RPC等浏览器扩展错误
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      
      // 更全面的JSON-RPC错误检测
      const isJSONRPCError = reason && (
        reason.code === -32603 ||
        reason.message?.includes('JSON-RPC') ||
        reason.message?.includes('Internal JSON-RPC error') ||
        (typeof reason === 'object' && reason.code && reason.message) ||
        String(reason).includes('JSON-RPC')
      );
      
      if (isJSONRPCError) {
        console.warn('忽略JSON-RPC错误（来自浏览器扩展）:', reason);
        event.preventDefault();
        return false;
      }
      
      console.error('未处理的Promise拒绝:', reason);
    };

    const handleError = (event: ErrorEvent) => {
      // 忽略来自扩展的错误
      if (event.message?.includes('JSON-RPC') || 
          event.message?.includes('Internal JSON-RPC error') ||
          event.filename?.includes('extension') ||
          event.filename?.includes('inject')) {
        console.warn('忽略扩展相关错误:', event.message);
        event.preventDefault();
        return false;
      }
    };

    // 添加全局错误捕获
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('JSON-RPC') || message.includes('Internal JSON-RPC error')) {
        console.warn('忽略JSON-RPC控制台错误:', ...args);
        return;
      }
      originalConsoleError.apply(console, args);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      console.error = originalConsoleError; // 恢复原始console.error
    };
  }, []);

  // 强化的预录音函数 - 带进度提示
  const startPreRecording = async () => {
    if (isPreRecordingRef.current) return;
    
    try {
      console.log('开始预录音初始化...');
      setWarmupMessage('正在获取麦克风权限...');
      setWarmupProgress(10);
      
      // 重置状态
      preRecordingReadyRef.current = false;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,  // 改为16kHz
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      
      streamRef.current = stream;
      console.log('预录音：音频流获取成功');
      setWarmupMessage('音频流获取成功，正在初始化录音器...');
      setWarmupProgress(30);
      
      // 给音频流更多时间稳定
      await new Promise(resolve => setTimeout(resolve, 500));
      setWarmupProgress(50);
      
      const preRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',  // 改回支持的格式
        audioBitsPerSecond: 128000
      });
      
      preRecordingRef.current = preRecorder;
      isPreRecordingRef.current = true;
      
      setWarmupMessage('录音器创建成功，正在预热...');
      setWarmupProgress(70);
      
      // 监听预录音启动事件
      preRecorder.onstart = () => {
        console.log('预录音已启动');
        setWarmupMessage('预录音已启动，正在完成最后的预热...');
        setWarmupProgress(85);
        
        // 延长预热时间，确保完全稳定
        setTimeout(() => {
          preRecordingReadyRef.current = true;
          setIsSystemReady(true);
          setWarmupProgress(100);
          setWarmupMessage('系统已就绪，可以开始录音！');
          console.log('预录音已完全准备好');
          
          // 3秒后隐藏预热提示
          setTimeout(() => {
            setWarmupMessage('');
          }, 3000);
        }, 1500); // 增加到1500ms的预热时间
      };
      
      preRecorder.ondataavailable = (event) => {
        // 预录音的数据不保存，只是为了预热
        // 静默处理，避免控制台日志污染
      };
      
      preRecorder.onerror = (event) => {
        console.error('预录音错误:', event);
        preRecordingReadyRef.current = false;
        setWarmupMessage('预录音初始化失败，请刷新页面重试');
        setIsSystemReady(false);
      };
      
      // 开始预录音，使用更合理的时间片
      preRecorder.start(500); // 改为500ms，减少频率
      console.log('预录音启动中...');
      
      // 立即开始请求数据，让预录音真正"热身"
      setTimeout(() => {
        if (preRecorder.state === 'recording') {
          preRecorder.requestData();
          console.log('预录音：立即请求初始数据');
        }
      }, 200);
      
    } catch (error) {
      console.error('预录音初始化失败:', error);
      preRecordingReadyRef.current = false;
      setIsSystemReady(false);
      setWarmupMessage('录音系统初始化失败，请检查麦克风权限');
      setWarmupProgress(0);
    }
  };

  // 强化的正式录音函数 - 只有系统就绪才能录音
  const handleStartRecording = async () => {
    // 如果系统未就绪，阻止录音
    if (!isSystemReady || !preRecordingReadyRef.current) {
      console.log('系统未就绪，无法开始录音');
      setWarmupMessage('系统正在预热中，请稍候...');
      return;
    }
    
    console.log('=== 开始正式录音 ===');
    
    try {
      // 清理之前的录音
      setRecordedAudio(null);
      audioChunksRef.current = [];
      
      // 重置录音计时器
      setRecordingTime(0);
      setRecordingDuration(0);
      recordingStartTimeRef.current = Date.now();
      
      // 启动录音计时器
      recordingTimerRef.current = setInterval(() => {
        const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000;
        setRecordingTime(elapsed);
        
        // 检查是否达到15秒限制 - 使用更精确的检查
        if (elapsed >= MAX_RECORDING_DURATION) {
          console.log(`录音达到${MAX_RECORDING_DURATION}秒限制，自动停止`);
          // 清理计时器，避免重复调用
          if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
          }
          // 立即停止录音
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            console.log('15秒限制：MediaRecorder 已自动停止');
          }
          setIsRecording(false);
        }
      }, 100); // 每100ms更新一次
      
      // 停止预录音
      if (preRecordingRef.current && preRecordingRef.current.state === 'recording') {
        preRecordingRef.current.stop();
        console.log('预录音已停止');
      }
      
      // 确保有音频流
      if (!streamRef.current) {
        throw new Error('音频流不可用');
      }
      
      // 立即启动正式录音
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 256000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('正式录音数据:', event.data.size, 'bytes, 总块数:', audioChunksRef.current.length);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log('正式录音停止，数据块总数:', audioChunksRef.current.length);
        
        // 清理录音计时器
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        
        // 记录最终录音时长
        const finalDuration = (Date.now() - recordingStartTimeRef.current) / 1000;
        setRecordingDuration(finalDuration);
        console.log('录音时长:', finalDuration.toFixed(2), '秒');
        
        if (requestDataIntervalRef.current) {
          clearInterval(requestDataIntervalRef.current);
          requestDataIntervalRef.current = null;
        }
        
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: 'audio/webm;codecs=opus' 
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          setRecordedAudio(audioUrl);
          console.log('录音完成，总大小:', audioBlob.size, 'bytes');
        }
        
        // 确保录音状态已停止
        setIsRecording(false);
        
        // 重新启动预录音为下次做准备 - 修复未处理的Promise
        setTimeout(() => {
          startPreRecording().catch(error => {
            console.error('重新启动预录音失败:', error);
          });
        }, 200);
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('正式录音错误:', event);
        // 清理录音计时器
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setIsRecording(false);
      };
      
      // 立即开始录音
      mediaRecorder.start(100);
      console.log('正式录音已启动');
      
      // 立即请求数据
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.requestData();
          console.log('立即请求初始数据');
        }
      }, 10);
      
      // 频繁请求数据，但不要太频繁
      requestDataIntervalRef.current = setInterval(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.requestData();
        }
      }, 100);
      
      setIsRecording(true);
      console.log(`正式录音已开始，将在${MAX_RECORDING_DURATION}秒后自动停止`);
      
    } catch (error) {
      console.error('正式录音失败:', error);
      alert('录音失败，请重试');
      setIsRecording(false);
      
      // 清理录音计时器
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      // 重新初始化预录音 - 修复未处理的Promise
      setTimeout(() => {
        startPreRecording().catch(error => {
          console.error('重新初始化预录音失败:', error);
        });
      }, 1000);
    }
  };

  // 组件挂载时立即启动预录音 - 保留这个，删除重复的
  useEffect(() => {
    startPreRecording().catch(error => {
      console.error('初始预录音启动失败:', error);
    });
    
    return () => {
      // 清理所有录音器
      if (preRecordingRef.current) {
        preRecordingRef.current.stop();
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (requestDataIntervalRef.current) {
        clearInterval(requestDataIntervalRef.current);
      }
      // 清理录音计时器
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // 停止录音函数
  const handleStopRecording = () => {
    console.log('=== 停止录音 ===');
    
    if (!isRecording) {
      console.log('当前没有在录音');
      return;
    }
    
    try {
      // 清理录音计时器
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      // 停止录音前多次请求数据，确保不丢失
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        // 连续请求数据3次
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.requestData();
              console.log(`停止前请求数据 ${i + 1}/3`);
            }
          }, i * 50);
        }
        
        // 延迟停止，确保数据收集完成
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            console.log('MediaRecorder 已停止');
          }
          setIsRecording(false);
        }, 200);
      } else {
        setIsRecording(false);
        console.log('MediaRecorder 不在录音状态');
      }
      
      // 清理定时器
      if (requestDataIntervalRef.current) {
        clearInterval(requestDataIntervalRef.current);
        requestDataIntervalRef.current = null;
        console.log('数据请求定时器已清理');
      }
      
    } catch (error) {
      console.error('停止录音时出错:', error);
      setIsRecording(false);
      
      // 确保清理录音计时器
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // 组件挂载时获取句子数据并初始化状态
  useEffect(() => {
    const storedSentences = localStorage.getItem('sentences');
    console.log('从 localStorage 获取的原始数据:', storedSentences);
    
    let sentencesToUse: string[] = [];
    
    if (storedSentences) {
      try {
        const parsedSentences = JSON.parse(storedSentences);
        console.log('解析后的句子数据:', parsedSentences);
        
        if (Array.isArray(parsedSentences) && parsedSentences.length > 0) {
          sentencesToUse = parsedSentences;
        }
      } catch (error) {
        console.error('解析句子数据失败:', error);
      }
    }
    
    // 如果没有存储的句子数据，使用默认句子
    if (sentencesToUse.length === 0) {
      sentencesToUse = [
        "",
        "",
        "",
        "",
        ""
      ];
      console.log('使用默认句子数据:', sentencesToUse);
      
      // 将默认句子保存到 localStorage
      localStorage.setItem('sentences', JSON.stringify(sentencesToUse));
    }
    
    // 初始化状态
    setSentences(sentencesToUse);
    setSentenceAudios(new Array(sentencesToUse.length).fill(null));
    setCompletedSentences(new Array(sentencesToUse.length).fill(false));
    setTempRecordings(new Array(sentencesToUse.length).fill(null));
    
    console.log('初始化句子数据:', sentencesToUse);
    console.log('句子数量:', sentencesToUse.length);
    console.log('初始化完成状态数组长度:', sentencesToUse.length);
    
    // 启动预录音系统
    setTimeout(() => {
      startPreRecording().catch(error => {
        console.error('初始预录音启动失败:', error);
      });
    }, 500);
  }, []);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (requestDataIntervalRef.current) {
        clearInterval(requestDataIntervalRef.current);
      }
    };
  }, []);

  // 调试：监听completedSentences变化
  useEffect(() => {
    console.log('completedSentences 更新:', completedSentences);
    console.log('已完成数量:', completedSentences.filter(Boolean).length);
    console.log('总句子数量:', sentences.length);
  }, [completedSentences, sentences.length]);

  // 添加测试停止函数（保持向后兼容）
  const testStopFunction = () => {
    console.log('测试停止函数被调用了！');
    handleStopRecording();
  };

  // 强制停止录音的函数
  const forceStopRecording = () => {
    console.log('强制停止录音');
    handleStopRecording();
  };

  // 下一个按钮的处理函数 - 只负责切换到下一个句子
  const handleNext = () => {
    console.log('handleNext 被调用');
    console.log('当前 recordedAudio:', !!recordedAudio);
    console.log('当前 sentences.length:', sentences.length);
    console.log('当前 currentSentenceIndex:', currentSentenceIndex);
    
    if (recordedAudio) {
      console.log('开始保存录音，当前句子索引:', currentSentenceIndex);
      
      // 保存当前句子的录音
      setSentenceAudios(prev => {
        const newAudios = [...prev];
        newAudios[currentSentenceIndex] = recordedAudio;
        console.log('保存录音到索引:', currentSentenceIndex);
        return newAudios;
      });
      
      // 清除临时录音（因为已经正式保存了）
      setTempRecordings(prev => {
        const newTemp = [...prev];
        newTemp[currentSentenceIndex] = null;
        return newTemp;
      });
      
      // 标记当前句子为已完成
      setCompletedSentences(prev => {
        const newCompleted = [...prev];
        newCompleted[currentSentenceIndex] = true;
        console.log('标记句子为已完成:', currentSentenceIndex);
        return newCompleted;
      });
      
      setCompletedCount(prev => prev + 1);
      
      // 检查是否可以切换到下一个句子
      const canMoveToNext = currentSentenceIndex < sentences.length - 1;
      console.log('可以切换到下一个句子吗?', canMoveToNext);
      console.log('条件检查: currentSentenceIndex < sentences.length - 1');
      console.log(`${currentSentenceIndex} < ${sentences.length - 1} = ${canMoveToNext}`);
      
      // 切换到下一个句子
      if (canMoveToNext) {
        const nextIndex = currentSentenceIndex + 1;
        console.log('切换到下一个句子:', nextIndex);
        setCurrentSentenceIndex(nextIndex);
        
        // 清空录音状态，准备录制新的
        setRecordedAudio(null);
        
        console.log('切换到下一个句子完成');
      } else {
        console.log('已经是最后一个句子，不切换');
        // 清空录音状态
        setRecordedAudio(null);
      }
    } else {
      console.log('没有录音，无法切换到下一个');
    }
  };

  // 转换音频为WAV格式并下载的函数 - 添加时长检查
  const convertToWav = async (audioUrl: string, filename: string) => {
    try {
      // 获取音频数据
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      // 创建音频上下文
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // 检查音频时长
      const duration = audioBuffer.duration;
      console.log(`音频 ${filename} 时长: ${duration.toFixed(2)} 秒`);
      
      // 如果音频时长大于等于16秒，跳过下载
      if (duration >= 16) {
        console.warn(`音频 ${filename} 时长 ${duration.toFixed(2)} 秒，超过16秒限制，跳过下载`);
        throw new Error(`音频时长 ${duration.toFixed(2)} 秒，超过16秒限制`);
      }
      
      // 转换为WAV格式
      const wavBuffer = audioBufferToWav(audioBuffer);
      const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      
      // 创建下载链接
      const downloadUrl = URL.createObjectURL(wavBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 清理URL
      URL.revokeObjectURL(downloadUrl);
      
      console.log(`已下载: ${filename} (时长: ${duration.toFixed(2)}秒)`);
      return { success: true, duration };
    } catch (error:any) {
      console.error(`下载 ${filename} 失败:`, error);
      return { success: false, error: error.message, duration: 0 };
    }
  };
  
  // 将AudioBuffer转换为WAV格式的函数
  const audioBufferToWav = (buffer: AudioBuffer) => {
    console.log('原始音频信息:', {
      sampleRate: buffer.sampleRate,
      channels: buffer.numberOfChannels,
      length: buffer.length,
      duration: buffer.duration
    });
    
    const targetSampleRate = 16000;  // 目标采样率16kHz
    const numberOfChannels = 1;      // 强制单声道
    const bytesPerSample = 2;        // 16位PCM
    
    // 重采样到16kHz并转换为单声道
    let audioData: Float32Array;
    if (buffer.sampleRate !== targetSampleRate) {
      // 需要重采样
      const ratio = buffer.sampleRate / targetSampleRate;
      const newLength = Math.floor(buffer.length / ratio);
      audioData = new Float32Array(newLength);
      
      console.log('重采样:', {
        原始采样率: buffer.sampleRate,
        目标采样率: targetSampleRate,
        重采样比例: ratio,
        原始长度: buffer.length,
        新长度: newLength
      });
      
      for (let i = 0; i < newLength; i++) {
        const sourceIndex = Math.floor(i * ratio);
        // 混合所有声道到单声道
        let sample = 0;
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          sample += buffer.getChannelData(channel)[sourceIndex] || 0;
        }
        audioData[i] = sample / buffer.numberOfChannels;
      }
    } else {
      // 采样率已经是16kHz，只需要转换为单声道
      console.log('采样率已经是16kHz，转换为单声道');
      audioData = new Float32Array(buffer.length);
      for (let i = 0; i < buffer.length; i++) {
        let sample = 0;
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          sample += buffer.getChannelData(channel)[i] || 0;
        }
        audioData[i] = sample / buffer.numberOfChannels;
      }
    }
    
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = targetSampleRate * blockAlign;
    const dataSize = audioData.length * bytesPerSample;
    const bufferSize = 44 + dataSize;
    
    console.log('WAV文件信息:', {
      采样率: targetSampleRate,
      声道数: numberOfChannels,
      位深: bytesPerSample * 8,
      数据长度: audioData.length,
      文件大小: bufferSize
    });
    
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    
    // WAV文件头
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);                    // fmt chunk size
    view.setUint16(20, 1, true);                     // PCM格式
    view.setUint16(22, numberOfChannels, true);      // 单声道
    view.setUint32(24, targetSampleRate, true);      // 16kHz采样率
    view.setUint32(28, byteRate, true);              // 字节率
    view.setUint16(32, blockAlign, true);            // 块对齐
    view.setUint16(34, bytesPerSample * 8, true);    // 16位
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    
    // 写入音频数据（16位PCM）
    let offset = 44;
    for (let i = 0; i < audioData.length; i++) {
      const sample = Math.max(-1, Math.min(1, audioData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    console.log('WAV文件生成完成，格式: 16kHz, 单声道, 16位PCM');
    return arrayBuffer;
  };

  // 提交所有录音的处理函数 - 修改为下载最新录音并过滤超时音频
  const handleSubmitAll = async () => {
    console.log('handleSubmitAll 被调用');
    console.log('所有录音完成，开始最终提交');
    console.log('sentenceAudios:', sentenceAudios);
    console.log('tempRecordings:', tempRecordings);
    console.log('当前recordedAudio:', recordedAudio);
    console.log('completedSentences:', completedSentences);
    
    try {
      // 显示下载进度
      const downloadButton = document.querySelector('[data-download-button]') as HTMLButtonElement;
      if (downloadButton) {
        downloadButton.textContent = '正在准备下载...';
        downloadButton.disabled = true;
      }
      
      // 如果当前句子有录音但未保存，先保存到临时录音
      if (recordedAudio && !completedSentences[currentSentenceIndex]) {
        setTempRecordings(prev => {
          const newTemp = [...prev];
          newTemp[currentSentenceIndex] = recordedAudio;
          return newTemp;
        });
      }
      
      // 获取最新的录音数组（优先使用临时录音，其次使用正式保存的录音）
      const finalAudios: (string | null)[] = [];
      for (let i = 0; i < 5; i++) {
        if (i === currentSentenceIndex && recordedAudio) {
          // 当前句子的录音优先使用当前状态
          finalAudios[i] = recordedAudio;
        } else if (tempRecordings[i]) {
          // 其次使用临时录音
          finalAudios[i] = tempRecordings[i];
        } else if (sentenceAudios[i]) {
          // 最后使用正式保存的录音
          finalAudios[i] = sentenceAudios[i];
        } else {
          finalAudios[i] = null;
        }
      }
      
      console.log('最终下载的录音数组:', finalAudios);
      
      // 下载所有录音为WAV文件，并统计结果
      let successCount = 0;
      let skippedCount = 0;
      const skippedFiles: string[] = [];
      
      for (let i = 0; i < finalAudios.length; i++) {
        const audioUrl = finalAudios[i];
        if (audioUrl) {
          const filename = `录音_${i + 1}_${sentences[i].substring(0, 10).replace(/[^\w\s]/gi, '')}.wav`;
          const result = await convertToWav(audioUrl, filename);
          
          if (result.success) {
            successCount++;
          } else {
            skippedCount++;
            skippedFiles.push(`句子${i + 1}: ${result.error}`);
          }
          
          // 添加延迟，避免浏览器阻止多个下载
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // 恢复按钮状态
      if (downloadButton) {
        downloadButton.textContent = '下载完成！';
        setTimeout(() => {
          downloadButton.textContent = '提交录音';
          downloadButton.disabled = false;
        }, 2000);
      }
      
      // 显示下载结果
      let message = `下载完成！成功下载 ${successCount} 个文件`;
      if (skippedCount > 0) {
        message += `\n跳过 ${skippedCount} 个超时文件:\n${skippedFiles.join('\n')}`;
      }
      message += '\n请检查浏览器的下载文件夹。';
      
      alert(message);
      
    } catch (error) {
      console.error('下载录音文件失败:', error);
      alert('下载失败，请重试。');
      
      // 恢复按钮状态
      const downloadButton = document.querySelector('[data-download-button]') as HTMLButtonElement;
      if (downloadButton) {
        downloadButton.textContent = '提交录音';
        downloadButton.disabled = false;
      }
    }
  };

  // 保留原来的 handleSubmit 函数作为兼容（如果其他地方还在使用）
  const handleSubmit = () => {
    console.log('handleSubmit 被调用（兼容性保留）');
    handleNext();
  };

  // 处理底部按钮点击跳转到指定句子 - 支持重新录制
  const handleSentenceNavigation = (targetIndex: number) => {
    console.log(`点击跳转到句子 ${targetIndex + 1}`);
    
    // 如果当前有录音，先保存到临时存储中
    if (recordedAudio) {
      setTempRecordings(prev => {
        const newTemp = [...prev];
        newTemp[currentSentenceIndex] = recordedAudio;
        console.log(`临时保存句子 ${currentSentenceIndex + 1} 的录音`);
        return newTemp;
      });
      
      // 如果录音已经被确认（点击过下一个/完成按钮），询问是否保存
      if (!completedSentences[currentSentenceIndex]) {
        const shouldSave = confirm(`当前句子有未保存的录音，是否保存？\n点击"确定"保存，点击"取消"保留为临时录音。`);
        
        if (shouldSave) {
          // 正式保存当前录音并标记为已完成
          setSentenceAudios(prev => {
            const newAudios = [...prev];
            newAudios[currentSentenceIndex] = recordedAudio;
            return newAudios;
          });
          
          setCompletedSentences(prev => {
            const newCompleted = [...prev];
            newCompleted[currentSentenceIndex] = true;
            return newCompleted;
          });
          
          setCompletedCount(prev => prev + 1);
          console.log(`正式保存了句子 ${currentSentenceIndex + 1} 的录音`);
        }
      }
    }

    // 停止当前播放的音频
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);

    // 停止录音（如果正在录音）
    if (isRecording) {
      handleStopRecording();
    }

    // 跳转到目标句子
    setCurrentSentenceIndex(targetIndex);
    
    // 清空当前录音状态，准备重新录制或加载已有录音
    setRecordedAudio(null);
    
    console.log(`跳转到句子 ${targetIndex + 1}，可以重新录制`);
  };

  // 更严格的完成检查 - 确保既有录音又标记为已完成
  const allSentencesCompleted = sentences.length > 0 && // 必须有句子
                                completedSentences.length === sentences.length && 
                                completedSentences.every(completed => completed) &&
                                sentenceAudios.length === sentences.length &&
                                sentenceAudios.every(audio => audio !== null);

  const handleSkip = () => {
    setRecordedAudio(null);
    
    // 找到下一个未完成的句子
    const nextIndex = completedSentences.findIndex((completed, index) => 
      !completed && index > currentSentenceIndex
    );
    
    if (nextIndex !== -1) {
      setCurrentSentenceIndex(nextIndex);
    } else {
      // 如果后面没有未完成的句子，从头开始找
      const firstIncompleteIndex = completedSentences.findIndex(completed => !completed);
      if (firstIncompleteIndex !== -1) {
        setCurrentSentenceIndex(firstIncompleteIndex);
      }
    }
    
    console.log('跳过当前句子');
  };

  // 播放/暂停音频
  const handlePlayPause = () => {
    if (!recordedAudio) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio(recordedAudio);
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
      });
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // 键盘监听
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (isRecording) {
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
  }, [isRecording]);

  // 清理音频引用
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 当录音音频改变时，重置播放状态
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, [recordedAudio]);

  // 当切换句子时，加载对应的录音（优先加载临时录音，其次是正式录音）
  useEffect(() => {
    // 延迟一点加载，确保状态已经清空
    const timer = setTimeout(() => {
      // 优先加载临时录音
      const tempAudio = tempRecordings[currentSentenceIndex];
      const savedAudio = sentenceAudios[currentSentenceIndex];
      
      if (tempAudio && !recordedAudio) {
        console.log('加载句子', currentSentenceIndex + 1, '的临时录音');
        setRecordedAudio(tempAudio);
      } else if (savedAudio && !recordedAudio && !tempAudio) {
        console.log('加载句子', currentSentenceIndex + 1, '的已保存录音');
        setRecordedAudio(savedAudio);
      } else if (!tempAudio && !savedAudio) {
        console.log('句子', currentSentenceIndex + 1, '没有录音，可以开始录制');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentSentenceIndex, sentenceAudios, tempRecordings]);

  // 删除所有注释掉的重复代码
  // 清理完毕，直接进入return语句

  return (
    <>
      {/* CSS样式 */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
        
        @keyframes circularProgress {
          0% {
            stroke-dasharray: 0 628;
          }
          100% {
            stroke-dasharray: 628 628;
          }
        }
        
        .progress-glow {
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
        
        .progress-warning {
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
        }
      `}</style>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px',
        paddingTop: '20px',
        position: 'relative'
      }}>
      {/* 主要内容区域 */}
      <div 
        style={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          {/* 句子显示区域 */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-4" style={{ 
            width: window.innerHeight > window.innerWidth ? '90%' : '33.33%',
            maxWidth: window.innerHeight > window.innerWidth ? '600px' : '800px',
            margin: '0 auto 16px auto',
            minWidth: '300px'
          }}>
            <div className="text-sm text-gray-500 mb-2">请朗读以下句子</div>
            <div className="text-lg font-medium text-gray-900 mb-2">
              {sentences[currentSentenceIndex]}
            </div>
            <div className="text-sm text-gray-400">
              <a href="#" className="text-blue-500 hover:text-blue-600">详细了解</a>
            </div>
          </div>

          {/* 录音控制区域 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* 录音按钮区域 */}
            <div style={{ 
              position: 'relative', 
              marginBottom: '20px', 
              width: '80px', 
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* 系统预热状态指示器 */}
              {!isSystemReady && (
                <div
                  className="rounded-full flex items-center justify-center transition-all duration-200"
                  style={{ 
                    width: '80px', 
                    height: '80px',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    cursor: 'not-allowed',
                    border: '3px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    borderTopColor: '#10b981'
                  }}
                >
                  {/* 旋转的加载指示器 */}
                  <div
                    className="animate-spin rounded-full border-2 border-gray-300 border-t-green-500"
                    style={{ width: '32px', height: '32px' }}
                  ></div>
                </div>
              )}

              {/* 开始录音按钮 - 只有系统就绪且未录音时显示 */}
              {!isRecording && isSystemReady && (
                <button
                  onClick={handleStartRecording}
                  className="rounded-full flex items-center justify-center transition-all duration-200 shadow-lg"
                  style={{ 
                    width: '80px', 
                    height: '80px',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    cursor: 'pointer',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: '#10b981',
                    boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2), 0 4px 6px -2px rgba(16, 185, 129, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#10b981';
                  }}
                >
                  <svg 
                    className="text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    viewBox="0 0 24 24" 
                    style={{ width: '32px', height: '32px', pointerEvents: 'none' }}
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </button>
              )}

              {/* 停止录音按钮 - 录音时显示，带圆形进度条 */}
              {isRecording && (
                <>
                  {/* 圆形进度条 SVG */}
                  <svg
                    width="120"
                    height="120"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) rotate(-90deg)',
                      zIndex: 999
                    }}
                  >
                    {/* 背景圆环 */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="rgba(229, 231, 235, 0.3)"
                      strokeWidth="8"
                    />
                    
                    {/* 进度圆环 */}
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={recordingTime >= MAX_RECORDING_DURATION - 3 ? '#f59e0b' : '#10b981'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="314"
                      strokeDashoffset={314 - (recordingTime / MAX_RECORDING_DURATION) * 314}
                      style={{
                        transition: 'stroke-dashoffset 0.1s ease-out, stroke 0.3s ease',
                        filter: recordingTime >= MAX_RECORDING_DURATION - 3 
                          ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' 
                          : 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))'
                      }}
                    />
                    
                    {/* 15秒标记 */}
                    <line
                      x1="60"
                      y1="5"
                      x2="60"
                      y2="10"
                      stroke="#dc2626"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* 停止录音按钮 */}
                  <button
                    onClick={(e) => {
                      console.log('红色按钮被点击了！', e);
                      e.preventDefault();
                      e.stopPropagation();
                      testStopFunction();
                    }}
                    onMouseDown={() => console.log('红色按钮 mousedown')}
                    onMouseUp={() => console.log('红色按钮 mouseup')}
                    className="rounded-full flex items-center justify-center transition-all duration-200 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200"
                    style={{ 
                      width: '80px', 
                      height: '80px',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 1000,
                      cursor: 'pointer',
                      border: 'none',
                      outline: 'none'
                    }}
                  >
                    {/* 移除了白色正方形 */}
                  </button>
                  
                  {/* 移除了时间显示 */}
                </>
              )}
            </div>

            {/* 系统状态文字 */}
            <div style={{ marginBottom: '16px' }}>
              {!isSystemReady ? (
                <div className="text-blue-600 font-medium">{warmupMessage}</div>
              ) : isRecording ? (
                <div className="text-red-600 font-medium">
                  <div>正在录音... 点击红色按钮或按S键停止</div>
                </div>
              ) : recordedAudio ? (
                <div className="text-gray-600 font-medium">
                  <div>点击重新录音</div>
                  {recordingDuration > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      录音时长: {recordingDuration.toFixed(1)}秒
                      {recordingDuration >= 16 && (
                        <span className="text-red-500 ml-2">⚠️ 超过16秒限制</span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-green-600 font-medium">系统已就绪，点击开始录音或按S键开始</div>
              )}
            </div>

            {/* 预热进度条 */}
            {!isSystemReady && warmupProgress > 0 && (
              <div style={{ marginBottom: '16px', width: '200px' }}>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${warmupProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1 text-center">
                  预热进度: {warmupProgress}%
                </div>
              </div>
            )}

            {/* 键盘提示 */}
            <div style={{ marginBottom: '16px' }}>
              <div className="text-sm text-gray-500">💡 提示：按 S 键可快速开始/停止录音</div>
            </div>

            {/* 操作按钮区域 - 播放按钮和提交按钮在同一行 */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center' }}>


              {/* 圆形播放按钮 - 放在左侧 */}
              {recordedAudio && (
                <button
                  onClick={handlePlayPause}
                  className="rounded-full flex items-center justify-center transition-all duration-200 border-2"
                  style={{ 
                    width: '48px', 
                    height: '48px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    outline: 'none',
                    borderColor: '#10b981'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#059669';
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {isPlaying ? (
                    // 暂停图标
                    <svg 
                      fill="currentColor"
                      viewBox="0 0 24 24" 
                      style={{ width: '20px', height: '20px', color: '#10b981' }}
                    >
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    // 播放图标
                    <svg 
                      fill="currentColor"
                      viewBox="0 0 24 24" 
                      style={{ width: '20px', height: '20px', marginLeft: '2px', color: '#10b981' }}
                    >
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
              )}

              {/* 下一个按钮 - 只在有录音且不是最后一个句子时显示 */}
              {recordedAudio && currentSentenceIndex < sentences.length - 1 && (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 border-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: 'transparent',
                    borderColor: '#10b981',
                    color: '#10b981'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#059669';
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  下一个
                </button>
              )}
              
              {/* 完成当前句子按钮 - 只在最后一个句子且有录音时显示 */}
              {recordedAudio && currentSentenceIndex === sentences.length - 1 && !allSentencesCompleted && (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 border-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: 'transparent',
                    borderColor: '#f59e0b',
                    color: '#f59e0b'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#d97706';
                    e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#f59e0b';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  完成录音
                </button>
              )}
              
              {/* 提交所有录音按钮 - 只在所有句子都完成时显示 */}
              {allSentencesCompleted && (
                <button
                  onClick={handleSubmitAll}
                  data-download-button
                  className="px-6 py-3 border-2 rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: 'transparent',
                    borderColor: '#dc2626',
                    color: '#dc2626'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#b91c1c';
                    e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#dc2626';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  提交录音
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 底部进度指示器 - 改进版 */}
      <div style={{ 
        padding: '20px',
        paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px'
      }}>
        {/* 说明文字 */}
        <div className="text-sm text-gray-600 text-center">
          点击下方数字可切换到对应句子进行录制
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {[1, 2, 3, 4, 5].map((number) => {
            const index = number - 1;
            const isCompleted = completedSentences[index];
            const isCurrent = currentSentenceIndex === index;
            const hasRecording = sentenceAudios[index] !== null;
            const hasTempRecording = tempRecordings[index] !== null;
            
            return (
              <div key={number} style={{ position: 'relative', textAlign: 'center' }}>
                <button
                  onClick={() => handleSentenceNavigation(index)}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    backgroundColor: isCompleted 
                      ? '#10b981' // 已完成 - 绿色
                      : hasRecording 
                        ? '#f59e0b' // 有录音但未确认 - 橙色
                        : '#e5e7eb', // 没有录音 - 灰色
                    color: (isCompleted || hasRecording) ? '#ffffff' : '#6b7280',
                    boxShadow: (isCompleted || hasRecording)
                      ? `0 2px 8px ${isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                      : 'none',
                    border: isCurrent ? '3px solid #8b5cf6' : 'none',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  title={
                    isCompleted 
                      ? `句子${number}：已完成录制` 
                      : hasRecording 
                        ? `句子${number}：有录音，点击可重新录制`
                        : `句子${number}：未录制`
                  }
                >
                  {number}
                </button>
                
                {/* 状态指示小图标 */}
                {isCompleted && (
                  <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="10" height="10" fill="white" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* 图例说明 */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
            <span>已完成</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#e5e7eb' }}></div>
            <span>未录制</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #8b5cf6' }}></div>
            <span>当前</span>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
