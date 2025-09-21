import React, { useRef, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { validateCSVFile, formatFileSize, parseCSVPreview } from '../utils/helpers';

const FileUpload = ({ onFileSelect, campaignType, selectedFile }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFiles = async (files) => {
    const file = files[0];
    const validation = validateCSVFile(file, campaignType);
    
    if (!validation.valid) {
      alert(validation.message);
      return;
    }

    try {
      const csvPreview = await parseCSVPreview(file);
      setPreview(csvPreview);
      onFileSelect(file);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error reading CSV file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = () => {
    setPreview(null);
    onFileSelect(null);
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-purple-400 bg-purple-400/10'
              : 'border-purple-400/50 hover:border-purple-400'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">
            Drop your CSV file here or click to browse
          </p>
          <p className="text-purple-200 text-sm">
            {campaignType === 'email' 
              ? 'CSV should contain: Name, Email, Balance columns' 
              : 'CSV should contain: name, mobile, message columns'
            }
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      ) : (
        <div className="backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <File className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-purple-200 text-sm">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {preview && (
            <div className="overflow-x-auto">
              <p className="text-purple-200 text-sm mb-2">Preview (first 5 rows):</p>
              <table className="w-full text-sm">
                <tbody>
                  {preview.map((row, index) => (
                    <tr key={index} className={index === 0 ? 'font-medium text-white' : 'text-purple-200'}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="py-1 px-2 border-r border-white/10 last:border-r-0">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;