import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { CodeBlock, InlineCode, Callout } from './Shared';

const AIDictionGuide = () => {
  const [activeTab, setActiveTab] = useState<'vue' | 'logic'>('vue');

  return (
    <article className="space-y-12 pb-20">
      <section id="overview">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Icon icon="lucide:mic" className="text-indigo-600" />
              AI Diction & Pronunciation
            </h1>
            <p className="text-slate-500 mt-1 text-sm leading-relaxed">
              A high-performance interface for language learning using Gemini-powered phonetic analysis.
            </p>
          </div>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl shrink-0">
            <button 
              onClick={() => setActiveTab('vue')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'vue' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Vue Template
            </button>
            <button 
              onClick={() => setActiveTab('logic')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'logic' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Core Logic
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
           {[
             { icon: "lucide:zap", label: "Dual-Path", desc: "Speech API for speed, RecordRTC for accuracy." },
             { icon: "lucide:cpu", label: "24kHz PCM", desc: "Raw AudioContext control for AI TTS playback." },
             { icon: "lucide:iphone", label: "MIME-Safe", desc: "Auto-detects Opus vs AAC for iOS compatibility." }
           ].map((item, i) => (
             <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
               <Icon icon={item.icon} className="w-5 h-5 text-indigo-600 mb-2" />
               <h4 className="text-sm font-bold text-slate-900">{item.label}</h4>
               <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
             </div>
           ))}
        </div>
      </section>

      <section id="implementation">
        {activeTab === 'vue' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">UI Structure</h3>
            <CodeBlock 
              language="vue"
              code={`<template>
  <div class="h-[100dvh] bg-[#05070a] text-white flex flex-col p-6">
    <!-- Actor & Emotion Info -->
    <div class="text-[#00d2ff] text-sm font-bold uppercase">{{ currentLine.actor }}</div>
    
    <!-- Dynamic Evaluation Display -->
    <div class="text-3xl font-serif min-h-[140px] flex items-center justify-center">
      <span v-for="word in evaluation" :class="word.correct ? 'text-[#00ff88]' : 'text-[#ff4b4b] underline-wavy'">
        {{ word.word }}
      </span>
    </div>

    <!-- Recording Controls -->
    <button @click="toggleRecording" :class="isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#00d2ff] text-black'">
      <Mic :size="28" />
    </button>
  </div>
</template>`} 
            />
          </div>
        ) : (
          <div className="space-y-4">
             <h3 className="text-lg font-bold text-slate-800">The Battle-Tested Logic</h3>
             <CodeBlock 
               language="typescript"
               code={`const toggleRecording = async () => {
  if (isRecording.value) {
    recordRTC.stopRecording(async () => {
      const blob = recordRTC!.getBlob();
      // 1. Process with Gemini Backend
      evaluation.value = await uploadAudioRecording(blob, currentLine.value.text);
      // 2. Play high-quality TTS response
      playTTS();
    });
  } else {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // IMPORTANT: check for iOS Safari compatibility
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm' : 'audio/mp4';
    recordRTC = new RecordRTC(stream, { type: 'audio', mimeType: mime });
    recordRTC.startRecording();
  }
};`} 
             />
          </div>
        )}
      </section>

      <section id="audio-processing" className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Audio Pipeline & TTS</h2>
        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-4">Handling 24kHz PCM</h4>
            <pre className="text-sm font-mono text-indigo-100/90 whitespace-pre-wrap leading-relaxed">
{`const playTTS = async (base64) => {
  const binary = atob(base64);
  const pcmData = new Int16Array(binary.length / 2);
  const audioBuffer = audioCtx.createBuffer(1, pcmData.length, 24000);
  
  // Convert Int16 PCM to Float32 for WebAudio
  audioBuffer.getChannelData(0).set(pcmData.map(v => v / 32768.0));
  
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.start();
};`}
            </pre>
          </div>
          <Icon icon="lucide:volume-2" className="absolute -right-4 -bottom-4 text-white/5" width="200" />
        </div>
      </section>

      <section id="mobile-safari">
        <Callout type="info" title="Cross-Platform Reliability">
           To ensure this works on <strong>Mobile Safari</strong>, the recording blob must be captured as <InlineCode>audio/mp4</InlineCode>. If you send <InlineCode>audio/webm</InlineCode> from an iPhone, the backend processing will likely fail due to invalid header signatures.
        </Callout>
      </section>

      <section id="best-practices" className="pt-8 border-t border-slate-100">
         <h3 className="text-lg font-bold text-slate-800 mb-6">Performance Checklist</h3>
         <div className="grid sm:grid-cols-2 gap-4">
           <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-start gap-3">
             <Icon icon="lucide:forward" className="text-indigo-600 mt-1" />
             <div>
               <p className="text-sm font-bold text-slate-900">Pre-loading</p>
               <p className="text-xs text-slate-500 mt-1">Generate the next line's TTS audio while the user is still on the current line.</p>
             </div>
           </div>
           <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex items-start gap-3">
             <Icon icon="lucide:trash-2" className="text-indigo-600 mt-1" />
             <div>
               <p className="text-sm font-bold text-slate-900">Cleanup</p>
               <p className="text-xs text-slate-500 mt-1">Disconnect microphone streams immediately after <InlineCode>stopRecording</InlineCode> to turn off OS indicator.</p>
             </div>
           </div>
         </div>
      </section>
    </article>
  );
};

export default AIDictionGuide;

