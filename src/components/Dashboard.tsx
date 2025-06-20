import React, { useState } from 'react';
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
  Download
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  status?: 'success' | 'warning' | 'error';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, status }) => {
  const statusColors = {
    success: 'text-green-600 bg-green-50',
    warning: 'text-yellow-600 bg-yellow-50',
    error: 'text-red-600 bg-red-50'
  };

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

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'conversations', label: 'Conversations', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'knowledge', label: 'Knowledge Base', icon: <Database className="w-4 h-4" /> },
    { id: 'scraping', label: 'Web Scraping', icon: <Globe className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const metrics = [
    {
      title: 'Active Users',
      value: '2,847',
      change: '+12.5%',
      icon: <Users className="w-5 h-5" />,
      status: 'success' as const
    },
    {
      title: 'Messages Today',
      value: '18,392',
      change: '+8.2%',
      icon: <MessageSquare className="w-5 h-5" />,
      status: 'success' as const
    },
    {
      title: 'Avg Response Time',
      value: '1.2s',
      change: '-0.3s',
      icon: <Clock className="w-5 h-5" />,
      status: 'success' as const
    },
    {
      title: 'RAG Accuracy',
      value: '94.7%',
      change: '+2.1%',
      icon: <TrendingUp className="w-5 h-5" />,
      status: 'success' as const
    }
  ];

  const systemStatus = [
    { service: 'Telegram API', status: 'healthy', uptime: '99.9%' },
    { service: 'LLM Service', status: 'healthy', uptime: '99.7%' },
    { service: 'Redis Cache', status: 'healthy', uptime: '100%' },
    { service: 'Milvus Vector DB', status: 'warning', uptime: '98.2%' },
    { service: 'Reranker API', status: 'healthy', uptime: '99.5%' }
  ];

  const recentConversations = [
    { id: 1, user: '@john_doe', message: 'How do I reset my password?', time: '2 min ago', status: 'resolved' },
    { id: 2, user: '@sarah_smith', message: 'What are your business hours?', time: '5 min ago', status: 'resolved' },
    { id: 3, user: '@mike_wilson', message: 'Can you help with billing issues?', time: '8 min ago', status: 'pending' },
    { id: 4, user: '@emma_brown', message: 'Product information needed', time: '12 min ago', status: 'resolved' }
  ];

  const knowledgeBase = [
    { id: 1, source: 'company-website.com', documents: 247, lastUpdate: '2 hours ago', status: 'synced' },
    { id: 2, source: 'help.company.com', documents: 156, lastUpdate: '4 hours ago', status: 'synced' },
    { id: 3, source: 'blog.company.com', documents: 89, lastUpdate: '1 day ago', status: 'pending' },
    { id: 4, source: 'docs.company.com', documents: 312, lastUpdate: '6 hours ago', status: 'synced' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
            <RefreshCw className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
          <div className="space-y-3">
            {systemStatus.map((service, index) => (
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
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {recentConversations.map((conv) => (
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
            ))}
          </div>
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
              {recentConversations.map((conv) => (
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

  const renderKnowledgeBase = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Knowledge Base Management</h2>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Database className="w-4 h-4" />
          <span>Add Source</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Documents"
          value="804"
          change="+23"
          icon={<Database className="w-5 h-5" />}
        />
        <MetricCard
          title="Vector Embeddings"
          value="12.4K"
          change="+156"
          icon={<Bot className="w-5 h-5" />}
        />
        <MetricCard
          title="Active Sources"
          value="4"
          icon={<Globe className="w-5 h-5" />}
        />
        <MetricCard
          title="Last Sync"
          value="2h ago"
          icon={<RefreshCw className="w-5 h-5" />}
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
              {knowledgeBase.map((kb) => (
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
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Sync</button>
                    <button className="text-gray-600 hover:text-gray-900">Configure</button>
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
        return <div className="text-center py-12 text-gray-500">Web Scraping configuration coming soon...</div>;
      case 'settings':
        return <div className="text-center py-12 text-gray-500">Settings panel coming soon...</div>;
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