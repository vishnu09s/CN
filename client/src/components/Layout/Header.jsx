import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Header = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6 md:pl-72">
        {/* Title/Breadcrumb */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Welcome Back</h2>
          <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
        </div>

        {/* User menu */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={20} className="text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{admin?.username}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
