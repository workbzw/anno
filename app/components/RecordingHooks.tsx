'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { RecordingState, RecordingRefs, MAX_RECORDING_DURATION } from './RecordingTypes';

export function useRecordingState() {
  const [sentences, setSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [sentenceAudios, setSentenceAudios] = useState<(string | null)[]>([]);
  const [completedSentences, setCompletedSentences] = useState<boolean[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [tempRecordings, setTempRecordings] = useState<(string | null)[]>(Array(5).fill(null));
  const [warmupProgress, setWarmupProgress] = useState(0);
  const [warmupMessage, setWarmupMessage] = useState('正在初始化录音系统...');

  return {
    sentences, setSentences,
    currentSentenceIndex, setCurrentSentenceIndex,
    isRecording, setIsRecording,
    recordedAudio, setRecordedAudio,
    sentenceAudios, setSentenceAudios,
    completedSentences, setCompletedSentences,
    completedCount, setCompletedCount,
    isPlaying, setIsPlaying,
    isSystemReady, setIsSystemReady,
    recordingTime, setRecordingTime,
    recordingDuration, setRecordingDuration,
    tempRecordings, setTempRecordings,
    warmupProgress, setWarmupProgress,
    warmupMessage, setWarmupMessage
  };
}

export function useRecordingRefs() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestDataIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const preRecordingRef = useRef<MediaRecorder | null>(null);
  const isPreRecordingRef = useRef<boolean>(false);
  const preRecordingReadyRef = useRef<boolean>(false);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingStartTimeRef = useRef<number>(0);
  const hasInitializedRef = useRef<boolean>(false); // 添加初始化标志

  return {
    mediaRecorderRef,
    streamRef,
    audioChunksRef,
    audioRef,
    requestDataIntervalRef,
    preRecordingRef,
    isPreRecordingRef,
    preRecordingReadyRef,
    recordingTimerRef,
    recordingStartTimeRef,
    hasInitializedRef
  };
}

export function useRecordingLogic(state: any, refs: any) {
  // 错误边界处理
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      
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
      if (event.message?.includes('JSON-RPC') || 
          event.message?.includes('Internal JSON-RPC error') ||
          event.filename?.includes('extension') ||
          event.filename?.includes('inject')) {
        console.warn('忽略扩展相关错误:', event.message);
        event.preventDefault();
        return false;
      }
    };

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
      console.error = originalConsoleError;
    };
  }, []);

  // 预录音函数
  const startPreRecording = useCallback(async () => {
    // 防止重复初始化
    if (refs.isPreRecordingRef.current || refs.hasInitializedRef.current) {
      console.log('预录音已经初始化过，跳过');
      return;
    }
    
    refs.hasInitializedRef.current = true;
    
    try {
      console.log('开始预录音初始化...');
      state.setWarmupMessage('正在获取麦克风权限...');
      state.setWarmupProgress(10);
      
      refs.preRecordingReadyRef.current = false;
      
      // 检查浏览器是否支持 getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('您的浏览器不支持录音功能，请使用现代浏览器（Chrome、Firefox、Safari等）');
      }
      
      // 检查是否为 HTTPS 或 localhost
      const isSecureContext = window.isSecureContext || 
                             location.protocol === 'https:' || 
                             location.hostname === 'localhost' || 
                             location.hostname === '127.0.0.1';
      
      if (!isSecureContext) {
        throw new Error('录音功能需要在安全环境（HTTPS）下运行，请使用 HTTPS 访问');
      }
      
      state.setWarmupMessage('正在请求麦克风权限，请点击"允许"...');
      state.setWarmupProgress(20);
      
      // 使用最简单的音频约束
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true  // 使用最基本的配置
      });
      
      refs.streamRef.current = stream;
      console.log('预录音：音频流获取成功');
      state.setWarmupMessage('麦克风权限获取成功，正在初始化录音器...');
      state.setWarmupProgress(40);
      
      // 检查音频轨道是否可用
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('未找到可用的音频设备，请检查麦克风连接');
      }
      
      console.log('音频设备信息:', audioTracks[0].label || '默认麦克风');
      console.log('音频轨道设置:', audioTracks[0].getSettings());
      
      await new Promise(resolve => setTimeout(resolve, 500));
      state.setWarmupProgress(60);
      
      state.setWarmupMessage('正在创建录音器...');
      state.setWarmupProgress(70);
      
      // 使用最基本的 MediaRecorder 配置
      let preRecorder: MediaRecorder;
      
      // 首先尝试完全默认的配置
      try {
        console.log('尝试使用默认配置创建 MediaRecorder...');
        preRecorder = new MediaRecorder(stream);
        console.log('默认配置创建成功');
      } catch (defaultError: unknown) {
        console.error('默认配置失败:', defaultError);
        
        // 如果默认配置失败，尝试指定最兼容的格式
        try {
          console.log('尝试使用 audio/webm 格式...');
          preRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
          console.log('audio/webm 格式创建成功');
        } catch (webmError: unknown) {
          console.error('audio/webm 格式失败:', webmError);
          
          // 最后尝试不指定任何选项，让浏览器自动选择
          try {
            console.log('尝试让浏览器自动选择格式...');
            preRecorder = new MediaRecorder(stream, {});
            console.log('自动选择格式创建成功');
          } catch (autoError: unknown) {
            console.error('所有格式都失败:', autoError);
            throw new Error('您的浏览器不支持录音功能，请更新浏览器或使用 Chrome');
          }
        }
      }
      
      refs.preRecordingRef.current = preRecorder;
      refs.isPreRecordingRef.current = true;
      
      state.setWarmupMessage('录音器创建成功，正在预热...');
      state.setWarmupProgress(80);
      
      // 设置事件处理器
      preRecorder.onstart = () => {
        console.log('预录音已启动');
        state.setWarmupMessage('预录音已启动，正在完成最后的预热...');
        state.setWarmupProgress(90);
        
        setTimeout(() => {
          refs.preRecordingReadyRef.current = true;
          state.setIsSystemReady(true);
          state.setWarmupProgress(100);
          state.setWarmupMessage('系统已就绪，可以开始录音！');
          console.log('预录音已完全准备好');
          
          // 停止预录音，避免进度条反复加载
          setTimeout(() => {
            if (refs.preRecordingRef.current && refs.preRecordingRef.current.state === 'recording') {
              refs.preRecordingRef.current.stop();
              console.log('预录音已停止');
            }
            refs.isPreRecordingRef.current = false;
            
            // 清除进度条和消息
            setTimeout(() => {
              state.setWarmupMessage('');
              state.setWarmupProgress(0);
            }, 2000);
          }, 1000);
        }, 1000);
      };
      
      preRecorder.ondataavailable = (event) => {
        console.log('预录音数据可用，大小:', event.data.size);
      };
      
      preRecorder.onerror = (event) => {
        console.error('预录音错误:', event);
        refs.preRecordingReadyRef.current = false;
        state.setWarmupMessage('预录音过程中出现错误，请刷新页面重试');
        state.setIsSystemReady(false);
        refs.isPreRecordingRef.current = false;
        refs.hasInitializedRef.current = false;
      };
      
      // 尝试启动录音器
      try {
        console.log('尝试启动 MediaRecorder...');
        console.log('MediaRecorder 状态:', preRecorder.state);
        console.log('MediaRecorder mimeType:', preRecorder.mimeType);
        
        // 不传递任何参数，使用默认时间片
        preRecorder.start();
        console.log('MediaRecorder 启动成功');
        
      } catch (startError: unknown) {
        console.error('MediaRecorder start 失败:', startError);
        
        // 尝试使用不同的时间片
        try {
          console.log('尝试使用 1000ms 时间片启动...');
          preRecorder.start(1000);
          console.log('使用 1000ms 时间片启动成功');
        } catch (timeSliceError: unknown) {
          console.error('使用时间片启动也失败:', timeSliceError);
          
          // 最后尝试：重新创建一个更简单的 MediaRecorder
          try {
            console.log('尝试重新创建最简单的 MediaRecorder...');
            const simpleRecorder = new MediaRecorder(stream);
            refs.preRecordingRef.current = simpleRecorder;
            
            simpleRecorder.onstart = preRecorder.onstart;
            simpleRecorder.ondataavailable = preRecorder.ondataavailable;
            simpleRecorder.onerror = preRecorder.onerror;
            
            simpleRecorder.start();
            console.log('简单 MediaRecorder 启动成功');
            
          } catch (finalError: unknown) {
            const errorMessage = finalError instanceof Error ? finalError.message : String(finalError);
            throw new Error(`录音器无法启动：${errorMessage}。您的设备可能不支持录音功能`);
          }
        }
      }
      
    } catch (error) {
      console.error('预录音初始化失败:', error);
      refs.preRecordingReadyRef.current = false;
      state.setIsSystemReady(false);
      refs.isPreRecordingRef.current = false;
      refs.hasInitializedRef.current = false;
      
      let errorMessage = '录音系统初始化失败';
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.message.includes('Permission denied')) {
          errorMessage = '麦克风权限被拒绝，请点击地址栏的麦克风图标允许访问，然后刷新页面';
        } else if (error.name === 'NotFoundError') {
          errorMessage = '未找到麦克风设备，请检查麦克风是否正确连接';
        } else if (error.name === 'NotReadableError') {
          errorMessage = '麦克风被其他应用占用，请关闭其他使用麦克风的程序';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = '麦克风不支持所需的音频格式，请尝试使用其他麦克风';
        } else if (error.name === 'SecurityError') {
          errorMessage = '安全限制：请确保在 HTTPS 环境下访问，或使用 localhost';
        } else if (error.message.includes('不支持录音功能')) {
          errorMessage = '您的浏览器或设备不支持录音功能，请使用最新版本的 Chrome、Firefox 或 Safari 浏览器';
        } else if (error.message.includes('录音器无法启动')) {
          errorMessage = '录音器无法启动，可能的原因：1) 浏览器版本过旧 2) 设备不支持 3) 系统权限限制。请尝试使用 Chrome 浏览器';
        } else {
          errorMessage = `录音初始化失败：${error.message}`;
        }
      }
      
      state.setWarmupMessage(errorMessage);
      state.setWarmupProgress(0);
      
      setTimeout(() => {
        state.setWarmupMessage(errorMessage + ' - 点击下方重试按钮或刷新页面');
      }, 3000);
    }
  }, [state, refs]);

  return {
    startPreRecording
  };
}