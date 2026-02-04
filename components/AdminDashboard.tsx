'use client';

import { useState, useEffect } from 'react';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface Registration {
  registration_number: number;
  user_id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  registered_at: string;
  [key: string]: any;
}

interface CheckIn {
  user_id: string;
  service: string;
  checkin_at: string;
  [key: string]: any;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'registrations' | 'checkins' | 'stats'>('registrations');
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
      setRegistrations(regData);
      setCheckins(checkData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => {
          const value = row[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value || '';
        }).join(',')
      ),
    ].join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 text-white p-8 rounded-3xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <img
                  src="https://i.imgur.com/n99IEoM.png"
                  alt="DICT Logo"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-slate-200">DTC Tuguegarao Attendance System</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-semibold">Total Registrations</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{registrations.length}</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.89 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-semibold">Total Check-ins</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{checkins.length}</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 font-semibold">Conversion Rate</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">
                  {registrations.length > 0 ? ((checkins.length / registrations.length) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75-3.54-4.3 5.74h12l-3.96-5.2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'registrations'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-500'
            }`}
          >
            Registrations
          </button>
          <button
            onClick={() => setActiveTab('checkins')}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'checkins'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-500'
            }`}
          >
            Check-ins
          </button>
        </div>

        {/* Registrations Tab */}
        {activeTab === 'registrations' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Registrations</h2>
              <button
                onClick={() => exportToCSV(registrations, 'registrations.csv')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                </svg>
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Reg #</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">User ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-700">{reg.registration_number}</td>
                      <td className="px-4 py-3 font-mono text-blue-600">{reg.user_id}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {reg.firstName} {reg.lastName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{reg.email}</td>
                      <td className="px-4 py-3 text-slate-600">{reg.phone}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(reg.registered_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {registrations.length === 0 && (
                <div className="text-center py-8 text-slate-500">No registrations yet</div>
              )}
            </div>
          </div>
        )}

        {/* Check-ins Tab */}
        {activeTab === 'checkins' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Check-ins</h2>
              <button
                onClick={() => exportToCSV(checkins, 'checkins.csv')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                </svg>
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">User ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Service</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Check-in Time</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {checkins.map((checkin, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-blue-600">{checkin.user_id}</td>
                      <td className="px-4 py-3 text-slate-700">{checkin.service}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(checkin.checkin_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{checkin.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {checkins.length === 0 && (
                <div className="text-center py-8 text-slate-500">No check-ins yet</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
