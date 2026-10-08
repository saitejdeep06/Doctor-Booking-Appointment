import React, { useState } from 'react';
import {
  HeartPulse,
  Calendar,
  User,
  Bell,
  Stethoscope,
  ShieldCheck,
  LogOut,
  ChevronDown,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  onDemoSwitch,
  activeTab,
  setActiveTab,
  notifications,
  unreadCount,
  onMarkNotificationRead,
  onMarkAllRead,
  onOpenBooking
}) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Demo Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-medium text-white">Interactive Demo Switcher:</span>
            <span className="hidden sm:inline text-slate-400">Test different role workflows instantly:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDemoSwitch('patient')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
                user?.role === 'patient'
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              👤 Patient (Sarah)
            </button>
            <button
              onClick={() => onDemoSwitch('doctor')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
                user?.role === 'doctor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🩺 Doctor (Dr. Chen)
            </button>
            <button
              onClick={() => onDemoSwitch('admin')}
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
                user?.role === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ⚙️ Admin Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab('doctors')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
                Med<span className="text-teal-600">Care</span>
              </span>
              <p className="text-[10px] text-slate-500 tracking-wider font-semibold uppercase -mt-1">
                Doctor Appointments
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'doctors'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Find Doctors
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'appointments'
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              My Appointments
            </button>

            {user?.role === 'doctor' && (
              <button
                onClick={() => setActiveTab('doctor-schedule')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'doctor-schedule'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-blue-600" />
                Doctor Portal
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Admin Analytics
              </button>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-teal-600" />
                      <span className="font-semibold text-sm text-slate-800">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllRead}
                        className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => onMarkNotificationRead(notif.id)}
                          className={`p-3.5 cursor-pointer transition flex items-start gap-3 hover:bg-slate-50 ${
                            !notif.read ? 'bg-teal-50/40' : ''
                          }`}
                        >
                          <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            notif.type === 'booking_success' ? 'bg-teal-100 text-teal-600' :
                            notif.type === 'prescription_added' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile or Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-900 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize leading-none mt-1">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('appointments');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4 text-teal-600" />
                      My Appointments
                    </button>

                    {user.role === 'doctor' && (
                      <button
                        onClick={() => {
                          setActiveTab('doctor-schedule');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        Doctor Queue & Notes
                      </button>
                    )}

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setActiveTab('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition"
              >
                Sign In / Join
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
