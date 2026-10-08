import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DoctorCard from './components/DoctorCard';
import DoctorModal from './components/DoctorModal';
import BookingModal from './components/BookingModal';
import AppointmentsView from './components/AppointmentsView';
import DoctorPortal from './components/DoctorPortal';
import AdminPortal from './components/AdminPortal';
import AuthModal from './components/AuthModal';
import { api, getStoredToken, setStoredToken } from './api';
import {
  Search,
  SlidersHorizontal,
  HeartPulse,
  ShieldCheck,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

const SPECIALTIES = [
  'All',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'General Medicine',
  'Psychiatry',
  'Ophthalmology'
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('doctors'); // 'doctors', 'appointments', 'doctor-schedule', 'admin'
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  // Appointments & Notifications
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modals
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState(null);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial user initialization: try stored token, or fallback to demo patient Sarah
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      api.getMe()
        .then((res) => {
          setUser(res.user);
        })
        .catch(() => {
          // If token expired, do default demo login for seamless first experience
          handleDemoSwitch('patient');
        });
    } else {
      handleDemoSwitch('patient');
    }
  }, []);

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const params = {};
      if (selectedSpecialty !== 'All') params.specialty = selectedSpecialty;
      if (searchQuery) params.search = searchQuery;
      if (sortBy) params.sortBy = sortBy;

      const res = await api.getDoctors(params);
      setDoctors(res.doctors || []);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, searchQuery, sortBy]);

  // Fetch appointments and notifications when user or activeTab changes
  const refreshUserData = async () => {
    if (!user) return;
    try {
      const apts = await api.getAppointments('all');
      setAppointments(apts.appointments || []);

      const notifs = await api.getNotifications();
      setNotifications(notifs.notifications || []);
      setUnreadCount(notifs.unreadCount || 0);
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshUserData();
    } else {
      setAppointments([]);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, activeTab]);

  // Handle Demo Switching
  const handleDemoSwitch = async (role) => {
    try {
      const res = await api.demoLogin(role);
      setStoredToken(res.token);
      setUser(res.user);
      if (role === 'doctor') setActiveTab('doctor-schedule');
      else if (role === 'admin') setActiveTab('admin');
      else setActiveTab('doctors');
      showToast(`Switched to demo role: ${res.user.name} (${res.user.role})`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setStoredToken(null);
    setUser(null);
    setActiveTab('doctors');
    showToast('Signed out of session');
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      refreshUserData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      refreshUserData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingSuccess = (newApt) => {
    refreshUserData();
    showToast(`Appointment booked successfully with ${newApt.doctorName}! Code: ${newApt.bookingCode}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-semibold border ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border-teal-500'
                : 'bg-rose-900 text-white border-rose-500'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onDemoSwitch={handleDemoSwitch}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllRead}
        onOpenBooking={() => {
          if (doctors.length > 0) setSelectedDoctorForBooking(doctors[0]);
        }}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {/* DOCTORS BROWSE VIEW */}
        {activeTab === 'doctors' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-8 sm:p-12 shadow-2xl">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Verified Doctors & Instant Slot Reservation
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  Book Doctor Appointments <br />
                  <span className="text-teal-400">Without the Waiting Line</span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                  Find top-rated specialists, check real-time availability, lock your time slot in seconds, and receive digital consultation receipts.
                </p>

                {/* Live Feature Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Instant Booking</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Board Certified</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2 rounded-xl">
                    <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Zero Wait Times</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2 rounded-xl">
                    <HeartPulse className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Digital Rx Notes</span>
                  </div>
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Search & Filters Section */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search doctor name, hospital, symptom, or treatment..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-teal-600 focus:bg-white transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
                    <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="rating">Top Rated (★)</option>
                      <option value="experience">Most Experienced</option>
                      <option value="fee_low">Fee: Low to High</option>
                      <option value="fee_high">Fee: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Specialty Pills */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Browse by Medical Specialty
                </p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {SPECIALTIES.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => setSelectedSpecialty(spec)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                        selectedSpecialty === spec
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Doctors Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Available Specialists ({doctors.length})
                </h2>
                <span className="text-xs text-slate-500">
                  Showing {selectedSpecialty} doctors
                </span>
              </div>

              {loadingDoctors ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-4">
                      <div className="flex gap-3">
                        <div className="w-14 h-14 bg-slate-200 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="w-3/4 h-4 bg-slate-200 rounded" />
                          <div className="w-1/2 h-3 bg-slate-200 rounded" />
                        </div>
                      </div>
                      <div className="h-10 bg-slate-100 rounded-xl" />
                      <div className="h-8 bg-slate-200 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : doctors.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">No doctors found</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Try adjusting your search criteria or select 'All' specialties.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSpecialty('All');
                      setSearchQuery('');
                    }}
                    className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {doctors.map((doc) => (
                    <DoctorCard
                      key={doc.id}
                      doctor={doc}
                      onBook={(doctor) => setSelectedDoctorForBooking(doctor)}
                      onViewDetails={(doctor) => setSelectedDoctorForModal(doctor)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* APPOINTMENTS VIEW (Patient) */}
        {activeTab === 'appointments' && (
          <AppointmentsView
            appointments={appointments}
            onRefresh={refreshUserData}
            onBookNew={() => setActiveTab('doctors')}
            user={user}
          />
        )}

        {/* DOCTOR SCHEDULE & PATIENT QUEUE (Doctor Portal) */}
        {activeTab === 'doctor-schedule' && (
          <DoctorPortal
            doctor={doctors.find((d) => d.userId === user?.id) || doctors[0]}
            appointments={appointments}
            onRefresh={refreshUserData}
            user={user}
          />
        )}

        {/* ADMIN ANALYTICS PORTAL */}
        {activeTab === 'admin' && (
          <AdminPortal onRefreshDoctors={fetchDoctors} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-slate-800">MedCare Appointment Engine</span>
            <span>• HIPAA Compliant & Double-Booking Protected</span>
          </div>
          <p>© 2026 MedCare Health Systems. All rights reserved.</p>
        </div>
      </footer>

      {/* MODALS */}
      {selectedDoctorForModal && (
        <DoctorModal
          doctor={selectedDoctorForModal}
          onClose={() => setSelectedDoctorForModal(null)}
          onBook={(doctor) => {
            setSelectedDoctorForModal(null);
            setSelectedDoctorForBooking(doctor);
          }}
        />
      )}

      {selectedDoctorForBooking && (
        <BookingModal
          doctor={selectedDoctorForBooking}
          user={user}
          onClose={() => setSelectedDoctorForBooking(null)}
          onBookingSuccess={handleBookingSuccess}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(u) => {
            setUser(u);
            showToast(`Logged in as ${u.name}`);
            refreshUserData();
          }}
        />
      )}
    </div>
  );
}
