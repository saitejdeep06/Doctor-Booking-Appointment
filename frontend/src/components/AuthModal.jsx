import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Sparkles, HeartPulse, Stethoscope } from 'lucide-react';
import { api, setStoredToken } from '../api';

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('General Medicine');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({
          name,
          email,
          password,
          role,
          phone,
          specialty: role === 'doctor' ? specialty : undefined
        });
        setStoredToken(res.token);
        onAuthSuccess(res.user);
        onClose();
      } else {
        const res = await api.login(email, password);
        setStoredToken(res.token);
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (roleName) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.demoLogin(roleName);
      setStoredToken(res.token);
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              {isRegister ? 'Create MedCare Account' : 'Welcome Back'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Switcher Strip inside modal */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <p className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Quick 1-Click Demo Login:
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleDemo('patient')}
              className="px-2 py-1.5 bg-white hover:bg-teal-50 border border-slate-200 rounded-xl font-medium text-slate-700 hover:text-teal-700 transition"
            >
              👤 Sarah (Patient)
            </button>
            <button
              type="button"
              onClick={() => handleDemo('doctor')}
              className="px-2 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl font-medium text-slate-700 hover:text-blue-700 transition"
            >
              🩺 Dr. Chen
            </button>
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="px-2 py-1.5 bg-white hover:bg-purple-50 border border-slate-200 rounded-xl font-medium text-slate-700 hover:text-purple-700 transition"
            >
              ⚙️ Admin
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <>
              {/* Role Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    role === 'patient'
                      ? 'bg-teal-50 border-teal-600 text-teal-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  I'm a Patient
                </button>
                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={`py-2 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1 ${
                    role === 'doctor'
                      ? 'bg-blue-50 border-blue-600 text-blue-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  I'm a Doctor
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {role === 'doctor' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specialty</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Neurology">Neurology</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Ophthalmology">Ophthalmology</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/30 transition mt-2"
          >
            {loading ? 'Please wait...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Register/Sign In */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
            }}
            className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
          >
            {isRegister
              ? 'Already have an account? Sign In'
              : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
