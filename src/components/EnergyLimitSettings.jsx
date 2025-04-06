import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EnergyLimitSettings = () => {
  const [limits, setLimits] = useState({ daily: '', monthly: '' });
  const [usage, setUsage] = useState({ dailyUsage: 0, monthlyUsage: 0 });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchUsageAndLimits();
    fetchNotifications();
    // Set up polling for usage updates
    const interval = setInterval(fetchUsageAndLimits, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchUsageAndLimits = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_API_URL+'/energy-limits/usage');
      setUsage({
        dailyUsage: response.data.dailyUsage,
        monthlyUsage: response.data.monthlyUsage
      });
      if (response.data.limits) {
        setLimits({
          daily: response.data.limits.daily || '',
          monthly: response.data.limits.monthly || ''
        });
      }
    } catch (error) {
      console.error('Error fetching usage and limits:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(import.meta.env.VITE_API_URL+'/energy-limits/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  

  const markNotificationsAsRead = async () => {
    try {
      await axios.put(import.meta.env.VITE_API_URL+'/energy-limits/notifications/read');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Total Energy Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-600 dark:text-blue-200">Daily Usage</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-100">
              {usage.dailyUsage.toFixed(2)}W
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-200">Monthly Usage</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-100">
              {usage.monthlyUsage.toFixed(2)}W
            </p>
          </div>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold dark:text-white">Notifications</h2>
            <button
              onClick={markNotificationsAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Mark all as read
            </button>
          </div>
          <div className="space-y-4">
            {notifications.slice(0, 5).map((notification, index) => (
              <div
                key={index}
                className={`p-4 rounded-md ${
                  notification.read
                    ? 'bg-gray-50 dark:bg-gray-700'
                    : 'bg-yellow-50 dark:bg-yellow-900'
                }`}
              >
                <p className="text-sm dark:text-gray-200">{notification.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyLimitSettings;
