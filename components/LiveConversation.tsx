import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { IconMic, IconStop } from './Icons';

// Audio Utility Functions
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return new Blob([new Uint8Array(int16.buffer)], { type: 'audio/pcm' });
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025';

const LiveConversation: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<string>('准备就绪');
  const [volume, setVolume] = useState(0); 
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  const apiKey = process.env.API_KEY || '';
  const ai = new GoogleGenAI({ apiKey });

  const startSession = async () => {
    try {
      setStatus('正在连接...');
      
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioContextRef.current = inputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = inputCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVolume = () => {
        if (!connected && streamRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setVolume(avg);
        if (connected) requestAnimationFrame(updateVolume);
      };
      
      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            setConnected(true);
            setStatus('通话中: 请用英语对话');
            updateVolume();

            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then((session: any) => {
                  const l = inputData.length;
                  const int16 = new Int16Array(l);
                  for (let i = 0; i < l; i++) {
                    int16[i] = inputData[i] * 32768;
                  }
                  
                  let binary = '';
                  const bytes = new Uint8Array(int16.buffer);
                  const len = bytes.byteLength;
                  for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(bytes[i]);
                  }
                  const base64Data = btoa(binary);

                  session.sendRealtimeInput({
                    media: {
                      data: base64Data,
                      mimeType: 'audio/pcm;rate=16000'
                    }
                  });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio && outputCtx) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                
                const audioBuffer = await decodeAudioData(
                  decode(base64Audio),
                  outputCtx,
                  24000,
                  1
                );
                
                const source = outputCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNode);
                source.addEventListener('ended', () => {
                   sourcesRef.current.delete(source);
                });
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
             }

             if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
             }
          },
          onclose: () => {
            console.log('Gemini Live Closed');
            setConnected(false);
            setStatus('通话结束');
            setVolume(0);
          },
          onerror: (err) => {
            console.error('Gemini Live Error', err);
            setStatus('连接错误，请检查权限');
            setConnected(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: `
            You are "Dr. Smith", a senior Laboratory Manager. 
            The user is a Chinese native speaker working as a lab technician who wants to practice Business English.
            
            Your Goal: Engage in a roleplay conversation about laboratory work.
            
            Guidelines:
            - Speak clear, standard Business English.
            - Speak slightly slower than normal if possible.
            - If the user struggles or uses Chinese, acknowledge it but encourage them to try in English, or simplify your English.
            - Topics: QC results, scheduling, safety checks.
            - Start by asking: "Good morning. How are the test results coming along today?"
          `
        }
      });
      
      sessionPromiseRef.current = sessionPromise;

    } catch (e) {
      console.error(e);
      setStatus('连接失败，请检查麦克风权限');
      setConnected(false);
    }
  };

  const stopSession = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) audioContextRef.current.close();
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => {
            // @ts-ignore
            if (session.close) session.close();
        }).catch(() => {});
    }

    setConnected(false);
    setStatus('通话结束');
    setVolume(0);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 pb-24">
      <div className={`relative w-56 h-56 rounded-full flex items-center justify-center transition-all duration-500 ${
        connected ? 'bg-wechat/10' : 'bg-white border border-slate-200'
      }`}>
        {connected && (
            <div 
                className="absolute inset-0 rounded-full border-4 border-wechat opacity-40"
                style={{ transform: `scale(${1 + volume / 100})`, transition: 'transform 0.1s ease-out' }}
            />
        )}
        
        <div className="z-10 text-center">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-3 transition-colors ${
                connected ? 'bg-wechat text-white' : 'bg-slate-100 text-slate-400'
            }`}>
                 <IconMic className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-slate-700">{status}</p>
            {connected && <p className="text-xs text-wechat font-medium mt-1">Listening...</p>}
        </div>
      </div>

      <div className="mt-12 w-full max-w-xs">
        {!connected ? (
            <button 
                onClick={startSession}
                className="w-full py-4 bg-wechat hover:bg-wechat-dark text-white rounded-xl font-bold text-lg shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                <IconMic className="w-6 h-6" />
                开始模拟对话
            </button>
        ) : (
            <button 
                onClick={stopSession}
                className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
                <IconStop className="w-6 h-6" />
                结束通话
            </button>
        )}
      </div>

      <div className="mt-8 text-center text-slate-400 text-xs px-8">
        <p>场景：与 Dr. Smith (实验室经理) 讨论日常工作。建议佩戴耳机以获得最佳体验。</p>
      </div>
    </div>
  );
};

export default LiveConversation;