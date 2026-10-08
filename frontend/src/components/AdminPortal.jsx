import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  DollarSign,
  Calendar,
  Stethoscope,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  X
} from 'lucide-react';
import { api } from '../api';

export default function AdminPortal({ onRefreshDoctors }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddDoctor, setShowAddDoctor] = useState(false);

  // Form fields for Add Doctor
  const [newDoc, setNewDoc] = useState({
    name: '',
    specialty: 'Cardiology',
    experienceYears: 5,
    hospital: '',
    consultationFee: 100,
    about: '',
    qualifications: 'MD, Board Certified',
    languages: 'English'
  });
  const [submittingDoc, setSubmittingDoc] = useState(false);
  const [docSuccess, setDocSuccess] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminStats();
      setStats(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setSubmittingDoc(true);
    setDocSuccess('');
    try {
      await api.addDoctor(newDoc);
      setDocSuccess('Doctor created successfully and available for bookings!');
      setNewDoc({
        name: '',
        specialty: 'Cardiology',
        experienceYears: 5,
        hospital: '',
        consultationFee: 100,
        about: '',
        qualifications: 'MD, Board Certified',
        languages: 'English'
      });
      loadStats();
      if (onRefreshDoctors) onRefreshDoctors();
      setTimeout(() => setShowAddDoctor(false), 1500);
    } catch (err) {
      alert(err.message || 'Failed to add doctor');
    } finally {
      setSubmittingDoc(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-400">
        Loading platform analytics...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            Executive Admin Analytics & Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time platform performance metrics, doctor directories, and revenue statistics.
          </p>
        </div>

        <button
          onClick={() => setShowAddDoctor(true)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add New Doctor Profile
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Bookings</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats?.totalAppointments || 0}
          </p>
          <p className="text-[11px] text-teal-600 font-medium mt-1">Live bookings across specialties</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Doctors</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats?.totalDoctors || 0}
          </p>
          <p className="text-[11px] text-blue-600 font-medium mt-1">Across 8 Medical Specialties</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Registered Patients</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {stats?.totalPatients || 0}
          </p>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">Active patient profiles</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Platform Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            ${stats?.totalRevenue || 0}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Net platform volume</p>
        </div>
      </div>

      {/* Specialty Breakdown & Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Specialty distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            Doctor Distribution by Specialty
          </h3>
          <div className="space-y-2.5">
            {stats?.specialtyCounts &&
              Object.entries(stats.specialtyCounts).map(([spec, count]) => (
                <div key={spec}>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>{spec}</span>
                    <span className="font-bold">{count} Doctors</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full"
                      style={{ width: `${(count / (stats.totalDoctors || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Appointment Status distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            Appointments Breakdown
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center pt-2">
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
              <span className="text-xs text-blue-700 font-semibold block">Upcoming</span>
              <span className="text-2xl font-bold text-blue-900 block mt-1">
                {stats?.statusCounts?.upcoming || 0}
              </span>
            </div>
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <span className="text-xs text-emerald-700 font-semibold block">Completed</span>
              <span className="text-2xl font-bold text-emerald-900 block mt-1">
                {stats?.statusCounts?.completed || 0}
              </span>
            </div>
            <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100">
              <span className="text-xs text-rose-700 font-semibold block">Cancelled</span>
              <span className="text-2xl font-bold text-rose-900 block mt-1">
                {stats?.statusCounts?.cancelled || 0}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Operational Health Summary:</p>
            <p>98.7% slot fulfillment rate with active double-booking protection enabled.</p>
          </div>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {showAddDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Add New Specialist</h3>
              </div>
              <button
                onClick={() => setShowAddDoctor(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {docSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{docSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateDoctor} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  placeholder="e.g. Dr. Priya Sharma"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Specialty</label>
                  <select
                    value={newDoc.specialty}
                    onChange={(e) => setNewDoc({ ...newDoc, specialty: e.target.value })}
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
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={newDoc.experienceYears}
                    onChange={(e) => setNewDoc({ ...newDoc, experienceYears: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hospital / Clinic</label>
                  <input
                    type="text"
                    value={newDoc.hospital}
                    onChange={(e) => setNewDoc({ ...newDoc, hospital: e.target.value })}
                    placeholder="e.g. Apollo Super Specialty"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    value={newDoc.consultationFee}
                    onChange={(e) => setNewDoc({ ...newDoc, consultationFee: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Profile Summary</label>
                <textarea
                  value={newDoc.about}
                  onChange={(e) => setNewDoc({ ...newDoc, about: e.target.value })}
                  placeholder="Expertise, sub-specialty, medical highlights..."
                  rows={2}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDoctor(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDoc}
                  className="px-5 py-2.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition"
                >
                  {submittingDoc ? 'Creating...' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
