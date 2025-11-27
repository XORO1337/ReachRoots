import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import shippingAgentService from '../../../services/shippingAgentService';
import {
  Package,
  Truck,
  Wallet,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  todayDeliveries: number;
  pendingPickups: number;
  totalEarnings: number;
  averageRating: number;
  totalDeliveries: number;
  walletBalance: number;
  weeklyEarnings: number;
}

interface PendingPickup {
  orderId: string;
  pickupAddress: {
    city: string;
    state: string;
  };
  deliveryAddress: {
    city: string;
    state: string;
  };
  estimatedEarnings: number;
  distance: number;
  orderValue: number;
  requestedAt: string;
}

const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingPickups, setPendingPickups] = useState<PendingPickup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dashboardResponse, pickupsResponse] = await Promise.all([
        shippingAgentService.getAgentDashboard(),
        shippingAgentService.getOpportunities({ limit: 5 })
      ]);
      
      // Map the response to our stats format
      setStats({
        todayDeliveries: dashboardResponse?.stats?.completedToday || 0,
        pendingPickups: dashboardResponse?.stats?.pendingPickups || 0,
        totalEarnings: dashboardResponse?.profile?.walletBalance || 0,
        averageRating: dashboardResponse?.profile?.rating || 0,
        totalDeliveries: dashboardResponse?.profile?.totalDeliveries || 0,
        walletBalance: dashboardResponse?.profile?.walletBalance || 0,
        weeklyEarnings: (dashboardResponse?.stats?.todaysEarnings || 0) * 7 // Estimate
      });
      
      // Handle pickupsResponse - it might be an array, or an object with data property
      const pickupsArray = Array.isArray(pickupsResponse) 
        ? pickupsResponse 
        : (pickupsResponse?.data || pickupsResponse?.opportunities || []);
      setPendingPickups(Array.isArray(pickupsArray) ? pickupsArray : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
      // Set default stats if API fails
      setStats({
        todayDeliveries: 0,
        pendingPickups: 0,
        totalEarnings: 0,
        averageRating: 0,
        totalDeliveries: 0,
        walletBalance: 0,
        weeklyEarnings: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-emerald-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, Agent!</h2>
        <p className="text-emerald-100">Here's your delivery overview for today</p>
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1.5">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">Status: Active</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-700">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="ml-auto text-yellow-600 hover:text-yellow-800 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Today</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.todayDeliveries || 0}</p>
          <p className="text-sm text-gray-500">Deliveries Today</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-emerald-600 font-medium">Available</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.pendingPickups || 0}</p>
          <p className="text-sm text-gray-500">Pending Pickups</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.walletBalance || 0)}</p>
          <p className="text-sm text-gray-500">Wallet Balance</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Rating</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.averageRating?.toFixed(1) || '0.0'}</p>
          <p className="text-sm text-gray-500">Average Rating</p>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Total Deliveries</p>
              <p className="text-3xl font-bold mt-1">{stats?.totalDeliveries || 0}</p>
            </div>
            <Truck className="w-10 h-10 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Earnings</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(stats?.totalEarnings || 0)}</p>
            </div>
            <Wallet className="w-10 h-10 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">This Week</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(stats?.weeklyEarnings || 0)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Available Opportunities */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Available Pickup Opportunities</h3>
            <p className="text-sm text-gray-500">Accept deliveries to earn more</p>
          </div>
          <button 
            onClick={() => navigate('/agent/opportunities')}
            className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {(!pendingPickups || pendingPickups.length === 0) ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No pickup opportunities available right now</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for new requests</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {(pendingPickups || []).slice(0, 3).map((pickup, index) => (
              <div key={pickup?.orderId || index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">Order #{(pickup?.orderId || '').slice(-8)}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                        {formatCurrency(pickup?.estimatedEarnings || 0)} commission
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        <span>{pickup?.pickupAddress?.city || 'N/A'}, {pickup?.pickupAddress?.state || ''}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span>{pickup?.deliveryAddress?.city || 'N/A'}, {pickup?.deliveryAddress?.state || ''}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Distance: ~{pickup?.distance || '10'}km • Order Value: {formatCurrency(pickup?.orderValue || 0)}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/agent/opportunities')}
                    className="ml-4 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/agent/opportunities')}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Find Opportunities</h4>
              <p className="text-sm text-gray-500">Browse available pickup requests</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-emerald-600 transition-colors" />
          </div>
        </button>

        <button
          onClick={() => navigate('/agent/deliveries')}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">My Deliveries</h4>
              <p className="text-sm text-gray-500">Manage active and past deliveries</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-600 transition-colors" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default DashboardOverview;
