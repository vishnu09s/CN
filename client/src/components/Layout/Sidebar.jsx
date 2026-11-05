import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/inventory', label: 'Inventory', icon: Package },
    { path: '/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/payments', label: 'Payments', icon: DollarSign },
    { path: '/invoices', label: 'Invoices', icon: FileText },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-0 md:w-64'
        } overflow-hidden md:relative z-40`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Inventory Pro</h1>
          <p className="text-xs text-gray-400 mt-1">Business Management</p>
        </div>

        {/* Menu Items */}
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 border-l-4 transition-colors ${
                  active
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-transparent text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700 bg-gray-900/50">
          <p className="text-xs text-gray-400 text-center">
            © 2024 Inventory System
          </p>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
