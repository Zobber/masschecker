import React from 'react';
import { Shield, ExternalLink, StopCircle } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { StatsCard } from './components/StatsCard';
import { IPResultsList } from './components/IPResultsList';
import { useIPChecker } from './hooks/useIPChecker';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const { results, stats, isRunning, checkIPs, stopChecking, exportMaliciousIPs, resetResults } = useIPChecker();

  const handleFileUpload = (ips: string[]) => {
    if (results.length > 0) {
      const confirmed = window.confirm(
        'Are you sure you want to upload a new list? Current results will be lost.'
      );
      if (!confirmed) return;
      resetResults();
    }
    checkIPs(ips);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">MassChecker</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Check reputation of IPs</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          {stats.total > 0 && <StatsCard stats={stats} />}

          {/* File Upload */}
          {stats.total === 0 && (
            <div className="mb-8">
              <FileUpload onFileUpload={handleFileUpload} isProcessing={isRunning} />
            </div>
          )}

          {/* Control Buttons */}
          {stats.total > 0 && (
            <div className="mb-6 flex justify-center gap-4">
              {isRunning ? (
                <button
                  onClick={stopChecking}
                  className="btn-danger flex items-center gap-2"
                >
                  <StopCircle className="w-4 h-4" />
                  Stop Checking
                </button>
              ) : (
                <button
                  onClick={() => {
                    const confirmed = window.confirm(
                      'Are you sure you want to upload a new list? Current results will be lost.'
                    );
                    if (confirmed) {
                      resetResults();
                    }
                  }}
                  className="btn-primary"
                >
                  Upload New List
                </button>
              )}
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <IPResultsList results={results} onExportMalicious={exportMaliciousIPs} />
          )}

          {/* Information */}
          <div className="mt-8 card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">How it works?</h3>
            <div className="text-gray-600 dark:text-gray-400 space-y-2">
              <p>• <strong>Upload:</strong> Upload a text file with one IP per line or comma-separated</p>
              <p>• <strong>Check:</strong> Each IP is verified against the AbuseIPDB database</p>
              <p>• <strong>Analyze:</strong> IPs are categorized based on the number of reports:</p>
              <ul className="list-disc list-inside ml-4 mb-2">
                <li>0 reports: Clean IP</li>
                <li>1-100 reports: Warning</li>
                <li>More than 100 reports: Malicious IP</li>
              </ul>
              <p>• <strong>Control:</strong> You can stop the verification at any time</p>
              <p>• <strong>Export:</strong> Download the list of found malicious IPs</p>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                <strong>Note:</strong> The free AbuseIPDB API has rate limits. 
                A 1.5-second delay is applied between queries to avoid rate limit errors.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="text-center text-gray-600 dark:text-gray-400">
      <p className="mb-2">
        Powered by{' '}
        <a 
          href="https://www.abuseipdb.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          AbuseIPDB API
        </a>
      </p>
      <p className="text-sm">
        Made with ❤️ by{' '}
        <a 
          href="https://github.com/Zobber" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          Zobber
        </a>
      </p>
    </div>
  </div>
</footer>

      </div>
    </ThemeProvider>
  );
}

export default App;