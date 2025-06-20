import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Key, 
  Database, 
  Bot, 
  Globe, 
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  TestTube,
  Webhook
} from 'lucide-react';

interface SettingsConfig {
  telegram: {
    botToken: string;
    webhookUrl: string;
  };
  llm: {
    apiUrl: string;
    apiKey: string;
    model: string;
  };
  reranker: {
    apiUrl: string;
    apiKey: string;
  };
  embedding: {
    model: string;
  };
  rag: {
    topK: number;
    topRerank: number;
    maxConversationHistory: number;
  };
  scraping: {
    delay: number;
    maxDepth: number;
    userAgent: string;
  };
  system: {
    debug: boolean;
    logLevel: string;
  };
}

const Settings: React.FC = () => {
  const [config, setConfig] = useState<SettingsConfig>({
    telegram: {
      botToken: '',
      webhookUrl: ''
    },
    llm: {
      apiUrl: '',
      apiKey: '',
      model: 'your-model-name'
    },
    reranker: {
      apiUrl: 'https://api.jina.ai/v1/rerank',
      apiKey: ''
    },
    embedding: {
      model: 'nomic-ai/nomic-embed-text-v1.5'
    },
    rag: {
      topK: 10,
      topRerank: 3,
      maxConversationHistory: 5
    },
    scraping: {
      delay: 1,
      maxDepth: 3,
      userAgent: 'TelegramRAGBot/1.0'
    },
    system: {
      debug: true,
      logLevel: 'INFO'
    }
  });

  const [activeTab, setActiveTab] = useState('telegram');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | null>>({});

  const tabs = [
    { id: 'telegram', label: 'Telegram', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'llm', label: 'LLM Service', icon: <Bot className="w-4 h-4" /> },
    { id: 'reranker', label: 'Reranker', icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'embedding', label: 'Embedding', icon: <Database className="w-4 h-4" /> },
    { id: 'rag', label: 'RAG Settings', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'scraping', label: 'Web Scraping', icon: <Globe className="w-4 h-4" /> },
    { id: 'system', label: 'System', icon: <SettingsIcon className="w-4 h-4" /> }
  ];

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (service: string) => {
    setTesting(prev => ({ ...prev, [service]: true }));
    setTestResults(prev => ({ ...prev, [service]: null }));

    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Random success/failure for demo
      const success = Math.random() > 0.3;
      setTestResults(prev => ({ ...prev, [service]: success ? 'success' : 'error' }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [service]: 'error' }));
    } finally {
      setTesting(prev => ({ ...prev, [service]: false }));
    }
  };

  const renderTelegramSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bot Token
        </label>
        <div className="relative">
          <input
            type={showSecrets.botToken ? 'text' : 'password'}
            value={config.telegram.botToken}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              telegram: { ...prev.telegram, botToken: e.target.value }
            }))}
            placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
            className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => toggleSecret('botToken')}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {showSecrets.botToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleTest('telegram')}
              disabled={testing.telegram || !config.telegram.botToken}
              className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {testing.telegram ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
            </button>
            {testResults.telegram && (
              testResults.telegram === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Get your bot token from @BotFather on Telegram
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Webhook URL
        </label>
        <div className="relative">
          <input
            type="text"
            value={config.telegram.webhookUrl}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              telegram: { ...prev.telegram, webhookUrl: e.target.value }
            }))}
            placeholder="https://your-domain.com/api/telegram/webhook"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={() => handleTest('webhook')}
            disabled={testing.webhook || !config.telegram.webhookUrl}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {testing.webhook ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Webhook className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Public URL where Telegram will send updates
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">Telegram Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-600">
              <li>Create a bot with @BotFather</li>
              <li>Copy the bot token and paste it above</li>
              <li>Set your webhook URL (must be HTTPS)</li>
              <li>Test the connection using the test button</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLLMSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          API URL
        </label>
        <input
          type="text"
          value={config.llm.apiUrl}
          onChange={(e) => setConfig(prev => ({
            ...prev,
            llm: { ...prev.llm, apiUrl: e.target.value }
          }))}
          placeholder="http://your-llm-service:8080/v1/chat/completions"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          API Key
        </label>
        <div className="relative">
          <input
            type={showSecrets.llmKey ? 'text' : 'password'}
            value={config.llm.apiKey}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              llm: { ...prev.llm, apiKey: e.target.value }
            }))}
            placeholder="your-api-key"
            className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => toggleSecret('llmKey')}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {showSecrets.llmKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleTest('llm')}
              disabled={testing.llm || !config.llm.apiUrl}
              className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {testing.llm ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
            </button>
            {testResults.llm && (
              testResults.llm === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Model Name
        </label>
        <input
          type="text"
          value={config.llm.model}
          onChange={(e) => setConfig(prev => ({
            ...prev,
            llm: { ...prev.llm, model: e.target.value }
          }))}
          placeholder="your-model-name"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const renderRAGSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Top K Results
          </label>
          <input
            type="number"
            value={config.rag.topK}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              rag: { ...prev.rag, topK: parseInt(e.target.value) }
            }))}
            min="1"
            max="50"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Number of documents to retrieve</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Top Rerank
          </label>
          <input
            type="number"
            value={config.rag.topRerank}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              rag: { ...prev.rag, topRerank: parseInt(e.target.value) }
            }))}
            min="1"
            max="10"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Number of documents after reranking</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conversation History
          </label>
          <input
            type="number"
            value={config.rag.maxConversationHistory}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              rag: { ...prev.rag, maxConversationHistory: parseInt(e.target.value) }
            }))}
            min="1"
            max="20"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Max messages to keep in context</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'telegram':
        return renderTelegramSettings();
      case 'llm':
        return renderLLMSettings();
      case 'rag':
        return renderRAGSettings();
      default:
        return (
          <div className="text-center py-12 text-gray-500">
            <SettingsIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>Settings for {tabs.find(t => t.id === activeTab)?.label} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;