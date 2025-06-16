import React, { useState, useMemo } from 'react';
import { IPCheckResult } from '../types';
import { 
  AlertTriangle, 
  Shield, 
  Clock, 
  XCircle, 
  Search, 
  Filter,
  Download,
  Globe,
  Building,
  Calendar,
  StopCircle
} from 'lucide-react';

interface IPResult {
  ip: string;
  status: 'pending' | 'completed' | 'error' | 'stopped' | 'checking';
  totalReports: number;
  abuseConfidenceScore: number;
  countryCode?: string;
  countryName?: string;
  isp?: string;
  lastReportedAt?: string;
}

interface IPResultsListProps {
  results: IPCheckResult[];
  onExportMalicious: () => void;
}

export const IPResultsList: React.FC<IPResultsListProps> = ({ results, onExportMalicious }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const matchesSearch = 
        result.ip.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (result.isp?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'malicious' && result.totalReports > 100) ||
        (statusFilter === 'warning' && result.totalReports > 0 && result.totalReports <= 100) ||
        (statusFilter === 'clean' && result.totalReports === 0 && result.status === 'completed') ||
        (statusFilter === 'error' && result.status === 'error') ||
        (statusFilter === 'pending' && (result.status === 'pending' || result.status === 'checking')) ||
        (statusFilter === 'stopped' && result.status === 'stopped');
      
      return matchesSearch && matchesStatus;
    });
  }, [results, searchTerm, statusFilter]);

  const getStatusIcon = (result: IPCheckResult) => {
    switch (result.status) {
      case 'pending':
      case 'checking':
        return <Clock className="w-5 h-5 text-amber-500 animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      case 'stopped':
        return <StopCircle className="w-5 h-5 text-orange-500" />;
      case 'completed':
        if (result.totalReports > 100) {
          return <AlertTriangle className="w-5 h-5 text-red-500" />;
        } else if (result.totalReports > 0) {
          return <AlertTriangle className="w-5 h-5 text-amber-500" />;
        }
        return <Shield className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (result: IPCheckResult) => {
    if (result.status === 'error') {
      return <span className="badge-info">Error</span>;
    }
    if (result.status === 'stopped') {
      return <span className="badge-warning">Stopped</span>;
    }
    if (result.status === 'pending' || result.status === 'checking') {
      return <span className="badge-warning">Checking...</span>;
    }
    if (result.totalReports > 100) {
      return <span className="badge-danger">Malicious</span>;
    }
    if (result.totalReports > 0 && result.totalReports <= 100) {
      return <span className="badge-warning">Warning</span>;
    }
    return <span className="badge-success">Clean</span>;
  };

  const maliciousCount = results.filter(r => r.totalReports > 100).length;

  const onExportResults = () => {
    const headers = ['IP', 'Total Reports', 'Abuse Score', 'Country', 'ISP', 'Last Reported'];
    const csvData = results.map(result => [
      result.ip,
      result.totalReports,
      result.abuseConfidenceScore,
      result.countryCode || 'Unknown',
      result.isp || 'Unknown',
      result.lastReportedAt ? new Date(result.lastReportedAt).toLocaleString() : 'Never'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ip_verification_results_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (results.length === 0) {
    return (
      <div className="card">
        <div className="p-6">
          <p className="text-gray-400 text-center">No results to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-6 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-100">Verification Results</h3>
          
          {results.length > 0 && (
            <button
              onClick={onExportResults}
              className="btn-danger flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export All Results ({results.length})
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by IP or ISP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select pl-10"
            >
              <option value="all">All</option>
              <option value="malicious">Malicious</option>
              <option value="warning">Warning</option>
              <option value="clean">Clean</option>
              <option value="pending">Pending</option>
              <option value="stopped">Stopped</option>
              <option value="error">With Errors</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-700">
        {filteredResults.map((result, index) => (
          <div key={`${result.ip}-${index}`} className="p-6 hover:bg-gray-800/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(result)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-medium text-gray-100">{result.ip}</span>
                    {getStatusBadge(result)}
                  </div>
                  
                  {result.status === 'completed' && (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Globe className="w-4 h-4" />
                        <span>{result.countryCode || 'Unknown'}</span>
                      </div>
                      
                      {result.isp && (
                        <div className="flex items-center gap-1 text-gray-400">
                          <Building className="w-4 h-4" />
                          <span>{result.isp}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Last report: {result.lastReportedAt ? new Date(result.lastReportedAt).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>
                  )}
                  
                  {result.status === 'error' && result.error && (
                    <p className="text-sm text-red-400 mt-1">{result.error}</p>
                  )}
                  
                  {result.status === 'stopped' && (
                    <p className="text-sm text-orange-400 mt-1">Verification stopped by user</p>
                  )}
                </div>
              </div>
              
              {result.status === 'completed' && result.totalReports > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-400">
                    {result.totalReports}
                  </div>
                  <div className="text-xs text-gray-400">Reports</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredResults.length === 0 && (
        <div className="p-12 text-center text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <p>No results found with the applied filters</p>
        </div>
      )}
    </div>
  );
};