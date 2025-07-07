// Service API pour l'administration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  activeUsers: number;
  totalUsers: number;
  activeSessions: number;
  databaseConnections: number;
  apiRequests: number;
  errors: number;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  activities?: Activity[];
  campaigns?: Campaign[];
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  archived: boolean;
  archivedAt?: string;
  ads?: Ad[];
}

interface Ad {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  status: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  createdAt: string;
  updatedAt: string;
  campaignId: string;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  metadata: string;
  createdAt: string;
  userId: string;
}

interface AnalyticsData {
  overview: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalAds: number;
    totalSpent: number;
  };
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    conversionRate: number;
    budgetUtilization: number;
    averageCpc: number;
    averageCpa: number;
  };
  charts: {
    dailyStats: any[];
    topCampaigns: any[];
  };
  recentActivities: Activity[];
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class AdminApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
    }
    return response.json();
  }

  // Authentification Admin
  async loginAdmin(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(response);
  }

  async verifyAdminSession(): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE_URL}/admin/verify-session`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Gestion des utilisateurs
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUserById(userId: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async suspendUser(userId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/suspend`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async activateUser(userId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/activate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async resetUserPassword(userId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Gestion des campagnes
  async getAllCampaigns(): Promise<Campaign[]> {
    const response = await fetch(`${API_BASE_URL}/admin/campaigns`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getCampaignById(campaignId: string): Promise<Campaign> {
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${campaignId}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateCampaign(campaignId: string, campaignData: Partial<Campaign>): Promise<Campaign> {
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${campaignId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(campaignData),
    });
    return this.handleResponse(response);
  }

  async deleteCampaign(campaignId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${campaignId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async archiveCampaign(campaignId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/archive`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Analytics et métriques
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await fetch(`${API_BASE_URL}/admin/system/metrics`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getGlobalAnalytics(period: string = '30d'): Promise<AnalyticsData> {
    const response = await fetch(`${API_BASE_URL}/admin/analytics?period=${period}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUserAnalytics(userId: string, period: string = '30d'): Promise<AnalyticsData> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/analytics?period=${period}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Activités et logs
  async getAllActivities(limit: number = 100): Promise<Activity[]> {
    const response = await fetch(`${API_BASE_URL}/admin/activities?limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUserActivities(userId: string, limit: number = 50): Promise<Activity[]> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/activities?limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Contrôle système
  async getSystemStatus(): Promise<{
    server: string;
    database: string;
    cache: string;
    queue: string;
    api: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/admin/system/status`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getSystemAlerts(): Promise<SystemAlert[]> {
    const response = await fetch(`${API_BASE_URL}/admin/system/alerts`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getDashboardStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getSecurityStatus(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/security/status`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async performSystemAction(action: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/system/action`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    });
    return this.handleResponse(response);
  }

  async clearCache(): Promise<{ message: string }> {
    return this.performSystemAction('clear_cache');
  }

  async optimizeDatabase(): Promise<{ message: string }> {
    return this.performSystemAction('optimize_database');
  }

  async backupDatabase(): Promise<{ message: string; backupId: string }> {
    return this.performSystemAction('backup_database');
  }

  async restartSystem(): Promise<{ message: string }> {
    return this.performSystemAction('restart_system');
  }

  async emergencyShutdown(): Promise<{ message: string }> {
    return this.performSystemAction('emergency_shutdown');
  }

  // Maintenance
  async enableMaintenanceMode(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/system/maintenance/enable`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async disableMaintenanceMode(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/system/maintenance/disable`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async cleanLogs(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/system/logs/clean`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Statistiques avancées
  async getSystemStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalRevenue: number;
    monthlyGrowth: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getRealTimeData(): Promise<{
    activeConnections: number;
    requestsPerMinute: number;
    errorRate: number;
    responseTime: number;
  }> {
    const response = await fetch(`${API_BASE_URL}/admin/realtime`, {
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

export const adminApi = new AdminApiService();
export type { User, Campaign, Ad, Activity, SystemMetrics, AnalyticsData, SystemAlert }; 