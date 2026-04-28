import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { CodeBlock, InlineCode, Callout } from './Shared';

const WebRTCGuide = () => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const steps = [
    {
      title: "1. PeerConnection & Transceivers",
      description: "Initialize the connection with STUN servers and set direction to receive-only.",
      code: `pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }]
});

// Important: recvonly prevents browser mic/cam prompts
pc.addTransceiver('video', { direction: 'recvonly' });
pc.addTransceiver('audio', { direction: 'recvonly' });`,
      language: "typescript"
    },
    {
      title: "2. Track Management",
      description: "Attach incoming tracks to a MediaStream object bound to your video element.",
      code: `const mediaStream = new MediaStream();
videoEl.value.srcObject = mediaStream;

pc.ontrack = (event) => {
  mediaStream.addTrack(event.track);
};`,
      language: "typescript"
    },
    {
      title: "3. Vanila ICE Gathering",
      description: "Wait for all network candidates to be collected before sending the SDP offer.",
      code: `const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

await new Promise((resolve) => {
  if (pc.iceGatheringState === 'complete') resolve();
  else {
    const check = () => {
      if (pc.iceGatheringState === 'complete') {
        pc.removeEventListener('icegatheringstatechange', check);
        resolve();
      }
    };
    pc.addEventListener('icegatheringstatechange', check);
  }
});`,
      language: "typescript"
    }
  ];

  return (
    <article className="space-y-12 pb-20">
      <section id="overview">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Icon icon="lucide:video" className="text-rose-500" />
              Ultra-Low Latency (WHEP)
            </h1>
            <p className="text-slate-500 mt-1 text-sm leading-relaxed">
              Implementing sub-second video playback using WebRTC HTTP Egress Protocol.
            </p>
          </div>
          <div className="bg-rose-50 border border-rose-100 px-4 py-2 rounded-full text-rose-700 text-sm font-bold shadow-sm flex items-center gap-2 shrink-0">
            <Icon icon="lucide:zap" className="animate-pulse" width="16" />
            &lt; 500ms Latency
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 mb-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex -space-x-2">
               <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">Offer</div>
               <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">ICE</div>
               <div className="w-8 h-8 rounded-full bg-rose-500 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold">Play</div>
            </div>
            <div className="h-px flex-1 bg-slate-800"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Connection Pipeline</span>
          </div>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            WHEP simplifies WebRTC by treating the handshake as a standard <InlineCode>POST</InlineCode> request. The server responds with an SDP answer, completing the signaling in one round-trip.
          </p>
        </div>
      </section>

      <div className="space-y-8">
        {steps.map((step, i) => (
          <div key={i} className={`p-6 rounded-2xl border transition-all ${completedSteps[i] ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{i+1}</span>
                <div>
                  <h3 className="font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                </div>
              </div>
              <button 
                onClick={() => toggleStep(i)}
                className={`p-1.5 rounded-lg transition-colors ${completedSteps[i] ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 hover:text-slate-500'}`}
              >
                <Icon icon="lucide:check-circle" width="20" />
              </button>
            </div>
            <CodeBlock language={step.language} code={step.code} />
          </div>
        ))}
      </div>

      <section id="technical-details" className="grid md:grid-cols-2 gap-6 pt-12">
        <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
           <h4 className="font-bold text-indigo-900 mb-2">Trickle vs Vanila ICE</h4>
           <p className="text-xs text-indigo-700 leading-relaxed">
             Most browsers default to "Trickle ICE" where candidates are sent one-by-one. However, many WHEP endpoints require "Vanila ICE" where the offer includes all candidates. Our step #3 ensures the promise only resolves when gathering is 100% complete.
           </p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
           <h4 className="font-bold text-slate-900 mb-2">Autoplay Policy</h4>
           <p className="text-xs text-slate-500 leading-relaxed">
             Browsers block <InlineCode>video.play()</InlineCode> if not muted. We handle this inside <InlineCode>onconnectionstatechange</InlineCode> to ensure immediate playback the millisecond the DTLS handshake finishes.
           </p>
        </div>
      </section>

      <Callout type="warning" title="Clean Unmounting">
         Always call <InlineCode>pc.close()</InlineCode> and nullify the reference in <InlineCode>onUnmounted</InlineCode>. Leaking PeerConnections can freeze the browser tab and keep network sockets open indefinitely.
      </Callout>
    </article>
  );
};

export default WebRTCGuide;

