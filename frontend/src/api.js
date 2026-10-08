// API Client wrapper for Doctor Booking System

const API_BASE = '/api';

export const getStoredToken = () => localStorage.getItem('medcare_token');
export const setStoredToken = (token) => {
  if (token) localStorage.setItem('medcare_token', token);
  else localStorage.removeItem('medcare_token');
};

const authHeaders = () => {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async demoLogin(role) {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Demo login failed');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  // Doctors
  async getDoctors(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/doctors${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch doctors');
    return res.json();
  },

  async getDoctorById(id) {
    const res = await fetch(`${API_BASE}/doctors/${id}`);
    if (!res.ok) throw new Error('Failed to fetch doctor details');
    return res.json();
  },

  async getDoctorSlots(doctorId, date) {
    const res = await fetch(`${API_BASE}/doctors/${doctorId}/slots?date=${encodeURIComponent(date)}`);
    if (!res.ok) throw new Error('Failed to fetch available slots');
    return res.json();
  },

  async addDoctor(doctorData) {
    const res = await fetch(`${API_BASE}/doctors`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(doctorData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add doctor');
    }
    return res.json();
  },

  // Appointments
  async getAppointments(status = 'all') {
    const res = await fetch(`${API_BASE}/appointments?status=${status}`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch appointments');
    return res.json();
  },

  async getAppointmentById(id) {
    const res = await fetch(`${API_BASE}/appointments/${id}`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch appointment');
    return res.json();
  },

  async bookAppointment(data) {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Booking failed');
    }
    return res.json();
  },

  async updateAppointmentStatus(id, status, cancelReason = '') {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status, cancelReason })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Status update failed');
    }
    return res.json();
  },

  async rescheduleAppointment(id, date, timeSlot) {
    const res = await fetch(`${API_BASE}/appointments/${id}/reschedule`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ date, timeSlot })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Reschedule failed');
    }
    return res.json();
  },

  async savePrescriptionNotes(id, prescriptionNotes, doctorNotes) {
    const res = await fetch(`${API_BASE}/appointments/${id}/notes`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ prescriptionNotes, doctorNotes })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to save notes');
    }
    return res.json();
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: authHeaders()
    });
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'POST',
      headers: authHeaders()
    });
    return res.json();
  },

  // Stats
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  }
};
