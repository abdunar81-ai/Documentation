import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { InlineCode, Callout, StepHeader } from './Shared';

const DevTestingGuide = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [config, setConfig] = useState({
    dbUser: 'postgres',
    dbPassword: 'password',
    dbHost: 'localhost',
    dbName: 'my_database'
  });

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

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

  const toggleStep = (id: string) => {
    setCompletedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <article className="space-y-12 pb-20">
      <section id="manual">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Icon icon="lucide:database" className="text-indigo-600" />
              PostgreSQL Master Guide
            </h1>
            <p className="text-slate-500 mt-1 text-sm leading-relaxed">
              Complete reference for manual backups, automated resets, and determinisic testing environments.
            </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full text-indigo-700 text-sm font-bold shadow-sm flex items-center gap-2 shrink-0">
            <Icon icon="lucide:shield-check" width="16" />
            V12+ Compatible
          </div>
        </div>

        {/* Configuration Form */}
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl shadow-sm mb-10 transition-all hover:shadow-md">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
              <Icon icon="lucide:settings-2" className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Connection Variables</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'DB User', name: 'dbUser' },
              { label: 'Password', name: 'dbPassword' },
              { label: 'Host', name: 'dbHost' },
              { label: 'DB Name', name: 'dbName' }
            ].map((field) => (
              <div key={field.name} className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                <input 
                  type="text" 
                  name={field.name} 
                  value={(config as any)[field.name]} 
                  onChange={handleConfigChange} 
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-8">
          <StepHeader number={1} title="Manual CLI Snapshot" icon="lucide:terminal" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 group">
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-800/20">
                   <div className="flex items-center gap-2">
                     <Icon icon="lucide:terminal" className="w-3 h-3 text-slate-500" />
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Backup Bash/PS</span>
                   </div>
                   <button onClick={() => copyToClipboard(`$env:PGPASSWORD="${config.dbPassword}"; pg_dump -U ${config.dbUser} -h ${config.dbHost} -d ${config.dbName} -f backup.sql`, 'cli-1')} className="text-[10px] uppercase font-bold text-indigo-400 hover:text-white transition-colors">
                    {copiedId === 'cli-1' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-5 overflow-x-auto custom-scrollbar">
                  <code className="text-xs text-indigo-200/90 whitespace-pre">
                    {`# PowerShell Environment\n$env:PGPASSWORD="${config.dbPassword}";\npg_dump -U ${config.dbUser} -h ${config.dbHost} \\\n  -d ${config.dbName} -f backup.sql`}
                  </code>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic px-2">Creates a deterministic <InlineCode>backup.sql</InlineCode> for seeding.</p>
            </div>

            <div className="space-y-4">
               <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 relative overflow-hidden">
                 <Icon icon="lucide:info" className="absolute -right-4 -bottom-4 text-indigo-100" width="80" />
                 <h4 className="font-bold text-indigo-900 text-sm mb-2">Pro-Tip: Pruning</h4>
                 <p className="text-xs text-indigo-700 leading-relaxed">
                   Use the <InlineCode>--no-owner</InlineCode> and <InlineCode>--no-privileges</InlineCode> flags to make your backup portable across different database users and environments.
                 </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reset" className="space-y-8">
        <StepHeader number={2} title="Automated Teardown Logic" icon="lucide:cpu" />
        <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between px-8 py-4 border-b border-slate-800/80 bg-slate-800/30">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">resetDatabase.service.ts</span>
            </div>
            <button onClick={() => copyToClipboard('Full Source...', 'full-code')} className="text-xs text-indigo-400 font-bold hover:text-white transition-colors">
              {copiedId === 'full-code' ? 'Copied Full Source' : 'Copy Implementation'}
            </button>
          </div>
          <div className="p-8 overflow-x-auto text-sm font-mono text-indigo-100/90 leading-relaxed">
            <pre>{`async function runDatabaseReset() {
  const options = {
    env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD },
    shell: 'powershell.exe'
  };

  const commands = [
    // 1. Force release all locks & terminate connections
    \`psql -U \${user} -h \${host} -d postgres -c "
       SELECT pg_terminate_backend(pid) 
       FROM pg_stat_activity 
       WHERE datname = '\${config.dbName}';"\`,

    // 2. Atomic Drop & Reconstruction
    \`dropdb -U \${user} -h \${host} --if-exists \${config.dbName}\`,
    \`createdb -U \${user} -h \${host} -T template0 \${config.dbName}\`,

    // 3. Re-hydration from seeds
    \`psql -U \${user} -h \${host} -d \${config.dbName} -f "seeds/backup.sql"\`
  ].join('; ');

  return await execa(commands, options);
}`}</pre>
          </div>
        </div>
        <Callout type="warning" title="Memory & Locks">
          Always include Step 1 (terminate connections). If any client (Prisma Studio, etc.) is connected, the <InlineCode>dropdb</InlineCode> command will fail with a "database is being accessed by other users" error.
        </Callout>
      </section>

      <section id="route" className="pt-12 border-t border-slate-100">
         <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800">Deployment Strategy</h2>
              <ul className="space-y-6">
                 {[
                   { icon: 'lucide:lock', title: 'Route Protection', desc: 'Secure the reset endpoint with a custom header check (X-Cypress-Secret) and env validation.' },
                   { icon: 'lucide:activity', title: 'Migration Alignment', desc: 'Ensure your Prisma migrations table is included in the backup to avoid sync errors.' }
                 ].map((item, i) => (
                   <li key={i} className="flex gap-4">
                     <div className="p-2 bg-indigo-50 rounded-xl shrink-0 h-fit">
                       <Icon icon={item.icon} className="w-5 h-5 text-indigo-600" />
                     </div>
                     <div>
                       <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                       <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                     </div>
                   </li>
                 ))}
              </ul>
            </div>
            <div className="space-y-4">
               <h2 className="text-2xl font-bold text-slate-800 mb-4">Express Route Hook</h2>
               <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
                 <pre className="text-xs text-slate-600 leading-normal overflow-auto whitespace-pre-wrap">
{`app.post('/api/test/reset-db', async (req, res) => {
  if (process.env.NODE_ENV === 'production') return;
  if (req.headers['x-secret'] !== SECRET) return res.sendStatus(401);

  await runDatabaseReset();
  res.status(200).json({ message: 'Fresh State Loaded' });
})`}
                 </pre>
               </div>
            </div>
         </div>
      </section>
    </article>
  );
};

export default DevTestingGuide;






