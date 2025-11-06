import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Upload,
  Send,
  Mail,
  MessageSquare,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
  Loader,
  RefreshCw,
  Calendar,
  Users
} from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:8000';

const formatNumber = (num) => num?.toLocaleString() || '0';
const calculatePercentage = (value, total) => total > 0 ? Math.round((value / total) * 100) : 0;

const StatsCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
    <div className="flex items-center justify-between mb-4">
      <Icon className={`h-8 w-8 text-${color}-400`} />
      {trend !== undefined && (
        <span className="text-sm text-purple-300">{trend}%</span>
      )}
    </div>
    <h3 className="text-purple-200 text-sm mb-1">{title}</h3>
    <p className="text-3xl font-bold text-white">{value}</p>
  </div>
);

const FileUpload = ({ onFileSelect, selectedFile, isLoading, campaignName, onCampaignNameChange }) => (
  <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
    <h3 className="text-xl font-semibold text-white mb-4">Upload CSV File & Name Campaign</h3>
    
    <div className="mb-4">
      <label className="text-purple-200 text-sm mb-2 block">Campaign Name *</label>
      <input
        type="text"
        value={campaignName}
        onChange={(e) => onCampaignNameChange(e.target.value)}
        placeholder="e.g., September Payment Reminders 2025"
        className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        disabled={isLoading}
      />
    </div>

    <div className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
      <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
      <p className="text-purple-200 mb-2">
        {selectedFile ? selectedFile.name : 'Drag and drop your CSV file here or click to browse'}
      </p>
      {selectedFile && (
        <p className="text-sm text-purple-300 mb-2">
          Size: {(selectedFile.size / 1024).toFixed(2)} KB
        </p>
      )}
      <input
        type="file"
        accept=".csv"
        onChange={(e) => onFileSelect(e.target.files[0])}
        className="hidden"
        id="file-upload"
        disabled={isLoading}
      />
      <label
        htmlFor="file-upload"
        className={`inline-block bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors mt-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Uploading...' : 'Select File'}
      </label>
      {selectedFile && (
        <button
          onClick={() => onFileSelect(null)}
          className="ml-3 inline-block bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors mt-2"
          disabled={isLoading}
        >
          Clear
        </button>
      )}
    </div>
  </div>
);

const CSVPreview = ({ headers, data }) => {
  if (!data || data.length === 0) return null;
 
  return (
    <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 mt-6">
      <h3 className="text-xl font-semibold text-white mb-4">CSV Preview (First 5 rows)</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/20">
              {headers.map((header, idx) => (
                <th key={idx} className="text-left p-3 text-purple-200 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-white/10">
                {headers.map((header, colIdx) => (
                  <td key={colIdx} className="p-3 text-white">
                    {row[header] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EmailComposer = ({ csvHeaders, csvData, emailTemplate, emailSubject, onTemplateChange, onSubjectChange }) => {
  const previewEmail = () => {
    if (!csvData.length || !emailTemplate) return null;
    let preview = emailTemplate;
    const firstRow = csvData[0];
    for (const [key, value] of Object.entries(firstRow)) {
      const placeholder = `{${key}}`;
      preview = preview.replace(new RegExp(placeholder, 'g'), value);
    }
    return preview;
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">Compose Email</h3>
      
      <div className="mb-4">
        <label className="text-purple-200 text-sm mb-2 block">Email Subject *</label>
        <input
          type="text"
          value={emailSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="e.g., Payment Reminder - Invoice {Balance}"
          className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="mb-4">
        <label className="text-purple-200 text-sm mb-2 block">Available Fields (Click to insert):</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {csvHeaders.map((header) => (
            <button
              key={header}
              onClick={() => onTemplateChange(emailTemplate + `{${header}}`)}
              className="bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 px-3 py-1 rounded-lg text-sm transition-colors"
            >
              {`{${header}}`}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={emailTemplate}
        onChange={(e) => onTemplateChange(e.target.value)}
        placeholder="Type your email message. Use HTML for formatting. Click field names above to insert them. Example: Dear {Name}, your balance of Ksh {Balance} is overdue..."
        className="w-full h-48 bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
      />
      
      <div className="mt-2 text-sm text-purple-300">
        Tip: You can use HTML tags like &lt;p&gt;, &lt;b&gt;, &lt;br&gt; for formatting
      </div>

      {csvData.length > 0 && emailTemplate && (
        <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <p className="text-blue-200 text-sm font-medium mb-2">Preview (first contact):</p>
          <div className="text-white text-sm bg-white/10 rounded p-3 max-h-60 overflow-y-auto">
            <div dangerouslySetInnerHTML={{ __html: previewEmail() }} />
          </div>
        </div>
      )}
    </div>
  );
};

const SMSMessageComposer = ({ csvHeaders, csvData, messageTemplate, onMessageChange }) => {
  const charCount = messageTemplate.length;
  const messageCount = Math.ceil(charCount / 160);
 
  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">Compose SMS Message</h3>
      <div className="mb-4">
        <label className="text-purple-200 text-sm mb-2 block">Available Fields (Click to insert):</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {csvHeaders.map((header) => (
            <button
              key={header}
              onClick={() => onMessageChange(messageTemplate + `{${header}}`)}
              className="bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 px-3 py-1 rounded-lg text-sm transition-colors"
            >
              {`{${header}}`}
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={messageTemplate}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="Type your message here. Click field names above to insert them. Example: Dear {Name}, your balance is Ksh {Balance}."
        className="w-full h-32 bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-purple-300">
          {charCount} characters ({messageCount} SMS)
        </span>
        {charCount > 160 && (
          <span className="text-yellow-400">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            Message will be split into {messageCount} parts
          </span>
        )}
      </div>
      {csvData.length > 0 && messageTemplate && (
        <div className="mt-4 p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <p className="text-blue-200 text-sm font-medium mb-2">Preview (first contact):</p>
          <p className="text-white text-sm">
            {messageTemplate.replace(/\{(\w+)\}/g, (match, field) => csvData[0][field] || match)}
          </p>
        </div>
      )}
    </div>
  );
};

const ConfirmDialog = ({ isOpen, onConfirm, onCancel, campaignType, total, smsMessage, emailSubject, campaignName }) => {
  if (!isOpen) return null;
 
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 border border-white/20 max-w-md w-full mx-4">
        <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-4 text-center">Confirm Campaign</h3>
        <div className="space-y-3 mb-6">
          {campaignName && (
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
              <p className="text-purple-200 text-sm font-medium mb-1">Campaign Name:</p>
              <p className="text-white font-semibold">{campaignName}</p>
            </div>
          )}
          <p className="text-purple-200 text-center">
            You are about to send <span className="font-bold text-white">{total}</span> {campaignType} messages.
          </p>
          {emailSubject && (campaignType === 'Email' || campaignType === 'Email + SMS') && (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-200 text-sm font-medium mb-1">Email Subject:</p>
              <p className="text-white text-sm">{emailSubject}</p>
            </div>
          )}
          {smsMessage && (campaignType === 'SMS' || campaignType === 'Email + SMS') && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-200 text-sm font-medium mb-1">SMS Preview:</p>
              <p className="text-white text-sm">{smsMessage}</p>
            </div>
          )}
          <p className="text-sm text-purple-300 text-center">This action cannot be undone.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 rounded-xl transition-colors font-semibold"
          >
            Send Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

const CampaignsDashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [campaignHistory, setCampaignHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [campaignType, setCampaignType] = useState('email');
  const [hasEmailColumn, setHasEmailColumn] = useState(false);
  const [hasMobileColumn, setHasMobileColumn] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFilePath, setUploadedFilePath] = useState(null);
  const [smsMessageTemplate, setSmsMessageTemplate] = useState('');
  const [emailMessageTemplate, setEmailMessageTemplate] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvPreviewData, setCsvPreviewData] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
 
  const [progress, setProgress] = useState({
    campaignId: null,
    status: 'idle',
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    progressPercent: 0,
    message: ''
  });
 
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
 
  const [stats, setStats] = useState({
    totalSent: 0,
    successful: 0,
    failed: 0,
    processing: 0
  });

  const fetchAllCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns`);
      if (response.ok) {
        const data = await response.json();
        setAllCampaigns(data);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const connectWebSocket = useCallback((campaignId, retryCount = 0) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = `ws://localhost:8000/ws/campaign/${campaignId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setError(null);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Progress update:', data);
     
      const emailSuccess = data.email_success || 0;
      const emailFailed = data.email_failed || 0;
      const smsSuccess = data.sms_success || 0;
      const smsFailed = data.sms_failed || 0;
     
      const totalSuccess = emailSuccess + smsSuccess;
      const totalFailed = emailFailed + smsFailed;
     
      setProgress({
        campaignId: data.campaign_id,
        status: data.status,
        total: data.total || 0,
        processed: data.processed || 0,
        success: totalSuccess,
        failed: totalFailed,
        progressPercent: data.progress_percent || 0,
        message: data.message || ''
      });

      setStats({
        totalSent: data.total || 0,
        successful: totalSuccess,
        failed: totalFailed,
        processing: (data.processed < data.total) ? (data.total - data.processed) : 0
      });

      if (data.status === 'completed' || data.status === 'error') {
        setTimeout(() => {
          ws.close();
          setIsLoading(false);
          if (data.status === 'completed') {
            setCampaignHistory(prev => [{
              id: data.campaign_id,
              type: campaignType,
              total: data.total,
              success: totalSuccess,
              failed: totalFailed,
              timestamp: new Date().toISOString(),
              status: 'completed'
            }, ...prev]);
            setActiveTab('campaigns');
            fetchAllCampaigns();
          }
        }, 2000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (retryCount < 3) {
        setError(`Connection error. Retrying (${retryCount + 1}/3)...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket(campaignId, retryCount + 1);
        }, 3000);
      } else {
        setError('Connection failed after 3 attempts. Please check the backend.');
        setIsLoading(false);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current = ws;
  }, [campaignType]);

  useEffect(() => {
    fetchAllCampaigns();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    if (!file) {
      setUploadedFile(null);
      setUploadedFilePath(null);
      setCsvHeaders([]);
      setCsvPreviewData([]);
      setSmsMessageTemplate('');
      setEmailMessageTemplate('');
      setEmailSubject('');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are allowed');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
     
      const response = await fetch(`${API_BASE_URL}/upload-csv`, {
        method: 'POST',
        body: formData,
      });
     
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
     
      const result = await response.json();
      setUploadedFile(file);
      setUploadedFilePath(result.file_path);
     
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const previewData = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        }).filter(row => Object.values(row).some(val => val));
       
        setCsvHeaders(headers);
        setCsvPreviewData(previewData);
       
        const hasEmail = headers.some(h => h.toLowerCase() === 'email');
        const hasMobile = headers.some(h => ['mobile', 'phone'].includes(h.toLowerCase()));
       
        setHasEmailColumn(hasEmail);
        setHasMobileColumn(hasMobile);
       
        if (hasEmail && hasMobile) {
          setCampaignType('unified');
        } else if (hasEmail) {
          setCampaignType('email');
        } else if (hasMobile) {
          setCampaignType('sms');
        }
      }
    } catch (error) {
      setError('Failed to upload file: ' + error.message);
      setUploadedFile(null);
      setUploadedFilePath(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendUnifiedCampaign = async () => {
    if (!uploadedFilePath) {
      setError('Please upload a CSV file first');
      return;
    }

    if (!campaignName.trim()) {
      setError('Please provide a campaign name');
      return;
    }
   
    if ((campaignType === 'email' || campaignType === 'unified') && !emailMessageTemplate.trim()) {
      setError('Please compose an email message template');
      return;
    }

    if ((campaignType === 'email' || campaignType === 'unified') && !emailSubject.trim()) {
      setError('Please provide an email subject');
      return;
    }
   
    if ((campaignType === 'sms' || campaignType === 'unified') && !smsMessageTemplate.trim()) {
      setError('Please compose a message template for SMS campaign');
      return;
    }
   
    setIsLoading(true);
    setError(null);
    setProgress({
      campaignId: null,
      status: 'starting',
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      progressPercent: 0,
      message: 'Initializing campaign...'
    });
   
    try {
      const response = await fetch(`${API_BASE_URL}/send-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_path: uploadedFilePath,
          campaign_name: campaignName,
          send_email: campaignType === 'email' || campaignType === 'unified',
          send_sms: campaignType === 'sms' || campaignType === 'unified',
          sms_template: (campaignType === 'sms' || campaignType === 'unified') ? smsMessageTemplate : null,
          email_template: (campaignType === 'email' || campaignType === 'unified') ? emailMessageTemplate : null,
          email_subject: (campaignType === 'email' || campaignType === 'unified') ? emailSubject : null
        }),
      });
     
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Campaign failed to start');
      }
     
      const result = await response.json();
     
      if (result.campaign_id) {
        connectWebSocket(result.campaign_id);
      }
    } catch (error) {
      setError('Failed to start campaign: ' + error.message);
      setIsLoading(false);
      setProgress(prev => ({ ...prev, status: 'idle' }));
    }
  };

  const handleSendCampaign = () => {
    setShowConfirmDialog(true);
  };

  const confirmSendCampaign = () => {
    setShowConfirmDialog(false);
    sendUnifiedCampaign();
  };

  const canSendCampaign = () => {
    if (!uploadedFile || !uploadedFilePath) return false;
    if (!campaignName.trim()) return false;
    if ((campaignType === 'email' || campaignType === 'unified') && (!emailMessageTemplate.trim() || !emailSubject.trim())) return false;
    if ((campaignType === 'sms' || campaignType === 'unified') && !smsMessageTemplate.trim()) return false;
    if (isLoading) return false;
    return true;
  };

  const resetForm = () => {
    setUploadedFile(null);
    setUploadedFilePath(null);
    setCsvHeaders([]);
    setCsvPreviewData([]);
    setSmsMessageTemplate('');
    setEmailMessageTemplate('');
    setEmailSubject('');
    setCampaignName('');
    setError(null);
    setHasEmailColumn(false);
    setHasMobileColumn(false);
    setProgress({
      campaignId: null,
      status: 'idle',
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      progressPercent: 0,
      message: ''
    });
  };

  const getSmsPreviewMessage = () => {
    if ((campaignType === 'sms' || campaignType === 'unified') && smsMessageTemplate && csvPreviewData.length > 0) {
      return smsMessageTemplate.replace(/\{(\w+)\}/g, (match, field) =>
        csvPreviewData[0][field] || match
      );
    }
    return null;
  };

  const getCampaignTypeLabel = () => {
    switch(campaignType) {
      case 'email':
        return 'Email';
      case 'sms':
        return 'SMS';
      case 'unified':
        return 'Email + SMS';
      default:
        return 'Email';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Campaigns Dashboard</h1>
          <p className="text-purple-200">Manage your bulk email and SMS campaigns with real-time tracking</p>
        </div>

        {error && (
          <div className="mb-6 backdrop-blur-lg bg-red-500/20 border border-red-500/30 rounded-2xl p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {progress.status !== 'idle' && progress.status !== 'completed' && (
          <div className="mb-6 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">Campaign Progress</h3>
                <p className="text-purple-300 text-sm">{progress.message}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{progress.progressPercent}%</div>
                <div className="text-sm text-purple-300">{progress.processed}/{progress.total}</div>
              </div>
            </div>
           
            <div className="w-full bg-white/10 rounded-full h-4 mb-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
           
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-green-200 text-sm font-medium">Successful</span>
                </div>
                <div className="text-2xl font-bold text-green-400">{progress.success}</div>
                <div className="text-xs text-green-300">
                  {progress.total > 0 ? Math.round((progress.success / progress.total) * 100) : 0}% success rate
                </div>
              </div>
             
              <div className="bg-red-500/20 rounded-lg p-3 border border-red-500/30">
                <div className="flex items-center space-x-2 mb-1">
                  <XCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-200 text-sm font-medium">Failed</span>
                </div>
                <div className="text-2xl font-bold text-red-400">{progress.failed}</div>
                <div className="text-xs text-red-300">
                  {progress.total > 0 ? Math.round((progress.failed / progress.total) * 100) : 0}% failure rate
                </div>
              </div>
             
              <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-blue-200 text-sm font-medium">Remaining</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">{progress.total - progress.processed}</div>
                <div className="text-xs text-blue-300">messages pending</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Sent" value={formatNumber(stats.totalSent)} icon={Send} color="purple" />
          <StatsCard
            title="Successful"
            value={formatNumber(stats.successful)}
            icon={CheckCircle}
            color="green"
            trend={stats.totalSent > 0 ? calculatePercentage(stats.successful, stats.totalSent) : 0}
          />
          <StatsCard title="Failed" value={formatNumber(stats.failed)} icon={XCircle} color="red" />
          <StatsCard title="Processing" value={formatNumber(stats.processing)} icon={Clock} color="yellow" />
        </div>

        <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-2 border border-white/20 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'upload', label: 'Upload & Send', icon: Upload },
              { id: 'campaigns', label: 'All Campaigns', icon: BarChart3 },
              { id: 'results', label: 'Recent Results', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-purple-200 hover:bg-white/10'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-8 border border-white/20 min-h-[600px]">
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Create New Campaign</h2>
                {uploadedFile && (
                  <button
                    onClick={resetForm}
                    className="flex items-center space-x-2 text-purple-300 hover:text-white transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Reset Form</span>
                  </button>
                )}
              </div>
             
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={() => setCampaignType('email')}
                  disabled={isLoading || !hasEmailColumn}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all ${
                    campaignType === 'email'
                      ? 'bg-blue-500/30 text-white border border-blue-400 shadow-lg'
                      : hasEmailColumn
                      ? 'bg-white/10 text-purple-200 hover:bg-white/20'
                      : 'bg-white/5 text-purple-400 opacity-50 cursor-not-allowed'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Mail className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">Email Only</div>
                    <div className="text-sm opacity-75">
                      {hasEmailColumn ? 'Send via email' : 'No email column'}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setCampaignType('sms')}
                  disabled={isLoading || !hasMobileColumn}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all ${
                    campaignType === 'sms'
                      ? 'bg-green-500/30 text-white border border-green-400 shadow-lg'
                      : hasMobileColumn
                      ? 'bg-white/10 text-purple-200 hover:bg-white/20'
                      : 'bg-white/5 text-purple-400 opacity-50 cursor-not-allowed'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <MessageSquare className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">SMS Only</div>
                    <div className="text-sm opacity-75">
                      {hasMobileColumn ? 'Send via SMS' : 'No mobile column'}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setCampaignType('unified')}
                  disabled={isLoading || !hasEmailColumn || !hasMobileColumn}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all ${
                    campaignType === 'unified'
                      ? 'bg-purple-500/30 text-white border border-purple-400 shadow-lg'
                      : (hasEmailColumn && hasMobileColumn)
                      ? 'bg-white/10 text-purple-200 hover:bg-white/20'
                      : 'bg-white/5 text-purple-400 opacity-50 cursor-not-allowed'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Send className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">Email + SMS</div>
                    <div className="text-sm opacity-75">
                      {(hasEmailColumn && hasMobileColumn) ? 'Send both' : 'Missing columns'}
                    </div>
                  </div>
                </button>
              </div>

              <FileUpload
                onFileSelect={handleFileUpload}
                selectedFile={uploadedFile}
                isLoading={isLoading}
                campaignName={campaignName}
                onCampaignNameChange={setCampaignName}
              />

              {csvPreviewData.length > 0 && (
                <CSVPreview headers={csvHeaders} data={csvPreviewData} />
              )}

              {uploadedFile && (campaignType === 'email' || campaignType === 'unified') && (
                <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 mt-6">
                  <EmailComposer
                    csvHeaders={csvHeaders}
                    csvData={csvPreviewData}
                    emailTemplate={emailMessageTemplate}
                    emailSubject={emailSubject}
                    onTemplateChange={setEmailMessageTemplate}
                    onSubjectChange={setEmailSubject}
                  />
                </div>
              )}

              {uploadedFile && (campaignType === 'sms' || campaignType === 'unified') && (
                <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 mt-6">
                  <SMSMessageComposer
                    csvHeaders={csvHeaders}
                    csvData={csvPreviewData}
                    messageTemplate={smsMessageTemplate}
                    onMessageChange={setSmsMessageTemplate}
                  />
                </div>
              )}

              {uploadedFile && (
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={handleSendCampaign}
                    disabled={!canSendCampaign()}
                    className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                      canSendCampaign()
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-white/10 text-purple-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Send {getCampaignTypeLabel()} Campaign</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">All Campaigns</h2>
                <button
                  onClick={fetchAllCampaigns}
                  disabled={loadingCampaigns}
                  className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingCampaigns ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
             
              {loadingCampaigns ? (
                <div className="text-center py-16">
                  <Loader className="h-12 w-12 text-purple-400 mx-auto mb-4 animate-spin" />
                  <p className="text-purple-200">Loading campaigns...</p>
                </div>
              ) : allCampaigns.length === 0 ? (
                <div className="text-center py-16">
                  <BarChart3 className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
                  <p className="text-purple-200 text-lg">No campaigns found</p>
                  <p className="text-purple-300 text-sm mt-2">Create your first campaign to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allCampaigns.map((campaign) => (
                    <div key={campaign.campaign_id} className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {campaign.name || 'Unnamed Campaign'}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-purple-300">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(campaign.created_at).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{campaign.total_messages || 0} recipients</span>
                            </div>
                            <div className="px-2 py-1 bg-purple-500/30 rounded text-purple-200">
                              {campaign.campaign_type === 'email' ? 'Email' :
                               campaign.campaign_type === 'sms' ? 'SMS' :
                               'Email + SMS'}
                            </div>
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-lg font-medium ${
                          campaign.status === 'completed'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : campaign.status === 'processing'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {campaign.status}
                        </div>
                      </div>
                     
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <Send className="h-4 w-4 text-blue-400" />
                            <span className="text-blue-200 text-sm">Total</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-400">{campaign.total_messages || 0}</div>
                        </div>
                       
                        <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-green-200 text-sm">Successful</span>
                          </div>
                          <div className="text-2xl font-bold text-green-400">{campaign.successful_messages || 0}</div>
                          <div className="text-xs text-green-300 mt-1">
                            {campaign.total_messages > 0 ? Math.round((campaign.successful_messages / campaign.total_messages) * 100) : 0}% success
                          </div>
                        </div>
                       
                        <div className="bg-red-500/20 rounded-lg p-4 border border-red-500/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <XCircle className="h-4 w-4 text-red-400" />
                            <span className="text-red-200 text-sm">Failed</span>
                          </div>
                          <div className="text-2xl font-bold text-red-400">{campaign.failed_messages || 0}</div>
                          <div className="text-xs text-red-300 mt-1">
                            {campaign.total_messages > 0 ? Math.round((campaign.failed_messages / campaign.total_messages) * 100) : 0}% failed
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Campaign Results</h2>
             
              {campaignHistory.length === 0 ? (
                <div className="text-center py-16">
                  <FileText className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
                  <p className="text-purple-200 text-lg">No recent campaigns</p>
                  <p className="text-purple-300 text-sm mt-2">Results from this session will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaignHistory.map((campaign) => (
                    <div key={campaign.id} className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-1">
                            {campaign.type === 'email' ? 'Email Campaign' :
                             campaign.type === 'sms' ? 'SMS Campaign' :
                             'Email + SMS Campaign'}
                          </h3>
                          <p className="text-purple-300 text-sm">
                            {new Date(campaign.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className={`px-4 py-2 rounded-lg font-medium ${
                          campaign.status === 'completed'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {campaign.status}
                        </div>
                      </div>
                     
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <Send className="h-4 w-4 text-blue-400" />
                            <span className="text-blue-200 text-sm">Total Sent</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-400">{campaign.total}</div>
                        </div>
                       
                        <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <span className="text-green-200 text-sm">Successful</span>
                          </div>
                          <div className="text-2xl font-bold text-green-400">{campaign.success}</div>
                          <div className="text-xs text-green-300 mt-1">
                            {Math.round((campaign.success / campaign.total) * 100)}% success rate
                          </div>
                        </div>
                       
                        <div className="bg-red-500/20 rounded-lg p-4 border border-red-500/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <XCircle className="h-4 w-4 text-red-400" />
                            <span className="text-red-200 text-sm">Failed</span>
                          </div>
                          <div className="text-2xl font-bold text-red-400">{campaign.failed}</div>
                          <div className="text-xs text-red-300 mt-1">
                            {Math.round((campaign.failed / campaign.total) * 100)}% failure rate
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <ConfirmDialog
          isOpen={showConfirmDialog}
          onConfirm={confirmSendCampaign}
          onCancel={() => setShowConfirmDialog(false)}
          campaignType={getCampaignTypeLabel()}
          total={csvPreviewData.length}
          smsMessage={getSmsPreviewMessage()}
          emailSubject={emailSubject}
          campaignName={campaignName}
        />
      </div>
    </div>
  );
};

export default CampaignsDashboard;