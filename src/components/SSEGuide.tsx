import React from 'react';
import { CodeBlock } from './Shared';

const SSEGuide = () => {
  return (
    <article className="space-y-12">
      <section id="architecture">
        <h1 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Server-Sent Events (SSE) Implementation</h1>
        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
          To implement Server-Sent Events (SSE) effectively for your video status tracker, you need to think of it as a <strong className="text-slate-900">live pipe</strong> rather than a standard request.
        </p>
        
        <h2 className="text-xl font-semibold text-slate-800 mb-4">1. The Architecture</h2>
        <p className="text-slate-600 mb-4 text-sm">
          Unlike a standard REST API, SSE keeps a single HTTP connection open. When your backend receives an update (via a Webhook from Bunny.net), it "pushes" that data through the pipe.
        </p>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">The Flow</h3>
          <ol className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-3"><span className="font-bold text-indigo-600">1.</span> <span><strong>Client</strong> opens a connection to <code className="bg-slate-200/50 px-1 rounded">/video/stats/:id</code>.</span></li>
            <li className="flex gap-3"><span className="font-bold text-indigo-600">2.</span> <span><strong>Server</strong> sends the "Initial State" (Full video object).</span></li>
            <li className="flex gap-3"><span className="font-bold text-indigo-600">3.</span> <span><strong>Bunny.net</strong> hits your Webhook when a video is encoded.</span></li>
            <li className="flex gap-3"><span className="font-bold text-indigo-600">4.</span> <span><strong>Webhook</strong> updates the DB and "Emits" an event to the Event Bus.</span></li>
            <li className="flex gap-3"><span className="font-bold text-indigo-600">5.</span> <span><strong>SSE Connection</strong> hears that event and pushes a small "Status Update" JSON to the Client.</span></li>
          </ol>
        </div>
      </section>

      <section id="implementation">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">2. Step-by-Step Implementation</h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-3">Step A: The Event Bus (The Messenger)</h3>
            <p className="text-slate-600 mb-4 text-sm">Create a file to act as the central hub. This allows different parts of your Node.js app to talk to each other.</p>
            <CodeBlock 
              language="typescript"
              code={`// src/eventBus.ts
import { EventEmitter } from 'events';
export const videoUpdates = new EventEmitter();`} 
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-3">Step B: The Webhook (The Trigger)</h3>
            <p className="text-slate-600 mb-4 text-sm">Capture the POST request from Bunny.net and tell the Event Bus to notify listening users.</p>
            <CodeBlock 
              language="typescript"
              code={`// src/controllers/webhook.ts
export async function bunnyWebhook(req: Request, res: Response) {
  const { VideoGuid, Status } = req.body;

  // 1. Update your DB so the status is permanent
  await prisma.short_videos.update({
    where: { bunny_video_id: VideoGuid },
    data: { bunny_stream_status: Status }
  });

  // 2. Alert the SSE connection
  videoUpdates.emit(\`status_\${VideoGuid}\`, {
    bunny_video_id: VideoGuid,
    new_status: Status,
    timestamp: new Date().toISOString()
  });

  res.sendStatus(200);
}`} 
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-3">Step C: The SSE Controller (The Pipe)</h3>
            <p className="text-slate-600 mb-4 text-sm">Handle the persistent connection and ensure proper cleanup.</p>
            <CodeBlock 
              language="typescript"
              code={`// src/controllers/videoStats.ts
export async function getVideoStats(req: Request, res: Response) {
  const { bunnyVideoId } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Important for Nginx
  });

  // 1. Fetch and send the initial full object immediately
  const video = await prisma.short_videos.findFirst({ /* ... */ });
  res.write(\`data: \${JSON.stringify(video)}\\n\\n\`);

  // 2. Define the listener
  const onStatusChange = (payload: any) => {
    res.write(\`event: statusChange\\ndata: \${JSON.stringify(payload)}\\n\\n\`);
  };

  // 3. Start listening to the Bus
  videoUpdates.on(\`status_\${bunnyVideoId}\`, onStatusChange);

  // 4. Cleanup on disconnect (CRITICAL)
  req.on('close', () => {
    videoUpdates.off(\`status_\${bunnyVideoId}\`, onStatusChange);
    res.end();
  });
}`} 
            />
          </div>
        </div>
      </section>

      <section id="frontend">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">3. The Frontend Logic (Vue 3)</h2>
        <p className="text-slate-600 mb-4 text-sm">In Vue, use <code className="bg-slate-100 px-1 rounded">EventSource</code> with listeners for both initial state and live updates.</p>
        <CodeBlock 
          language="typescript"
          code={`const videoData = ref(null);
let es: EventSource;

onMounted(() => {
  es = new EventSource(getApiUrl(\`/video/stats/\${id}\`));

  // Handles the data: {...} lines (Initial load)
  es.onmessage = (e) => {
    videoData.value = JSON.parse(e.data);
  };

  // Handles the event: statusChange lines (Live updates)
  es.addEventListener('statusChange', (e) => {
    const update = JSON.parse(e.data);
    if (videoData.value?.short_video) {
       videoData.value.short_video.bunny_stream_status = update.new_status;
    }
  });
});

onUnmounted(() => es?.close());`} 
        />
      </section>

      <section id="pitfalls">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">4. Common Pitfalls to Avoid</h2>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold text-slate-900">Problem</th>
                <th className="px-4 py-3 font-bold text-slate-900">Solution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Nginx/Proxies Timeout</td>
                <td className="px-4 py-3 text-slate-600">Send a <code className="bg-slate-100 px-1 rounded">: keep-alive\n\n</code> comment every 30 seconds.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Memory Leaks</td>
                <td className="px-4 py-3 text-slate-600">Always use <code className="bg-slate-100 px-1 rounded">req.on('close')</code> to remove listeners.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">Browser Limit</td>
                <td className="px-4 py-3 text-slate-600">Browsers allow only 6 SSE connections per domain. Use HTTP/2 if more are needed.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">JSON Parse Errors</td>
                <td className="px-4 py-3 text-slate-600">Wrap <code className="bg-slate-100 px-1 rounded">JSON.parse</code> in a try/catch. SSE data is always a string.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="reconnection">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">5. Reconnection Strategy</h2>
        <p className="text-slate-600 mb-4 text-sm">
          Standard <code className="bg-slate-100 px-1 rounded">EventSource</code> has built-in reconnection, but it's often too simple. For robust apps, implement a custom strategy that handles the "Initial State" on every reconnect.
        </p>
        <CodeBlock 
          language="typescript"
          code={`function connectSSE() {
  const es = new EventSource('/api/video/stats');

  es.onopen = () => {
    console.log('Connected to SSE');
  };

  es.onerror = (err) => {
    console.error('SSE Error, reconnecting in 5s...', err);
    es.close();
    
    // Exponential backoff or simple timeout
    setTimeout(() => {
      connectSSE();
    }, 5000);
  };

  // ... other listeners ...
}

connectSSE();`} 
        />
      </section>

      <section id="next-steps" className="pt-8">
        <div className="bg-indigo-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
          <p className="mb-6 opacity-90">Would you like me to show you how to implement a <strong>Reconnection Strategy</strong> on the frontend, so if the user's internet flickers, the status tracker automatically reconnects?</p>
          <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
            Learn Reconnection Strategy
          </button>
        </div>
      </section>
    </article>
  );
};

export default SSEGuide;
