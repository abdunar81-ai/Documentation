import React, { useState } from 'react';
import { Icon } from '@iconify/react';

export const CodeBlock = ({ code, language = 'bash' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-100/50">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{language}</span>
        <button 
          onClick={handleCopy}
          className="text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1 text-xs font-medium"
        >
          {copied ? <Icon icon="lucide:check" width="14" className="text-emerald-500" /> : <Icon icon="lucide:copy" width="14" />}
          {copied ? <span className="text-emerald-500">Copied!</span> : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-slate-800 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export const InlineCode = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <code className={`bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-md text-[0.875em] font-mono border border-slate-200/60 ${className}`}>
    {children}
  </code>
);

export const Callout = ({ title, children, type = 'info' }: { title?: string; children: React.ReactNode; type?: 'info' | 'warning' | 'error' }) => {
  const isWarning = type === 'warning';
  const isError = type === 'error';
  
  let bgColor = 'bg-blue-50/50 border-blue-500 text-slate-700';
  let iconColor = 'text-blue-500';
  let titleColor = 'text-slate-900';

  if (isWarning) {
    bgColor = 'bg-amber-50 border-amber-500 text-amber-900';
    iconColor = 'text-amber-500';
    titleColor = 'text-amber-900';
  } else if (isError) {
    bgColor = 'bg-red-50 border-red-500 text-red-900';
    iconColor = 'text-red-500';
    titleColor = 'text-red-900';
  }

  return (
    <div className={`my-8 p-5 rounded-xl border-l-4 flex gap-4 ${bgColor}`}>
      <div className="shrink-0 mt-0.5">
        {isError ? <Icon icon="lucide:alert-triangle" width="20" className={iconColor} /> : <Icon icon="lucide:info" className={iconColor} width="20" />}
      </div>
      <div>
        {title && <h4 className={`font-semibold mb-1 ${titleColor}`}>{title}</h4>}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
};

export const StepHeader = ({ number, title, icon }: { number: number; title: string; icon: string }) => (
  <div className="flex items-center gap-4 mt-16 mb-6 pb-2 border-b border-slate-100">
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 font-bold border border-indigo-100/50 shadow-sm">
      {number}
    </div>
    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
      {title}
      <Icon icon={icon} className="text-slate-300" width="24" />
    </h2>
  </div>
);
