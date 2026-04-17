import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const ConflictResolver = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [copied, setCopied] = useState(false);

  const steps = [
      {
        id: 1,
        title: "Connect to Server",
        icon: "lucide:server",
        description: "Securely connect to your remote database so we can see its current state.",
        command: "ssh -L 6000:localhost:5432 user@remote-host",
        env: 'DATABASE_URL="postgresql://...localhost:6000/db"',
        status: 'active'
      },
      {
        id: 2,
        title: "Fetch Database State",
        icon: "lucide:database",
        description: "Download the actual structure of your remote database into your project.",
        command: "npx prisma db pull",
        status: 'pending'
      },
      {
        id: 3,
        title: "Align Local Files",
        icon: "lucide:refresh-ccw",
        description: "Update your local environment and prepare the synchronization files.",
        command: "npx prisma migrate dev --name sync_changes",
        status: 'pending'
      },
      {
        id: 4,
        title: "Finalize Synchronization",
        icon: "lucide:shield-check",
        description: "Tell the server that everything is now in sync and ready to go.",
        command: "npx prisma migrate resolve --applied 2023_sync_changes",
        status: 'pending'
      }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Live Guide
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Database Sync Wizard</h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            A step-by-step assistant to help you align your local database schema with the remote server.
          </p>
        </div>
        
        <div className="flex items-center gap-3 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <div className="px-4 py-2 bg-white rounded-lg shadow-sm text-xs font-bold text-slate-700 flex items-center gap-2">
            <Icon icon="lucide:check-circle" className="text-emerald-500" />
            System Ready
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Progress Timeline */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">Workflow Progress</h3>
            <div className="space-y-1">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                    activeStep === step.id 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-[1.02] z-10' 
                      : 'hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl font-mono text-sm font-bold transition-colors ${
                    activeStep === step.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                  }`}>
                    0{step.id}
                  </div>
                  <div className="text-left">
                    <div className={`text-sm font-bold ${activeStep === step.id ? 'text-white' : 'text-slate-700'}`}>
                      {step.title}
                    </div>
                    <div className={`text-[10px] uppercase tracking-wider font-medium opacity-60`}>
                      {activeStep > step.id ? 'Completed' : activeStep === step.id ? 'In Progress' : 'Pending'}
                    </div>
                  </div>
                  {activeStep > step.id && (
                    <Icon icon="lucide:check" className="ml-auto w-5 h-5 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Tip */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative group">
            <Icon icon="lucide:lightbulb" className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            <h4 className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-3">Pro Tip</h4>
            <p className="text-sm text-slate-300 leading-relaxed relative z-10">
              Always backup your local <code className="text-indigo-300">schema.prisma</code> before performing a <code className="text-indigo-300">db pull</code> to avoid losing custom attributes.
            </p>
          </div>
        </div>

        {/* Right: Active Step Detail */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <Icon icon={steps[activeStep - 1].icon} className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Phase 0{activeStep}</div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{steps[activeStep - 1].title}</h2>
                  </div>
                </div>
                <p className="text-slate-500 text-lg leading-relaxed max-w-xl">
                  {steps[activeStep - 1].description}
                </p>
              </div>
            </div>

            {/* Interactive Terminal */}
            <div className="space-y-6 flex-1">
              <div className="group relative bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Icon icon="lucide:terminal" className="w-3 h-3" /> bash
                  </div>
                </div>
                <div className="p-8 md:p-10 font-mono text-base md:text-lg">
                  <div className="flex items-start gap-4">
                    <span className="text-indigo-500 font-bold select-none mt-1">❯</span>
                    <code className="text-slate-100 break-all leading-relaxed">
                      {steps[activeStep - 1].command}
                    </code>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(steps[activeStep - 1].command)}
                    className="absolute right-6 bottom-6 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Icon icon="lucide:check" className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Icon icon="lucide:copy" className="w-3 h-3" />
                        <span>Copy Command</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {steps[activeStep - 1].env && (
                <div className="p-6 bg-indigo-50/30 border border-indigo-100/50 rounded-3xl">
                  <div className="flex items-center gap-2 text-indigo-600 text-[10px] font-bold uppercase mb-4 tracking-widest">
                    <Icon icon="lucide:settings-2" className="w-4 h-4" /> Required Env
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm font-mono text-sm text-indigo-900 overflow-x-auto">
                    {steps[activeStep - 1].env}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-12 flex items-center justify-between gap-4">
              <button 
                disabled={activeStep === 1}
                onClick={() => setActiveStep(prev => prev - 1)}
                className="px-8 py-4 rounded-2xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Icon icon="lucide:arrow-left" className="w-4 h-4" />
                Back
              </button>
              
              <button 
                onClick={() => activeStep < 4 ? setActiveStep(prev => prev + 1) : null}
                className={`flex-1 md:flex-none px-12 py-4 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-xl ${
                  activeStep === 4 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                }`}
              >
                {activeStep === 4 ? "Finish Guide" : "Continue"}
                <Icon icon={activeStep === 4 ? "lucide:check" : "lucide:arrow-right"} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolver;

