class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    this.sampleRate = 16000; // 目标采样率
    this.inputSampleRate = 48000; // 通常的输入采样率
    this.downsampleRatio = this.inputSampleRate / this.sampleRate; // 3:1 下采样
    this.downsampleCounter = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    if (input.length > 0) {
      const inputChannel = input[0]; // 获取第一个声道
      
      // 下采样处理：从48kHz降到16kHz
      for (let i = 0; i < inputChannel.length; i++) {
        this.downsampleCounter++;
        
        // 每3个样本取1个（48kHz -> 16kHz）
        if (this.downsampleCounter >= this.downsampleRatio) {
          this.downsampleCounter = 0;
          
          // 将样本添加到缓冲区
          this.buffer[this.bufferIndex] = inputChannel[i];
          this.bufferIndex++;
          
          // 当缓冲区满时，发送数据
          if (this.bufferIndex >= this.bufferSize) {
            // 转换为16位PCM
            const pcmData = this.floatTo16BitPCM(this.buffer);
            
            // 发送PCM数据到主线程
            this.port.postMessage({
              type: 'audioData',
              data: pcmData,
              sampleRate: this.sampleRate,
              channels: 1
            });
            
            // 重置缓冲区
            this.bufferIndex = 0;
          }
        }
      }
    }
    
    return true; // 保持处理器活跃
  }
  
  // 将Float32Array转换为16位PCM
  floatTo16BitPCM(float32Array) {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      let sample = Math.max(-1, Math.min(1, float32Array[i]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, sample, true); // little-endian
    }
    
    return buffer;
  }
}

registerProcessor('audio-processor', AudioProcessor);