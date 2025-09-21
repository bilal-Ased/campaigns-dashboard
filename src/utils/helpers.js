// utils/helpers.js

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const calculatePercentage = (part, total) => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

export const formatFileSize = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

export const validateCSVFile = (file, campaignType) => {
  if (!file) {
    return { valid: false, message: 'Please select a file' };
  }

  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    return { valid: false, message: 'Please select a CSV file' };
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    return { valid: false, message: 'File size must be less than 10MB' };
  }

  return { valid: true, message: 'File is valid' };
};

export const parseCSVPreview = (file, maxRows = 5) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n').slice(0, maxRows);
        const data = lines.map(line => {
          // Simple CSV parsing - you might want to use a more robust CSV parser
          const row = line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
          return row;
        });
        resolve(data.filter(row => row.some(cell => cell.length > 0)));
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};

export const validateCSVColumns = (headers, campaignType) => {
  const requiredColumns = {
    email: ['name', 'email', 'balance'],
    sms: ['name', 'mobile', 'message'],
    whatsapp: ['name', 'phone', 'message']
  };

  const required = requiredColumns[campaignType] || [];
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  const missing = required.filter(col => 
    !normalizedHeaders.some(header => header.includes(col))
  );

  if (missing.length > 0) {
    return {
      valid: false,
      message: `Missing required columns: ${missing.join(', ')}`
    };
  }

  return { valid: true, message: 'All required columns present' };
};

export const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add + prefix if not present and number doesn't start with country code
  if (!phone.startsWith('+') && !cleaned.startsWith('254')) {
    if (cleaned.startsWith('0')) {
      return '+254' + cleaned.substring(1);
    }
    return '+254' + cleaned;
  }
  
  return phone.startsWith('+') ? phone : '+' + cleaned;
};

export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getCampaignTypeColor = (type) => {
  const colors = {
    email: 'blue',
    sms: 'green', 
    whatsapp: 'emerald'
  };
  return colors[type] || 'purple';
};

export const getCampaignTypeIcon = (type) => {
  // This would return the appropriate icon component based on type
  // You'll need to import the icons where this is used
  const icons = {
    email: 'Mail',
    sms: 'MessageSquare',
    whatsapp: 'MessageCircle'
  };
  return icons[type] || 'Send';
};

export const getStatusColor = (status) => {
  const colors = {
    success: 'green',
    delivered: 'green',
    read: 'blue',
    sent: 'yellow',
    failed: 'red',
    error: 'red',
    undelivered: 'red',
    pending: 'yellow',
    processing: 'yellow'
  };
  return colors[status] || 'gray';
};

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
};

export const exportToCsv = (data, filename) => {
  const csvContent = data.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const generateCampaignSummary = (results) => {
  const summary = {
    total: results.length,
    successful: 0,
    failed: 0,
    pending: 0,
    delivered: 0,
    read: 0
  };

  results.forEach(result => {
    switch (result.status) {
      case 'success':
      case 'delivered':
        summary.successful++;
        summary.delivered++;
        break;
      case 'read':
        summary.successful++;
        summary.delivered++;
        summary.read++;
        break;
      case 'failed':
      case 'error':
      case 'undelivered':
        summary.failed++;
        break;
      case 'pending':
      case 'processing':
        summary.pending++;
        break;
      default:
        break;
    }
  });

  summary.successRate = summary.total > 0 ? 
    Math.round((summary.successful / summary.total) * 100) : 0;
    
  return summary;
};