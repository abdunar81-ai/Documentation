import React from 'react';
import { CodeBlock } from './Shared';

const MemoryMonitorGuide = () => {
  return (
    <article className="space-y-12">
      <section id="monitoring">
        <h1 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">V8 Memory & Handle Monitoring</h1>
        <p className="text-slate-600 mb-6 text-sm leading-relaxed">
          To debug potential memory leaks or zombie handles in your Node.js application, you can use the built-in <code className="bg-slate-100 px-1 rounded">v8</code> module to monitor heap space and active handles.
        </p>

        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-8 rounded-r-lg">
          <p className="text-sm text-indigo-900">
            <strong>Pro Tip:</strong> Log active handles regularly. If this number grows continuously (e.g., reaching 1000+), you likely have a socket or connection leak.
          </p>
        </div>

        <CodeBlock 
          language="typescript"
          code={`import v8 from 'node:v8';

// Log V8 heap space breakdown every 60 seconds
const logMemoryUsage = () => {
  const mem = process.memoryUsage();
  console.log('[memory]', {
    'JS Objects (heapUsed)': \`\${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB\`,
    'C++ & Prisma Engine (external)': \`\${(mem.external / 1024 / 1024).toFixed(2)} MB\`,
    'File Buffers (arrayBuffers)': \`\${(mem.arrayBuffers / 1024 / 1024).toFixed(2)} MB\`,
  });

  // Log active handles (This tells us if "Zombies" are accumulating)
  // If this number grows to 1000+, you have a socket leak.
  // Use 'any' to bypass the TypeScript error for the internal method
  const activeHandles = (process as any)._getActiveHandles();

  console.log(\`[active-handles] \${activeHandles.length}\`);

  console.log('[heap spaces]');
  v8.getHeapSpaceStatistics().forEach((space) => {
    const usedMB = space.space_used_size / 1024 / 1024;
    if (usedMB > 1) {
      console.log(\`  \${space.space_name}: \${usedMB.toFixed(2)} MB\`);
    }
  });
};

// Run the logger every 60 seconds
setInterval(logMemoryUsage, 60000);`} 
        />
      </section>

      <section id="heap-breakdown">
        <h2 className="text-xl font-semibold text-slate-800 mb-4 font-mono">Heap Space Explanation</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase">New Space</h4>
            <p className="text-xs text-slate-500">Where most objects are initially allocated. High churn here is normal.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase">Old Space</h4>
            <p className="text-xs text-slate-500">Objects that survived multiple garbage collection cycles. Growth here suggests a leak.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase">Code Space</h4>
            <p className="text-xs text-slate-500">Used by the JIT compiler to store generated machine code.</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase">Large Object Space</h4>
            <p className="text-xs text-slate-500">Contains objects larger than the size limits of other spaces.</p>
          </div>
        </div>
      </section>
    </article>
  );
};

export default MemoryMonitorGuide;
