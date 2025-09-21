export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const calculatePercentage = (part, total) => {
  if (total === 0) return 0;
  return ((part / total) * 100).toFixed(1);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateCSVFile = (file, campaignType) => {
  if (!file) return { valid: false, message: 'No file selected' };
  
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return { valid: false, message: 'Please select a CSV file' };
  }
  
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, message: 'File size must be less than 10MB' };
  }
  
  return { valid: true, message: '' };
};

export const parseCSVPreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').slice(0, 6);
      const preview = lines.map(line => line.split(','));
      resolve(preview);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};