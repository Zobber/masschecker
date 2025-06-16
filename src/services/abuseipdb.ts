import axios from 'axios';
import { IPCheckResult } from '../types';

const API_KEY = import.meta.env.VITE_ABUSEIPDB_API_KEY;

// Debug logs
console.log('API Key loaded:', API_KEY ? 'Yes' : 'No');
console.log('API Key length:', API_KEY ? API_KEY.length : 0);

if (!API_KEY) {
  console.error('VITE_ABUSEIPDB_API_KEY is not defined in environment variables');
}

export interface AbuseIPDBResponse {
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

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: '/api/v2',
  headers: {
    'Key': API_KEY,
    'Accept': 'application/json'
  }
});

export class AbuseIPDBService {
  private static async makeRequest(endpoint: string, params: URLSearchParams): Promise<AbuseIPDBResponse> {
    try {
      const url = `${endpoint}?${params.toString()}`;
      console.log('Making request to URL:', url);
      console.log('Using API Key:', API_KEY ? 'Present' : 'Missing');
      
      const response = await api.get(url);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('API Response data:', response.data);

      return response.data;
    } catch (error) {
      console.error('Detailed error in makeRequest:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making more requests.');
        } else if (error.response?.status === 401) {
          throw new Error('Invalid API key or unauthorized access.');
        } else if (error.response?.status === 422) {
          throw new Error('Invalid IP address format.');
        } else {
          throw new Error(`API request failed: ${error.response?.status} - ${error.response?.statusText}`);
        }
      }
      throw new Error('Network error: Unable to connect to AbuseIPDB API. Please check your internet connection.');
    }
  }

  static async checkIP(ip: string): Promise<IPCheckResult> {
    try {
      if (!this.isValidIP(ip)) {
        throw new Error(`Invalid IP address format: ${ip}`);
      }

      const params = new URLSearchParams({
        ipAddress: ip,
        maxAgeInDays: '90'
      });

      const response = await this.makeRequest('/check', params);
      const data = response.data;
      console.log('Processing IP check response:', data);
      console.log('Country data:', {
        name: data.countryName,
        code: data.countryCode,
        raw: data
      });

      return {
        ip,
        status: 'completed',
        totalReports: data.totalReports,
        lastReportedAt: data.lastReportedAt || undefined,
        countryName: data.countryName || undefined,
        countryCode: data.countryCode || undefined,
        domain: data.domain || undefined,
        isp: data.isp || undefined,
        usageType: data.usageType,
        isWhitelisted: data.isWhitelisted,
        abuseConfidenceScore: data.abuseConfidenceScore
      };
    } catch (error) {
      console.error('Error checking IP:', error);
      return {
        ip,
        status: 'error',
        totalReports: 0,
        lastReportedAt: undefined,
        countryName: undefined,
        countryCode: undefined,
        domain: undefined,
        isp: undefined,
        usageType: undefined,
        isWhitelisted: false,
        abuseConfidenceScore: 0,
        error: error instanceof Error ? error.message : 'Failed to check IP'
      };
    }
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