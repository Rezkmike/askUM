const API_BASE_URL = 'http://localhost:8000/api';

export interface DashboardMetrics {
  active_users: number;
  messages_today: number;
  avg_response_time: number;
  rag_accuracy: number;
  change_active_users: string;
  change_messages: string;
  change_response_time: string;
  change_accuracy: string;
}

export interface SystemStatus {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
}

export interface Conversation {
  id: number;
  user: string;
  message: string;
  time: string;
  status: 'resolved' | 'pending';
}

export interface KnowledgeSource {
  id: number;
  source: string;
  documents: number;
  lastUpdate: string;
  status: 'synced' | 'pending';
}

export interface ActivityData {
  timestamp: string;
  messages: number;
  users: number;
  response_time: number;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Dashboard endpoints
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.request<DashboardMetrics>('/dashboard/metrics');
  }

  async getSystemStatus(): Promise<SystemStatus[]> {
    return this.request<SystemStatus[]>('/dashboard/system-status');
  }

  async getConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>('/dashboard/conversations');
  }

  async getActivityData(): Promise<ActivityData[]> {
    return this.request<ActivityData[]>('/dashboard/activity');
  }

  // Knowledge base endpoints
  async getKnowledgeSources(): Promise<KnowledgeSource[]> {
    return this.request<KnowledgeSource[]>('/knowledge/sources');
  }

  async addKnowledgeSource(url: string, maxDepth: number = 3, maxPages: number = 100) {
    return this.request('/knowledge/sources', {
      method: 'POST',
      body: JSON.stringify({
        url,
        max_depth: maxDepth,
        max_pages: maxPages,
      }),
    });
  }

  async syncKnowledgeSource(sourceId: number) {
    return this.request(`/knowledge/sources/${sourceId}/sync`, {
      method: 'POST',
    });
  }

  async getKnowledgeStats() {
    return this.request('/knowledge/stats');
  }

  // Scraping endpoints
  async startScrapingJob(urls: string[], maxDepth: number = 3, maxPages: number = 100) {
    return this.request('/scraping/start', {
      method: 'POST',
      body: JSON.stringify({
        urls,
        max_depth: maxDepth,
        max_pages: maxPages,
      }),
    });
  }

  async getScrapingJobs() {
    return this.request('/scraping/jobs');
  }

  async getScrapingJobStatus(jobId: string) {
    return this.request(`/scraping/jobs/${jobId}`);
  }

  async cancelScrapingJob(jobId: string) {
    return this.request(`/scraping/jobs/${jobId}`, {
      method: 'DELETE',
    });
  }

  // Telegram endpoints
  async getTelegramStats() {
    return this.request('/telegram/stats');
  }

  async setTelegramWebhook() {
    return this.request('/telegram/set-webhook', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();