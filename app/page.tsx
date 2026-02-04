'use client';

import { useState } from 'react';
import RegistrationForm from '@/components/RegistrationForm';
import CheckInForm from '@/components/CheckInForm';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'register' | 'checkin'>('register');

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-sky-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-600 to-sky-400 text-white p-8 rounded-3xl mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl pointer-events-none" />
          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <img
                src="https://i.imgur.com/n99IEoM.png"
                alt="DICT Logo"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.background = 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)';
                }}
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">DTC Tuguegarao Cagayan</h1>
            <p className="text-lg opacity-90">Attendance Monitoring System</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl p-2 mb-6 shadow-sm border border-slate-200 flex gap-2">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            Register
          </button>
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'checkin'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z" />
            </svg>
            Check In
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'register' && <RegistrationForm />}
        {activeTab === 'checkin' && <CheckInForm />}
      </div>
    </div>
  );
}
