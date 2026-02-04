'use client';

import { useState, useEffect } from 'react';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface Registration {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  service: string;
  createdAt: string;
  [key: string]: any;
}

interface CheckIn {
  userId: string;
  service: string;
  checkinAt: string;
  [key: string]: any;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'registrations' | 'checkins'>('registrations');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regRes, checkRes] = await Promise.all([
        fetch('/api/registrations'),
        fetch('/api/checkins'),
      ]);
      const regData = await regRes.json();
      const checkData = await checkRes.json();
      setRegistrations(Array.isArray(regData) ? regData : []);
      setCheckins(Array.isArray(checkData) ? checkData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [
      keys.join(','),
      ...data.map(item =>
        keys.map(key => {
          const value = item[key];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">DTC Tuguegarao Management</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 flex border-b">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`flex-1 py-4 px-6 font-semibold border-b-2 transition ${
              activeTab === 'registrations'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Registrations ({registrations.length})
          </button>
          <button
            onClick={() => setActiveTab('checkins')}
            className={`flex-1 py-4 px-6 font-semibold border-b-2 transition ${
              activeTab === 'checkins'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            Check-ins ({checkins.length})
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              <p className="text-gray-600 mt-4">Loading...</p>
            </div>
          ) : activeTab === 'registrations' ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Registrations</h2>
                <button
                  onClick={() => exportCSV(registrations, 'registrations.csv')}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                >
                  Export to CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">User ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Service</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No registrations yet
                        </td>
                      </tr>
                    ) : (
                      registrations.map((reg, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-blue-600">{reg.userId}</td>
                          <td className="px-4 py-3">{reg.firstName} {reg.lastName}</td>
                          <td className="px-4 py-3 text-sm">{reg.email}</td>
                          <td className="px-4 py-3 text-sm">{reg.phone}</td>
                          <td className="px-4 py-3 text-sm">{reg.service}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(reg.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Check-ins</h2>
                <button
                  onClick={() => exportCSV(checkins, 'checkins.csv')}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                >
                  Export to CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">User ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Service</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checkins.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                          No check-ins yet
                        </td>
                      </tr>
                    ) : (
                      checkins.map((checkin, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-blue-600">{checkin.userId}</td>
                          <td className="px-4 py-3 text-sm">{checkin.service}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(checkin.checkinAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
