import React from 'react';
import { CodeBlock, InlineCode, Callout } from './Shared';

const WebRTCGuide = () => {
  return (
    <article className="space-y-12">
      <section id="overview">
        <h1 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">WebRTC (WHEP) Player Implementation</h1>
        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
          For ultra-low latency playback (sub-second), standard HLS or DASH aren't enough. WebRTC via the <strong className="text-slate-900">WHEP (WebRTC HTTP Egress Protocol)</strong> allows you to stream video with almost zero delay.
        </p>
        
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-8 rounded-r-lg">
          <p className="text-sm text-indigo-900">
            <strong>Key Concept:</strong> WHEP simplifies WebRTC by using a standard HTTP POST to exchange SDP (Session Description Protocol) offers and answers.
          </p>
        </div>
      </section>

      <section id="implementation">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Complete Vue 3 Component</h2>
        <p className="text-slate-600 mb-4 text-sm">
          This component handles the PeerConnection lifecycle, ICE candidate gathering, and SDP exchange with the WHEP endpoint.
        </p>
        <CodeBlock 
          language="vue"
          code={`<template>
  <div class="relative w-full h-full bg-black overflow-hidden">
    <!-- Error overlay -->
    <div
      v-if="error"
      class="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-20 text-red-400 font-medium p-4 text-center text-sm pointer-events-none"
    >
      WebRTC Error: {{ error }}
    </div>

    <video
      ref="videoEl"
      :autoplay="autoPlay"
      :muted="muted"
      playsinline
      controls
      class="w-full h-full bg-black object-contain"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    whepUrl: string
    autoPlay?: boolean
    muted?: boolean
  }>(),
  {
    autoPlay: true,
    muted: true,
  },
)

const videoEl = ref<HTMLVideoElement | null>(null)
const error = ref<string | null>(null)
let pc: RTCPeerConnection | null = null

const startWebRTC = async (url: string) => {
  if (pc) {
    pc.close()
    pc = null
  }
  error.value = null

  try {
    // 1. Initialize with STUN servers (Cloudflare recommended)
    pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }],
    })

    // 2. Prepare the MediaStream immediately
    const mediaStream = new MediaStream()
    if (videoEl.value) {
      videoEl.value.srcObject = mediaStream
    }

    // Set transceivers to receive-only
    pc.addTransceiver('video', { direction: 'recvonly' })
    pc.addTransceiver('audio', { direction: 'recvonly' })

    // 3. Attach incoming tracks to our stream
    pc.ontrack = (event) => {
      mediaStream.addTrack(event.track)
    }

    // Force playback on connection success
    pc.onconnectionstatechange = () => {
      if (pc?.connectionState === 'connected' && videoEl.value) {
        videoEl.value.play().catch((e) => console.warn('Autoplay prevented:', e))
      }
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    // 4. IMPORTANT: Wait for ICE candidates before sending the offer
    // This avoids "trickle ICE" which many WHEP servers don't support yet
    await new Promise<void>((resolve) => {
      if (pc!.iceGatheringState === 'complete') {
        resolve()
      } else {
        const checkState = () => {
          if (pc!.iceGatheringState === 'complete') {
            pc!.removeEventListener('icegatheringstatechange', checkState)
            resolve()
          }
        }
        pc!.addEventListener('icegatheringstatechange', checkState)
        // Fallback timeout after 1.5s
        setTimeout(() => {
          pc!.removeEventListener('icegatheringstatechange', checkState)
          resolve()
        }, 1500)
      }
    })

    // 5. Send the offer with gathered ICE candidates
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/sdp' },
      body: pc.localDescription?.sdp,
    })

    if (!response.ok) throw new Error(\`Server returned \${response.status}\`)

    const answerSdp = await response.text()
    await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answerSdp }))
  } catch (err: any) {
    console.error('WHEP Error:', err)
    error.value = err.message
  }
}

watch(
  () => props.whepUrl,
  (url) => {
    if (url) startWebRTC(url)
  },
)

onMounted(() => {
  if (props.whepUrl) startWebRTC(props.whepUrl)
})

onUnmounted(() => {
  if (pc) {
    pc.close()
    pc = null
  }
})
</script>\n`} 
        />
      </section>

      <section id="technical-details">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Technical Critical Path</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50">
            <h4 className="font-bold text-slate-900 mb-2">ICE Gathering</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Step 4 is the most common point of failure. Many WHEP implementations (like Cloudflare's) expect a "Vanila ICE" offer, meaning the SDP must contain all connection candidates before being sent. We use a Promise to wait for <InlineCode>iceGatheringState === 'complete'</InlineCode>.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50">
            <h4 className="font-bold text-slate-900 mb-2">Transceivers</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We explicitly use <InlineCode>recvonly</InlineCode> to tell the browser we are only playing back media, not sending camera/mic data. This prevents the browser from prompting the user for hardware permissions.
            </p>
          </div>
        </div>
      </section>

      <Callout type="warning" title="Autoplay Policy">
        Modern browsers will block <InlineCode>video.play()</InlineCode> unless the video is muted or the user has interacted with the page. Always default to <InlineCode>muted: true</InlineCode> for the smoothest experience.
      </Callout>
    </article>
  );
};

export default WebRTCGuide;
