import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (ips: string[]) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isProcessing }) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.name.endsWith('.txt')) {
      setError('Only .txt files are allowed');
      return false;
    }

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      setError('File size must be less than 1MB');
      return false;
    }

    // Check for potentially malicious content
    if (file.name.toLowerCase().includes('.php') || 
        file.name.toLowerCase().includes('.exe') || 
        file.name.toLowerCase().includes('.js')) {
      setError('Invalid file type. Only text files are allowed');
      return false;
    }

    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;

    try {
      const text = await file.text();
      const ips = text
        .split(/[\n,]/)
        .map(ip => ip.trim())
        .filter(ip => {
          // Basic IP validation
          const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
          const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
          return ipv4Regex.test(ip) || ipv6Regex.test(ip);
        });

      if (ips.length === 0) {
        setError('No valid IP addresses found in the file');
        return;
      }

      setError(null);
      onFileUpload(ips);
    } catch (err) {
      setError('Error reading file. Please try again.');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [onFileUpload]);

  return (
    <div className="card p-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-700'
        }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
            <input
              type="file"
          id="file-upload"
              className="hidden"
          accept=".txt"
          onChange={handleFileInput}
              disabled={isProcessing}
            />
        <label
          htmlFor="file-upload"
          className="cursor-pointer"
        >
          <div className="flex flex-col items-center">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Drag and drop your file here, or click to select
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Only .txt files are allowed
          </p>
          </div>
        </label>
        </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Processing file...
          </p>
      </div>
      )}
    </div>
  );
};