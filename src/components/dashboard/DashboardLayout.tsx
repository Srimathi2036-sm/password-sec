import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Key, 
  KeyRound,
  FileText, 
  HeartPulse, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Password Vault', href: '/dashboard/vault', icon: Key },
  { name: 'Password Generator', href: '/dashboard/generator', icon: KeyRound },
  { name: 'Secure Notes', href: '/dashboard/notes', icon: FileText },
  { name: 'Security Health', href: '/dashboard/security', icon: HeartPulse },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function DashboardLayout({ children, searchQuery = '', onSearchChange }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications: notifs, clear, markRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({ title: 'Successfully logged out', description: 'You have been signed out.' });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border z-40 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg gradient-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold font-display">SecurePass</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn("shrink-0", isCollapsed && "mx-auto")}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        isCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border sticky top-0 z-30">
          <div className="h-full flex items-center justify-between px-6">
            {/* Search */}
            <div className="relative w-96 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by site name (Google, Instagram, LinkedIn...)"
                className="pl-10 bg-background"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotifications((s) => !s)}>
                  <Bell className="h-5 w-5" />
                  {notifs.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
                  )}
                </Button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg p-3 z-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Notifications</span>
                      <button className="text-xs text-muted-foreground" onClick={() => clear()}>Clear</button>
                    </div>
                    <div className="max-h-64 overflow-auto space-y-2">
                      {notifs.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No notifications</div>
                      ) : (
                        notifs.map((n) => (
                          <div key={n.id} className="p-2 rounded-md bg-background/50">
                            <div className="text-sm font-medium">{n.title}</div>
                            {n.body && <div className="text-xs text-muted-foreground">{n.body}</div>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.name || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
                </div>
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
