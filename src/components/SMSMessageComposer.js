import React, { useState } from 'react';
import { Plus, AlertCircle, MessageSquare } from 'lucide-react';

const SMSMessageComposer = ({ 
  csvHeaders, 
  csvData, 
  messageTemplate, 
  onMessageChange, 
  className = "" 
}) => {
  const [previewIndex, setPreviewIndex] = useState(0);

  // Insert variable into message template
  const insertVariable = (variable) => {
    const textarea = document.getElementById('smsMessageTextarea');
    const cursorPos = textarea.selectionStart;
    const textBefore = messageTemplate.substring(0, cursorPos);
    const textAfter = messageTemplate.substring(cursorPos);
    const variableText = `{${variable}}`;
    
    const newMessage = textBefore + variableText + textAfter;
    onMessageChange(newMessage);
    
    // Set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos + variableText.length, cursorPos + variableText.length);
    }, 0);
  };

  // Replace variables with actual values
  const renderMessage = (template, data) => {
    let message = template;
    csvHeaders.forEach(header => {
      const regex = new RegExp(`{${header}}`, 'g');
      message = message.replace(regex, data[header] || '');
    });
    return message;
  };

  // Get character count for current preview
  const getPreviewCharCount = () => {
    if (csvData.length === 0 || !messageTemplate) return 0;
    return renderMessage(messageTemplate, csvData[previewIndex]).length;
  };

  if (csvHeaders.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white">Compose Message</h3>
      
      {/* Variable Buttons */}
      <div>
        <p className="text-purple-200 text-sm mb-2">Click to insert variables:</p>
        <div className="flex flex-wrap gap-2">
          {csvHeaders.map(header => (
            <button
              key={header}
              onClick={() => insertVariable(header)}
              type="button"
              className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 px-3 py-2 rounded-lg text-sm flex items-center space-x-1 transition-colors"
            >
              <Plus className="h-3 w-3" />
              <span>{header}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message Textarea */}
      <div className="relative">
        <textarea
          id="smsMessageTextarea"
          value={messageTemplate}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Compose your message here. Use {ColumnName} for variables.
Example: Hello {Name}, your account balance is {Amount}. Please contact us for payment."
          className="w-full h-32 bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-purple-300 resize-none focus:outline-none focus:border-purple-400"
        />
        <div className="absolute bottom-2 right-2 text-purple-300 text-xs">
          {messageTemplate.length} characters
        </div>
      </div>

      {/* Preview Section */}
      {messageTemplate && csvData.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-purple-200 text-sm font-medium">Message Preview:</p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))}
                disabled={previewIndex === 0}
                type="button"
                className="text-purple-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1"
              >
                ←
              </button>
              <span className="text-purple-200 text-sm">
                {previewIndex + 1} of {csvData.length}
              </span>
              <button
                onClick={() => setPreviewIndex(Math.min(csvData.length - 1, previewIndex + 1))}
                disabled={previewIndex === csvData.length - 1}
                type="button"
                className="text-purple-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1"
              >
                →
              </button>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border-l-4 border-green-400">
            <div className="flex items-start space-x-3 mb-3">
              <MessageSquare className="h-5 w-5 text-green-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-green-200 text-sm font-medium">SMS Preview</p>
                <p className="text-purple-300 text-xs">
                  To: {csvData[previewIndex].Mobile || csvData[previewIndex].mobile || csvData[previewIndex].phone || 'No mobile number'}
                </p>
              </div>
            </div>
            
            <p className="text-white whitespace-pre-wrap mb-3">
              {renderMessage(messageTemplate, csvData[previewIndex])}
            </p>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-300">
                Character count: {getPreviewCharCount()}
              </span>
              <span className={`px-2 py-1 rounded ${getPreviewCharCount() > 160 ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300'}`}>
                {getPreviewCharCount() > 160 ? 'Multiple SMS' : 'Single SMS'}
              </span>
            </div>
          </div>

          {/* Warning for long messages */}
          {csvData.some(row => renderMessage(messageTemplate, row).length > 160) && (
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-200 font-medium">Long Message Warning</p>
                <p className="text-orange-300 text-sm">
                  Some messages exceed 160 characters and will be sent as multiple SMS, increasing costs.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SMSMessageComposer;