import React from 'react';
import { Icon } from '@iconify/react';
import { CodeBlock } from './Shared';

const RecoveryGuide = () => {
  return (
    <article>
      <h1 id="overview" className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Recovery & Baselining Protocol</h1>
      <p className="text-xl text-slate-600 mb-10 leading-relaxed">
        Learn how to restore synchronization between Prisma Schema and an existing database without data loss, even when drift is detected.
      </p>

      <div className="bg-amber-50 border-l-4 border-amber-400 p-6 my-8 rounded-r-lg">
        <div className="flex items-center gap-3 text-amber-800 font-bold mb-2">
          <Icon icon="lucide:alert-circle" width="20" />
          <span>The Reset Trap</span>
        </div>
        <p className="text-amber-900 text-sm leading-relaxed">
          If <code>prisma migrate dev</code> asks to <strong>Reset the database</strong>, it will drop all schemas and tables. If you have production or legacy data, you must follow the baselining protocol instead.
        </p>
      </div>

      <section id="safety" className="mt-16">
        <h2 className="text-2xl font-bold border-b border-slate-200 pb-2 mb-6 tracking-tight">1. Safety First</h2>
        <p className="text-slate-700 leading-relaxed">
          Before any manual intervention, secure your data. Perform a full dump of your current database state.
        </p>
        <CodeBlock 
          language="bash"
          code="pg_dump -U postgres -h localhost -d my_app_db > backup.sql" 
        />
      </section>

      <section id="surgery" className="mt-16">
        <h2 className="text-2xl font-bold border-b border-slate-200 pb-2 mb-6 tracking-tight">2. Database Surgery</h2>
        <p className="text-slate-700 leading-relaxed mb-4">
          Prisma fails when the migration history is desynced or when it encounters native constraints it can't map. We must clear the history log and fix structural conflicts.
        </p>
        <div className="bg-blue-50 border-l-4 border-[#5A67D8] p-6 my-6 rounded-r-lg">
          <div className="flex items-center gap-2 text-[#5A67D8] font-bold mb-2 uppercase text-xs tracking-wider">
            <Icon icon="lucide:info" width="16" />
            <span>Pro Tip</span>
          </div>
          <p className="text-slate-700 text-sm">
            Prisma requires Primary Keys to be <code>NOT NULL</code>. If your legacy DB has nullable IDs, migration will crash with <strong>P3006</strong>.
          </p>
        </div>
        <CodeBlock 
          language="sql"
          code={`-- Clear corrupted migration history
DROP TABLE IF EXISTS "_prisma_migrations";

-- Fix Primary Key nullability conflicts
ALTER TABLE "users" ALTER COLUMN "id" SET NOT NULL;

-- Remove native constraints that block Prisma's shadow engine
ALTER TABLE "league_entries" DROP CONSTRAINT IF EXISTS "check_league_type";`} 
        />
      </section>

      <section id="cleanup" className="mt-16">
        <h2 className="text-2xl font-bold border-b border-slate-200 pb-2 mb-6 tracking-tight">3. Environment Cleanup</h2>
        <p className="text-slate-700 leading-relaxed">
          Delete the old, conflicting migration files from your local project to prevent checksum errors.
        </p>
        <CodeBlock 
          code="# Windows (CMD)
rmdir /s /q prisma\\migrations

# Mac / Linux
rm -rf prisma/migrations" 
        />
      </section>

      <section id="baseline" className="mt-16">
        <h2 className="text-2xl font-bold border-b border-slate-200 pb-2 mb-6 tracking-tight">4. Baselining Protocol</h2>
        <p className="text-slate-700 leading-relaxed">
          The final step is to "lie" to Prisma's history log, telling it that the current state is the official starting point.
        </p>
        <div className="space-y-8 mt-6">
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="bg-slate-200 text-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
              Introspect Database
            </h4>
            <p className="text-sm text-slate-500 mb-2 px-7 italic">Align the schema file with physical tables.</p>
            <CodeBlock code="npx prisma db pull" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="bg-slate-200 text-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
              Generate Baseline Script
            </h4>
            <p className="text-sm text-slate-500 mb-2 px-7 italic">Create the baseline folder and SQL file.</p>
            <CodeBlock code="npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --output prisma/migrations/0_init/migration.sql" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="bg-slate-200 text-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
              Apply to History
            </h4>
            <p className="text-sm text-slate-500 mb-2 px-7 italic">Record the migration as applied without executing it.</p>
            <CodeBlock code="npx prisma migrate resolve --applied 0_init" />
          </div>
        </div>
      </section>

      <section id="future" className="mt-20 pt-10 border-t border-slate-200">
        <h2 className="text-2xl font-bold tracking-tight mb-4 text-slate-900">Next Steps</h2>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Now that your database is in sync, you can proceed with your development. To avoid future drift issues, follow the best practices outlined in this guide.
        </p>
      </section>
    </article>
  );
};

export default RecoveryGuide;
