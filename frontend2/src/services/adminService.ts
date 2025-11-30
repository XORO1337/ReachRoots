import axios from 'axios';
import { API_CONFIG } from '../config/api';

const API_URL = API_CONFIG.BASE_URL;

// Get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ================== INTERFACES ==================

export interface PlatformStats {
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
    flagged: number;
  };
  orders: {
    byStatus: Record<string, { count: number; value: number }>;
    totalValue: number;
    pendingPickups: number;
  };
  revenue: {
    last30Days: number;
    ordersLast30Days: number;
  };
  agents: {
    active: number;
    total: number;
  };
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  artisanId?: string;
  buyerId?: string;
  agentId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  shippingMethod?: string;
  hasPendingPickup?: boolean;
}

export interface UserFlag {
  flag: 'scam' | 'fraud' | 'suspicious' | 'trusted' | 'vip' | 'banned' | 'warning';
  reason?: string;
  expiresAt?: string;
  addedBy?: string;
  addedAt?: string;
}

export interface ShippingAgent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  agentProfile: {
    isActive: boolean;
    commissionRate: number;
    baseDeliveryFee: number;
    walletBalance: number;
    totalEarnings: number;
    totalDeliveries: number;
    successfulDeliveries: number;
    rating: number;
    totalRatings: number;
    serviceAreas: Array<{
      district: string;
      city: string;
      pinCodes: string[];
    }>;
    vehicleType?: string;
    vehicleNumber?: string;
  };
}

export interface InterestedAgent {
  agentId: string;
  agentName: string;
  agentPhone: string;
  agentRating: number;
  interestedAt: string;
}

export interface PickupRequest {
  _id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  artisanId: {
    _id: string;
    name: string;
    phone: string;
    addresses?: Array<{
      city: string;
      district: string;
      pinCode: string;
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
      interestedAgents?: InterestedAgent[];
    };
  };
  items: Array<{
    productId: { name: string };
    quantity: number;
    price: number;
  }>;
}

// ================== DASHBOARD & STATS ==================

export const getPlatformStats = async (): Promise<PlatformStats> => {
  const response = await axios.get(`${API_URL}/api/admin/stats`, {
    headers: getAuthHeader()
  });
  return response.data.data;
};

export const getActivityLogs = async (filters: {
  type?: string;
  userId?: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
} = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });
  
  const response = await axios.get(`${API_URL}/api/admin/activity?${params}`, {
    headers: getAuthHeader()
  });
  return response.data.data;
};

// ================== ORDER MANAGEMENT ==================

export const getAllOrders = async (filters: OrderFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await axios.get(`${API_URL}/api/admin/orders?${params}`, {
    headers: getAuthHeader()
  });
  return response.data.data;
};

export const getPendingPickupRequests = async (filters: {
  pinCode?: string;
  city?: string;
  district?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });
  
  const response = await axios.get(`${API_URL}/api/admin/orders/pickups?${params}`, {
    headers: getAuthHeader()
  });
  return response.data.data;
};

export const broadcastPickupRequest = async (
  orderId: string,
  options: {
    targetAgentIds?: string[];
    targetPinCodes?: string[];
    targetDistrict?: string;
    note?: string;
  } = {}
) => {
  const response = await axios.post(
    `${API_URL}/api/admin/orders/${orderId}/broadcast`,
    options,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const assignAgentToOrder = async (
  orderId: string,
  agentId: string,
  note?: string
) => {
  const response = await axios.post(
    `${API_URL}/api/admin/orders/${orderId}/assign-agent`,
    { agentId, note },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const overrideOrderStatus = async (
  orderId: string,
  status: string,
  reason: string
) => {
  const response = await axios.patch(
    `${API_URL}/api/admin/orders/${orderId}/status`,
    { status, reason },
    { headers: getAuthHeader() }
  );
  return response.data;
};

// ================== USER MANAGEMENT ==================

export const getAllUsers = async (filters: {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
} = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });
  
  const response = await axios.get(`${API_URL}/api/admin/users?${params}`, {
    headers: getAuthHeader()
  });
  return response.data.data;
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const response = await axios.patch(
    `${API_URL}/api/admin/users/${userId}/status`,
    { isActive },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getFlaggedUsers = async (filters: {
  flag?: string;
  page?: number;
  limit?: number;
} = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });
  
  const response = await axios.get(`${API_URL}/api/admin/users/flagged?${params}`, {
    headers: getAuthHeader()
  });
  return response.data.data;
};

export const addUserFlag = async (
  userId: string,
  flagData: { flag: UserFlag['flag']; reason?: string; expiresAt?: string }
) => {
  const response = await axios.post(
    `${API_URL}/api/admin/users/${userId}/flag`,
    flagData,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const removeUserFlag = async (userId: string, flag: string) => {
  const response = await axios.delete(
    `${API_URL}/api/admin/users/${userId}/flag/${flag}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

// ================== AGENT MANAGEMENT ==================

export const getAllAgents = async (filters: {
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
} = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await axios.get(`${API_URL}/api/admin/agents?${params}`, {
    headers: getAuthHeader()
  });
  return response.data.data;
};

export const createAgent = async (agentData: {
  name: string;
  email: string;
  phone: string;
  password: string;
  commissionRate?: number;
  baseDeliveryFee?: number;
  serviceAreas?: Array<{ district: string; city: string; pinCodes: string[] }>;
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
}) => {
  const response = await axios.post(
    `${API_URL}/api/admin/agents`,
    agentData,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const updateAgent = async (agentId: string, updateData: Partial<{
  isActive: boolean;
  commissionRate: number;
  baseDeliveryFee: number;
  serviceAreas: Array<{ district: string; city: string; pinCodes: string[] }>;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
}>) => {
  const response = await axios.patch(
    `${API_URL}/api/admin/agents/${agentId}`,
    updateData,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const toggleAgentStatus = async (agentId: string, isActive: boolean) => {
  const response = await axios.patch(
    `${API_URL}/api/admin/agents/${agentId}/status`,
    { isActive },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getAgentPerformance = async (agentId: string) => {
  const response = await axios.get(
    `${API_URL}/api/admin/agents/${agentId}/performance`,
    { headers: getAuthHeader() }
  );
  return response.data.data;
};

// ================== SETTINGS ==================

export interface PlatformSettings {
  general: {
    siteName: string;
    adminEmail: string;
    supportEmail: string;
    maintenanceMode: boolean;
    maintenanceMessage: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    requireTwoFactor: boolean;
    passwordMinLength: number;
  };
  system: {
    backupFrequency: string;
    lastBackup: string | null;
    lastSystemCheck: string | null;
    systemCheckStatus: string;
    logRetentionDays: number;
    enableDebugMode: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    userRegistrationNotifications: boolean;
    securityAlerts: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
  };
  orders: {
    autoConfirmPayment: boolean;
    requireAddressVerification: boolean;
    defaultShippingMethod: string;
    maxOrderValue: number;
    minOrderValue: number;
  };
  agents: {
    defaultCommissionRate: number;
    baseDeliveryFee: number;
    autoAssignAgents: boolean;
    maxActiveDeliveries: number;
  };
}

export const getSettings = async (): Promise<PlatformSettings> => {
  const response = await axios.get(`${API_URL}/api/admin/settings`, {
    headers: getAuthHeader()
  });
  return response.data.data;
};

export const updateSettings = async (settings: Partial<PlatformSettings>) => {
  const response = await axios.put(
    `${API_URL}/api/admin/settings`,
    settings,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const runSystemCheck = async () => {
  const response = await axios.post(
    `${API_URL}/api/admin/settings/system-check`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

// ================== NOTIFICATIONS ==================

export interface AdminNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  readAt: string | null;
  relatedEntity?: {
    type: string;
    id: string;
    displayId?: string;
  };
  actionUrl?: string;
  createdAt: string;
}

export const getNotifications = async (filters: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  type?: string;
} = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  
  const response = await axios.get(`${API_URL}/api/admin/notifications?${params}`, {
    headers: getAuthHeader()
  });
  return response.data.data;
};

export const createNotification = async (data: {
  type?: string;
  title: string;
  message: string;
  priority?: string;
  relatedEntity?: { type: string; id: string; displayId?: string };
  actionUrl?: string;
}) => {
  const response = await axios.post(
    `${API_URL}/api/admin/notifications`,
    data,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const response = await axios.patch(
    `${API_URL}/api/admin/notifications/${notificationId}/read`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await axios.post(
    `${API_URL}/api/admin/notifications/mark-all-read`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const deleteNotification = async (notificationId: string) => {
  const response = await axios.delete(
    `${API_URL}/api/admin/notifications/${notificationId}`,
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getUnreadNotificationCount = async () => {
  const response = await axios.get(
    `${API_URL}/api/admin/notifications/unread-count`,
    { headers: getAuthHeader() }
  );
  return response.data.data.count;
};

// Export all functions
export const adminService = {
  // Dashboard
  getPlatformStats,
  getActivityLogs,
  // Orders
  getAllOrders,
  getPendingPickupRequests,
  broadcastPickupRequest,
  assignAgentToOrder,
  overrideOrderStatus,
  // Users
  getAllUsers,
  updateUserStatus,
  getFlaggedUsers,
  addUserFlag,
  removeUserFlag,
  // Agents
  getAllAgents,
  createAgent,
  updateAgent,
  toggleAgentStatus,
  getAgentPerformance,
  // Settings
  getSettings,
  updateSettings,
  runSystemCheck,
  // Notifications
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount
};

export default adminService;
