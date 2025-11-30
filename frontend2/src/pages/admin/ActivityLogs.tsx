<<<<<<< HEAD
import React, { useState } from 'react';
=======
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
>>>>>>> fixed-repo/main
import { 
  Activity, 
  Filter, 
  Download, 
  Search,
  User,
  ShoppingCart,
  Settings,
  AlertTriangle,
  CheckCircle,
<<<<<<< HEAD
  Clock
} from 'lucide-react';

interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  type: 'user_action' | 'system' | 'security' | 'order' | 'admin';
  severity: 'low' | 'medium' | 'high';
  ipAddress?: string;
}

const ActivityLogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Mock data - replace with actual API call
  const logs: ActivityLog[] = [
    {
      id: '1',
      timestamp: '2025-01-31T10:30:00Z',
      user: 'admin@rootsreach.com',
      action: 'User Status Updated',
      details: 'Changed user Amit Patel status to inactive',
      type: 'admin',
      severity: 'medium',
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      timestamp: '2025-01-31T10:25:00Z',
      user: 'sunita@example.com',
      action: 'Profile Updated',
      details: 'Updated profile information and skills',
      type: 'user_action',
      severity: 'low',
      ipAddress: '192.168.1.101'
    },
    {
      id: '3',
      timestamp: '2025-01-31T10:20:00Z',
      user: 'system',
      action: 'Database Backup',
      details: 'Automated daily backup completed successfully',
      type: 'system',
      severity: 'low'
    },
    {
      id: '4',
      timestamp: '2025-01-31T10:15:00Z',
      user: 'rajesh@example.com',
      action: 'Order Placed',
      details: 'Placed order #ORD-2025-001 for ₹25,000',
      type: 'order',
      severity: 'medium',
      ipAddress: '192.168.1.102'
    },
    {
      id: '5',
      timestamp: '2025-01-31T10:10:00Z',
      user: 'unknown',
      action: 'Failed Login Attempt',
      details: 'Multiple failed login attempts detected',
      type: 'security',
      severity: 'high',
      ipAddress: '192.168.1.200'
    }
  ];
=======
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import * as adminService from '../../services/adminService';

interface ActivityLog {
  id: string;
  orderId?: string;
  orderNumber?: string;
  timestamp: string;
  user?: string;
  userName?: string;
  action: string;
  details?: string;
  type: string;
  status?: string;
  changedBy?: string;
  note?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  total: number;
}

const ActivityLogs: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ currentPage: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [pagination.currentPage, typeFilter, dateFrom, dateTo]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.currentPage === 1) {
        fetchLogs();
      } else {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getActivityLogs({
        page: pagination.currentPage,
        limit: 20,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      });
      
      const logsData = Array.isArray(response) ? response : (response?.logs || response?.data || []);
      
      // Map to our format
      const mappedLogs = logsData.map((log: any, index: number) => ({
        id: log._id || log.id || `log-${index}`,
        orderId: log.orderId,
        orderNumber: log.orderNumber,
        timestamp: log.timestamp || log.changedAt || log.createdAt || new Date().toISOString(),
        user: log.user || log.changedBy || 'System',
        userName: log.userName,
        action: log.action || log.status || 'Activity',
        details: log.details || log.note || '',
        type: log.type || 'order_status_change',
        status: log.status,
        changedBy: log.changedBy,
        note: log.note
      }));
      
      setLogs(mappedLogs);
      
      if (response?.pagination) {
        setPagination(response.pagination);
      } else {
        setPagination(prev => ({ ...prev, total: mappedLogs.length, totalPages: Math.ceil(mappedLogs.length / 20) || 1 }));
      }
    } catch (err: any) {
      console.error('Failed to fetch logs:', err);
      setError(err.response?.data?.message || 'Failed to load activity logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert('No logs to export');
      return;
    }

    const headers = ['Timestamp', 'Type', 'User', 'Action', 'Details', 'Order Number'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        formatTimestamp(log.timestamp),
        log.type,
        log.user || log.changedBy || 'System',
        log.action,
        `"${(log.details || log.note || '').replace(/"/g, '""')}"`,
        log.orderNumber || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };
>>>>>>> fixed-repo/main

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user_action':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'order':
<<<<<<< HEAD
=======
      case 'order_status_change':
>>>>>>> fixed-repo/main
        return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case 'admin':
        return <Settings className="h-4 w-4 text-purple-500" />;
      case 'security':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'system':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

<<<<<<< HEAD
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
=======
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'pending':
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'shipped':
      case 'in_transit':
        return 'text-blue-600 bg-blue-50';
>>>>>>> fixed-repo/main
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

<<<<<<< HEAD
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    
    return matchesSearch && matchesType && matchesSeverity;
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };
=======
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.action?.toLowerCase().includes(search) ||
      log.details?.toLowerCase().includes(search) ||
      log.user?.toLowerCase().includes(search) ||
      log.orderNumber?.toLowerCase().includes(search) ||
      log.note?.toLowerCase().includes(search)
    );
  });

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-orange-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading activity logs...</span>
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
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
<<<<<<< HEAD
          <p className="text-gray-600">Monitor system activities and user actions</p>
        </div>
        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200">
          <Download className="h-4 w-4" />
          Export Logs
        </button>
      </div>

=======
          <p className="text-gray-600">Monitor system activities and user actions ({pagination.total} logs)</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchLogs}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleExportCSV}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={fetchLogs} className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium">
            Retry
          </button>
        </div>
      )}

>>>>>>> fixed-repo/main
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Types</option>
<<<<<<< HEAD
              <option value="user_action">User Actions</option>
              <option value="order">Orders</option>
              <option value="admin">Admin Actions</option>
              <option value="security">Security</option>
=======
              <option value="order_status_change">Order Status Changes</option>
              <option value="user_action">User Actions</option>
              <option value="admin">Admin Actions</option>
>>>>>>> fixed-repo/main
              <option value="system">System</option>
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

<<<<<<< HEAD
          {/* Severity Filter */}
          <div className="relative">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
=======
          {/* Date From */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="From"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="To"
            />
>>>>>>> fixed-repo/main
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600">Latest system and user activities</p>
        </div>

<<<<<<< HEAD
        {filteredLogs.length === 0 ? (
=======
        {filteredLogs.length === 0 && !isLoading ? (
>>>>>>> fixed-repo/main
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activity logs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
<<<<<<< HEAD
                    Action
=======
                    Action / Status
>>>>>>> fixed-repo/main
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
<<<<<<< HEAD
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
=======
                    Order
>>>>>>> fixed-repo/main
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(log.type)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
<<<<<<< HEAD
                          {log.type.replace('_', ' ')}
=======
                          {log.type.replace(/_/g, ' ')}
>>>>>>> fixed-repo/main
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
<<<<<<< HEAD
                      {log.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress || '-'}
=======
                      {log.user || log.changedBy || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.status ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(log.status)}`}>
                          {log.status.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{log.action}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                      {log.details || log.note || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.orderNumber ? (
                        <span className="text-blue-600 font-medium">{log.orderNumber}</span>
                      ) : '-'}
>>>>>>> fixed-repo/main
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
<<<<<<< HEAD
=======

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {pagination.currentPage} of {pagination.totalPages}
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
>>>>>>> fixed-repo/main
      </div>
    </div>
  );
};

export default ActivityLogs;
