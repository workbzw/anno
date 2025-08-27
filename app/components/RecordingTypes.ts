// 录音相关的类型定义
export interface RecordingState {
  sentences: string[];
  currentSentenceIndex: number;
  isRecording: boolean;
  recordedAudio: string | null;
  sentenceAudios: (string | null)[];
  completedSentences: boolean[];
  completedCount: number;
  isPlaying: boolean;
  isSystemReady: boolean;
  recordingTime: number;
  recordingDuration: number;
  tempRecordings: (string | null)[];
  warmupProgress: number;
  warmupMessage: string;
}

export interface RecordingRefs {
  mediaRecorderRef: React.RefObject<MediaRecorder | null>;
  streamRef: React.RefObject<MediaStream | null>;
  audioChunksRef: React.RefObject<Blob[]>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  requestDataIntervalRef: React.RefObject<NodeJS.Timeout | null>;
  preRecordingRef: React.RefObject<MediaRecorder | null>;
  isPreRecordingRef: React.RefObject<boolean>;
  preRecordingReadyRef: React.RefObject<boolean>;
  recordingTimerRef: React.RefObject<NodeJS.Timeout | null>;
  recordingStartTimeRef: React.RefObject<number>;
}

export interface RecordingActions {
  handleStartRecording: () => Promise<void>;
  handleStopRecording: () => void;
  handleNext: () => void;
  handlePlayPause: () => void;
  handleSkip: () => void;
  handleSentenceNavigation: (targetIndex: number) => void;
  downloadAllRecordings: () => Promise<void>;
}

export const MAX_RECORDING_DURATION = 15;