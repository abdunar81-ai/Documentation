import React, { useState } from 'react';
import { Icon } from '@iconify/react';

export default function NuxtDeploymentGuide() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [config, setConfig] = useState({
    projectPath: '',
    gitUrl: '',
    port: '',
    pm2Name: '',
    domain: ''
  });

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const val = (key: keyof typeof config, fallback: string) => config[key] || fallback;

  const copyToClipboard = (text: string, id: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const steps = [
    {
      icon: "lucide:terminal",
      iconColor: "text-blue-500",
      title: "1. Clean Clone & Build",
      description: "Navigate to the folder, clone directly into it to avoid nested folders, install dependencies, and build the Nuxt app.",
      commands: [
        { label: "Clone repository", code: `cd ${val('projectPath', '<PROJECT_PATH>')}\ngit clone ${val('gitUrl', '<GIT_URL>')} .` },
        { label: "Install and build", code: "yarn install\nyarn build" }
      ]
    },
    {
      icon: "lucide:server",
      iconColor: "text-purple-500",
      title: "2. Start PM2 Process",
      description: `Run the Nuxt 3 Nitro server on port ${val('port', '<PORT>')} and save the PM2 list.`,
      commands: [
        { label: "Start and save", code: `PORT=${val('port', '<PORT>')} pm2 start .output/server/index.mjs --name "${val('pm2Name', '<PM2_APP_NAME>')}"\npm2 save` }
      ]
    },
    {
      icon: "lucide:file-code-2",
      iconColor: "text-emerald-500",
      title: "3. Configure Nginx",
      description: "Create the reverse proxy, fix symbols, and restart Nginx.",
      commands: [
        { label: "Create configuration file", code: `nano /etc/nginx/sites-available/${val('pm2Name', '<NGINX_FILE_NAME>')}` },
        { 
          label: "Nginx Server Block (Paste inside nano)", 
          code: `server {
    listen 80;
    listen [::]:80;
    server_name ${val('domain', '<YOUR_DOMAIN>')};

    location / {
        proxy_pass http://localhost:${val('port', '<PORT>')};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}` 
        },
        { label: "Enable site and restart", code: `rm -f /etc/nginx/sites-enabled/${val('domain', '<YOUR_DOMAIN>')}\nln -s /etc/nginx/sites-available/${val('pm2Name', '<NGINX_FILE_NAME>')} /etc/nginx/sites-enabled/\nnginx -t\nsystemctl restart nginx` }
      ]
    },
    {
      icon: "lucide:shield",
      iconColor: "text-amber-500",
      title: "4. Secure with SSL",
      description: "Run Certbot to automatically fetch an SSL certificate and redirect HTTP to HTTPS.",
      commands: [
        { label: "Run Certbot", code: `certbot --nginx -d ${val('domain', '<YOUR_DOMAIN>')}` }
      ]
    }
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <section id="config">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Nuxt Deployment Guide</h1>
            <p className="text-slate-500 mt-1">Interactive step-by-step configuration for production servers.</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full text-indigo-700 text-sm font-bold shadow-sm flex items-center gap-2">
            <Icon icon="lucide:check-circle-2" width="16" />
            Progress: {Object.values(completedSteps).filter(Boolean).length} / {steps.length}
          </div>
        </div>

        {/* Configuration Form */}
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <Icon icon="lucide:settings" className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">Project Variables</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Project Path</label>
              <input type="text" name="projectPath" value={config.projectPath} onChange={handleConfigChange} placeholder="/root/my-app" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Git URL</label>
              <input type="text" name="gitUrl" value={config.gitUrl} onChange={handleConfigChange} placeholder="https://github.com/..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Internal Port</label>
              <input type="text" name="port" value={config.port} onChange={handleConfigChange} placeholder="3000" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">App Name</label>
              <input type="text" name="pm2Name" value={config.pm2Name} onChange={handleConfigChange} placeholder="my-app-prod" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Domain Name</label>
              <input type="text" name="domain" value={config.domain} onChange={handleConfigChange} placeholder="app.domain.com" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, index) => {
          const isCompleted = completedSteps[index];
          
          return (
            <section 
              key={index} 
              id={`step-${index + 1}`}
              className={`p-6 rounded-2xl border transition-all duration-500 ${
                isCompleted 
                  ? 'bg-slate-50/50 border-emerald-200 shadow-inner' 
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              {/* Step Header */}
              <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shadow-sm border transition-colors ${isCompleted ? 'bg-white border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                    <Icon icon={step.icon} className={`w-6 h-6 ${isCompleted ? 'text-emerald-500' : step.iconColor}`} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold transition-all ${isCompleted ? 'text-slate-400' : 'text-slate-900'}`}>
                      {step.title}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1 leading-relaxed">{step.description}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleStep(index)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <Icon icon="lucide:check" width="18" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <span>Mark Task Done</span>
                  )}
                </button>
              </div>

              {/* Commands */}
              <div className={`grid gap-4 transition-all duration-500 ${isCompleted ? 'opacity-40 pointer-events-none blur-[0.5px]' : 'opacity-100'}`}>
                {step.commands.map((cmd, cmdIdx) => {
                  const uniqueId = `${index}-${cmdIdx}`;
                  const isCopied = copiedId === uniqueId;
                  
                  return (
                    <div key={cmdIdx} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-800/20">
                        <div className="flex items-center gap-2">
                          <Icon icon="lucide:terminal" className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {cmd.label}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(cmd.code, uniqueId)}
                          className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all uppercase tracking-wider ${
                            isCopied ? 'text-emerald-400 bg-emerald-400/10' : 'text-indigo-400 hover:text-white hover:bg-indigo-500/20'
                          }`}
                        >
                          <Icon icon={isCopied ? "lucide:check" : "lucide:copy"} width="12" />
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <div className="p-4 overflow-x-auto custom-scrollbar">
                        <pre className="text-sm font-mono text-indigo-300 leading-relaxed whitespace-pre-wrap">
                          <code>{cmd.code}</code>
                        </pre>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
