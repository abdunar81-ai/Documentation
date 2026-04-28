import React from 'react';
import { CodeBlock, InlineCode, Callout } from './Shared';

const AIDictionGuide = () => {
  return (
    <article className="space-y-12">
      <section id="overview">
        <h1 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">AI Diction & Pronunciation Player</h1>
        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
          This "battle-tested" implementation provides a high-performance interface for language learning, combining real-time speech recognition, compressed audio recording, and AI-driven pronunciation feedback.
        </p>
        
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              Dual-Path Evaluation
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Uses built-in Browser Speech API for instant transcripts, with a robust RecordRTC fallback that sends compressed audio to Gemini for precise phonetic analysis.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              Advanced TTS
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Employs pre-loading and PCM-level control to play high-quality AI-generated speech with specific emotions and Kazakhstan-localizations (KK).
            </p>
          </div>
        </div>
      </section>

      <section id="implementation">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Core Vue 3 Implementation</h2>
        <p className="text-slate-600 mb-4 text-sm">
          A fine-grained implementation focusing on mobile compatibility (iOS/Android mime-types) and memory management.
        </p>
        <CodeBlock 
          language="vue"
          code={`<template>
  <div class="w-full h-[100dvh] bg-[#05070a] text-white flex flex-col items-center justify-between p-6 relative overflow-hidden">
    <!-- UI Layout: Header, Evaluation Display, Controls, Progress -->
    
    <!-- Evaluation Display Example -->
    <div v-if="evaluation" class="inline">
      <span
        v-for="(w, i) in evaluation"
        :key="i"
        class="mr-2 inline-block"
        :class="w.correct ? 'text-[#00ff88]' : 'text-[#ff4b4b] underline decoration-wavy'"
      >
        {{ w.word }}
      </span>
    </div>

    <!-- Microhone / Start Recording Toggle -->
    <button @click="toggleRecording" :class="isRecording ? 'bg-red-500' : 'bg-[#00d2ff]'">
      <Mic v-else :size="28" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import RecordRTC from 'recordrtc'
import { evaluatePronunciation, generateTTS, uploadAudioRecording } from '@/utils/geminiService'

// Logic handles:
// 1. Browser SpeechRecognition (Instant result)
// 2. RecordRTC (Compressed Blob fallback for Backend AI)
// 3. AudioContext PCM Playback (High-fidelity TTS)

const toggleRecording = async () => {
  if (isRecording.value) {
    recordRTC.stopRecording(async () => {
      const blob = recordRTC!.getBlob()
      // Send to Gemini for evaluate-audio
      evaluation.value = await uploadAudioRecording(blob, currentLine.value.text)
    })
  } else {
    // Detect best MIME for platform (WebM for Chrome, MP4 for iOS)
    const bestMimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
      ? 'audio/webm;codecs=opus' 
      : 'audio/mp4'
      
    recordRTC = new RecordRTC(userMediaStream, { type: 'audio', mimeType: bestMimeType })
    recordRTC.startRecording()
  }
}
</script>`} 
        />
      </section>

      <section id="audio-processing">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Advanced Audio & TTS Logic</h2>
        <p className="text-slate-600 mb-4 text-sm">
          The implementation uses raw <InlineCode>AudioContext</InlineCode> to handle 24kHz Int16 PCM data returned from AI models, ensuring zero-latency transitions and emotion sync.
        </p>
        <CodeBlock 
          language="typescript"
          code={`const playTTS = async () => {
  const base64Audio = preloadedTTSAudio.value || await generateTTS(...)
  
  if (base64Audio && audioCtx) {
    const binaryString = atob(base64Audio)
    const pcmData = new Int16Array(binaryString.length / 2)
    // ... data view conversion ...

    const audioBuffer = audioCtx.createBuffer(1, pcmData.length, 24000)
    audioBuffer.getChannelData(0).set(pcmData.map(v => v / 32768.0))

    const source = audioCtx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioCtx.destination)
    source.start()
  }
}`} 
        />
      </section>

      <section id="mobile-safari">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Mobile & Safari Compatibility</h2>
        <Callout type="warning" title="Critical: iOS Audio Support">
          iOS Safari does NOT support <InlineCode>audio/webm</InlineCode>. To make this production-ready, your implementation MUST check <InlineCode>MediaRecorder.isTypeSupported</InlineCode> and fallback to <InlineCode>audio/mp4</InlineCode> for RecordRTC, or the server will receive corrupt headers.
        </Callout>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-900 text-xs uppercase mb-2">WebM (Android/Chrome)</h5>
            <p className="text-xs text-slate-500 italic">audio/webm;codecs=opus</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200">
            <h5 className="font-bold text-slate-900 text-xs uppercase mb-2">MP4 (iOS Safari)</h5>
            <p className="text-xs text-slate-500 italic">audio/mp4</p>
          </div>
        </div>
      </section>

      <section id="best-practices">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Best Practices</h2>
        <ul className="space-y-3 text-sm text-slate-600 list-disc ml-4">
          <li><strong>Pre-loading:</strong> Always pre-load the TTS audio for the "Next" line as soon as the user advances to avoid 1-2s generation pauses.</li>
          <li><strong>Clean Cleanup:</strong> Use <InlineCode>track.stop()</InlineCode> on all MediaStream tracks after recording finishes to turn off the OS recording indicator (red dot).</li>
          <li><strong>Visual Feedback:</strong> Use CSS <InlineCode>underline decoration-wavy</InlineCode> for mispronounced words to differentiate structural spelling errors from phonetic ones.</li>
        </ul>
      </section>
    </article>
  );
};

export default AIDictionGuide;
