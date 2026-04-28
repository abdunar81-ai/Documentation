import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { CodeBlock, InlineCode, Callout, StepHeader } from './Shared';

const FrontendDeploymentDocs = () => {
  const [config, setConfig] = useState({
    domain: 'new-admin.meyram.kz',
    appPath: '/var/www/new-admin.meyram.kz',
  });

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  return (
    <article className="space-y-12 pb-20">
      <section id="overview">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
               <Icon icon="lucide:globe" className="text-indigo-600" />
               Frontend Deployment
             </h1>
             <p className="text-slate-500 mt-1 text-sm leading-relaxed">
               Best practices for deploying high-performance SPAs (React/Vue) using Nginx and SSL.
             </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-full text-emerald-700 text-sm font-bold shadow-sm flex items-center gap-2 shrink-0">
             <Icon icon="lucide:shield-check" width="16" />
             Nginx + Certbot
          </div>
        </div>

        {/* Dynamic Config */}
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl mb-10">
          <div className="flex items-center gap-2 mb-6 text-slate-800 font-bold">
            <Icon icon="lucide:settings" />
            Deployment Variables
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Domain Name</label>
              <input type="text" name="domain" value={config.domain} onChange={handleConfigChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Server Root Path</label>
              <input type="text" name="appPath" value={config.appPath} onChange={handleConfigChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-16">
        <section id="phase-1">
          <StepHeader number={1} title="Directory Infrastructure" icon="lucide:folder-plus" />
          <p className="text-sm text-slate-600 mb-6">Create the target directory and ensure the current user has ownership to prevent permission errors during deployment.</p>
          <CodeBlock 
            language="bash"
            code={`sudo mkdir -p ${config.appPath}
sudo chown -R $USER:$USER ${config.appPath}`} 
          />
        </section>

        <section id="phase-2">
          <StepHeader number={2} title="Nginx Configuration" icon="lucide:server" />
          <p className="text-sm text-slate-600 mb-6">Create a site configuration file in <InlineCode>/etc/nginx/sites-available/</InlineCode> with SPA fallback rules.</p>
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/80 bg-slate-800/30">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{config.domain}.conf</span>
              <Icon icon="lucide:copy" className="w-4 h-4 text-indigo-400 cursor-pointer" />
            </div>
            <div className="p-6 overflow-x-auto text-sm font-mono text-indigo-100/90 leading-relaxed">
<pre>{`server {
    listen 80;
    server_name ${config.domain};
    root ${config.appPath};
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Optimization: Cache static assets
    location ~* \\.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|otf|svg)$ {
        expires 6M;
        access_log off;
        add_header Cache-Control "public";
    }
}`}</pre>
            </div>
          </div>
        </section>

        <section id="phase-3">
          <StepHeader number={3} title="Enable site & Reload" icon="lucide:refresh-cw" />
          <p className="text-sm text-slate-600 mb-6">Link the configuration to <InlineCode>sites-enabled</InlineCode> and verify the syntax before reloading.</p>
          <CodeBlock 
            language="bash"
            code={`sudo ln -s /etc/nginx/sites-available/${config.domain} /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx`} 
          />
        </section>

        <section id="phase-4">
          <StepHeader number={4} title="Secure HTTPS with Certbot" icon="lucide:lock" />
          <p className="text-sm text-slate-600 mb-6">Automate SSL certificate generation and auto-renewal using Let's Encrypt.</p>
          <CodeBlock 
            language="bash"
            code={`sudo certbot --nginx -d ${config.domain}`} 
          />
          <Callout type="info" title="Automatic Renewal">
            Certbot automatically adds a timer to systemd. You can verify it with <InlineCode>sudo systemctl list-timers</InlineCode>.
          </Callout>
        </section>
      </div>

      <section id="best-practices" className="grid md:grid-cols-2 gap-8 pt-12 border-t border-slate-100">
         <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
           <h4 className="font-bold text-indigo-900 mb-2">Gzip Compression</h4>
           <p className="text-xs text-indigo-700 leading-relaxed">
             Always enable Gzip in your <InlineCode>nginx.conf</InlineCode> to reduce bundle size by up to 70%. Ensure <InlineCode>gzip_types</InlineCode> includes <InlineCode>application/javascript</InlineCode> and <InlineCode>text/css</InlineCode>.
           </p>
         </div>
         <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-2">Build Analysis</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Before deploying, run <InlineCode>npm run build</InlineCode> and check the <InlineCode>dist/</InlineCode> folder size. Use <InlineCode>rollup-plugin-visualizer</InlineCode> to find large dependencies.
            </p>
         </div>
      </section>
    </article>
  );
};

export default FrontendDeploymentDocs;

