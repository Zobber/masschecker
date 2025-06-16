import axios from 'axios';
import { IPCheckResult } from '../types';

const API_KEY = import.meta.env.VITE_ABUSEIPDB_API_KEY;

if (!API_KEY) {
  console.error('VITE_ABUSEIPDB_API_KEY is not defined in environment variables');
}

export const checkIP = async (ip: string): Promise<IPCheckResult> => {
  try {
    const response = await axios.get(`https://api.abuseipdb.com/api/v2/check`, {
      params: {
        ipAddress: ip,
        maxAgeInDays: 90
      },
      headers: {
        'Key': API_KEY,
        'Accept': 'application/json'
      }
    });

    const data = response.data.data;
    return {
      ip,
      status: 'completed',
      totalReports: data.totalReports,
      lastReportedAt: data.lastReportedAt,
      countryName: data.countryName,
      countryCode: data.countryCode,
      domain: data.domain,
      isp: data.isp,
      usageType: data.usageType,
      isWhitelisted: data.isWhitelisted,
      abuseConfidenceScore: data.abuseConfidenceScore
    };
  } catch (error) {
    console.error(`Error checking IP ${ip}:`, error);
    return {
      ip,
      status: 'error',
      error: 'Failed to check IP'
    };
  }
};

export interface AbuseIPDBResponse {
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

export class AbuseIPDBService {
  private static async makeRequest(endpoint: string, params: URLSearchParams): Promise<AbuseIPDBResponse> {
    try {
      const url = `/api${endpoint}?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Key': API_KEY,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making more requests.');
        } else if (response.status === 401) {
          throw new Error('Invalid API key or unauthorized access.');
        } else if (response.status === 422) {
          throw new Error('Invalid IP address format.');
        } else {
          throw new Error(`API request failed: ${response.status} - ${response.statusText}`);
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to AbuseIPDB API. Please check your internet connection.');
      }
      throw error;
    }
  }

  static async checkIP(ip: string): Promise<AbuseIPDBResponse> {
    if (!this.isValidIP(ip)) {
      throw new Error(`Invalid IP address format: ${ip}`);
    }

    const params = new URLSearchParams({
      ipAddress: ip,
      maxAgeInDays: '90',
      verbose: ''
    });

    return this.makeRequest('/check', params);
  }

  static isValidIP(ip: string): boolean {
    // IPv4 validation
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    // IPv6 validation (basic)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  static parseIPList(content: string): string[] {
    return content
      .split(/[\n,;|\s]+/)
      .map(ip => ip.trim())
      .filter(ip => ip && this.isValidIP(ip))
      .filter((ip, index, array) => array.indexOf(ip) === index); // Remove duplicates
  }
}