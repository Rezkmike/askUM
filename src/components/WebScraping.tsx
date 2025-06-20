import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Download,
  Search,
  Filter
} from 'lucide-react';
import { apiService } from '../services/api';

interface ScrapingJob {
  job_id: string;
  status: 'started' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  total_pages: number;
  urls: string[];
  started_at?: string;
  completed_at?: string;
  current_url?: string;
  documents_created?: number;
  errors?: number;
}

const WebScraping: React.FC = () => {
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJobUrls, setNewJobUrls] = useState('');
  const [newJobSettings, setNewJobSettings] = useState({
    maxDepth: 3,
    maxPages: 100,
    delay: 1
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadScrapingJobs();
    const interval = setInterval(loadScrapingJobs, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadScrapingJobs = async () => {
    try {
      const jobsData = await apiService.getScrapingJobs();
      setJobs(jobsData);
    } catch (error) {
      console.error('Failed to load scraping jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartJob = async () => {
    if (!newJobUrls.trim()) return;

    const urls = newJobUrls.split('\n').map(url => url.trim()).filter(url => url);
    
    try {
      await apiService.startScrapingJob(urls, newJobSettings.maxDepth, newJobSettings.maxPages);
      setShowAddModal(false);
      setNewJobUrls('');
      await loadScrapingJobs();
    } catch (error) {
      alert('Failed to start scraping job');
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await apiService.cancelScrapingJob(jobId);
      await loadScrapingJobs();
    } catch (error) {
      alert('Failed to cancel job');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'running':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.urls.some(url => url.toLowerCase().includes(searchQuery.toLowerCase())) ||
    job.job_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Web Scraping Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Scraping Job</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs by URL or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
        <button
          onClick={loadScrapingJobs}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Jobs List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading scraping jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-8 text-center">
            <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scraping jobs found</h3>
            <p className="text-gray-500 mb-4">Start your first web scraping job to extract content from websites.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Job</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredJobs.map((job) => (
              <div key={job.job_id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">Job {job.job_id}</h3>
                      <p className="text-sm text-gray-500">
                        {job.urls.length} URL{job.urls.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                    {job.status === 'running' && (
                      <button
                        onClick={() => handleCancelJob(job.job_id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {job.status === 'running' && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Job Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Documents Created</span>
                    <p className="font-medium">{job.documents_created || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Pages Processed</span>
                    <p className="font-medium">{job.total_pages || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Errors</span>
                    <p className="font-medium text-red-600">{job.errors || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Started</span>
                    <p className="font-medium">
                      {job.started_at ? new Date(job.started_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Current URL */}
                {job.current_url && job.status === 'running' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Currently processing:</span> {job.current_url}
                    </p>
                  </div>
                )}

                {/* URLs List */}
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Target URLs:</p>
                  <div className="space-y-1">
                    {job.urls.slice(0, 3).map((url, index) => (
                      <p key={index} className="text-sm text-gray-600 truncate">{url}</p>
                    ))}
                    {job.urls.length > 3 && (
                      <p className="text-sm text-gray-500">+{job.urls.length - 3} more URLs</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Start New Scraping Job</h3>
              <p className="text-sm text-gray-600 mt-1">Configure and start a new web scraping job</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target URLs (one per line)
                </label>
                <textarea
                  value={newJobUrls}
                  onChange={(e) => setNewJobUrls(e.target.value)}
                  placeholder="https://example.com&#10;https://docs.example.com&#10;https://blog.example.com"
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Depth
                  </label>
                  <input
                    type="number"
                    value={newJobSettings.maxDepth}
                    onChange={(e) => setNewJobSettings(prev => ({ ...prev, maxDepth: parseInt(e.target.value) }))}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Pages
                  </label>
                  <input
                    type="number"
                    value={newJobSettings.maxPages}
                    onChange={(e) => setNewJobSettings(prev => ({ ...prev, maxPages: parseInt(e.target.value) }))}
                    min="1"
                    max="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delay (seconds)
                  </label>
                  <input
                    type="number"
                    value={newJobSettings.delay}
                    onChange={(e) => setNewJobSettings(prev => ({ ...prev, delay: parseInt(e.target.value) }))}
                    min="0"
                    max="10"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Scraping Guidelines:</p>
                    <ul className="space-y-1 text-blue-600">
                      <li>• Only scrape websites you have permission to access</li>
                      <li>• Respect robots.txt and rate limits</li>
                      <li>• Higher delays reduce server load but increase job time</li>
                      <li>• Max depth controls how deep the crawler goes into the site</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartJob}
                disabled={!newJobUrls.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Scraping</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebScraping;