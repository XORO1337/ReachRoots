import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.BASE_URL;

// Get auth header for shipping agent
const getAuthHeader = () => {
  // Try agentToken first (used by AgentAuthContext), then fallback to token
  const token = localStorage.getItem('agentToken') || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ================== INTERFACES ==================

export interface AgentProfile {
  name: string;
  rating: number;
  totalDeliveries: number;
  successRate: number;
  walletBalance: number;
}

export interface AgentStats {
  pendingPickups: number;
  activeDeliveries: number;
  completedToday: number;
  completedThisMonth: number;
  todaysEarnings: number;
}

export interface AgentDashboard {
  profile: AgentProfile;
  stats: AgentStats;
}

export interface DeliveryOpportunity {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  estimatedCommission: number;
  artisanId: {
    _id: string;
    name: string;
    phone: string;
    addresses?: Array<{
      city: string;
      district: string;
      pinCode: string;
      street: string;
    }>;
  };
  buyerId: {
    _id: string;
    name: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  shippingDetails?: {
    pickupRequestedAt?: string;
    broadcastInfo?: {
      broadcastedAt?: string;
    };
  };
  items: Array<{
    productId: { name: string; images?: string[] };
    quantity: number;
    price: number;
  }>;
  createdAt: string;
}

export interface AssignedDelivery {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  artisanId: {
    _id: string;
    name: string;
    phone: string;
    addresses?: Array<{
      city: string;
      district: string;
      pinCode: string;
      street: string;
    }>;
  };
  buyerId: {
    _id: string;
    name: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  shippingDetails: {
    assignedAgentId: string;
    agentAssignedAt: string;
    agentAccepted?: boolean;
    agentAcceptedAt?: string;
    agentCommission: number;
    trackingNumber?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
  };
  items: Array<{
    productId: { name: string; images?: string[] };
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Earnings {
  wallet: {
    balance: number;
    totalEarnings: number;
  };
  periodEarnings: {
    period: string;
    totalCommission: number;
    deliveryCount: number;
    totalOrderValue: number;
  };
  dailyBreakdown: Array<{
    _id: string;
    commission: number;
    deliveries: number;
  }>;
  payoutHistory: Array<{
    amount: number;
    transactionId: string;
    status: 'pending' | 'completed' | 'failed';
    requestedAt: string;
    processedAt?: string;
  }>;
}

export interface BankDetails {
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
}

export interface ServiceArea {
  district: string;
  city: string;
  pinCodes: string[];
}

// ================== DASHBOARD ==================

export const getAgentDashboard = async (): Promise<AgentDashboard> => {
  const response = await axios.get(`${API_URL}/api/agent/dashboard`, {
    headers: getAuthHeader()
  });
  return response.data.data;
};

export const getAgentProfile = async () => {
  const response = await axios.get(`${API_URL}/api/agent/profile`, {
    headers: getAuthHeader()
  });
  return response.data.data;
};

// ================== OPPORTUNITIES ==================

export const getOpportunities = async (filters: {
  page?: number;
  limit?: number;
  pinCode?: string;
  district?: string;
} = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });
  
  const response = await axios.get(`${API_URL}/api/agent/opportunities?${params}`, {
    headers: getAuthHeader()
  });
  return response.data.data;
};

export const expressInterest = async (orderId: string) => {
  const response = await axios.post(
    `${API_URL}/api/agent/opportunities/${orderId}/interest`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const acceptDelivery = async (orderId: string) => {
  const response = await axios.post(
    `${API_URL}/api/agent/opportunities/${orderId}/accept`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

// ================== DELIVERIES ==================

export const getAssignedDeliveries = async (filters: {
  status?: 'pending' | 'active' | 'completed';
  page?: number;
  limit?: number;
} = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });
  
  const response = await axios.get(`${API_URL}/api/agent/deliveries?${params}`, {
    headers: getAuthHeader()
  });
  return response.data.data;
};

export const confirmPickup = async (
  orderId: string,
  data: { note?: string; pickupProofImage?: string } = {}
) => {
  const response = await axios.post(
    `${API_URL}/api/agent/deliveries/${orderId}/pickup`,
    data,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const markDelivered = async (
  orderId: string,
  data: {
    note?: string;
    deliveryProofImage?: string;
    signature?: string;
    otp?: string;
  } = {}
) => {
  const response = await axios.post(
    `${API_URL}/api/agent/deliveries/${orderId}/deliver`,
    data,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getDeliveryHistory = async (filters: {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
} = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });
  
  const response = await axios.get(`${API_URL}/api/agent/deliveries/history?${params}`, {
    headers: getAuthHeader()
  });
  return response.data.data;
};

// ================== EARNINGS & PAYOUTS ==================

export const getEarnings = async (period: 'today' | 'week' | 'month' = 'month'): Promise<Earnings> => {
  const response = await axios.get(`${API_URL}/api/agent/earnings?period=${period}`, {
    headers: getAuthHeader()
  });
  return response.data.data;
};

export const requestPayout = async (amount: number) => {
  const response = await axios.post(
    `${API_URL}/api/agent/payout`,
    { amount },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const updateBankDetails = async (bankDetails: BankDetails) => {
  const response = await axios.put(
    `${API_URL}/api/agent/bank-details`,
    bankDetails,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const updateServiceAreas = async (serviceAreas: ServiceArea[]) => {
  const response = await axios.put(
    `${API_URL}/api/agent/service-areas`,
    { serviceAreas },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// ================== EXPORT ==================

export const shippingAgentService = {
  // Dashboard
  getAgentDashboard,
  getAgentProfile,
  // Opportunities
  getOpportunities,
  expressInterest,
  acceptDelivery,
  // Deliveries
  getAssignedDeliveries,
  confirmPickup,
  markDelivered,
  getDeliveryHistory,
  // Earnings
  getEarnings,
  requestPayout,
  updateBankDetails,
  updateServiceAreas
};

export default shippingAgentService;
