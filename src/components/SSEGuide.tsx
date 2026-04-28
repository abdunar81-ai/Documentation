import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { CodeBlock, InlineCode, Callout } from './Shared';

const SSEGuide = () => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const steps = [
    {
      title: "Step A: The Event Bus (The Messenger)",
      description: "Create a central hub to allow the Webhook and the SSE route to communicate asynchronously.",
      code: `// src/eventBus.ts
import { EventEmitter } from 'events';
export const videoUpdates = new EventEmitter();`,
      language: "typescript"
    },
    {
      title: "Step B: The Webhook (The Trigger)",
      description: "Capture external notifications (e.g. from Bunny.net) and notify the internal Event Bus.",
      code: `// src/controllers/webhook.ts
export async function bunnyWebhook(req: Request, res: Response) {
  const { VideoGuid, Status } = req.body;

  // 1. Persist to Database
  await prisma.short_videos.update({
    where: { bunny_video_id: VideoGuid },
    data: { bunny_stream_status: Status }
  });

  // 2. Alert the active SSE connections
  videoUpdates.emit(\`status_\${VideoGuid}\`, {
    bunny_video_id: VideoGuid,
    new_status: Status,
    timestamp: new Date().toISOString()
  });

  res.sendStatus(200);
}`,
      language: "typescript"
    },
    {
      title: "Step C: The SSE Controller (The Pipe)",
      description: "Establish the persistent connection and clean up listeners on client disconnect.",
      code: `// src/controllers/videoStats.ts
export async function getVideoStats(req: Request, res: Response) {
  const { bunnyVideoId } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  // Listener function
  const onStatusChange = (payload) => {
    res.write(\`event: statusChange\\ndata: \${JSON.stringify(payload)}\\n\\n\`);
  };

  videoUpdates.on(\`status_\${bunnyVideoId}\`, onStatusChange);

  req.on('close', () => {
    videoUpdates.off(\`status_\${bunnyVideoId}\`, onStatusChange);
    res.end();
  });
}`,
      language: "typescript"
    }
  ];

  return (
    <article className="space-y-12 pb-20">
      <section id="architecture">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Icon icon="lucide:zap" className="text-amber-500" />
              Live Status Updates with SSE
            </h1>
            <p className="text-slate-500 mt-1 text-sm leading-relaxed">
              Implementing sub-second UI updates using Server-Sent Events and an internal Node.js Event Bus.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-full text-amber-700 text-sm font-bold shadow-sm flex items-center gap-2 shrink-0">
            <Icon icon="lucide:radio" className="animate-pulse" width="16" />
            Live Pattern
          </div>
        </div>

        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 mb-12">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-1">Implementation Flow</h3>
          <div className="grid md:grid-cols-3 gap-6 relative">
             <div className="flex flex-col gap-4">
               <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-900 shadow-sm">1</div>
               <p className="text-sm font-bold text-slate-800">Connection</p>
               <p className="text-xs text-slate-500">Client opens a persistent <InlineCode>keep-alive</InlineCode> HTTP pipe to the server.</p>
             </div>
             <div className="flex flex-col gap-4">
               <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-900 shadow-sm">2</div>
               <p className="text-sm font-bold text-slate-800">Observation</p>
               <p className="text-xs text-slate-500">Server attaches a listener to the <InlineCode>EventEmitter</InlineCode> for a specific topic.</p>
             </div>
             <div className="flex flex-col gap-4">
               <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-900 shadow-sm">3</div>
               <p className="text-sm font-bold text-slate-800">Propagation</p>
               <p className="text-xs text-slate-500">External webhook triggers the Bus, which pushes the update through the pipe.</p>
             </div>
          </div>
        </div>
      </section>

      <div className="space-y-10">
        <h2 className="text-xl font-bold text-slate-900 px-1 border-l-4 border-indigo-500 ml-1">Backend Setup</h2>
        {steps.map((step, idx) => (
          <div key={idx} className={`p-6 rounded-2xl border transition-all ${completedSteps[idx] ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{step.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{step.description}</p>
              </div>
              <button 
                onClick={() => toggleStep(idx)}
                className={`p-2 rounded-xl transition-all ${completedSteps[idx] ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                <Icon icon="lucide:check" width="20" />
              </button>
            </div>
            <CodeBlock language={step.language} code={step.code} />
          </div>
        ))}
      </div>

      <section id="frontend">
        <div className="border-t border-slate-100 pt-12 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">3. Frontend Implementation (Vue 3)</h2>
          <CodeBlock 
            language="typescript"
            code={`onMounted(() => {
  const es = new EventSource('/api/video/stats/123');
  
  // Custom event listener for 'statusChange'
  es.addEventListener('statusChange', (e) => {
    const update = JSON.parse(e.data);
    video.status = update.new_status;
  });

  onUnmounted(() => es.close());
});`} 
          />
        </div>
      </section>

      <section id="reconnection" className="bg-indigo-950 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
           <h3 className="text-2xl font-bold mb-4">Resilient Reconnection</h3>
           <p className="text-indigo-200 text-sm mb-6 max-w-lg leading-relaxed">
             Standard <InlineCode>EventSource</InlineCode> automatically reconnects, but you should handle exponential backoff for server crashes.
           </p>
           <button className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center gap-2">
             <Icon icon="lucide:refresh-ccw" width="18" />
             View Strategy
           </button>
        </div>
        <Icon icon="lucide:zap" className="absolute -right-4 -bottom-4 text-white/5" width="200" />
      </section>

      <section id="pitfalls">
         <Callout type="warning" title="Memory Warning">
           Failure to remove your <InlineCode>EventEmitter</InlineCode> listener inside the <InlineCode>req.on('close')</InlineCode> callback will cause a massive memory leak, as the listener function keeps the <InlineCode>res</InlineCode> object alive indefinitely.
         </Callout>
      </section>
    </article>
  );
};

export default SSEGuide;

