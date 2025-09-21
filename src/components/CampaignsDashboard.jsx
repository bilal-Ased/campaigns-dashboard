import React, { useState, useCallback } from 'react';
import { 
  Upload, 
  Send, 
  Mail, 
  MessageSquare, 
  BarChart3, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Eye,
  AlertCircle,
  Loader
} from 'lucide-react';
import { campaignService } from '../services/api';
import { formatNumber, calculatePercentage } from '../utils/helpers';
import StatsCard from './StatsCard';
import FileUpload from './FileUpload';

const CampaignsDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [campaignResults, setCampaignResults] = useState([]);
  const [trackingResults, setTrackingResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [campaignType, setCampaignType] = useState('email');
  const [error, setError] = useState(null);
  const [uploadedFilePath, setUploadedFilePath] = useState(null);
  
  const [stats, setStats] = useState({
    totalSent: 0,
    successful: 0,
    failed: 0,
    processing: 0
  });

  // Handle file upload
  const handleFileUpload = useCallback(async (file) => {
    if (!file) {
      setUploadedFile(null);
      setUploadedFilePath(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await campaignService.uploadCSV(file);
      setUploadedFile(file);
      setUploadedFilePath(result.file_path);
    } catch (error) {
      setError('Failed to upload file: ' + (error.response?.data?.error || error.message));
      setUploadedFile(null);
      setUploadedFilePath(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send email campaign
  const sendEmailCampaign = async () => {
    if (!uploadedFilePath) {
      setError('Please upload a CSV file first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await campaignService.sendEmailCampaign(uploadedFilePath);
      setCampaignResults(results);
      
      // Calculate stats
      const successful = results.filter(r => r.status === 'success').length;
      const failed = results.filter(r => r.status === 'error').length;
      
      setStats({
        totalSent: results.length,
        successful,
        failed,
        processing: 0
      });
      
      setActiveTab('results');
    } catch (error) {
      setError('Failed to send email campaign: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Send SMS campaign
  const sendSMSCampaign = async () => {
    if (!uploadedFilePath) {
      setError('Please upload a CSV file first');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await campaignService.sendSMSCampaign(uploadedFilePath);
      setCampaignResults(results);
      
      // Calculate stats
      const successful = results.filter(r => r.status === 'success').length;
      const failed = results.filter(r => r.status === 'error').length;
      
      setStats({
        totalSent: results.length,
        successful,
        failed,
        processing: 0
      });
      
      setActiveTab('results');
    } catch (error) {
      setError('Failed to send SMS campaign: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Get tracking information
  const getTrackingInfo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await campaignService.getTrackingInfo();
      setTrackingResults(results);
      setActiveTab('tracking');
    } catch (error) {
      setError('Failed to get tracking info: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error after a few seconds
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Campaigns Dashboard</h1>
          <p className="text-purple-200">Manage your bulk email and SMS campaigns</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 backdrop-blur-lg bg-red-500/20 border border-red-500/30 rounded-2xl p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Sent"
            value={formatNumber(stats.totalSent)}
            icon={Send}
            color="purple"
          />
          <StatsCard
            title="Successful"
            value={formatNumber(stats.successful)}
            icon={CheckCircle}
            color="green"
            trend={stats.totalSent > 0 ? calculatePercentage(stats.successful, stats.totalSent) : 0}
          />
          <StatsCard
            title="Failed"
            value={formatNumber(stats.failed)}
            icon={XCircle}
            color="red"
          />
          <StatsCard
            title="Processing"
            value={formatNumber(stats.processing)}
            icon={Clock}
            color="yellow"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-2 border border-white/20 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'upload', label: 'Upload & Send', icon: Upload },
              { id: 'results', label: 'Campaign Results', icon: BarChart3, badge: campaignResults.length },
              { id: 'tracking', label: 'Email Tracking', icon: Eye, badge: trackingResults.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all relative ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-purple-200 hover:bg-white/10'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 border border-white/20 min-h-[600px]">
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Campaign</h2>
              
              {/* Campaign Type Selection */}
              <div className="flex space-x-4 mb-8">
                <button
                  onClick={() => setCampaignType('email')}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all ${
                    campaignType === 'email'
                      ? 'bg-blue-500/30 text-white border border-blue-400 shadow-lg'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  <Mail className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">Email Campaign</div>
                    <div className="text-sm opacity-75">Send payment reminders via email</div>
                  </div>
                </button>
                <button
                  onClick={() => setCampaignType('sms')}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all ${
                    campaignType === 'sms'
                      ? 'bg-green-500/30 text-white border border-green-400 shadow-lg'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  <MessageSquare className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">SMS Campaign</div>
                    <div className="text-sm opacity-75">Send messages via SMS</div>
                  </div>
                </button>
              </div>

              {/* File Upload */}
              <FileUpload
                onFileSelect={handleFileUpload}
                campaignType={campaignType}
                selectedFile={uploadedFile}
              />

              {/* Send Campaign Button */}
              {uploadedFile && uploadedFilePath && (
                <div className="flex space-x-4">
                  <button
                    onClick={campaignType === 'email' ? sendEmailCampaign : sendSMSCampaign}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Send {campaignType === 'email' ? 'Email' : 'SMS'} Campaign</span>
                      </>
                    )}
                  </button>
                  
                  {campaignType === 'email' && campaignResults.length > 0 && (
                    <button
                      onClick={getTrackingInfo}
                      disabled={isLoading}
                      className="px-6 py-4 bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 rounded-xl flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Eye className="h-5 w-5" />
                      <span>Get Tracking</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Campaign Results</h2>
                {campaignResults.length > 0 && (
                  <div className="flex items-center space-x-4">
                    <span className="text-purple-200 text-sm">
                      {stats.successful} successful, {stats.failed} failed
                    </span>
                    {campaignType === 'email' && (
                      <button
                        onClick={getTrackingInfo}
                        disabled={isLoading}
                        className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 px-4 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Get Tracking</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {campaignResults.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 text-purple-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-2">No campaign results yet</h3>
                  <p className="text-purple-200 mb-6">Upload a CSV and send a campaign to see results here</p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl transition-colors"
                  >
                    Create Campaign
                  </button>
                </div>
              ) : (
                <div className="backdrop-blur-lg bg-white/5 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="text-left py-4 px-6 text-purple-200 font-medium">Recipient</th>
                          <th className="text-left py-4 px-6 text-purple-200 font-medium">Status</th>
                          <th className="text-left py-4 px-6 text-purple-200 font-medium">Message ID</th>
                          <th className="text-left py-4 px-6 text-purple-200 font-medium">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaignResults.map((result, index) => (
                          <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-6 text-white font-medium">
                              {result.to || result.mobile}
                            </td>
                            <td className="py-4 px-6">
                              {result.status === 'success' ? (
                                <span className="flex items-center text-green-400 bg-green-400/20 px-3 py-1 rounded-full text-sm">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Success
                                </span>
                              ) : (
                                <span className="flex items-center text-red-400 bg-red-400/20 px-3 py-1 rounded-full text-sm">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Failed
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-purple-200 font-mono text-sm">
                              {result.message_id || 'N/A'}
                            </td>
                            <td className="py-4 px-6 text-purple-200 text-sm">
                              {result.error ? (
                                <span className="text-red-300">{result.error}</span>
                              ) : (
                                <span className="text-green-300">Sent successfully</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Email Tracking Information</h2>
                <button
                  onClick={getTrackingInfo}
                  disabled={isLoading}
                  className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span>Refresh Tracking</span>
                </button>
              </div>

              {trackingResults.length === 0 ? (
                <div className="text-center py-16">
                  <Eye className="h-16 w-16 text-purple-400 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-white mb-2">No tracking data available</h3>
                  <p className="text-purple-200 mb-6">
                    Send an email campaign first, then click "Get Tracking" to see opens, clicks, and engagement data
                  </p>
                  <button
                    onClick={getTrackingInfo}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Check for Tracking Data'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Tracking Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="backdrop-blur-lg bg-white/10 rounded-xl p-4 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-200 text-sm">Total Tracked</p>
                          <p className="text-2xl font-bold text-white">{trackingResults.length}</p>
                        </div>
                        <Mail className="h-8 w-8 text-purple-400" />
                      </div>
                    </div>
                    <div className="backdrop-blur-lg bg-white/10 rounded-xl p-4 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-200 text-sm">Total Opens</p>
                          <p className="text-2xl font-bold text-white">
                            {trackingResults.reduce((sum, r) => sum + (r.tracking?.opens || 0), 0)}
                          </p>
                        </div>
                        <Eye className="h-8 w-8 text-green-400" />
                      </div>
                    </div>
                    <div className="backdrop-blur-lg bg-white/10 rounded-xl p-4 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-200 text-sm">Total Clicks</p>
                          <p className="text-2xl font-bold text-white">
                            {trackingResults.reduce((sum, r) => sum + (r.tracking?.clicks || 0), 0)}
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-blue-400" />
                      </div>
                    </div>
                  </div>

                  {/* Tracking Table */}
                  <div className="backdrop-blur-lg bg-white/5 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="text-left py-4 px-6 text-purple-200 font-medium">Email</th>
                            <th className="text-left py-4 px-6 text-purple-200 font-medium">Message ID</th>
                            <th className="text-center py-4 px-6 text-purple-200 font-medium">Opens</th>
                            <th className="text-center py-4 px-6 text-purple-200 font-medium">Clicks</th>
                            <th className="text-left py-4 px-6 text-purple-200 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trackingResults.map((result, index) => (
                            <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                              <td className="py-4 px-6 text-white font-medium">{result.to}</td>
                              <td className="py-4 px-6 text-purple-200 font-mono text-sm">
                                {result.message_id}
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className="bg-green-400/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                                  {result.tracking?.opens || 0}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className="bg-blue-400/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                                  {result.tracking?.clicks || 0}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                {result.error ? (
                                  <span className="flex items-center text-red-400 bg-red-400/20 px-3 py-1 rounded-full text-sm">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Error
                                  </span>
                                ) : (
                                  <span className="flex items-center text-green-400 bg-green-400/20 px-3 py-1 rounded-full text-sm">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Tracked
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 border border-white/20 flex flex-col items-center space-y-4">
              <Loader className="h-12 w-12 text-purple-400 animate-spin" />
              <p className="text-white text-lg font-medium">Processing your request...</p>
              <p className="text-purple-200 text-sm text-center">
                {activeTab === 'upload' && 'Uploading and processing CSV file'}
                {activeTab === 'results' && 'Sending campaign messages'}
                {activeTab === 'tracking' && 'Fetching tracking information'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignsDashboard;