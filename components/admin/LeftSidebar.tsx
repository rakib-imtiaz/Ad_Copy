'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LayoutDashboard, Bot, FileText, Palette, Users, BarChart2, PlusCircle, Edit, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/agents', label: 'Agent Management', icon: Bot },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/referrals', label: 'Referral Codes', icon: FileText },
  { href: '/admin/tokens', label: 'Token Pricing', icon: BarChart2 },
];

const quickActions = [
  { href: '/admin/agents/create', label: 'Create Agent', icon: PlusCircle },
  { href: '/admin/agents/prompts', label: 'Agent Prompts', icon: Edit },
  { href: '/admin/users/create', label: 'Create Admin User', icon: UserPlus },
  { href: '/admin/referrals/create', label: 'Create Referral Code', icon: PlusCircle },
]

export const LeftSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="w-64 flex flex-col bg-white p-6 shadow-md">
      <div className="flex items-center space-x-3 mb-10">
        <Shield size={32} className="text-indigo-600"/>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">System Administration</p>
        </div>
      </div>
      
      <nav className="flex-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Navigation</p>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'bg-indigo-50 text-indigo-600 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</p>
        <ul className="space-y-2">
          {quickActions.map((action) => (
            <li key={action.label}>
              <Link href={action.href} className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-100">
                <action.icon size={20} />
                <span>{action.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">A</div>
          <div>
            <p className="font-semibold text-gray-800">Admin User</p>
            <p className="text-sm text-gray-500">admin@example.com</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-red-600 w-full text-left"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

