import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { energyApi } from '../api/api';
import Layout from '../components/Layout';
import EnergyLimitSettings from '../components/EnergyLimitSettings';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';

export default function Dashboard() {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { darkMode } = useTheme();

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const response = await energyApi.getTotalUsage();
        setUsageData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load energy usage data');
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Energy Limit Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-colors duration-200">
          <EnergyLimitSettings />
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Devices</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{usageData.totalDevices}</p>
            <Link to="/devices" className="mt-4 inline-block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200">
              Manage devices →
            </Link>
          </div>
          {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Power Usage</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {Math.round(usageData.totalPowerUsage / 1000)} kW
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">From {usageData.totalReadings} readings</p>
          </div> */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Devices</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {usageData.devices.filter(d => d.lastReading.power > 0).length}
            </p>
            <Link to="/monitoring" className="mt-4 inline-block text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-200">
              View monitoring →
            </Link>
          </div>
        </div>

        {/* Device List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Device Overview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Device</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Location</th>
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">Current Power</th>
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">Total Usage</th>
                  <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">Readings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {usageData.devices.map((device) => (
                  <tr key={device.deviceId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                      {device.deviceName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {device.deviceLocation}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-white">
                      {device.lastReading.power}W
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-white">
                      {Math.round(device.totalPower / 1000)}kW
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500 dark:text-gray-400">
                      {device.readingCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Power Usage Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Power Usage Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={usageData.devices}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="deviceName" 
                  stroke={darkMode ? '#9ca3af' : '#4b5563'}
                  tick={{ fill: darkMode ? '#9ca3af' : '#4b5563' }}
                />
                <YAxis 
                  stroke={darkMode ? '#9ca3af' : '#4b5563'}
                  tick={{ fill: darkMode ? '#9ca3af' : '#4b5563' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  }}
                  labelStyle={{ color: darkMode ? '#e5e7eb' : '#111827' }}
                  itemStyle={{ color: darkMode ? '#93c5fd' : '#2563eb' }}
                />
                <Area
                  type="monotone"
                  dataKey="totalPower"
                  name="Total Power"
                  stroke={darkMode ? '#60a5fa' : '#2563eb'}
                  fill={darkMode ? '#3b82f6' : '#3b82f6'}
                  fillOpacity={darkMode ? 0.2 : 0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}
