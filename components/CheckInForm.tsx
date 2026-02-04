'use client';

import { useState } from 'react';
import Toast from './Toast';

export default function CheckInForm() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [checkInData, setCheckInData] = useState({
    service: '',
    notes: '',
  });

  const handleUserIdChange = async (value: string) => {
    setUserId(value.toUpperCase());
    if (value.trim()) {
      try {
        const response = await fetch('/api/check-userid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: value }),
        });
        const data = await response.json();
        setUserInfo(data.user || null);
      } catch (error) {
        setUserInfo(null);
      }
    } else {
      setUserInfo(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo) {
      setToast({ type: 'error', message: 'Please select a valid user ID' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          service: checkInData.service,
          notes: checkInData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setToast({
          type: 'error',
          message: data.error || 'Failed to check in',
        });
      } else {
        setToast({
          type: 'success',
          message: `Welcome back, ${userInfo.firstName}!`,
        });
        setUserId('');
        setUserInfo(null);
        setCheckInData({ service: '', notes: '' });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'An error occurred during check-in',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User ID Section */}
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-500">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Check In</h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            User ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => handleUserIdChange(e.target.value)}
            placeholder="DT-00001"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all ${
              userInfo
                ? 'border-green-500 focus:border-green-600 focus:ring-green-100'
                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
            }`}
            required
          />
          <p className="text-xs text-slate-500 mt-1">Enter the User ID from your registration</p>
        </div>

        {userInfo && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-green-900">
                  {userInfo.firstName} {userInfo.lastName}
                </p>
                <p className="text-sm text-green-700">{userInfo.email}</p>
              </div>
            </div>
          </div>
        )}

        {userId && !userInfo && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 mb-4">
            <p className="text-red-700 font-semibold">User ID not found. Please check and try again.</p>
          </div>
        )}
      </div>

      {/* Check-in Details */}
      {userInfo && (
        <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-500">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Service Details</h2>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Service <span className="text-red-500">*</span>
            </label>
            <select
              value={checkInData.service}
              onChange={(e) => setCheckInData({ ...checkInData, service: e.target.value })}
              required
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select a service...</option>
              <option value="Printing">Printing</option>
              <option value="PC Use">PC Use</option>
              <option value="Training">Training</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Additional Notes</label>
            <textarea
              value={checkInData.notes}
              onChange={(e) => setCheckInData({ ...checkInData, notes: e.target.value })}
              placeholder="Any additional information..."
              rows={3}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      {userInfo && (
        <button
          type="submit"
          disabled={loading || !userInfo}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-60 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            'Complete Check-In'
          )}
        </button>
      )}

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </form>
  );
}
