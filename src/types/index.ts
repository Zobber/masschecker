export interface IPCheckResult {
  ip: string;
  status: 'pending' | 'completed' | 'error' | 'stopped';
  totalReports: number;
  lastReportedAt: string | undefined;
  countryName: string | undefined;
  countryCode: string | undefined;
  domain: string | undefined;
  isp: string | undefined;
  usageType: string | undefined;
  isWhitelisted: boolean;
  abuseConfidenceScore: number;
  error?: string;
}

export interface APIResponse {
  data: {
    ipAddress: string;
    isPublic: boolean;
    ipVersion: number;
    isWhitelisted: boolean;
    abuseConfidenceScore: number;
    countryCode: string | null;
    countryName: string | null;
    usageType: string;
    isp: string | null;
    domain: string | null;
    totalReports: number;
    numDistinctUsers: number;
    lastReportedAt: string | null;
    hostnames: string[];
    isTor: boolean;
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