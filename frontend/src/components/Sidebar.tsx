import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuth';
import {
  LayoutDashboard, Briefcase, Brain, Calendar, TrendingUp,
  FileText, MessageSquare, Settings, User, Zap, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/mentor', label: 'AI Mentor', icon: Brain },
  { path: '/interviews', label: 'Mock Interviews', icon: Calendar },
  { path: '/market', label: 'Market Data', icon: TrendingUp },
  { path: '/skills', label: 'Skills', icon: Zap },
  { path: '/resume', label: 'Resume', icon: FileText },
  { path: '/messages', label: 'Messages', icon: MessageSquare },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-dark-900/50 backdrop-blur-xl border-r border-white/5 hidden lg:block">
      <div className="p-4">
        <div className="mb-6 p-4 bg-gradient-to-br from-primary-900/50 to-accent-900/50 rounded-xl border border-white/5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Profile Completion</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-dark-800 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"></div>
            </div>
            <span className="text-sm font-semibold">75%</span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive 
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon size={18} />
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {user?.role === 'RECRUITER' && (
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-3">Recruiter</p>
            <Link
              to="/jobs/post"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Briefcase size={18} />
              Post a Job
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
