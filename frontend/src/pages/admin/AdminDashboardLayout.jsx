import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, User, FileText, Award, FolderGit2, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Visitors', path: '/admin/dashboard/visitors', icon: Users },
  { name: 'Profile', path: '/admin/dashboard/profile', icon: User },
  { name: 'CV Management', path: '/admin/dashboard/cv', icon: FileText },
  { name: 'Certificates', path: '/admin/dashboard/certificates', icon: Award },
  { name: 'Projects', path: '/admin/dashboard/projects', icon: FolderGit2 },
];

export default function AdminDashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-darker text-gray-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-white/10 flex flex-col z-20 relative">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
            Admin Panel
          </h2>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary/20 text-primary border border-primary/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : ''}`} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
        <div className="p-8 max-w-7xl mx-auto relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
