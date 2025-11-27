import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user_action':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'order':
      case 'order_status_change':
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
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
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
              <option value="order_status_change">Order Status Changes</option>
              <option value="user_action">User Actions</option>
              <option value="admin">Admin Actions</option>
              <option value="system">System</option>
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

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
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600">Latest system and user activities</p>
        </div>

        {filteredLogs.length === 0 && !isLoading ? (
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
                    Action / Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
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
                          {log.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default ActivityLogs;
