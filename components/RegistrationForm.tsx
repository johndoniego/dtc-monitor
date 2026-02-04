'use client';

import { useState } from 'react';
import Toast from './Toast';

interface RegistrationData {
  firstName: string;
  middleInitial: string;
  lastName: string;
  suffix: string;
  email: string;
  gender: string;
  birthdate: string;
  phone: string;
  nationality: string;
  region: string;
  building: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  services: string[];
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: '',
    middleInitial: '',
    lastName: '',
    suffix: '',
    email: '',
    gender: '',
    birthdate: '',
    phone: '',
    nationality: '',
    region: '',
    building: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    services: [],
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const calculateAgeGroup = (birthdate: string) => {
    if (!birthdate) return '';
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (age < 15) return '< 15 years old';
    if (age < 30) return '15 - 29 years old';
    if (age < 60) return '30 - 59 years old';
    return '60+ years old';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setToast({
          type: 'error',
          message: data.error || 'Failed to register',
        });
      } else {
        setToast({
          type: 'success',
          message: 'Registration successful!',
        });
        setRegistrationNumber(data.data.registration_number);
        setUserId(data.data.user_id);
        setFormData({
          firstName: '',
          middleInitial: '',
          lastName: '',
          suffix: '',
          email: '',
          gender: '',
          birthdate: '',
          phone: '',
          nationality: '',
          region: '',
          building: '',
          street: '',
          barangay: '',
          city: '',
          province: '',
          services: [],
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'An error occurred during registration',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Modal */}
      {registrationNumber && userId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Registration Successful!</h2>
              <p className="text-slate-600 mb-6">Your information has been saved.</p>
              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-slate-600 mb-2">
                  <span className="font-semibold">Registration Number:</span>
                </p>
                <p className="text-lg font-mono font-bold text-blue-600 mb-4">{registrationNumber}</p>
                <p className="text-sm text-slate-600 mb-2">
                  <span className="font-semibold">User ID:</span>
                </p>
                <p className="text-lg font-mono font-bold text-blue-600">{userId}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRegistrationNumber(null);
                  setUserId(null);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information Section */}
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-500">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Juan"
              required
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Middle Initial</label>
            <input
              type="text"
              name="middleInitial"
              value={formData.middleInitial}
              onChange={handleInputChange}
              placeholder="D"
              maxLength="1"
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Dela Cruz"
              required
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Suffix</label>
            <select
              name="suffix"
              value={formData.suffix}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">None</option>
              <option value="Jr.">Jr.</option>
              <option value="Sr.">Sr.</option>
              <option value="II">II</option>
              <option value="III">III</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="email@example.com"
            required
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {['Male', 'Female', 'Prefer not to say'].map((option) => (
                <label key={option} className="flex items-center gap-3 p-2 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={formData.gender === option}
                    onChange={handleInputChange}
                    required
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Birthdate <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            {formData.birthdate && (
              <p className="text-sm text-blue-600 font-semibold mt-2">
                Age Group: {calculateAgeGroup(formData.birthdate)}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="09171234567"
            pattern="09[0-9]{9}"
            required
            className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <p className="text-xs text-slate-500 mt-1">Must start with 09 and be 11 digits</p>
        </div>
      </div>

      {/* Location Section */}
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-500">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Location</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nationality <span className="text-red-500">*</span>
            </label>
            <select
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select nationality...</option>
              <option value="Filipino">Filipino</option>
              <option value="American">American</option>
              <option value="Australian">Australian</option>
              <option value="British">British</option>
              <option value="Canadian">Canadian</option>
              <option value="Chinese">Chinese</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Region <span className="text-red-500">*</span>
            </label>
            <select
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select region...</option>
              <option value="Region II">Region II - Cagayan Valley</option>
              <option value="Region I">Region I - Ilocos Region</option>
              <option value="Region III">Region III - Central Luzon</option>
              <option value="NCR">NCR - National Capital Region</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Building/House Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="building"
              value={formData.building}
              onChange={handleInputChange}
              placeholder="123"
              required
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Street</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              placeholder="Main Street"
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Barangay</label>
            <input
              type="text"
              name="barangay"
              value={formData.barangay}
              onChange={handleInputChange}
              placeholder="Barangay"
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Tuguegarao"
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Province</label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleInputChange}
              placeholder="Cagayan"
              className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-500">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Services Interested In</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Printing', 'PC Use', 'Training'].map((service) => (
            <label
              key={service}
              className={`p-4 border-3 rounded-xl cursor-pointer transition-all ${
                formData.services.includes(service)
                  ? 'border-green-500 bg-green-50'
                  : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.services.includes(service)}
                onChange={() => handleServiceToggle(service)}
                className="w-5 h-5 accent-green-600"
              />
              <span className="ml-3 font-semibold text-slate-700">{service}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
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
          'Submit Registration'
        )}
      </button>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </form>
  );
}
