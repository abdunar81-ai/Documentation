import React, { useState } from 'react';
import { Key, Github, FileJson, Check, Copy, ArrowRight, Settings, Trash2 } from 'lucide-react';

const VpsDeployGuide = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [config, setConfig] = useState({
    appDir: '/root/meyramLanding',
    pm2Name: 'meyram-landing',
    branch: 'main'
  });

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const val = (key: keyof typeof config, fallback: string) => config[key] || fallback;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error('Copy failed', err);
    });
  };

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const steps = [
    {
      icon: <Key className="w-6 h-6 text-emerald-400" />,
      title: "1. Generate Server SSH Key",
      description: "Log into your VPS and generate a dedicated SSH key for GitHub Actions to use securely.",
      commands: [
        { label: "Generate the key (Press Enter when asked for passphrase)", code: "ssh-keygen -t ed25519 -C \"github-actions-deploy\" -f ~/.ssh/github_actions" },
        { label: "Authorize the key on your server", code: "cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys" },
        { label: "View and COPY the Private Key (Include BEGIN and END lines)", code: "cat ~/.ssh/github_actions" }
      ]
    },
    {
      icon: <Github className="w-6 h-6 text-white" />,
      title: "2. Add GitHub Repository Secrets",
      description: "Go to your GitHub Repo -> Settings -> Secrets and variables -> Actions. Add these 3 secrets:",
      commands: [
        { label: "Secret 1", code: "Name: SERVER_HOST\nSecret: <Your VPS IP Address>" },
        { label: "Secret 2", code: "Name: SERVER_USERNAME\nSecret: root" },
        { label: "Secret 3", code: "Name: SERVER_SSH_KEY\nSecret: <Paste the Private Key from Step 1>" }
      ]
    },
    {
      icon: <FileJson className="w-6 h-6 text-blue-400" />,
      title: "3. Create Workflow File",
      description: "In your project codebase, create the file .github/workflows/deploy.yml and paste this configuration.",
      commands: [
        {
          label: "deploy.yml (Your exact working script)",
          code: `name: Deploy to Production Server
on:
  push:
    branches:
      - ${val('branch', 'main')}
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Connect and Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: \${{ secrets.SERVER_HOST }}
          username: \${{ secrets.SERVER_USERNAME }}
          key: \${{ secrets.SERVER_SSH_KEY }}
          script: |
            set -e
            APP_DIR="${val('appDir', '/root/meyramLanding')}"
            
            echo "Deploying to $APP_DIR"
            cd "$APP_DIR"

            # Discard any local dirty changes on VPS and pull latest
            git fetch origin
            git reset --hard origin/${val('branch', 'main')}

            # Ensure yarn is installed
            if ! command -v yarn >/dev/null 2>&1; then
              echo "Yarn not found, installing via npm..."
              npm install -g yarn
            fi

            # Install dependencies (ignoring strict node version check)
            yarn install --frozen-lockfile --ignore-engines

            # Apply production database migrations
            npx prisma migrate deploy

            # Build project
            yarn build

            # Reload PM2 zero-downtime
            pm2 restart ${val('pm2Name', 'meyram-landing')}`
        }
      ]
    },
    {
      icon: <Trash2 className="w-6 h-6 text-red-400" />,
      title: "4. Clean Up Lockfiles (Optional but Recommended)",
      description: "To get rid of the yellow Yarn warnings in your pipeline logs, delete the NPM lockfile from your repo.",
      commands: [
        { label: "Remove NPM lockfile from git", code: "git rm package-lock.json\ngit commit -m \"chore: remove package-lock.json\"\ngit push" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 sm:p-8 font-sans rounded-3xl overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">VPS CI/CD Pipeline Guide</h1>
            <p className="text-slate-400">Automated GitHub Actions deployment for <span className="text-blue-400">{val('pm2Name', 'your app')}</span></p>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-full text-sm font-medium border border-slate-700 shadow-sm shrink-0">
            Progress: {Object.values(completedSteps).filter(Boolean).length} / {steps.length}
          </div>
        </header>

        {/* Configuration Form */}
        <div className="mb-8 p-6 bg-slate-800 rounded-2xl border border-slate-700 shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Pipeline Variables</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Server Project Path</label>
              <input type="text" name="appDir" value={config.appDir} onChange={handleConfigChange} placeholder="/root/my-app" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">PM2 Process Name</label>
              <input type="text" name="pm2Name" value={config.pm2Name} onChange={handleConfigChange} placeholder="my-app" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Git Branch to Deploy</label>
              <input type="text" name="branch" value={config.branch} onChange={handleConfigChange} placeholder="main" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isCompleted = completedSteps[index];
            const sectionId = `step-${index + 1}`;
            
            return (
              <div 
                key={index} 
                id={sectionId}
                className={`p-6 rounded-2xl border transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-slate-800/50 border-emerald-500/30' 
                    : 'bg-slate-800 border-slate-700 shadow-lg'
                }`}
              >
                {/* Step Header */}
                <div className="flex items-start justify-between mb-4 gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-slate-900 rounded-xl shadow-inner shrink-0">
                      {step.icon}
                    </div>
                    <div>
                      <h2 className={`text-xl font-semibold ${isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {step.title}
                      </h2>
                      <p className="text-slate-400 text-sm mt-1">{step.description}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleStep(index)}
                    className={`flex flex-shrink-0 items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isCompleted 
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Done</span>
                      </>
                    ) : (
                      <span>Mark Complete</span>
                    )}
                  </button>
                </div>

                {/* Commands */}
                <div className={`space-y-4 transition-all duration-300 ${isCompleted ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                  {step.commands.map((cmd, cmdIdx) => {
                    const uniqueId = `${index}-${cmdIdx}`;
                    const isCopied = copiedId === uniqueId;
                    
                    return (
                      <div key={cmdIdx} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700/50">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
                          <span className="text-xs font-mono text-slate-500 flex items-center">
                            <ArrowRight className="w-3 h-3 mr-2 text-blue-400" />
                            {cmd.label}
                          </span>
                          <button
                            onClick={() => copyToClipboard(cmd.code, uniqueId)}
                            className={`flex items-center space-x-1 text-xs px-2 py-1 rounded transition-colors ${
                              isCopied ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="p-4 overflow-x-auto">
                          <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap break-all">
                            <code>{cmd.code}</code>
                          </pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VpsDeployGuide;
