import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Database, 
  Bot, 
  Settings, 
  Activity, 
  Globe, 
  Users, 
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Plus,
  LogOut
} from 'lucide-react';
import { apiService, DashboardMetrics, SystemStatus, Conversation, KnowledgeSource } from '../services/api';
import WebScraping from './WebScraping';
import Settings from './Settings';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  status?: 'success' | 'warning' | 'error';
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, status, loading }) => {
  const statusColors = {
    success: 'text-green-600 bg-green-50',
    warning: 'text-yellow-600 bg-yellow-50',
    error: 'text-red-600 bg-red-50'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div>
              <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-16 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${status ? statusColors[status] : 'text-blue-600 bg-blue-50'}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {change && (
          <div className="text-right">
            <span className="text-sm font-medium text-green-600">{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeSource[]>([]);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'conversations', label: 'Conversations', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'knowledge', label: 'Knowledge Base', icon: <Database className="w-4 h-4" /> },
    { id: 'scraping', label: 'Web Scraping', icon: <Globe className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsData, statusData, conversationsData, knowledgeData] = await Promise.all([
        apiService.getDashboardMetrics().catch(() => null),
        apiService.getSystemStatus().catch(() => []),
        apiService.getConversations().catch(() => []),
        apiService.getKnowledgeSources().catch(() => [])
      ]);

      setMetrics(metricsData);
      setSystemStatus(statusData);
      setConversations(conversationsData);
      setKnowledgeBase(knowledgeData);
    } catch (err) {
      setError('Failed to load dashboard data. Please check if the backend is running.');
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKnowledgeSource = async () => {
    const url = prompt('Enter the URL to scrape:');
    if (url) {
      try {
        await apiService.addKnowledgeSource(url);
        await loadDashboardData(); // Refresh data
        alert('Knowledge source added successfully!');
      } catch (err) {
        alert('Failed to add knowledge source');
      }
    }
  };

  const handleSyncKnowledgeSource = async (sourceId: number) => {
    try {
      await apiService.syncKnowledgeSource(sourceId);
      alert('Sync started successfully!');
    } catch (err) {
      alert('Failed to start sync');
    }
  };

  const renderOverview = () => {
    const metricsArray = metrics ? [
      {
        title: 'Active Users',
        value: metrics.active_users.toLocaleString(),
        change: metrics.change_active_users,
        icon: <Users className="w-5 h-5" />,
        status: 'success' as const
      },
      {
        title: 'Messages Today',
        value: metrics.messages_today.toLocaleString(),
        change: metrics.change_messages,
        icon: <MessageSquare className="w-5 h-5" />,
        status: 'success' as const
      },
      {
        title: 'Avg Response Time',
        value: `${metrics.avg_response_time}s`,
        change: metrics.change_response_time,
        icon: <Clock className="w-5 h-5" />,
        status: 'success' as const
      },
      {
        title: 'RAG Accuracy',
        value: `${metrics.rag_accuracy}%`,
        change: metrics.change_accuracy,
        icon: <TrendingUp className="w-5 h-5" />,
        status: 'success' as const
      }
    ] : [];

    return (
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
              <button 
                onClick={loadDashboardData}
                className="ml-auto text-red-600 hover:text-red-800 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <MetricCard key={index} title="" value="" icon={<div />} loading />
            ))
          ) : (
            metricsArray.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
              <RefreshCw 
                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" 
                onClick={loadDashboardData}
              />
            </div>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <div className="w-24 h-4 bg-gray-300 rounded"></div>
                      </div>
                      <div className="w-12 h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                systemStatus.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {service.status === 'healthy' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : service.status === 'warning' ? (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium text-gray-900">{service.service}</span>
                    </div>
                    <span className="text-sm text-gray-600">{service.uptime}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="flex items-center justify-between p-3 rounded-lg">
                      <div className="flex-1">
                        <div className="w-20 h-4 bg-gray-300 rounded mb-2"></div>
                        <div className="w-32 h-3 bg-gray-300 rounded"></div>
                      </div>
                      <div className="w-12 h-3 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                conversations.map((conv) => (
                  <div key={conv.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{conv.user}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          conv.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {conv.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conv.message}</p>
                    </div>
                    <span className="text-xs text-gray-400">{conv.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderKnowledgeBase = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Knowledge Base Management</h2>
        <button 
          onClick={handleAddKnowledgeSource}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Source</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Documents"
          value={metrics?.total_documents || "804"}
          change="+23"
          icon={<Database className="w-5 h-5" />}
          loading={loading}
        />
        <MetricCard
          title="Vector Embeddings"
          value={metrics?.vector_embeddings || "12.4K"}
          change="+156"
          icon={<Bot className="w-5 h-5" />}
          loading={loading}
        />
        <MetricCard
          title="Active Sources"
          value={metrics?.active_sources || "4"}
          icon={<Globe className="w-5 h-5" />}
          loading={loading}
        />
        <MetricCard
          title="Last Sync"
          value={metrics?.last_sync || "2h ago"}
          icon={<RefreshCw className="w-5 h-5" />}
          loading={loading}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4"><div className="w-32 h-4 bg-gray-300 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-16 h-4 bg-gray-300 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-20 h-4 bg-gray-300 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-16 h-6 bg-gray-300 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="w-24 h-4 bg-gray-300 rounded"></div></td>
                  </tr>
                ))
              ) : (
                knowledgeBase.map((kb) => (
                  <tr key={kb.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="w-5 h-5 text-gray-400 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{kb.source}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{kb.documents}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kb.lastUpdate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        kb.status === 'synced' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {kb.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleSyncKnowledgeSource(kb.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Sync
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">Configure</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderConversations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Conversation Management</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {conversations.map((conv) => (
                <tr key={conv.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {conv.user.charAt(1).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{conv.user}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{conv.message}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{conv.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      conv.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {conv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-gray-600 hover:text-gray-900">Export</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'conversations':
        return renderConversations();
      case 'knowledge':
        return renderKnowledgeBase();
      case 'scraping':
        return <WebScraping />;
      case 'settings':
        return <Settings />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">RAG Chatbot Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">A</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;