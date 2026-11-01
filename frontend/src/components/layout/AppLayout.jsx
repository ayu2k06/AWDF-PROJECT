import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div className="app-shell min-h-screen text-slate-900 flex">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onToggle={() => setCollapsed((c) => !c)}
      />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 190 }}
        />
      )}

      {/* Main Content */}
      <div
        className="app-main transition-all duration-300 ease-in-out min-h-screen"
        style={{ marginLeft: sidebarWidth, width: `calc(100% - ${sidebarWidth}px)` }}
      >
        <TopNav sidebarCollapsed={collapsed} onMobileMenuToggle={() => setMobileOpen((o) => !o)} />
        <main className="pt-16 min-h-screen">
          <div className="app-content p-8 max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
