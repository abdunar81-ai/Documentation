import React from 'react';
import { Icon } from '@iconify/react';
import { CodeBlock, InlineCode, Callout, StepHeader } from './Shared';

export default function CICDDocs() {
  return (
    <div className="space-y-12">
      <div id="intro">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
          Full CI/CD Workflow: <br/>
          <span className="text-indigo-600">VPS + SSH + PM2</span>
        </h1>
        <p className="text-lg leading-relaxed text-slate-600 mb-8 max-w-3xl">
          Automate your deployment to an existing VPS setup using <InlineCode>Nginx</InlineCode> and <InlineCode>PM2</InlineCode>. 
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { title: 'Secure SSH', desc: 'Passwordless entry for GitHub into your server.' },
            { title: 'Auto Build', desc: 'Generate production bundles on every push.' },
            { title: 'PM2 Reload', desc: 'Zero-downtime restarts for your live processes.' }
          ].map((card, i) => (
            <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold mb-3">
                {i + 1}
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">{card.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1 */}
      <div id="step-1">
        <StepHeader number={1} title="Secure SSH Configuration" icon="lucide:key" />
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-xl">
          <p className="text-sm text-amber-900 flex items-center gap-2">
            <Icon icon="lucide:terminal" width="18" />
            <strong>Location:</strong> Run these commands on your <strong>VPS (Remote Server)</strong>.
          </p>
        </div>
        <p className="mb-6 leading-relaxed text-slate-600">
          Generate a specific key for GitHub to bypass standard password prompts.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3 flex items-center gap-2">
          <Icon icon="lucide:chevron-right" width="18" className="text-indigo-500" />
          1.1 Generate Deploy Key
        </h3>
        <CodeBlock 
          language="bash" 
          code={`ssh-keygen -t ed25519 -f ~/.ssh/github_deploy_key -N ""`} 
        />

        <h3 className="text-lg font-semibold text-slate-900 mt-10 mb-3 flex items-center gap-2">
          <Icon icon="lucide:chevron-right" width="18" className="text-indigo-500" />
          1.2 Authorize and Extract
        </h3>
        <p className="text-sm text-slate-500 mb-4 italic">
          This adds the key to your server's trusted list and prints the private key for GitHub.
        </p>
        <CodeBlock 
          language="bash" 
          code={`# Add public key to authorized_keys
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Print the PRIVATE key (Copy this for GitHub Secrets)
cat ~/.ssh/github_deploy_key`} 
        />
      </div>

      {/* STEP 2 */}
      <div id="step-2">
        <StepHeader number={2} title="GitHub Secrets" icon="lucide:github" />
        <p className="mb-6 leading-relaxed">
          Add these variables to <strong>Settings {'>'} Secrets and variables {'>'} Actions</strong>.
        </p>
        
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-900">Secret Name</th>
                <th className="px-4 py-3 font-semibold text-slate-900">Important Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-3 font-mono text-indigo-600">SERVER_IP</td>
                <td className="px-4 py-3">Your VPS Public IP.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-indigo-600">SERVER_USER</td>
                <td className="px-4 py-3">The SSH username (e.g. <InlineCode>ubuntu</InlineCode>).</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-indigo-600">SSH_PRIVATE_KEY</td>
                <td className="px-4 py-3 text-red-600 font-semibold underline">See Fix below if you get connection errors!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* TROUBLESHOOTING SECTION */}
      <div id="troubleshoot" className="scroll-mt-20">
        <Callout title="Fixing Connection Error" type="error">
          <strong>Error: can't connect without a private SSH key or password</strong>
          <p className="mt-2">If you see this in your GitHub Actions logs, follow these checks:</p>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-slate-600">
            <li><strong>Formatting:</strong> Ensure the secret value includes the headers: <br/> <InlineCode>-----BEGIN OPENSSH PRIVATE KEY-----</InlineCode> and <InlineCode>-----END OPENSSH PRIVATE KEY-----</InlineCode>.</li>
            <li><strong>Whitespace:</strong> Ensure there are no extra spaces at the end of the key or empty lines at the bottom.</li>
            <li><strong>Line Breaks:</strong> Make sure you copied the key exactly as it appeared in the terminal, including all line breaks.</li>
          </ul>
        </Callout>
      </div>

      {/* STEP 3 */}
      <div id="step-3">
        <StepHeader number={3} title="Workflow Configuration" icon="lucide:zap" />
        <p className="mb-4 leading-relaxed">
          Create <InlineCode>.github/workflows/deploy.yml</InlineCode>. Use the <InlineCode>key</InlineCode> parameter precisely as shown.
        </p>
        
        <CodeBlock 
          language="yaml" 
          code={`name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: |
          npm ci
          npm run build

      - name: Sync Files (SCP)
        uses: appleboy/scp-action@v0.1.7
        with:
          host: \${{ secrets.SERVER_IP }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          port: 22
          source: "dist/*"
          target: "/var/www/my-app"
          strip_components: 1

      - name: Reload PM2 (SSH)
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: \${{ secrets.SERVER_IP }}
          username: \${{ secrets.SERVER_USER }}
          key: \${{ secrets.SSH_PRIVATE_KEY }}
          port: 22
          script: |
            pm2 reload my-app-name || pm2 start npm --name "my-app-name" -- start`} 
        />
      </div>

      {/* PM2 SPECIFIC SECTION */}
      <div id="step-pm2">
        <StepHeader number={4} title="PM2 Best Practices" icon="lucide:terminal" />
        <p className="mb-4 leading-relaxed">Use an <InlineCode>ecosystem.config.js</InlineCode> to manage environment variables easily:</p>
        <CodeBlock 
          language="javascript" 
          code={`module.exports = {
  apps: [{
    name: "my-app-name",
    script: "npm",
    args: "start",
    env: { NODE_ENV: "production", PORT: 3000 }
  }]
}`} 
        />
      </div>

      {/* STEP 4 */}
      <div id="step-4">
        <StepHeader number={5} title="Nginx Verification" icon="lucide:server" />
        <p className="mb-4 leading-relaxed">Final server block configuration for serving the built assets.</p>
        <CodeBlock 
          language="nginx" 
          code={`server {
    listen 80;
    server_name example.com;
    root /var/www/my-app;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}`} 
        />
      </div>
    </div>
  );
}
