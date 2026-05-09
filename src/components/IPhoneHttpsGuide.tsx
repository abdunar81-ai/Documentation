import React from 'react';
import { Icon } from '@iconify/react';
import { CodeBlock, InlineCode, Callout, StepHeader } from './Shared';

const IPhoneHttpsGuide = () => {
  return (
    <article className="space-y-12 pb-20">
      <section id="overview">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
               <Icon icon="lucide:smartphone" className="text-indigo-600" />
               iPhone Local HTTPS Setup
             </h1>
             <p className="text-slate-500 mt-1 text-sm leading-relaxed">
               The definitive setup to get your iPhone talking to your local environment with full camera access.
             </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full text-emerald-700 text-sm font-bold shadow-sm flex items-center gap-2 shrink-0">
             <Icon icon="lucide:shield-check" width="16" />
             Trusted CA
          </div>
        </div>

        <Callout type="info">
          We are going to make your computer a <strong>Certificate Authority</strong> so that your phone trusts your local IP address. This is required for things like Camera/Microphone APIs which require a secure context (HTTPS).
        </Callout>
      </section>

      <div className="space-y-16">
        <section id="step-1">
          <StepHeader number={1} title="Install mkcert" icon="lucide:download" />
          <p className="text-sm text-slate-600 mb-6">Since you are on Windows, we'll avoid complex package managers for this utility.</p>
          <ul className="list-decimal ml-6 space-y-3 text-sm text-slate-700">
            <li>Go to the <a href="https://github.com/FiloSottile/mkcert/releases" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold underline">mkcert GitHub Releases</a>.</li>
            <li>Download <InlineCode>mkcert-v1.4.4-windows-amd64.exe</InlineCode>.</li>
            <li>Rename it to <InlineCode>mkcert.exe</InlineCode> and move it into your project folder (e.g., <InlineCode>C:\MeyramVue</InlineCode>).</li>
          </ul>
        </section>

        <section id="step-2">
          <StepHeader number={2} title="Generate Certificates" icon="lucide:key" />
          <p className="text-sm text-slate-600 mb-6">Open <strong>PowerShell as Administrator</strong> in your project folder.</p>
          
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">1. Initialize mkcert</h4>
          <CodeBlock 
            language="powershell"
            code={`.\\mkcert.exe -install`} 
          />

          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-8 mb-3">2. Create the Certs</h4>
          <p className="text-sm text-slate-600 mb-3 italic">Find your Local IP using <InlineCode>ipconfig</InlineCode> (e.g., 192.168.1.5).</p>
          <CodeBlock 
            language="powershell"
            code={`# Replace 192.168.x.x with your real IP
.\\mkcert.exe localhost 127.0.0.1 ::1 192.168.x.x`} 
          />
          <p className="text-xs text-slate-500 mt-2 italic">This creates: <InlineCode>localhost+3.pem</InlineCode> and <InlineCode>localhost+3-key.pem</InlineCode>.</p>
        </section>

        <section id="step-3">
          <StepHeader number={3} title="iPhone Trust Config" icon="lucide:check-circle" />
          <p className="text-sm text-slate-600 mb-6 font-medium">This is the "secret sauce" that enables the camera.</p>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-700 mb-2">1. In PowerShell, run <InlineCode>.\\mkcert.exe -CAROOT</InlineCode> to find the root folder.</p>
              <p className="text-xs text-slate-700 mb-2">2. Transfer the <InlineCode>rootCA.pem</InlineCode> file from that folder to your iPhone (AirDrop, Email, etc).</p>
            </div>
            
            <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <h5 className="font-bold text-indigo-900 text-xs uppercase mb-3">On your iPhone Settings:</h5>
              <ul className="space-y-2 text-xs text-indigo-800 list-disc ml-4">
                <li>Open the file &rarr; Tap <strong>"Profile Downloaded"</strong> in Settings &rarr; <strong>Install</strong>.</li>
                <li><strong>CRITICAL:</strong> Go to <strong>Settings &gt; General &gt; About &gt; Certificate Trust Settings</strong>.</li>
                <li>Under "Enable full trust for root certificates," <strong>Toggle ON</strong> the switch for <InlineCode className="bg-indigo-600/10 border-indigo-200">mkcert</InlineCode>.</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="step-4">
          <StepHeader number={4} title="Vite (Frontend) Config" icon="lucide:code" />
          <p className="text-sm text-slate-600 mb-6">Update your <InlineCode>vite.config.ts</InlineCode> to use the generated PEM files.</p>
          <CodeBlock 
            language="typescript"
            code={`import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'fs';

export default defineConfig({
  plugins: [vue()],
  server: {
    https: {
      key: fs.readFileSync('./localhost+3-key.pem'),
      cert: fs.readFileSync('./localhost+3.pem'),
    },
    host: '0.0.0.0', // Allows connections from your local network
  }
});`} 
          />
        </section>

        <section id="step-5">
          <StepHeader number={5} title="Node.js (Backend) Config" icon="lucide:server" />
          <p className="text-sm text-slate-600 mb-6">Update your entry file (e.g., <InlineCode>main.ts</InlineCode>) to serve over HTTPS.</p>
          <CodeBlock 
            language="javascript"
            code={`const https = require('https');
const fs = require('fs');
const app = require('./app'); // Your Express app

const httpsOptions = {
  key: fs.readFileSync('./localhost+3-key.pem'),
  cert: fs.readFileSync('./localhost+3.pem'),
};

const server = https.createServer(httpsOptions, app);

server.listen(3000, '0.0.0.0', () => {
  console.log('Backend running on https://192.168.x.x:3000');
});`} 
          />
        </section>

        <section id="step-6">
          <StepHeader number={6} title="Environment Update" icon="lucide:file-text" />
          <p className="text-sm text-slate-600 mb-6">Point your frontend to the new HTTPS API endpoint.</p>
          <CodeBlock 
            language="env"
            code={`VITE_API_URL=https://192.168.x.x:3000`} 
          />
        </section>

        <section id="final-check">
          <div className="p-8 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-200">
            <h3 className="text-2xl font-bold mb-4">Deployment Ready!</h3>
            <p className="opacity-90 leading-relaxed mb-6">
              Restart your servers and open Safari on iPhone at <InlineCode className="bg-white/20 border-white/10 text-white">https://192.168.x.x:5173</InlineCode>. 
              You should see a green lock and the camera will work.
            </p>
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold">
              <Icon icon="lucide:shield-check" />
              SECURE CONTEXT ENABLED
            </div>
          </div>
          
          <Callout type="warning" title="Git Security">
            Add <InlineCode>*.pem</InlineCode> to your <InlineCode>.gitignore</InlineCode> immediately to avoid leaking local certificates.
          </Callout>
        </section>
      </div>
    </article>
  );
};

export default IPhoneHttpsGuide;
