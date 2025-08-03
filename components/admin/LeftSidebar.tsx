'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LayoutDashboard, Bot, FileText, Palette, Users, BarChart2, PlusCircle, Edit, UserPlus } from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/agents', label: 'Agents', icon: Bot },
  { href: '/admin/prompts', label: 'Prompts', icon: FileText },
  { href: '/admin/branding', label: 'Branding', icon: Palette },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
];

const quickActions = [
  { href: '/admin/agents/new', label: 'Create Agent', icon: PlusCircle },
  { href: '/admin/prompts/edit/1', label: 'Edit Prompts', icon: Edit },
  { href: '/admin/users/invite', label: 'Invite User', icon: UserPlus },
]

export const LeftSidebar = () => {
  const pathname = usePathname();

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

       <div className="mt-10 pt-6 border-t border-gray-200 flex items-center space-x-3">
         <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600">A</div>
         <div>
           <p className="font-semibold text-gray-800">Admin User</p>
           <p className="text-sm text-gray-500">admin@example.com</p>
         </div>
       </div>
    </aside>
  );
};

