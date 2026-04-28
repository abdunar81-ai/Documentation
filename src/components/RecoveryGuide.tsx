import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { CodeBlock, InlineCode, Callout, StepHeader } from './Shared';

const RecoveryGuide = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (step: number) => {
    setCompletedSteps(prev => 
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    );
  };

  const progress = Math.round((completedSteps.length / 4) * 100);

  return (
    <article className="space-y-12 pb-20">
      <section id="overview">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
               <Icon icon="lucide:shield-alert" className="text-red-500" />
               Recovery & Baselining
             </h1>
             <p className="text-slate-500 mt-1 text-sm leading-relaxed">
               Restore sync between Prisma and an existing database without data loss.
             </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-2xl">
             <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-500" 
                  style={{ width: `${progress}%` }} 
                />
             </div>
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{progress}% Restored</span>
          </div>
        </div>

        <Callout type="error" title="Critical Warning: The Reset Trap">
          If <InlineCode>prisma migrate dev</InlineCode> asks to <strong>Reset the database</strong>, it will drop all tables. 
          Stop immediately. Follow this baselining protocol instead.
        </Callout>
      </section>

      <div className="space-y-16">
        <section id="safety">
          <StepHeader number={1} title="Data Lockdown" icon="lucide:lock" />
          <p className="text-sm text-slate-600 mb-6">Before any manual intervention, perform a full raw SQL dump of your current state.</p>
          <CodeBlock 
            language="bash"
            code="pg_dump -U postgres -h localhost -d my_app_db > backup.sql" 
          />
          <button 
            onClick={() => toggleStep(1)}
            className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              completedSteps.includes(1) 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Icon icon={completedSteps.includes(1) ? "lucide:check-circle" : "lucide:circle"} />
            {completedSteps.includes(1) ? 'Backup Verified' : 'Mark as Backed Up'}
          </button>
        </section>

        <section id="surgery">
          <StepHeader number={2} title="Structural Correction" icon="lucide:activity" />
          <p className="text-sm text-slate-600 mb-6">Prisma fails if migration history is corrupted. Clear the meta-table and fix ID nullability conflicts.</p>
          <CodeBlock 
            language="sql"
            code={`-- Remove corrupted metadata
DROP TABLE IF EXISTS "_prisma_migrations";

-- Ensure IDs are NOT NULL (Required for Prisma)
ALTER TABLE "users" ALTER COLUMN "id" SET NOT NULL;`} 
          />
          <button 
            onClick={() => toggleStep(2)}
            className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              completedSteps.includes(2) 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Icon icon={completedSteps.includes(2) ? "lucide:check-circle" : "lucide:circle"} />
            {completedSteps.includes(2) ? 'Schema Sanitized' : 'Confirm Schema Cleanup'}
          </button>
        </section>

        <section id="cleanup">
          <StepHeader number={3} title="Migration Purge" icon="lucide:trash-2" />
          <p className="text-sm text-slate-600 mb-6">Delete the physical migration files from your folder to resolve checksum checksum conflicts.</p>
          <CodeBlock 
            language="bash" 
            code="# Linux / Mac
rm -rf prisma/migrations

# Windows
rmdir /s /q prisma\\migrations" 
          />
          <button 
            onClick={() => toggleStep(3)}
            className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              completedSteps.includes(3) 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Icon icon={completedSteps.includes(3) ? "lucide:check-circle" : "lucide:circle"} />
            {completedSteps.includes(3) ? 'Files Purged' : 'Mark as Purged'}
          </button>
        </section>

        <section id="baseline">
          <StepHeader number={4} title="Baselining Registry" icon="lucide:list-checks" />
          <p className="text-sm text-slate-600 mb-6">Mirror your schema with the DB and manually record the 'init' state in the history log.</p>
          <div className="space-y-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Step A: Introspect</div>
               <CodeBlock language="bash" code="npx prisma db pull" />
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Step B: Generate Initial SQL</div>
               <CodeBlock language="bash" code="npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --output prisma/migrations/0_init/migration.sql" />
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-left">
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Step C: Resolve (Soft Apply)</div>
               <CodeBlock language="bash" code="npx prisma migrate resolve --applied 0_init" />
            </div>
          </div>
          <button 
            onClick={() => toggleStep(4)}
            className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              completedSteps.includes(4) 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Icon icon={completedSteps.includes(4) ? "lucide:check-circle" : "lucide:circle"} />
            {completedSteps.includes(4) ? 'Baseline Established' : 'Finalize Baseline'}
          </button>
        </section>
      </div>

      {progress === 100 && (
        <section className="pt-12">
          <div className="p-8 rounded-3xl bg-emerald-600 text-white shadow-xl shadow-emerald-200">
            <h3 className="text-2xl font-bold mb-2">System Restored</h3>
            <p className="opacity-90 leading-relaxed mb-6">
              Prisma is now in sync with your physical database. Future migrations can now proceed normally without data loss.
            </p>
            <div className="flex gap-4">
               <button className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-xl text-sm">Verify with introspection</button>
            </div>
          </div>
        </section>
      )}
    </article>
  );
};

export default RecoveryGuide;

