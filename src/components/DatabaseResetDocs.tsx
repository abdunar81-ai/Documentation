import React from 'react';
import { Icon } from '@iconify/react';
import { CodeBlock, InlineCode, Callout, StepHeader } from './Shared';

const DatabaseResetDocs = () => {
  return (
    <article className="space-y-12">
      <section id="overview">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Automated Database Reset</h1>
        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
          Establish a deterministic testing environment by automating the teardown and reconstruction of your PostgreSQL database using native CLI tools and Express.
        </p>
        
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Icon icon="lucide:trash-2" className="text-red-500" />
              Teardown
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Drops the existing database and all active connections to ensure no stale data or locks persist between test runs.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Icon icon="lucide:seedling" className="text-emerald-500" />
              Reconstruction
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Creates a fresh database instance and seeds it using a pre-defined <InlineCode>backup.sql</InlineCode> snapshot.
            </p>
          </div>
        </div>
      </section>

      <section id="prerequisites">
        <h2 className="text-2xl font-bold border-b border-slate-200 pb-2 mb-6 tracking-tight">Prerequisites</h2>
        <p className="text-slate-700 mb-4">Ensure the PostgreSQL client tools are available in your system's <InlineCode>PATH</InlineCode>:</p>
        <ul className="list-disc ml-6 space-y-2 text-slate-600 mb-6">
          <li><InlineCode>pg_dump</InlineCode>: For creating the snapshot.</li>
          <li><InlineCode>dropdb</InlineCode> & <InlineCode>createdb</InlineCode>: For environment management.</li>
          <li><InlineCode>psql</InlineCode>: For executing the restoration script.</li>
        </ul>

        <h3 className="text-lg font-semibold text-slate-900 mb-3">Required Environment Variables</h3>
        <CodeBlock 
          language="env"
          code={`DB_NAME=my_app_test
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
CYPRESS_SECRET=super_secret_token_123`} 
        />
      </section>

      <section id="step-1">
        <StepHeader number={1} title="Creating the Initial Backup" icon="lucide:database-backup" />
        <p className="text-slate-700 leading-relaxed mb-4">
          Generate a "Golden Image" of your database. This snapshot should contain the minimal required state (users, roles, static data) for your tests to run.
        </p>
        <Callout type="warning" title="Directory Structure">
          Save the file to <InlineCode>../../seeds/backup.sql</InlineCode> relative to your server entry point to ensure the automated script can locate it.
        </Callout>
        <CodeBlock 
          language="bash"
          code={`# 1. Set environment variables (or use your .env)
export DB_NAME=my_app_test
export DB_USER=postgres
export DB_HOST=localhost
export PGPASSWORD=your_password

# 2. Generate the backup script
pg_dump -U $DB_USER -h $DB_HOST -d $DB_NAME \\
  --no-owner --no-privileges \\
  -f ../../seeds/backup.sql`} 
        />

        <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">PowerShell Alternative</h3>
        <p className="text-slate-700 mb-4">If you are using PowerShell (Windows), use the backtick (<InlineCode>`</InlineCode>) for line continuation instead of the backslash (<InlineCode>\</InlineCode>):</p>
        <CodeBlock 
          language="powershell"
          code={`# 1. Set environment variables
$env:DB_NAME="my_app_test"
$env:DB_USER="postgres"
$env:DB_HOST="localhost"
$env:PGPASSWORD="your_password"

# 2. Generate the backup script
pg_dump -U $env:DB_USER -h $env:DB_HOST -d $env:DB_NAME \`
  --no-owner --no-privileges \`
  -f ../../seeds/backup.sql`} 
        />
      </section>

      <section id="step-2">
        <StepHeader number={2} title="The Automated Reset Endpoint" icon="lucide:refresh-cw" />
        <p className="text-slate-700 leading-relaxed mb-4">
          Implement a protected route in your Express application. This route uses <InlineCode>child_process</InlineCode> to execute system commands.
        </p>
        
        <CodeBlock 
          language="typescript"
          code={`import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();
const execAsync = promisify(exec);
const app = express();

// Database Reset Endpoint
app.post('/api/test/reset-db', async (req, res) => {
  // 1. Security Check: Only allow in non-production environments
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Forbidden in production' });
  }

  const secret = req.headers['x-cypress-secret'];
  if (secret !== process.env.CYPRESS_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { DB_NAME, DB_USER, DB_HOST, DB_PASSWORD } = process.env;

    // 2. Execute Reset Sequence
    // We use PGPASSWORD to avoid interactive prompts
    const env = { ...process.env, PGPASSWORD: DB_PASSWORD };

    console.log('Starting DB Reset...');
    
    // Drop existing connections and database
    await execAsync(\`dropdb -h \${DB_HOST} -U \${DB_USER} --if-exists \${DB_NAME}\`, { env });
    
    // Create fresh database
    await execAsync(\`createdb -h \${DB_HOST} -U \${DB_USER} \${DB_NAME}\`, { env });
    
    // Restore from backup
    await execAsync(\`psql -h \${DB_HOST} -U \${DB_USER} -d \${DB_NAME} -f ../../seeds/backup.sql\`, { env });

    console.log('DB Reset Complete.');
    res.status(200).json({ message: 'Database reset successfully' });
  } catch (error) {
    console.error('Reset Failed:', error);
    res.status(500).json({ 
      error: 'Database reset failed', 
      details: error.message 
    });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));`} 
        />
      </section>

      <section id="step-3">
        <StepHeader number={3} title="Triggering the Reset" icon="lucide:zap" />
        <p className="text-slate-700 leading-relaxed mb-6">
          Integrate the reset trigger into your testing workflow.
        </p>

        <h3 className="text-lg font-semibold text-slate-900 mb-3">Via cURL</h3>
        <CodeBlock 
          language="bash"
          code={`curl -X POST http://localhost:3000/api/test/reset-db \\
  -H "x-cypress-secret: super_secret_token_123"`} 
        />

        <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Via PowerShell (Invoke-RestMethod)</h3>
        <CodeBlock 
          language="powershell"
          code={`Invoke-RestMethod -Method Post \`
  -Uri "http://localhost:3000/api/test/reset-db" \`
  -Headers @{ "x-cypress-secret" = "super_secret_token_123" }`} 
        />

        <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-3">Via Cypress (beforeEach)</h3>
        <CodeBlock 
          language="javascript"
          code={`describe('User Authentication', () => {
  beforeEach(() => {
    // Reset DB to clean state before every test
    cy.request({
      method: 'POST',
      url: '/api/test/reset-db',
      headers: {
        'x-cypress-secret': Cypress.env('CYPRESS_SECRET')
      }
    });
  });

  it('should allow a new user to sign up', () => {
    // Test logic here...
  });
});`} 
        />
      </section>

      <section id="plumbing">
        <h2 className="text-2xl font-bold border-b border-slate-200 pb-2 mb-6 tracking-tight">Database Schema Plumbing</h2>
        <p className="text-slate-700 leading-relaxed mb-6">
          The "Correct Approach" to database plumbing involves ensuring your schema migrations and test snapshots are perfectly aligned.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="lucide:git-branch" className="text-indigo-500" />
              Migration Alignment
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Always run <InlineCode>prisma migrate dev</InlineCode> before generating your backup. This ensures the <InlineCode>_prisma_migrations</InlineCode> table is included in the snapshot, preventing Prisma from thinking the database is out of sync.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Icon icon="lucide:layers" className="text-indigo-500" />
              Schema Scoping
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              If your database uses multiple schemas, ensure your <InlineCode>pg_dump</InlineCode> command includes the <InlineCode>--schema</InlineCode> flag or captures the entire public schema to maintain foreign key integrity.
            </p>
          </div>
        </div>

        <Callout type="info" title="The Golden Rule">
          Your <InlineCode>backup.sql</InlineCode> is the source of truth for tests. If you change your Prisma schema, you <strong>must</strong> regenerate the backup to include the new structural changes.
        </Callout>
      </section>
    </article>
  );
};

export default DatabaseResetDocs;
