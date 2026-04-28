import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { CodeBlock, InlineCode, Callout, StepHeader } from './Shared';

export default function CICDDocs() {
  const [config, setConfig] = useState({
    serverIp: '1.2.3.4',
    serverUser: 'ubuntu',
    appName: 'meyram-api',
    targetPath: '/var/www/my-app',
  });

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  return (
    <article className="space-y-12 pb-20">
      <section id="intro">
         <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
               <Icon icon="lucide:server" className="text-indigo-600" />
               CI/CD Workflow
             </h1>
             <p className="text-slate-500 mt-1 text-sm leading-relaxed">
               Zero-downtime deployments with GitHub Actions, PM2, and Nginx.
             </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full text-indigo-700 text-sm font-bold shadow-sm flex items-center gap-2 shrink-0">
             <Icon icon="lucide:zap" width="16" />
             VPS + SSH
          </div>
        </div>

        {/* Dynamic Config */}
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl mb-10">
          <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold text-sm">
            <Icon icon="lucide:settings" />
            Workflow Variables
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Server IP</label>
              <input type="text" name="serverIp" value={config.serverIp} onChange={handleConfigChange} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">SSH User</label>
              <input type="text" name="serverUser" value={config.serverUser} onChange={handleConfigChange} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">PM2 App Name</label>
              <input type="text" name="appName" value={config.appName} onChange={handleConfigChange} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Path</label>
              <input type="text" name="targetPath" value={config.targetPath} onChange={handleConfigChange} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none" />
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-16">
        <section id="step-1">
          <StepHeader number={1} title="Server Auth Protocol" icon="lucide:key" />
          <p className="text-sm text-slate-600 mb-6">Create a dedicated SSH key pair on your VPS to allow passwordless entry from GitHub.</p>
          <CodeBlock 
            language="bash" 
            code={`# 1. Generate Deploy Key
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy_key -N ""

# 2. Authorize it
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 3. Copy the Private Key for GitHub
cat ~/.ssh/github_deploy_key`} 
          />
        </section>

        <section id="step-2">
          <StepHeader number={2} title="Cloud Vault Setup" icon="lucide:shield" />
          <p className="text-sm text-slate-600 mb-6 font-medium">Add these Secrets to GitHub Settings {'>'} Actions:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'SERVER_IP', value: config.serverIp },
              { label: 'SERVER_USER', value: config.serverUser },
              { label: 'SSH_PRIVATE_KEY', value: 'Value from cat github_deploy_key' }
            ].map((s, i) => (
              <div key={i} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</div>
                <div className="text-xs font-mono text-indigo-600 truncate">{s.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="step-3">
          <StepHeader number={3} title="Workflow Orchestration" icon="lucide:github" />
          <p className="text-sm text-slate-600 mb-6">Deploy this configuration to <InlineCode>.github/workflows/deploy.yml</InlineCode>.</p>
          <CodeBlock 
            language="yaml" 
            code={`name: Live Release

on:
  push:
    branches: [ main ]

jobs:
  ship:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Assets
        run: npm ci && npm run build

      - name: Sync Artifacts (SCP)
        uses: appleboy/scp-action@v0.1.7
        with:
          host: \${{ secrets.SERVER_IP }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          source: "dist/*"
          target: "${config.targetPath}"
          strip_components: 1

      - name: Thermal Reload (PM2)
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: \${{ secrets.SERVER_IP }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            pm2 reload ${config.appName} || pm2 start npm --name "${config.appName}" -- start`} 
          />
        </section>

        <section id="step-pm2">
          <StepHeader number={4} title="PM2 Micro-tuning" icon="lucide:activity" />
          <p className="text-sm text-slate-600 mb-6">Use an ecosystem file for atomic control over environment variables.</p>
          <CodeBlock 
            language="javascript" 
            code={`// ecosystem.config.js
module.exports = {
  apps: [{
    name: "${config.appName}",
    script: "npm",
    args: "start",
    env: { 
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}`} 
          />
        </section>

        <section id="step-4">
          <StepHeader number={5} title="Proxy Edge Config" icon="lucide:network" />
          <p className="text-sm text-slate-600 mb-6">Verify your Nginx server block matches the target path.</p>
          <CodeBlock 
            language="nginx" 
            code={`server {
    listen 80;
    server_name example.com;
    root ${config.targetPath};
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}`} 
          />
        </section>
      </div>

      <div id="troubleshoot" className="pt-12">
        <Callout title="Common Connection Pitfalls" type="error">
          <ul className="list-disc ml-5 space-y-2 text-sm text-slate-600">
            <li><strong>Key Header:</strong> Ensure private key starts with <InlineCode>-----BEGIN OPENSSH PRIVATE KEY-----</InlineCode>.</li>
            <li><strong>Line Breaks:</strong> Do not collapse the private key into a single line.</li>
            <li><strong>Permissions:</strong> Target path must be owned by <InlineCode>{config.serverUser}</InlineCode>.</li>
          </ul>
        </Callout>
      </div>
    </article>
  );
}

