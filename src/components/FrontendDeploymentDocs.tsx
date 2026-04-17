import React from 'react';
import { Icon } from '@iconify/react';
import { CodeBlock, InlineCode, Callout, StepHeader } from './Shared';

const FrontendDeploymentDocs = () => {
  return (
    <article className="space-y-12">
      <section id="overview">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Frontend Deployment Guide</h1>
        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
          Complete end-to-end guide for deploying your Vue/Vite frontend to <InlineCode>new-admin.meyram.kz</InlineCode>, including Nginx optimization and HTTPS security.
        </p>
        
        <div className="flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-sm">
          <Icon icon="lucide:info" width="20" />
          <p>Steps marked as <span className="font-bold uppercase">(Skippable)</span> involve software you likely already have installed.</p>
        </div>
      </section>

      <section id="phase-1">
        <StepHeader number={1} title="Prepare the Server Directory" icon="lucide:folder-plus" />
        <p className="text-slate-700 leading-relaxed mb-6">
          Create a dedicated home for your compiled dashboard files and ensure permissions allow Nginx to serve them securely.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 mb-3">1. Create the web directory</h3>
        <CodeBlock 
          language="bash"
          code={`sudo mkdir -p /var/www/new-admin.meyram.kz`} 
        />

        <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">2. Transfer build files</h3>
        <p className="text-slate-600 text-sm mb-4 italic">
          Run <InlineCode>npm run build</InlineCode> locally, then move the <InlineCode>dist</InlineCode> contents to the server.
        </p>
        <Callout type="info" title="CI/CD Note">
          If using GitHub Actions, ensure your deployment script syncs the <InlineCode>dist</InlineCode> output directly to <InlineCode>/var/www/new-admin.meyram.kz/</InlineCode> via SSH.
        </Callout>

        <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">3. Set directory permissions</h3>
        <CodeBlock 
          language="bash"
          code={`# Assign ownership to the web server user
sudo chown -R www-data:www-data /var/www/new-admin.meyram.kz
sudo chmod -R 755 /var/www/new-admin.meyram.kz`} 
        />
      </section>

      <section id="phase-2">
        <StepHeader number={2} title="Nginx Site Configuration" icon="lucide:settings" />
        <p className="text-slate-700 leading-relaxed mb-6">
          Configure Nginx to route traffic to your static files and handle Vue Router's history mode.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 mb-3">1. Create the configuration file</h3>
        <CodeBlock 
          language="bash"
          code={`sudo nano /etc/nginx/sites-available/new-admin.meyram.kz`} 
        />

        <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">2. Add optimized Vite configuration</h3>
        <CodeBlock 
          language="nginx"
          code={`server {
    listen 80;
    server_name new-admin.meyram.kz;

    root /var/www/new-admin.meyram.kz;
    index index.html;

    # Gzip compression for faster loading
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Essential for Vue Router (History Mode)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache Vite hashed assets for 1 year
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logging
    error_log  /var/log/nginx/new-admin-error.log;
    access_log /var/log/nginx/new-admin-access.log;
}`} 
        />
      </section>

      <section id="phase-3">
        <StepHeader number={3} title="Enable the Site" icon="lucide:check-circle" />
        <p className="text-slate-700 leading-relaxed mb-6">
          Activate the configuration by linking it to the <InlineCode>sites-enabled</InlineCode> directory.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 mb-3">1. Create the symbolic link</h3>
        <CodeBlock 
          language="bash"
          code={`sudo ln -s /etc/nginx/sites-available/new-admin.meyram.kz /etc/nginx/sites-enabled/`} 
        />

        <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">2. Test and Reload</h3>
        <CodeBlock 
          language="bash"
          code={`# Verify syntax
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx`} 
        />
      </section>

      <section id="phase-4">
        <StepHeader number={4} title="Secure with HTTPS (SSL)" icon="lucide:lock" />
        <p className="text-slate-700 leading-relaxed mb-6">
          Use Certbot to provision a free Let's Encrypt SSL certificate and force HTTPS.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 mb-3">1. Install Certbot <span className="text-slate-400 font-normal text-sm uppercase ml-2">(Skippable)</span></h3>
        <CodeBlock 
          language="bash"
          code={`sudo apt update
sudo apt install certbot python3-certbot-nginx`} 
        />

        <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">2. Obtain the Certificate</h3>
        <CodeBlock 
          language="bash"
          code={`sudo certbot --nginx -d new-admin.meyram.kz`} 
        />
        <ul className="mt-4 list-disc ml-6 space-y-2 text-sm text-slate-600">
          <li>Enter an admin email when prompted.</li>
          <li>Agree to the Terms of Service.</li>
          <li><span className="font-bold text-indigo-600">Crucial:</span> Select <span className="font-bold underline">Option 2 (Redirect)</span> to force HTTPS.</li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">3. Verify Auto-Renewal</h3>
        <CodeBlock 
          language="bash"
          code={`sudo certbot renew --dry-run`} 
        />
      </section>

      <section id="conclusion" className="pt-12 border-t border-slate-100">
        <div className="p-8 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-200">
          <h3 className="text-2xl font-bold mb-4">Deployment Complete!</h3>
          <p className="opacity-90 leading-relaxed mb-6">
            Your frontend is now live and secure at <InlineCode className="bg-white/20 text-white border-white/20">https://new-admin.meyram.kz</InlineCode>.
          </p>
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
            <Icon icon="lucide:github" width="20" />
            Update GitHub Actions Workflow
          </button>
        </div>
      </section>
    </article>
  );
};

export default FrontendDeploymentDocs;
