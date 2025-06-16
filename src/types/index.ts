export interface IPCheckResult {
  ip: string;
  status: 'pending' | 'completed' | 'error' | 'stopped';
  totalReports?: number;
  lastReportedAt?: string;
  countryName?: string;
  countryCode?: string;
  domain?: string;
  isp?: string;
  usageType?: string;
  isWhitelisted?: boolean;
  abuseConfidenceScore?: number;
  error?: string;
}

export interface APIResponse {
  data: {
    ipAddress: string;
    isPublic: boolean;
    ipVersion: number;
    isWhitelisted: boolean;
    abuseConfidencePercentage: number;
    countryCode: string | null;
    countryName: string | null;
    usageType: string;
    isp: string | null;
    domain: string | null;
    totalReports: number;
    numDistinctUsers: number;
    lastReportedAt: string | null;
  };
}

export interface CheckStats {
  total: number;
  completed: number;
  inProgress: number;
  errors: number;
  stopped: number;
  malicious: number;
  clean: number;
}