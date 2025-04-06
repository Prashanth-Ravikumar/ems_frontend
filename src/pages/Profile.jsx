import { useState, Fragment, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios'; // Import axios

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Devices', href: '/devices' },
  { name: 'Energy Monitoring', href: '/monitoring' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Profile() {
  const { user, logout } = useAuth();
  const [limits, setLimits] = useState({ daily: '', monthly: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
    const [usage, setUsage] = useState({ dailyUsage: 0, monthlyUsage: 0 });
  
      
    
  
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
  
      try {
        await axios.post(import.meta.env.VITE_API_URL+'/energy-limits/limits', {
          daily: parseFloat(limits.daily) || null,
          monthly: parseFloat(limits.monthly) || null
        });
        
        // Refresh data
        await fetchUsageAndLimits();
        setError('');
      } catch (error) {
        setError('Failed to update energy limits');
        console.error('Error updating limits:', error);
      } finally {
        setLoading(false);
      }
    };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      console.log('Sending password change request with token:', user.token);
      const response = await axios.post(import.meta.env.VITE_API_URL+'/auth/change-password', 
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Password change response:', response.data);

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password updated successfully' });
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: response.data.error || 'Failed to update password' });
      }
    } catch (error) {
      console.error('Password change error:', error.response?.data || error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Current password is incorrect or server error occurred'
      });
    }
  };

  useEffect(() => {
      fetchUsageAndLimits();
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <Disclosure as="nav" className="bg-white dark:bg-gray-800 shadow">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="-ml-2 mr-2 flex items-center md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-300">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                  <div className="hidden md:flex md:space-x-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  {/* Theme toggle */}
                  <button
                    onClick={toggleTheme}
                    className="rounded-md p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {darkMode ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                      </svg>
                    )}
                  </button>
                  {/* Sign out */}
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="ml-4 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3h15.75" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu */}
            <Disclosure.Panel className="md:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block py-2 pl-3 pr-4 text-base font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center gap-x-6">
              <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-4xl font-medium text-blue-600 dark:text-blue-400">
                  {user?.username ? user.username[0].toUpperCase() : 'U'}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</p>
                  <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">{user?.username || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                  <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white">{user?.email || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</p>
                  <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white capitalize">{user?.role || 'User'}</p>
                </div>
              </div>
            </div>

            {/* Password Change Form */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h3>
              {message.text && (
                <div className={`mt-4 p-4 rounded-md ${
                  message.type === 'error' 
                    ? 'bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-400' 
                    : 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                }`}>
                  {message.text}
                </div>
              )}
              <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className='p-6'>
          <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Update Energy Limits</h3>
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Daily Limit (Watts)
                    <input
                      type="number"
                      value={limits.daily}
                      onChange={(e) => setLimits({ ...limits, daily: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Enter daily limit"
                      required
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Monthly Limit (Watts)
                    <input
                      type="number"
                      value={limits.monthly}
                      onChange={(e) => setLimits({ ...limits, monthly: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Enter monthly limit"
                      required
                    />
                  </label>
                </div>
                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Update Limits'}
                </button>
              </form>
            </div>
                  </div>

        </div>
        
      </div>
      
    </div>
  );
}
