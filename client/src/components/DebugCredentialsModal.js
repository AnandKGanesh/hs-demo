import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import API_BASE_URL from '../config';

const DebugCredentialsModal = ({ initialCredentials, onSave, onCancel }) => {
  const [credentials, setCredentials] = useState(initialCredentials || {
    publishableKey: '',
    secretKey: '',
    profileId: '',
    merchantId: '',
  });
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const isEditing = !!initialCredentials;

  const handleChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    if (validationError) {
      setValidationError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.publishableKey.trim()) newErrors.publishableKey = 'Publishable Key is required';
    if (!credentials.secretKey.trim()) newErrors.secretKey = 'Secret Key is required';
    if (!credentials.profileId.trim()) newErrors.profileId = 'Profile ID is required';
    if (!credentials.merchantId.trim()) newErrors.merchantId = 'Merchant ID is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCredentials = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/create-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Mode': 'true',
          'X-Publishable-Key': credentials.publishableKey,
          'X-Secret-Key': credentials.secretKey,
          'X-Profile-Id': credentials.profileId,
          'X-Merchant-Id': credentials.merchantId,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Invalid credentials');
      }

      return true;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Validation timed out. Please check your credentials and try again.');
      }
      throw new Error(error.message || 'Failed to validate credentials');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      await validateCredentials();
      onSave(credentials);
    } catch (error) {
      setValidationError(error.message);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Debug Mode Credentials
          </h2>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Enter your sandbox credentials to use Debug Mode. These will be stored locally in your browser.
        </p>

        {validationError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              <strong>Validation Failed:</strong> {validationError}
            </p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
              Please check your credentials and try again. Make sure you're using sandbox credentials.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Publishable Key
            </label>
            <input
              type="text"
              value={credentials.publishableKey}
              onChange={(e) => handleChange('publishableKey', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder="pk_snd_..."
            />
            {errors.publishableKey && (
              <p className="text-xs text-red-500 mt-1">{errors.publishableKey}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Secret Key
            </label>
            <input
              type="password"
              value={credentials.secretKey}
              onChange={(e) => handleChange('secretKey', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder="snd_..."
            />
            {errors.secretKey && (
              <p className="text-xs text-red-500 mt-1">{errors.secretKey}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Profile ID
            </label>
            <input
              type="text"
              value={credentials.profileId}
              onChange={(e) => handleChange('profileId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder="pro_..."
            />
            {errors.profileId && (
              <p className="text-xs text-red-500 mt-1">{errors.profileId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Merchant ID
            </label>
            <input
              type="text"
              value={credentials.merchantId}
              onChange={(e) => handleChange('merchantId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              placeholder="merchant_..."
            />
            {errors.merchantId && (
              <p className="text-xs text-red-500 mt-1">{errors.merchantId}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium"
            >
              {isEditing ? 'Update & Reload' : 'Save & Enable Debug Mode'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DebugCredentialsModal;