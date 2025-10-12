'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, MoreHorizontal, Trash2, AlertTriangle, Filter, RefreshCw, Crown, Search, Eye, ChevronDown, User, Info, Snowflake, Shield } from 'lucide-react';
import { authService } from '@/lib/auth-service';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { UserSwitchDialog } from '@/components/admin/UserSwitchDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface User {
  id: number;
  email: string;
  created_at: string;
  role: 'Superking' | 'paid-user' | null;
  total_credit: string;
  freeze_status?: boolean;
  freeze_duration_days?: number;
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [changingRoleUserId, setChangingRoleUserId] = useState<number | null>(null);
  const [showRoleChangeConfirm, setShowRoleChangeConfirm] = useState<number | null>(null);
  const [freezingUserId, setFreezingUserId] = useState<number | null>(null);
  const [showFreezeConfirm, setShowFreezeConfirm] = useState<number | null>(null);
  const [freezeDuration, setFreezeDuration] = useState<number>(7);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<{ id?: number; email?: string } | null>(null);
  const [showUserSwitchDialog, setShowUserSwitchDialog] = useState<{ userId: number; userEmail: string } | null>(null);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const fetchUsers = async (searchFor: string = 'all') => {
    try {
      setLoading(true);
      const token = authService.getAuthToken();
      
      if (!token) {
        console.error('No authentication token found');
        setLoading(false);
        return;
      }

      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        console.error('User not authenticated');
        setLoading(false);
        return;
      }

      console.log('🔗 Client - Making request to:', '/api/admin/users');
      console.log('🔑 Client - Token exists:', !!token);
      console.log('📋 Client - Request body:', { accessToken: token ? '***' : 'NOT PROVIDED', search_for: searchFor });

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: token,
          search_for: searchFor,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch users');
      }

      const result = await response.json();
      console.log('✅ Users fetched successfully:', result);
      
      // The API returns an array directly, no need for nested data.users
      const transformedUsers = Array.isArray(result) ? result : [];
      
      // Get current user info directly to ensure it's available for filtering
      const currentUserInfo = authService.getCurrentUser();
      
      // Filter out the current logged-in user
      const filteredUsers = transformedUsers.filter(user => 
        user.id !== currentUserInfo?.id && user.email !== currentUserInfo?.email
      );
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      alert(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get current user info
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser({
        id: user.id,
        email: user.email
      });
    }

    // Only fetch users if authenticated
    if (authService.isAuthenticated()) {
      fetchUsers(filterRole);
    }
  }, [filterRole]);

  const handleDeleteUser = async (userId: number) => {
    try {
      setDeletingUserId(userId);
      const token = authService.getAuthToken();
      
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      // Find the user to get their email
      const userToDelete = users.find(user => user.id === userId);
      if (!userToDelete) {
        alert('User not found');
        return;
      }

      console.log('🗑️ Client - Deleting user ID:', userId, 'Email:', userToDelete.email);
      console.log('🔑 Client - Token exists:', !!token);

      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email: userToDelete.email,
          accessToken: token,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      // This should never happen since current user is filtered out, but keep as safety
      const currentUserInfo = authService.getCurrentUser();
      if (userId === currentUserInfo?.id) {
        console.log('❌ Self-deletion prevented');
        alert('You cannot delete your own account');
        return;
      }

      // Refresh the user list
      await fetchUsers(filterRole);
      setShowDeleteConfirm(null);
      console.log('✅ User deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleChangeUserRole = async (userId: number) => {
    try {
      setChangingRoleUserId(userId);
      const token = authService.getAuthToken();
      
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      // Find the user to get their email
      const userToChange = users.find(user => user.id === userId);
      if (!userToChange) {
        alert('User not found');
        return;
      }

      console.log('👑 Client - Changing role for user ID:', userId, 'Email:', userToChange.email);
      console.log('🔑 Client - Token exists:', !!token);

      const response = await fetch('/api/admin/change-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userToChange.email,
          accessToken: token,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change user role');
      }

      // Refresh the user list
      await fetchUsers(filterRole);
      setShowRoleChangeConfirm(null);
      console.log('✅ User role changed successfully');
    } catch (error) {
      console.error('❌ Error changing user role:', error);
      alert(`Failed to change user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setChangingRoleUserId(null);
    }
  };

  const handleFreezeAccount = async (userId: number, freezeStatus: boolean) => {
    try {
      setFreezingUserId(userId);
      const token = authService.getAuthToken();
      
      if (!token) {
        alert('Authentication token not found');
        return;
      }

      // Find the user to get their email
      const userToFreeze = users.find(user => user.id === userId);
      if (!userToFreeze) {
        alert('User not found');
        return;
      }

      console.log('❄️ Client - Freezing/unfreezing user ID:', userId, 'Email:', userToFreeze.email, 'Status:', freezeStatus);
      console.log('🔑 Client - Token exists:', !!token);

      const response = await fetch('/api/admin/freeze-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: token,
          freeze_email: userToFreeze.email,
          freeze_status: freezeStatus,
          freeze_duration: freezeStatus ? freezeDuration : 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to freeze/unfreeze account');
      }

      // Refresh the user list
      await fetchUsers(filterRole);
      setShowFreezeConfirm(null);
      console.log('✅ Account freeze status updated successfully');
    } catch (error) {
      console.error('❌ Error freezing/unfreezing account:', error);
      alert(`Failed to ${freezeStatus ? 'freeze' : 'unfreeze'} account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setFreezingUserId(null);
    }
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, roles, and permissions
            {currentUser && (
              <span className="block text-xs text-primary mt-1">
                💡 Your account is hidden from this list for security
              </span>
            )}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Button 
            className="gap-2"
            onClick={() => {}}
          >
            <UserPlus size={18} />
            Create Admin User
          </Button>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-muted-foreground" />
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="paid-user">Paid Users</SelectItem>
                    <SelectItem value="Superking">Admin Users</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(filterRole)}
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw size={16} className={cn(loading && 'animate-spin')} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Records</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage users and switch to their accounts to view their dashboard experience. Use the "Switch" button to log in as any user and see their perspective.
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {filteredUsers.length} of {users.length} users
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              </div>
            ) : !authService.isAuthenticated() ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">Authentication required</p>
                  <p className="text-xs text-muted-foreground">Please sign in to view user data</p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No users found.</p>
                {searchTerm && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Try adjusting your search or filters
                  </p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Credits</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs font-medium">
                                {user.email.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.email}</div>
                              <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.role === 'Superking' ? 'default' :
                              user.role === 'paid-user' ? 'secondary' : 
                              'outline'
                            }
                            className="gap-1"
                          >
                            {user.role === 'Superking' && <Crown size={12} />}
                            {user.role === 'Superking' ? 'Admin' : user.role || 'No Role'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.freeze_status ? (
                              <Badge variant="destructive" className="gap-1">
                                <Snowflake size={12} />
                                Frozen
                                {user.freeze_duration_days && (
                                  <span className="text-xs">({user.freeze_duration_days}d)</span>
                                )}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <Shield size={12} />
                                Active
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          ${parseFloat(user.total_credit).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowUserSwitchDialog({ userId: user.id, userEmail: user.email })}
                                    className="h-8 px-2 hover:bg-blue-100 hover:text-blue-600 text-xs"
                                  >
                                    <User size={14} className="mr-1" />
                                    Switch
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Switch to this user's account to view their dashboard and experience</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {user.role !== 'Superking' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowRoleChangeConfirm(user.id)}
                                disabled={changingRoleUserId === user.id}
                                className="h-8 w-8 p-0 hover:bg-purple-100 hover:text-purple-600"
                                title="Make Admin"
                              >
                                <Crown size={14} />
                              </Button>
                            )}
                            {user.role !== 'Superking' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setShowFreezeConfirm(user.id)}
                                      disabled={freezingUserId === user.id}
                                      className={`h-8 w-8 p-0 ${user.freeze_status ? 'hover:bg-green-100 hover:text-green-600' : 'hover:bg-orange-100 hover:text-orange-600'}`}
                                      title={user.freeze_status ? "Unfreeze Account" : "Freeze Account"}
                                    >
                                      {user.freeze_status ? <Shield size={14} /> : <Snowflake size={14} />}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{user.freeze_status ? "Unfreeze this account" : "Freeze this account"}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDeleteConfirm(user.id)}
                              disabled={deletingUserId === user.id}
                              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                              title="Delete User"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600 h-5 w-5" />
              </div>
              <div>
                <DialogTitle>
                  {showDeleteConfirm && users.find(u => u.id === showDeleteConfirm)?.role === 'Superking' 
                    ? 'Delete Admin User' 
                    : 'Delete User'
                  }
                </DialogTitle>
                <DialogDescription>This action cannot be undone</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="my-4">
            <p className="text-sm text-muted-foreground mb-4">
              {showDeleteConfirm && users.find(u => u.id === showDeleteConfirm)?.role === 'Superking' 
                ? 'Are you sure you want to delete this admin user? This will permanently remove their admin account and all associated data.'
                : 'Are you sure you want to delete this user? This will permanently remove their account and all associated data.'
              }
            </p>
            {showDeleteConfirm && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">User:</span> {users.find(u => u.id === showDeleteConfirm)?.email}
                  {users.find(u => u.id === showDeleteConfirm)?.role === 'Superking' && (
                    <Badge variant="destructive" className="ml-2">Admin User</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(null)}
              disabled={deletingUserId === showDeleteConfirm}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteConfirm && handleDeleteUser(showDeleteConfirm)}
              disabled={deletingUserId === showDeleteConfirm}
              className="gap-2"
            >
              {deletingUserId === showDeleteConfirm ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  {showDeleteConfirm && users.find(u => u.id === showDeleteConfirm)?.role === 'Superking'
                    ? 'Delete Admin User'
                    : 'Delete User'
                  }
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Confirmation Dialog */}
      <Dialog open={!!showRoleChangeConfirm} onOpenChange={() => setShowRoleChangeConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Crown className="text-purple-600 h-5 w-5" />
              </div>
              <div>
                <DialogTitle>Make User Admin</DialogTitle>
                <DialogDescription>This will grant admin privileges</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="my-4">
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to make this user an admin? They will have full access to the admin dashboard and all administrative functions.
            </p>
            {showRoleChangeConfirm && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">User:</span> {users.find(u => u.id === showRoleChangeConfirm)?.email}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRoleChangeConfirm(null)}
              disabled={changingRoleUserId === showRoleChangeConfirm}
            >
              Cancel
            </Button>
            <Button
              onClick={() => showRoleChangeConfirm && handleChangeUserRole(showRoleChangeConfirm)}
              disabled={changingRoleUserId === showRoleChangeConfirm}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {changingRoleUserId === showRoleChangeConfirm ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                  Changing Role...
                </>
              ) : (
                <>
                  <Crown size={16} />
                  Make Admin
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Freeze Account Confirmation Dialog */}
      <Dialog open={!!showFreezeConfirm} onOpenChange={() => setShowFreezeConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${users.find(u => u.id === showFreezeConfirm)?.freeze_status ? 'bg-green-100' : 'bg-orange-100'}`}>
                {users.find(u => u.id === showFreezeConfirm)?.freeze_status ? (
                  <Shield className="text-green-600 h-5 w-5" />
                ) : (
                  <Snowflake className="text-orange-600 h-5 w-5" />
                )}
              </div>
              <div>
                <DialogTitle>
                  {showFreezeConfirm && users.find(u => u.id === showFreezeConfirm)?.freeze_status 
                    ? 'Unfreeze Account' 
                    : 'Freeze Account'
                  }
                </DialogTitle>
                <DialogDescription>
                  {showFreezeConfirm && users.find(u => u.id === showFreezeConfirm)?.freeze_status 
                    ? 'This will restore access to the account'
                    : 'This will temporarily restrict access to the account'
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="my-4">
            <p className="text-sm text-muted-foreground mb-4">
              {showFreezeConfirm && users.find(u => u.id === showFreezeConfirm)?.freeze_status 
                ? 'Are you sure you want to unfreeze this account? The user will regain access to their account immediately.'
                : 'Are you sure you want to freeze this account? The user will be unable to log in for the specified duration.'
              }
            </p>
            {showFreezeConfirm && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">User:</span> {users.find(u => u.id === showFreezeConfirm)?.email}
                  {users.find(u => u.id === showFreezeConfirm)?.freeze_status && (
                    <Badge variant="secondary" className="ml-2">Currently Frozen</Badge>
                  )}
                </div>
              </div>
            )}
            {showFreezeConfirm && !users.find(u => u.id === showFreezeConfirm)?.freeze_status && (
              <div className="mt-4">
                <label className="text-sm font-medium">Freeze Duration (days):</label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={freezeDuration}
                  onChange={(e) => setFreezeDuration(parseInt(e.target.value) || 7)}
                  className="mt-2"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFreezeConfirm(null)}
              disabled={freezingUserId === showFreezeConfirm}
            >
              Cancel
            </Button>
            <Button
              variant={users.find(u => u.id === showFreezeConfirm)?.freeze_status ? "default" : "destructive"}
              onClick={() => showFreezeConfirm && handleFreezeAccount(showFreezeConfirm, !users.find(u => u.id === showFreezeConfirm)?.freeze_status)}
              disabled={freezingUserId === showFreezeConfirm}
              className="gap-2"
            >
              {freezingUserId === showFreezeConfirm ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                  Processing...
                </>
              ) : (
                <>
                  {users.find(u => u.id === showFreezeConfirm)?.freeze_status ? (
                    <>
                      <Shield size={16} />
                      Unfreeze Account
                    </>
                  ) : (
                    <>
                      <Snowflake size={16} />
                      Freeze Account
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Switch Dialog */}
      {showUserSwitchDialog && (
        <UserSwitchDialog
          isOpen={!!showUserSwitchDialog}
          onClose={() => setShowUserSwitchDialog(null)}
          userEmail={showUserSwitchDialog.userEmail}
          userId={showUserSwitchDialog.userId}
        />
      )}
    </div>
  );
};

export default UserManagementPage;
