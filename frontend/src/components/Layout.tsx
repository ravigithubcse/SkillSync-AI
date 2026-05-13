import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function Layout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-64 pt-16 min-h-screen">
          <div className="p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
