import { useState, useEffect } from 'react';
import { energyApi, deviceApi } from '../api/api';
import Layout from '../components/Layout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';

export default function EnergyMonitoring() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [energyData, setEnergyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { darkMode } = useTheme();

  // Fetch devices on component mount
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await deviceApi.getAllDevices();
        setDevices(response.data);
        if (response.data.length > 0) {
          setSelectedDevice(response.data[0]);
        }
      } catch (err) {
        setError('Failed to load devices');
      }
    };
    fetchDevices();
  }, []);

  // Fetch energy data when device is selected
  useEffect(() => {
    const fetchEnergyData = async () => {
      if (!selectedDevice) return;
      
      setLoading(true);
      try {
        const response = await energyApi.getDeviceData(selectedDevice.deviceId);
        setEnergyData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load energy data');
      } finally {
        setLoading(false);
      }
    };

    fetchEnergyData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchEnergyData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [selectedDevice]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Energy Monitoring</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Real-time energy consumption monitoring for your devices
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm dark:bg-gray-700 dark:text-white transition-colors duration-200"
              value={selectedDevice?.deviceId || ''}
              onChange={(e) => {
                const device = devices.find(d => d.deviceId === e.target.value);
                setSelectedDevice(device);
              }}
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.name} - {device.location}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600 dark:text-gray-400">Loading...</div>
          </div>
        ) : (
          <>
            {/* Current Readings */}
            {selectedDevice && energyData.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Power</h3>
                  <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {energyData[energyData.length - 1].power}W
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Voltage</h3>
                  <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {energyData[energyData.length - 1].voltage}V
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current</h3>
                  <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                    {energyData[energyData.length - 1].current}A
                  </p>
                </div>
              </div>
            )}

            {/* Energy Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Energy Usage Over Time</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={energyData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatTimestamp}
                      stroke={darkMode ? '#9ca3af' : '#4b5563'}
                      tick={{ fill: darkMode ? '#9ca3af' : '#4b5563' }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      stroke={darkMode ? '#9ca3af' : '#4b5563'}
                      tick={{ fill: darkMode ? '#9ca3af' : '#4b5563' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
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
                      labelFormatter={formatTimestamp}
                      formatter={(value, name) => [value, name]}
                    />
                    <Legend 
                      wrapperStyle={{ color: darkMode ? '#e5e7eb' : '#111827' }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="power"
                      name="Power (W)"
                      stroke={darkMode ? '#60a5fa' : '#2563eb'}
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="voltage"
                      name="Voltage (V)"
                      stroke={darkMode ? '#34d399' : '#059669'}
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="current"
                      name="Current (A)"
                      stroke={darkMode ? '#f87171' : '#dc2626'}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Readings Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors duration-200">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Readings</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Time
                      </th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Device Name
                      </th>
                      <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        Power (W)
                      </th>
                      <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        Voltage (V)
                      </th>
                      <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        Current (A)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {[...energyData].reverse().slice(0, 10).map((reading, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                          {new Date(reading.timestamp).toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 dark:text-white">
                          {selectedDevice.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-white">
                          {reading.power}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-white">
                          {reading.voltage}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-900 dark:text-white">
                          {reading.current}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
