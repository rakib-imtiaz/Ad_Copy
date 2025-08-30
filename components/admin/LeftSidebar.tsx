'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, LayoutDashboard, Bot, FileText, Users, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/agents', label: 'Agent Management', icon: Bot },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/referrals', label: 'Referral Codes', icon: FileText },
  { href: '/admin/tokens', label: 'Token Pricing', icon: BarChart2 },
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { state } = useSidebar();

  const handleLogout = () => {
    logout();
  };

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 48 }
  };

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -10 }
  };

  return (
    <Sidebar variant="inset" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border">
        <motion.div 
          className="flex items-center gap-2 px-2"
          animate={state}
          variants={{
            expanded: { justifyContent: 'flex-start' },
            collapsed: { justifyContent: 'center' }
          }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shield className="h-8 w-8 text-gray-700" />
          </motion.div>
          <motion.div
            animate={state}
            variants={contentVariants}
            transition={{ duration: 0.2, delay: state === 'expanded' ? 0.1 : 0 }}
            className="overflow-hidden"
          >
            <h1 className="font-bold text-sidebar-foreground whitespace-nowrap">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground whitespace-nowrap">System Administration</p>
          </motion.div>
        </motion.div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <motion.div
            animate={state}
            variants={contentVariants}
            transition={{ duration: 0.2 }}
          >
            <SidebarGroupLabel className="px-2">Navigation</SidebarGroupLabel>
          </motion.div>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                      <Link href={item.href}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <item.icon />
                        </motion.div>
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <motion.div
              className="flex items-center gap-2 px-2 py-1.5"
              animate={state}
              variants={{
                expanded: { justifyContent: 'flex-start' },
                collapsed: { justifyContent: 'center' }
              }}
              transition={{ duration: 0.2 }}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-100 text-gray-700 font-semibold">
                  A
                </AvatarFallback>
              </Avatar>
              <motion.div
                animate={state}
                variants={contentVariants}
                transition={{ duration: 0.2, delay: state === 'expanded' ? 0.1 : 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium text-sidebar-foreground whitespace-nowrap">Admin User</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">admin@example.com</p>
              </motion.div>
            </motion.div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout">
              <button onClick={handleLogout} className="w-full text-destructive hover:text-destructive">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut />
                </motion.div>
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export const LeftSidebar = AdminSidebar;

