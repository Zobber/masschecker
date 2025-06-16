import React from 'react';
import { Activity, Clock, CheckCircle, Shield, AlertTriangle, XCircle, StopCircle } from 'lucide-react';
import { CheckStats } from '../types';

interface StatsCardProps {
  stats: CheckStats;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const progressPercentage = stats.total > 0 ? ((stats.completed + stats.errors + stats.stopped) / stats.total) * 100 : 0;
  const maliciousPercentage = stats.completed > 0 ? (stats.malicious / stats.completed) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-8">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Total IPs</p>
            <p className="text-2xl font-bold text-gray-100">{stats.total}</p>
          </div>
          <Activity className="w-8 h-8 text-blue-400" />
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">In Progress</p>
            <p className="text-2xl font-bold text-amber-400">{stats.inProgress}</p>
          </div>
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Completed</p>
            <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-blue-400" />
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Clean IPs</p>
            <p className="text-2xl font-bold text-green-400">{stats.clean}</p>
          </div>
          <Shield className="w-8 h-8 text-green-400" />
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Malicious IPs</p>
            <p className="text-2xl font-bold text-red-400">{stats.malicious}</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Errors</p>
            <p className="text-2xl font-bold text-gray-400">{stats.errors}</p>
          </div>
          <XCircle className="w-8 h-8 text-gray-400" />
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Stopped</p>
            <p className="text-2xl font-bold text-orange-400">{stats.stopped}</p>
          </div>
          <StopCircle className="w-8 h-8 text-orange-400" />
        </div>
      </div>

      {stats.total > 0 && (
        <div className="col-span-full card p-6">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300">Overall Progress</span>
              <span className="text-sm text-gray-400">{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-400 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {stats.completed > 0 && (
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-400">{(100 - maliciousPercentage).toFixed(1)}%</p>
                <p className="text-sm text-gray-400">Clean IPs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{maliciousPercentage.toFixed(1)}%</p>
                <p className="text-sm text-gray-400">Malicious IPs</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};