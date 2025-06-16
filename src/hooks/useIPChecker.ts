import { useState, useCallback, useRef } from 'react';
import { IPCheckResult, CheckStats } from '../types';
import { AbuseIPDBService } from '../services/abuseipdb';

export const useIPChecker = () => {
  const [results, setResults] = useState<IPCheckResult[]>([]);
  const [stats, setStats] = useState<CheckStats>({
    total: 0,
    completed: 0,
    malicious: 0,
    clean: 0,
    errors: 0,
    inProgress: 0,
    stopped: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  const stopSignal = useRef(false);

  const updateStats = useCallback((newResults: IPCheckResult[]) => {
    const newStats: CheckStats = {
      total: newResults.length,
      completed: newResults.filter(r => r.status === 'completed').length,
      malicious: newResults.filter(r => r.status === 'completed' && r.totalReports > 100).length,
      clean: newResults.filter(r => r.status === 'completed' && r.totalReports === 0).length,
      errors: newResults.filter(r => r.status === 'error').length,
      inProgress: newResults.filter(r => r.status === 'pending' || r.status === 'checking').length,
      stopped: newResults.filter(r => r.status === 'stopped').length,
    };
    setStats(newStats);
  }, []);

  const stopChecking = useCallback(() => {
    stopSignal.current = true;
    setIsRunning(false);
    
    // Mark all pending/checking IPs as stopped
    setResults(prev => {
      const updated = prev.map(result => 
        (result.status === 'pending' || result.status === 'checking') 
          ? { ...result, status: 'stopped' as const }
          : result
      );
      updateStats(updated);
      return updated;
    });
  }, [updateStats]);

  const checkIPs = useCallback(async (ips: string[]) => {
    stopSignal.current = false;
    setIsRunning(true);

    // Initialize results
    const initialResults: IPCheckResult[] = ips.map(ip => ({
      ip,
      isPublic: false,
      ipVersion: 4,
      isWhitelisted: false,
      abuseConfidencePercentage: 0,
      countryCode: null,
      countryName: null,
      usageType: '',
      isp: null,
      domain: null,
      totalReports: 0,
      numDistinctUsers: 0,
      lastReportedAt: null,
      status: 'pending',
    }));

    setResults(initialResults);
    updateStats(initialResults);

    // Check each IP with a delay to avoid rate limiting
    for (let i = 0; i < ips.length; i++) {
      if (stopSignal.current) {
        break;
      }

      const ip = ips[i];
      
      // Update status to checking
      setResults(prev => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: 'checking' };
        updateStats(updated);
        return updated;
      });

      try {
        const response = await AbuseIPDBService.checkIP(ip);
        
        if (stopSignal.current) {
          setResults(prev => {
            const updated = [...prev];
            updated[i] = { ...updated[i], status: 'stopped' };
            updateStats(updated);
            return updated;
          });
          break;
        }
        
        setResults(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            ...response.data,
            ip: response.data.ipAddress,
            status: 'completed',
          };
          updateStats(updated);
          return updated;
        });
      } catch (error) {
        console.error(`Error checking IP ${ip}:`, error);
        
        setResults(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            status: 'error',
            error: error instanceof Error ? error.message : 'Error desconocido',
          };
          updateStats(updated);
          return updated;
        });
      }

      // Add delay between requests to avoid rate limiting (AbuseIPDB allows 1000 requests per day for free tier)
      if (i < ips.length - 1 && !stopSignal.current) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 seconds delay
      }
    }

    setIsRunning(false);
  }, [updateStats]);

  const exportMaliciousIPs = useCallback(() => {
    const maliciousIPs = results
      .filter(result => result.status === 'completed' && result.totalReports > 100)
      .map(result => {
        const country = result.countryName ? ` (${result.countryName})` : '';
        const isp = result.isp ? ` - ${result.isp}` : '';
        return `${result.ip} - ${result.totalReports} reportes${country}${isp}`;
      })
      .join('\n');

    if (maliciousIPs.length === 0) {
      alert('No malicious IPs found to export');
      return;
    }

    const header = `# IPs Malicious - ${new Date().toLocaleString()}\n# Format: IP - Reports - Country - ISP\n\n`;
    const content = header + maliciousIPs;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `malicious-ips-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [results]);

  const resetResults = useCallback(() => {
    stopSignal.current = true;
    setIsRunning(false);
    setResults([]);
    setStats({
      total: 0,
      completed: 0,
      malicious: 0,
      clean: 0,
      errors: 0,
      inProgress: 0,
      stopped: 0,
    });
  }, []);

  return {
    results,
    stats,
    isRunning,
    checkIPs,
    stopChecking,
    exportMaliciousIPs,
    resetResults,
  };
};