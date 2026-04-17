import React from 'react';
import { CodeBlock, InlineCode } from './Shared';

const DevTestingGuide = () => {
  return (
    <article className="space-y-12">
      <section id="manual">
        <h1 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Complete Guide: Backup & Replace PostgreSQL Database</h1>
        
        <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Create a SQL Backup</h2>
        <p className="text-slate-600 mb-4 text-sm">Use this command to export your database state to a file:</p>
        <CodeBlock 
          language="powershell"
          code={`$env:PGPASSWORD="husan2004"; pg_dump -U postgres -h localhost -d database_meyramappdb2 -f backup.sql`} 
        />
      </section>

      <section id="replace">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">2. Replace Database with Backup</h2>
        <p className="text-slate-600 mb-4 text-sm">Drop and recreate the database to replace data (e.g., 10 users → 9 users):</p>
        <div className="space-y-4">
          <CodeBlock 
            language="powershell"
            code={`$env:PGPASSWORD="husan2004"; dropdb -U postgres -h localhost --if-exists database_meyramappdb2
$env:PGPASSWORD="husan2004"; createdb -U postgres -h localhost -T template0 database_meyramappdb2
$env:PGPASSWORD="husan2004"; psql -U postgres -h localhost -d database_meyramappdb2 -f backup.sql`} 
          />
        </div>
        <div className="mt-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-sm font-medium rounded-r-lg">
          ✅ This ensures the database is fully replaced with data from <InlineCode>backup.sql</InlineCode>.
        </div>
      </section>

      <div className="border-t border-slate-200 my-12"></div>

      <section id="reset">
        <h1 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Robust Node.js Database Reset</h1>
        <p className="text-slate-600 mb-4 text-sm">
          Automated implementation with environment safety checks and connection termination.
        </p>
        <CodeBlock 
          language="typescript"
          code={`import { Request, Response } from 'express';
import path from 'path';
import { execa } from 'execa';

async function runDatabaseReset() {
  if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'development') {
    throw new Error('Database reset is only allowed in development environment');
  } else if (!process.env.DB_PASSWORD) {
    throw new Error('Database password is not set in environment variables');
  }
  if (!process.env.DB_USER || !process.env.DB_HOST || !process.env.DB_NAME) {
    throw new Error('Database connection details are not fully set in environment variables');
  }

  const backupPath = path.resolve(process.cwd(), 'backup.sql'); // Absolute path

  const dbUser = process.env.DB_USER;
  const dbHost = process.env.DB_HOST;
  const dbName = process.env.DB_NAME;

  const options = {
    env: {
      ...process.env,
      PGPASSWORD: process.env.DB_PASSWORD,
    },
    shell: 'powershell.exe', // Explicitly use PowerShell
  };

  const commands = [
    // Terminate all active connections
    \`psql -U \${dbUser} -h \${dbHost} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '\${dbName}';"\`,

    // Drop and recreate database
    \`dropdb -U \${dbUser} -h \${dbHost} --if-exists \${dbName}\`,
    \`createdb -U \${dbUser} -h \${dbHost} -T template0 \${dbName}\`,

    // Restore from backup
    \`psql -U \${dbUser} -h \${dbHost} -d \${dbName} -f "\${backupPath}"\`,
  ].join('; ');

  return await execa(commands, options);
}`} 
        />
      </section>

      <section id="route">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Express Route Handlers</h2>
        <CodeBlock 
          language="typescript"
          code={`export async function resetDatabase(req: Request, res: Response) {
  try {
    const log = await runDatabaseReset();
    console.log(log);
    return res.status(200).json({ message: 'Success', log });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed' });
  }
}

export async function resetAndSeedDatabase(req: Request, res: Response) {
  return res.status(404).json({ message: 'Resource stopped' }); // Immediate response to avoid timeout
}`} 
        />
      </section>

      <section id="endpoint">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Automated Backup Creation</h2>
        <CodeBlock 
          language="typescript"
          code={`export async function createBackup(req: Request, res: Response) {
  const filePath = path.resolve(process.cwd(), 'backup.sql');

  const options = {
    env: {
      ...process.env,
      PGPASSWORD: process.env.DB_PASSWORD,
    },
    shell: 'powershell.exe',
  };

  const dbUser = process.env.DB_USER;
  const dbHost = process.env.DB_HOST;
  const dbName = process.env.DB_NAME;

  const command = \`pg_dump -U \${dbUser} -h \${dbHost} -d \${dbName} -f "\${filePath}"\`;

  try {
    await execa(command, options);
    return res.status(200).json({ message: 'Backup created', file: filePath });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Backup failed' });
  }
}`} 
        />
      </section>
    </article>
  );
};

export default DevTestingGuide;




