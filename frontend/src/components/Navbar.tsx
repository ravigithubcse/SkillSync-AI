import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuth';
import { useState } from 'react';
import { 
  Bell, MessageSquare, Search, Menu, X, LogOut, User, Briefcase 
} from 'lucide-react';
import { getInitials } from '@/lib/utils';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Briefcase size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">SkillSync</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-dark-800/50 rounded-xl px-4 py-2 border border-white/5">
            <Search size={16} className="text-gray-500 mr-2" />
            <input 
              type="text" 
              placeholder="Search jobs, skills, people..."
              className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-64"
            />
          </div>

          <button className="relative p-2 hover:bg-white/10 rounded-xl transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <Link to="/messages" className="relative p-2 hover:bg-white/10 rounded-xl transition-colors">
            <MessageSquare size={20} />
          </Link>

          <div className="relative">
            <button 
              className="flex items-center gap-2 p-1 hover:bg-white/10 rounded-xl transition-colors"
              onClick={() => setShowProfile(!showProfile)}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {user ? getInitials(user.firstName, user.lastName) : '?'}
                </div>
              )}
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5">
                  <p className="font-semibold text-white">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
                <div className="p-2">
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg text-sm">
                    <User size={16} /> Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg text-sm text-red-400"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
