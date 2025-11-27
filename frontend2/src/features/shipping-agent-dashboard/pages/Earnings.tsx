import React, { useState, useEffect } from 'react';
import shippingAgentService, { Earnings as EarningsType } from '../../../services/shippingAgentService';
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Download,
  Truck
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'bonus';
  amount: number;
  description: string;
  orderId?: string;
  orderNumber?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

const Earnings: React.FC = () => {
  const [earnings, setEarnings] = useState<EarningsType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [dateFilter, setDateFilter] = useState<'week' | 'month' | 'today'>('month');
  
  // Bank details for withdrawal
  const [bankDetails, setBankDetails] = useState({
    bankAccount: '',
    ifscCode: '',
    accountHolderName: ''
  });

  useEffect(() => {
    fetchEarningsData();
  }, [dateFilter]);

  const fetchEarningsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const earningsData = await shippingAgentService.getEarnings(dateFilter);
      setEarnings(earningsData);
      
      // Convert payout history to transactions format
      const txns: Transaction[] = earningsData.payoutHistory?.map((p, idx) => ({
        id: p.transactionId || `payout-${idx}`,
        type: 'withdrawal' as const,
        amount: -p.amount,
        description: 'Bank Transfer',
        status: p.status,
        createdAt: p.requestedAt
      })) || [];
      
      setTransactions(txns);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load earnings data');
      // Demo data for fallback
      setEarnings({
        wallet: { balance: 8750, totalEarnings: 45680 },
        periodEarnings: { period: dateFilter, totalCommission: 12500, deliveryCount: 78, totalOrderValue: 625000 },
        dailyBreakdown: [],
        payoutHistory: []
      });
      setTransactions([
        {
          id: '1',
          type: 'earning',
          amount: 180,
          description: 'Delivery Commission',
          orderId: '507f1f77bcf86cd799439011',
          orderNumber: 'ORD-2024-001',
          status: 'completed',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'earning',
          amount: 120,
          description: 'Delivery Commission',
          orderId: '507f1f77bcf86cd799439012',
          orderNumber: 'ORD-2024-002',
          status: 'completed',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'bonus',
          amount: 500,
          description: 'Weekly Performance Bonus',
          status: 'completed',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          type: 'withdrawal',
          amount: -5000,
          description: 'Bank Transfer',
          status: 'completed',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          type: 'earning',
          amount: 90,
          description: 'Delivery Commission',
          orderId: '507f1f77bcf86cd799439013',
          orderNumber: 'ORD-2024-003',
          status: 'completed',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(withdrawAmount) > (earnings?.wallet?.balance || 0)) {
      setError('Insufficient balance');
      return;
    }

    if (!bankDetails.bankAccount || !bankDetails.ifscCode || !bankDetails.accountHolderName) {
      setError('Please fill all bank details');
      return;
    }

    setIsWithdrawing(true);
    try {
      await shippingAgentService.requestPayout(parseFloat(withdrawAmount));
      
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      fetchEarningsData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process withdrawal');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'bonus':
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTransactionBadge = (_type: string, amount: number) => {
    const isPositive = amount > 0;
    return (
      <span className={`font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{formatCurrency(amount)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-emerald-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading earnings data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Earnings</h2>
          <p className="text-gray-500">Track your commissions and manage withdrawals</p>
        </div>
        <button
          onClick={() => setShowWithdrawModal(true)}
          disabled={(earnings?.wallet?.balance || 0) < 100}
          className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Wallet className="w-4 h-4" />
          <span>Withdraw Funds</span>
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-yellow-600 hover:text-yellow-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <Wallet className="w-8 h-8 text-emerald-200" />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Available</span>
          </div>
          <p className="text-emerald-100 text-sm">Wallet Balance</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(earnings?.wallet?.balance || 0)}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-emerald-600 font-medium flex items-center">
              <ArrowUpRight className="w-3 h-3" />
              +12%
            </span>
          </div>
          <p className="text-gray-500 text-sm">Period Commission</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(earnings?.periodEarnings?.totalCommission || 0)}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm">Deliveries</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{earnings?.periodEarnings?.deliveryCount || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Truck className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm">Total Earnings</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(earnings?.wallet?.totalEarnings || 0)}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{earnings?.periodEarnings?.deliveryCount || 0}</p>
          <p className="text-sm text-gray-500">Period Deliveries</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(earnings?.periodEarnings?.deliveryCount ? 
              (earnings?.periodEarnings?.totalCommission || 0) / earnings.periodEarnings.deliveryCount : 0)}
          </p>
          <p className="text-sm text-gray-500">Avg per Delivery</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(earnings?.periodEarnings?.totalOrderValue || 0)}</p>
          <p className="text-sm text-gray-500">Order Value Handled</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{earnings?.payoutHistory?.length || 0}</p>
          <p className="text-sm text-gray-500">Payouts Made</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <div className="flex items-center space-x-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'earning' ? 'bg-emerald-100' :
                      transaction.type === 'withdrawal' ? 'bg-red-100' : 'bg-purple-100'
                    }`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {transaction.orderNumber && (
                          <span className="text-emerald-600">{transaction.orderNumber}</span>
                        )}
                        <span>{formatDate(transaction.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getTransactionBadge(transaction.type, transaction.amount)}
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{transaction.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Withdraw Funds</h3>
                <button 
                  onClick={() => setShowWithdrawModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <p className="text-sm text-emerald-600">Available Balance</p>
                <p className="text-3xl font-bold text-emerald-700">{formatCurrency(earnings?.wallet?.balance || 0)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount (₹)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="100"
                  max={earnings?.wallet?.balance || 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum withdrawal: ₹100</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={bankDetails.accountHolderName}
                  onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                  placeholder="Name as per bank account"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={bankDetails.bankAccount}
                  onChange={(e) => setBankDetails({...bankDetails, bankAccount: e.target.value})}
                  placeholder="Enter account number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})}
                  placeholder="e.g., SBIN0001234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-700">
                    Withdrawals are processed within 2-3 business days. A transaction fee of ₹5 may apply.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing || !withdrawAmount}
                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isWithdrawing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Withdraw</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earnings;
