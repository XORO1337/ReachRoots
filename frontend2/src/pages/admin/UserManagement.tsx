<<<<<<< HEAD
import React, { useState } from 'react';
=======
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
>>>>>>> fixed-repo/main
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  UserPlus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
<<<<<<< HEAD
  Users
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Customer' | 'Artisan' | 'Distributor' | 'Admin';
  status: 'Active' | 'Inactive' | 'Pending';
  joinDate: string;
  lastActive: string;
}

const UserManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data - replace with API call
  const users: User[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      role: 'Customer',
      status: 'Active',
      joinDate: '2024-01-15',
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      role: 'Artisan',
      status: 'Active',
      joinDate: '2024-01-10',
      lastActive: '1 day ago'
    },
    {
      id: '3',
      name: 'Amit Patel',
      email: 'amit@example.com',
      role: 'Customer',
      status: 'Inactive',
      joinDate: '2024-01-05',
      lastActive: '1 week ago'
    },
    {
      id: '4',
      name: 'Sunita Devi',
      email: 'sunita@example.com',
      role: 'Artisan',
      status: 'Active',
      joinDate: '2024-01-20',
      lastActive: '30 minutes ago'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Customer':
        return 'bg-blue-100 text-blue-800';
      case 'Artisan':
        return 'bg-green-100 text-green-800';
      case 'Distributor':
        return 'bg-purple-100 text-purple-800';
      case 'Admin':
        return 'bg-red-100 text-red-800';
=======
  Users,
  RefreshCw,
  AlertTriangle,
  Flag,
  ChevronLeft,
  ChevronRight,
  X,
  Shield
} from 'lucide-react';
import * as adminService from '../../services/adminService';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastActive?: string;
  flags?: Array<{
    flag: string;
    reason?: string;
    addedAt?: string;
  }>;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  total: number;
}

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ currentPage: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [flagData, setFlagData] = useState({ flag: 'warning', reason: '' });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, selectedStatus, pagination.currentPage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.currentPage === 1) {
        fetchUsers();
      } else {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllUsers({
        page: pagination.currentPage,
        limit: 10,
        role: selectedRole !== 'all' ? selectedRole : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchTerm || undefined
      });
      
      const usersData = Array.isArray(response) ? response : (response?.users || []);
      setUsers(usersData);
      
      if (response?.pagination) {
        setPagination(response.pagination);
      } else {
        setPagination(prev => ({ ...prev, total: usersData.length, totalPages: 1 }));
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    setActionLoading(true);
    try {
      await adminService.updateUserStatus(user._id, !user.isActive);
      // Update local state
      setUsers(prev => prev.map(u => 
        u._id === user._id ? { ...u, isActive: !u.isActive } : u
      ));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddFlag = async () => {
    if (!selectedUser || !flagData.flag) return;
    
    setActionLoading(true);
    try {
      await adminService.addUserFlag(selectedUser._id, {
        flag: flagData.flag as any,
        reason: flagData.reason
      });
      setShowFlagModal(false);
      setFlagData({ flag: 'warning', reason: '' });
      fetchUsers(); // Refresh to show updated flags
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add flag');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFlag = async (userId: string, flag: string) => {
    if (!confirm('Remove this flag from user?')) return;
    
    setActionLoading(true);
    try {
      await adminService.removeUserFlag(userId, flag);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove flag');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      case 'artisan':
        return 'bg-green-100 text-green-800';
      case 'distributor':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'shipping_agent':
        return 'bg-orange-100 text-orange-800';
>>>>>>> fixed-repo/main
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

<<<<<<< HEAD
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role.toLowerCase() === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status.toLowerCase() === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
=======
  const getFlagBadgeColor = (flag: string) => {
    switch (flag) {
      case 'banned':
      case 'scam':
      case 'fraud':
        return 'bg-red-100 text-red-800';
      case 'suspicious':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'trusted':
      case 'vip':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never';
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return formatDate(dateString);
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-orange-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>{t('admin.userManagement.loadingUsers')}</span>
        </div>
      </div>
    );
  }
>>>>>>> fixed-repo/main

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
<<<<<<< HEAD
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage user accounts and permissions</p>
        </div>
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200">
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

=======
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.userManagement.title')}</h1>
          <p className="text-gray-600">{t('admin.userManagement.subtitle', { total: pagination.total })}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchUsers}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={fetchUsers} className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium">
            {t('common.retry')}
          </button>
        </div>
      )}

>>>>>>> fixed-repo/main
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
<<<<<<< HEAD
              placeholder="Search users..."
=======
              placeholder={t('admin.userManagement.searchPlaceholder')}
>>>>>>> fixed-repo/main
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
<<<<<<< HEAD
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="artisan">Artisan</option>
              <option value="distributor">Distributor</option>
              <option value="admin">Admin</option>
=======
              <option value="all">{t('admin.userManagement.allRoles')}</option>
              <option value="customer">{t('admin.userManagement.roles.customer')}</option>
              <option value="artisan">{t('admin.userManagement.roles.artisan')}</option>
              <option value="distributor">{t('admin.userManagement.roles.distributor')}</option>
              <option value="admin">{t('admin.userManagement.roles.admin')}</option>
>>>>>>> fixed-repo/main
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
<<<<<<< HEAD
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
=======
              <option value="all">{t('admin.userManagement.allStatus')}</option>
              <option value="active">{t('common.active')}</option>
              <option value="inactive">{t('common.inactive')}</option>
>>>>>>> fixed-repo/main
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
<<<<<<< HEAD
          <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
          <p className="text-sm text-gray-600">A list of all users in your system including their details and status.</p>
=======
          <h3 className="text-lg font-semibold text-gray-900">{t('admin.userManagement.allUsers')}</h3>
          <p className="text-sm text-gray-600">{t('admin.userManagement.usersListDescription')}</p>
>>>>>>> fixed-repo/main
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
<<<<<<< HEAD
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
=======
                  {t('admin.userManagement.columns.user')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.userManagement.columns.contact')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.userManagement.columns.role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.userManagement.columns.flags')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.userManagement.columns.joined')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
>>>>>>> fixed-repo/main
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
<<<<<<< HEAD
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
=======
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
>>>>>>> fixed-repo/main
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
<<<<<<< HEAD
                            {user.name.charAt(0).toUpperCase()}
=======
                            {user.name?.charAt(0).toUpperCase() || '?'}
>>>>>>> fixed-repo/main
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
<<<<<<< HEAD
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
=======
                        <div className="text-sm font-medium text-gray-900">{user.name || t('admin.userManagement.unknown')}</div>
                        <div className="text-xs text-gray-500">ID: {user._id.slice(-8)}</div>
>>>>>>> fixed-repo/main
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
<<<<<<< HEAD
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(user.status)}
                      <span className="ml-2 text-sm text-gray-900">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600" title="More">
                        <MoreHorizontal className="h-4 w-4" />
=======
                    <div className="text-xs text-gray-500">{user.phone || t('admin.userManagement.noPhone')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                      {user.role?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      disabled={actionLoading}
                      className="flex items-center space-x-2 hover:opacity-80"
                      title={t('admin.userManagement.clickToToggle')}
                    >
                      {getStatusIcon(user.isActive)}
                      <span className="text-sm text-gray-900">{user.isActive ? t('common.active') : t('common.inactive')}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.flags && user.flags.length > 0 ? (
                        user.flags.map((f, idx) => (
                          <span 
                            key={idx}
                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getFlagBadgeColor(f.flag)} cursor-pointer`}
                            onClick={() => handleRemoveFlag(user._id, f.flag)}
                            title={`${f.reason || t('admin.userManagement.noReason')} - ${t('admin.userManagement.clickToRemove')}`}
                          >
                            {f.flag}
                            <X className="w-3 h-3 ml-1" />
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">{t('common.none')}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900" 
                        title={t('common.view')}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedUser(user);
                          setShowFlagModal(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-900" 
                        title={t('admin.userManagement.addFlag')}
                      >
                        <Flag className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user)}
                        className={user.isActive ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                        title={user.isActive ? t('admin.userManagement.deactivate') : t('admin.userManagement.activate')}
                      >
                        <Shield className="h-4 w-4" />
>>>>>>> fixed-repo/main
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

<<<<<<< HEAD
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
=======
        {users.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">{t('admin.userManagement.noUsersFound')}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('admin.userManagement.adjustFilters')}
>>>>>>> fixed-repo/main
              </p>
            </div>
          </div>
        )}
<<<<<<< HEAD
      </div>
=======

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {t('admin.userManagement.pageInfo', { current: pagination.currentPage, total: pagination.totalPages, users: pagination.total })}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('admin.userManagement.userDetails')}</h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{selectedUser.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h4 className="text-lg font-medium">{selectedUser.name}</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>
              <div className="border-t pt-3 space-y-2">
                <p><span className="text-gray-500">{t('admin.userManagement.fields.email')}:</span> {selectedUser.email}</p>
                <p><span className="text-gray-500">{t('admin.userManagement.fields.phone')}:</span> {selectedUser.phone || t('admin.userManagement.notProvided')}</p>
                <p><span className="text-gray-500">{t('common.status')}:</span> {selectedUser.isActive ? t('common.active') : t('common.inactive')}</p>
                <p><span className="text-gray-500">{t('admin.userManagement.fields.joined')}:</span> {formatDate(selectedUser.createdAt)}</p>
                <p><span className="text-gray-500">ID:</span> {selectedUser._id}</p>
              </div>
              {selectedUser.flags && selectedUser.flags.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-gray-500 mb-2">{t('admin.userManagement.columns.flags')}:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.flags.map((f, idx) => (
                      <span key={idx} className={`px-2 py-1 text-xs rounded-full ${getFlagBadgeColor(f.flag)}`}>
                        {f.flag}: {f.reason || t('admin.userManagement.noReason')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Flag Modal */}
      {showFlagModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('admin.userManagement.addFlagTo', { name: selectedUser.name })}</h3>
              <button onClick={() => setShowFlagModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.userManagement.flagType')}</label>
                <select
                  value={flagData.flag}
                  onChange={(e) => setFlagData(prev => ({ ...prev, flag: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="warning">{t('admin.userManagement.flags.warning')}</option>
                  <option value="suspicious">{t('admin.userManagement.flags.suspicious')}</option>
                  <option value="scam">{t('admin.userManagement.flags.scam')}</option>
                  <option value="fraud">{t('admin.userManagement.flags.fraud')}</option>
                  <option value="banned">{t('admin.userManagement.flags.banned')}</option>
                  <option value="trusted">{t('admin.userManagement.flags.trusted')}</option>
                  <option value="vip">{t('admin.userManagement.flags.vip')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.userManagement.reason')}</label>
                <textarea
                  value={flagData.reason}
                  onChange={(e) => setFlagData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder={t('admin.userManagement.enterReason')}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowFlagModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddFlag}
                disabled={actionLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {actionLoading ? t('admin.userManagement.adding') : t('admin.userManagement.addFlag')}
              </button>
            </div>
          </div>
        </div>
      )}
>>>>>>> fixed-repo/main
    </div>
  );
};

export default UserManagement;
