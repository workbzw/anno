'use client';

import { MAX_RECORDING_DURATION } from './RecordingTypes';

interface RecordingControlsProps {
  isRecording: boolean;
  isSystemReady: boolean;
  recordingTime: number;
  warmupProgress: number;
  warmupMessage: string;
  onStartRecording: () => Promise<void>;
  onStopRecording: () => void;
}

export default function RecordingControls({
  isRecording,
  isSystemReady,
  recordingTime,
  warmupProgress,
  warmupMessage,
  onStartRecording,
  onStopRecording
}: RecordingControlsProps) {
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

        /* 固定时间显示区域，防止颜色变化引起跳动 */
        .time-display {
          width: 60px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

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
            onClick={onStartRecording}
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
                  transition: 'stroke-dashoffset 0.1s ease-out, stroke 0.3s ease'
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
              onClick={onStopRecording}
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
                backgroundColor: '#dc2626',
                boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.2), 0 4px 6px -2px rgba(220, 38, 38, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b91c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
              }}
            >
              {/* 删除这整个div块 - 按钮内的时间显示 */}

            {/* 录音时间显示在按钮中间 */}
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                {recordingTime.toFixed(1)}s
              </div>
            </button>

            {/* 移除原来的录音时间显示 */}
            
          </>
        )}
      </div>

      {/* 系统状态文字 */}
      {warmupMessage && (
        <div className="text-center mb-4">
          <div className="text-sm text-gray-600 mb-2">{warmupMessage}</div>
          {warmupProgress > 0 && warmupProgress < 100 && (
            <div className="w-48 bg-gray-200 rounded-full h-2 mx-auto">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${warmupProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* 键盘提示 */}
      <div className="text-center text-sm text-gray-500 mb-4">
        按 S 键快速{isRecording ? '停止' : '开始'}录音
      </div>
    </>
  );
}