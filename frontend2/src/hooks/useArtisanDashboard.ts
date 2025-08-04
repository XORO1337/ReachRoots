import { useEffect, useState } from 'react';
import { api } from '../utils/api';
import { DashboardStats, Analytics } from '../types/dashboard';

export const useArtisanDashboard = () => {
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardStats = async () => {
        try {
            const response = await api.get('/api/artisan-dashboard/stats');
            setDashboardStats(response.data);
        } catch (err) {
            setError('Failed to fetch dashboard statistics');
            console.error('Error fetching dashboard stats:', err);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await api.get('/api/artisan-dashboard/analytics');
            setAnalytics(response.data);
        } catch (err) {
            setError('Failed to fetch analytics data');
            console.error('Error fetching analytics:', err);
        }
    };

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            await Promise.all([fetchDashboardStats(), fetchAnalytics()]);
            setIsLoading(false);
        };

        loadDashboardData();

        // Refresh data every 5 minutes
        const interval = setInterval(loadDashboardData, 300000);
        return () => clearInterval(interval);
    }, []);

    return {
        dashboardStats,
        analytics,
        isLoading,
        error,
        refreshData: async () => {
            setIsLoading(true);
            await Promise.all([fetchDashboardStats(), fetchAnalytics()]);
            setIsLoading(false);
        }
    };
};
