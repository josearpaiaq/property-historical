import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Building2, LogOut, Menu, X, Landmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: '/', label: t('nav.dashboard'), icon: Home },
    { href: '/properties', label: t('nav.properties'), icon: Building2 },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen">
      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{t('common.appName')}</span>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - always fixed, with internal scroll on nav */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[17rem] bg-card border-r flex flex-col transition-transform duration-200 ease-out',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand - fixed top */}
        <div className="shrink-0 px-5 py-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Landmark className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm tracking-tight">{t('common.appName')}</span>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation - scrollable middle */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={closeSidebar}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <Icon className="h-[1.1rem] w-[1.1rem]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer - fixed bottom */}
        <div className="shrink-0 p-4 border-t space-y-3">
          <div className="hidden lg:flex items-center gap-2">
            <LanguageSelector />
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title={t('nav.logout')}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content - offset by sidebar width on desktop, offset by top bar on mobile */}
      <main className="lg:ml-[17rem] pt-[57px] lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
