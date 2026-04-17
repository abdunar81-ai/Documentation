import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import RecoveryGuide from './components/RecoveryGuide';
import ConflictResolver from './components/ConflictResolver';
import CICDDocs from './components/CICDDocs';
import DatabaseResetDocs from './components/DatabaseResetDocs';
import FrontendDeploymentDocs from './components/FrontendDeploymentDocs';
import DevTestingGuide from './components/DevTestingGuide';
import SSEGuide from './components/SSEGuide';

type View = 'guide' | 'dashboard' | 'cicd' | 'db-reset' | 'frontend-deploy' | 'dev-testing' | 'sse';

interface NavItem {
  id: string;
  title: string;
}

const App = () => {
  const [view, setView] = useState<View>('guide');
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation: Record<View, { label: string; icon: string; sections: NavItem[] }> = {
    guide: {
      label: 'Recovery Guide',
      icon: 'lucide:database',
      sections: [
        { id: 'overview', title: 'Overview' },
        { id: 'safety', title: '1. Safety First' },
        { id: 'surgery', title: '2. Database Surgery' },
        { id: 'cleanup', title: '3. Environment Cleanup' },
        { id: 'baseline', title: '4. Baselining Protocol' },
        { id: 'future', title: 'Next Steps' },
      ]
    },
    dashboard: {
      label: 'Sync Wizard',
      icon: 'lucide:wand-2',
      sections: [] // Dashboard handles its own internal navigation for now
    },
    cicd: {
      label: 'CI/CD Docs',
      icon: 'lucide:server',
      sections: [
        { id: 'intro', title: 'Introduction' },
        { id: 'step-1', title: '1. Prepare VPS' },
        { id: 'step-2', title: '2. GitHub Secrets' },
        { id: 'troubleshoot', title: 'Troubleshooting' },
        { id: 'step-3', title: '3. Actions Workflow' },
        { id: 'step-pm2', title: '4. PM2 Integration' },
        { id: 'step-4', title: '5. Nginx Config' },
      ]
    },
    'db-reset': {
      label: 'DB Reset',
      icon: 'lucide:refresh-cw',
      sections: [
        { id: 'overview', title: 'Overview' },
        { id: 'prerequisites', title: 'Prerequisites' },
        { id: 'step-1', title: '1. Initial Backup' },
        { id: 'step-2', title: '2. Reset Endpoint' },
        { id: 'step-3', title: '3. Triggering' },
        { id: 'plumbing', title: '4. Schema Plumbing' },
      ]
    },
    'frontend-deploy': {
      label: 'Frontend Deploy',
      icon: 'lucide:globe',
      sections: [
        { id: 'overview', title: 'Overview' },
        { id: 'phase-1', title: '1. Prepare Directory' },
        { id: 'phase-2', title: '2. Nginx Config' },
        { id: 'phase-3', title: '3. Enable Site' },
        { id: 'phase-4', title: '4. Secure HTTPS' },
      ]
    },
    'dev-testing': {
      label: 'DB Reset Guide',
      icon: 'lucide:flask-conical',
      sections: [
        { id: 'manual', title: '1. Manual Backup' },
        { id: 'replace', title: '2. Manual Replace' },
        { id: 'reset', title: '3. Node.js Reset' },
        { id: 'route', title: '4. Route Handlers' },
        { id: 'endpoint', title: '5. Backup Creation' },
      ]
    },
    'sse': {
      label: 'SSE Guide',
      icon: 'lucide:zap',
      sections: [
        { id: 'architecture', title: '1. Architecture' },
        { id: 'implementation', title: '2. Implementation' },
        { id: 'frontend', title: '3. Frontend Logic' },
        { id: 'pitfalls', title: '4. Common Pitfalls' },
      ]
    }
  };

  useEffect(() => {
    if (view === 'dashboard') return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      const currentSections = navigation[view].sections;
      
      for (const section of currentSections) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [view]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-slate-900">
          <div className="bg-indigo-600 p-1 rounded-lg shadow-sm text-white">
            <Icon icon="lucide:database" width="18" />
          </div>
          DEV<span className="text-indigo-600">SYNC</span>
        </div>
        <button 
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Icon icon={isMobileMenuOpen ? "lucide:x" : "lucide:menu"} width="24" />
        </button>
      </header>

      <div className="max-w-[1600px] mx-auto flex">
        {/* Left Sidebar: Main Navigation */}
        <aside className={`fixed md:sticky top-0 md:top-0 h-screen w-72 border-r border-slate-100 bg-slate-50/50 overflow-y-auto z-40 transition-transform md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 flex flex-col h-full">
            <div className="hidden md:flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 mb-10">
              <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm text-white">
                <Icon icon="lucide:database" width="20" />
              </div>
              DEV<span className="text-indigo-600">SYNC</span> <span className="text-slate-300 font-normal">|</span> <span className="text-slate-500 font-medium text-lg">Docs</span>
            </div>

            <div className="space-y-8 flex-1">
              <div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">Main Navigation</h5>
                <nav className="space-y-1">
                  {(Object.keys(navigation) as View[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => { setView(v); window.scrollTo(0, 0); setIsMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                        view === v 
                          ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                          : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      <Icon icon={navigation[v].icon} width="18" className={view === v ? 'text-indigo-600' : 'text-slate-400'} />
                      {navigation[v].label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Mobile-only Table of Contents integration */}
              <div className="md:hidden">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">On this page</h5>
                <nav className="space-y-1">
                  {navigation[view].sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollTo(section.id)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                        activeSection === section.id 
                          ? 'text-indigo-600 font-semibold' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-slate-200/60">
              <div className="flex items-center gap-3 px-3 py-2 text-slate-400 text-xs font-medium">
                <Icon icon="lucide:github" width="16" />
                v1.4.2-stable
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex min-w-0">
          <main className={`flex-1 min-w-0 px-6 lg:px-12 py-12 ${view === 'dashboard' ? 'max-w-7xl' : 'max-w-4xl'} mx-auto`}>
            {view === 'guide' && <RecoveryGuide />}
            {view === 'dashboard' && <ConflictResolver />}
            {view === 'cicd' && <CICDDocs />}
            {view === 'db-reset' && <DatabaseResetDocs />}
            {view === 'frontend-deploy' && <FrontendDeploymentDocs />}
            {view === 'dev-testing' && <DevTestingGuide />}
            {view === 'sse' && <SSEGuide />}

            <footer className="mt-24 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
              <p>© 2026 Development Documentation Suite</p>
              <div className="flex gap-6">
                <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
                <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
                <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
              </div>
            </footer>
          </main>

          {/* Right Sidebar: Table of Contents (Desktop Only) */}
          {navigation[view].sections.length > 0 && (
            <aside className="hidden xl:block w-64 sticky top-0 h-screen overflow-y-auto border-l border-slate-50">
              <div className="p-12">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Icon icon="lucide:list" width="14" />
                  On this page
                </h5>
                <nav className="space-y-3 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-100" />
                  {navigation[view].sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollTo(section.id)}
                      className={`w-full text-left pl-4 text-sm transition-all relative ${
                        activeSection === section.id 
                          ? 'text-indigo-600 font-semibold' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {activeSection === section.id && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-full bg-indigo-600" />
                      )}
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default App;

