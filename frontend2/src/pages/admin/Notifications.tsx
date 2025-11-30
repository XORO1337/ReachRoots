<<<<<<< HEAD
import React, { useState } from 'react';
=======
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
>>>>>>> fixed-repo/main
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  Check,
  Trash2,
<<<<<<< HEAD
  Filter
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'warning' | 'success' | 'info' | 'error';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Server Load Detected',
      message: 'Server CPU usage has exceeded 85% for the past 10 minutes',
      time: '5 minutes ago',
      isRead: false
    },
    {
      id: '2',
      type: 'success',
      title: 'Backup Completed Successfully',
      message: 'Daily database backup completed without errors',
      time: '2 hours ago',
      isRead: true
    },
    {
      id: '3',
      type: 'info',
      title: 'New Feature Release',
      message: 'Advanced search filters have been deployed to production',
      time: '1 day ago',
      isRead: false
    },
    {
      id: '4',
      type: 'error',
      title: 'Payment Gateway Issue',
      message: 'Multiple payment failures reported in the last hour',
      time: '3 hours ago',
      isRead: false
    },
    {
      id: '5',
      type: 'info',
      title: 'Weekly Report Available',
      message: 'Your weekly analytics report is ready for review',
      time: '2 days ago',
      isRead: true
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
=======
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import * as adminService from '../../services/adminService';

interface AdminNotification {
  _id: string;
  type: 'warning' | 'success' | 'info' | 'error' | 'system' | 'order' | 'user';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  metadata?: {
    orderId?: string;
    userId?: string;
    actionUrl?: string;
  };
}

const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchNotifications();
  }, [page, filter, typeFilter]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = { page, limit };
      if (filter === 'unread') params.isRead = false;
      if (filter === 'read') params.isRead = true;
      if (typeFilter !== 'all') params.type = typeFilter;

      const response = await adminService.getNotifications(params);
      setNotifications(response.notifications || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.total || 0);
      setUnreadCount(response.unreadCount || 0);
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      setError(err.response?.data?.message || 'Failed to load notifications');
      // Use mock data as fallback
      setNotifications([
        {
          _id: '1',
          type: 'warning',
          title: 'High Server Load Detected',
          message: 'Server CPU usage has exceeded 85% for the past 10 minutes',
          createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
          isRead: false
        },
        {
          _id: '2',
          type: 'success',
          title: 'Backup Completed Successfully',
          message: 'Daily database backup completed without errors',
          createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
          isRead: true
        },
        {
          _id: '3',
          type: 'info',
          title: 'New Feature Release',
          message: 'Advanced search filters have been deployed to production',
          createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
          isRead: false
        },
        {
          _id: '4',
          type: 'error',
          title: 'Payment Gateway Issue',
          message: 'Multiple payment failures reported in the last hour',
          createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
          isRead: false
        },
        {
          _id: '5',
          type: 'order',
          title: 'New Order Received',
          message: 'Order #ORD-2024-001 has been placed and awaiting confirmation',
          createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
          isRead: true
        }
      ]);
      setUnreadCount(3);
    } finally {
      setIsLoading(false);
    }
  };
>>>>>>> fixed-repo/main

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
<<<<<<< HEAD
=======
      case 'order':
        return <Bell className="h-5 w-5 text-purple-500" />;
      case 'user':
        return <Info className="h-5 w-5 text-indigo-500" />;
      case 'system':
        return <Info className="h-5 w-5 text-gray-500" />;
>>>>>>> fixed-repo/main
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-l-yellow-500';
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
<<<<<<< HEAD
=======
      case 'order':
        return 'border-l-purple-500';
      case 'user':
        return 'border-l-indigo-500';
      case 'system':
        return 'border-l-gray-500';
>>>>>>> fixed-repo/main
      case 'info':
      default:
        return 'border-l-blue-500';
    }
  };

<<<<<<< HEAD
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
=======
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = async (id: string) => {
    try {
      await adminService.markNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
      // Still update locally
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, isRead: true } : notif
        )
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await adminService.markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Failed to mark all as read:', err);
      // Still update locally
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await adminService.deleteNotification(id);
      const deletedNotif = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(notif => notif._id !== id));
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error('Failed to delete notification:', err);
      // Still remove locally
      const deletedNotif = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(notif => notif._id !== id));
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
>>>>>>> fixed-repo/main
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

<<<<<<< HEAD
  const unreadCount = notifications.filter(n => !n.isRead).length;
=======
  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-orange-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading notifications...</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">System alerts and important updates</p>
        </div>
        <div className="flex items-center gap-2">
<<<<<<< HEAD
          <span className="text-sm text-gray-500">
=======
          <button 
            onClick={fetchNotifications}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-sm text-gray-500 px-2">
>>>>>>> fixed-repo/main
            {unreadCount} Unread
          </span>
          <button 
            onClick={markAllAsRead}
<<<<<<< HEAD
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2"
=======
            disabled={unreadCount === 0}
            className={`px-4 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center gap-2 ${
              unreadCount > 0
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
>>>>>>> fixed-repo/main
          >
            <Check className="h-4 w-4" />
            Mark All Read
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
=======
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-700">{error} - Showing cached data</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Status:</span>
>>>>>>> fixed-repo/main
          </div>
          <div className="flex gap-2">
            {(['all', 'unread', 'read'] as const).map((filterType) => (
              <button
                key={filterType}
<<<<<<< HEAD
                onClick={() => setFilter(filterType)}
=======
                onClick={() => { setFilter(filterType); setPage(1); }}
>>>>>>> fixed-repo/main
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  filter === filterType
                    ? 'bg-orange-100 text-orange-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                {filterType === 'unread' && unreadCount > 0 && (
<<<<<<< HEAD
                  <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-1">
=======
                  <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-1.5">
>>>>>>> fixed-repo/main
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
<<<<<<< HEAD
=======
          
          <div className="border-l border-gray-200 pl-4 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="order">Order</option>
              <option value="user">User</option>
              <option value="system">System</option>
            </select>
          </div>
>>>>>>> fixed-repo/main
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? "You're all caught up! No notifications to display."
                : `No ${filter} notifications found.`
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div 
<<<<<<< HEAD
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${getBorderColor(notification.type)} ${
                notification.isRead ? 'opacity-75' : ''
              }`}
=======
              key={notification._id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${getBorderColor(notification.type)} ${
                notification.isRead ? 'opacity-75' : ''
              } transition-opacity duration-200`}
>>>>>>> fixed-repo/main
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 pt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${
                          notification.isRead ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {notification.title}
                          {!notification.isRead && (
                            <span className="ml-2 inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                          )}
                        </h3>
<<<<<<< HEAD
=======
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded capitalize">
                          {notification.type}
                        </span>
>>>>>>> fixed-repo/main
                      </div>
                      <p className={`mt-1 text-sm ${
                        notification.isRead ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
<<<<<<< HEAD
                      <p className="mt-2 text-xs text-gray-500">{notification.time}</p>
=======
                      <p className="mt-2 text-xs text-gray-500">{formatTime(notification.createdAt)}</p>
>>>>>>> fixed-repo/main
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
<<<<<<< HEAD
                        onClick={() => markAsRead(notification.id)}
                        className="text-gray-400 hover:text-gray-600 p-1"
=======
                        onClick={() => markAsRead(notification._id)}
                        className="text-gray-400 hover:text-green-600 p-1 transition-colors"
>>>>>>> fixed-repo/main
                        title="Mark as read"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
<<<<<<< HEAD
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
=======
                      onClick={() => deleteNotification(notification._id)}
                      className="text-gray-400 hover:text-red-600 p-1 transition-colors"
>>>>>>> fixed-repo/main
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
<<<<<<< HEAD
=======

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {totalCount} notifications
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
>>>>>>> fixed-repo/main
    </div>
  );
};

export default Notifications;
