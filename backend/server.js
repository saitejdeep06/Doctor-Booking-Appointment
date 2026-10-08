const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'doctor_appointment_secret_key_2026';

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    const user = db.findUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User no longer exists' });
    }
    req.user = user;
    next();
  });
};

// Optional Auth (for public routes that can personalize if token provided)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err && decoded) {
        req.user = db.findUserById(decoded.id);
      }
      next();
    });
  } else {
    next();
  }
};

// Generate JWT Helper
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'patient', phone, specialty } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = 'usr-' + uuidv4().slice(0, 8);

    const newUser = {
      id: userId,
      name,
      email,
      password: passwordHash,
      role: role === 'doctor' ? 'doctor' : (role === 'admin' ? 'admin' : 'patient'),
      phone: phone || '+1 (555) 000-0000',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    };

    db.createUser(newUser);

    // If registering as a doctor, auto-create doctor entry
    if (newUser.role === 'doctor') {
      const doctorId = 'doc-' + uuidv4().slice(0, 8);
      const newDoctor = {
        id: doctorId,
        userId: newUser.id,
        name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
        title: specialty ? `Consultant ${specialty}, MD` : 'Consultant Physician, MD',
        specialty: specialty || 'General Medicine',
        subSpecialty: 'General Consultations & Patient Care',
        experienceYears: 5,
        hospital: 'MedCare Central Hospital',
        address: '100 Health Boulevard, NY',
        consultationFee: 90,
        rating: 5.0,
        reviewCount: 1,
        about: `${name} is dedicated to delivering patient-first care with extensive diagnostic proficiency.`,
        qualifications: ['MD - Board Certified'],
        languages: ['English'],
        avatar: newUser.avatar,
        availabilityDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        workingHours: '09:00 AM - 05:00 PM',
        slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
        badges: ['New Doctor']
      };
      db.createDoctor(newDoctor);
    }

    const token = generateToken(newUser);
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    // Attach doctor info if role is doctor
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = db.findDoctorByUserId(user.id);
    }

    res.json({
      token,
      user: userWithoutPassword,
      doctorProfile
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Demo Instant Switcher (Patient, Doctor, Admin)
app.post('/api/auth/demo-login', (req, res) => {
  const { role = 'patient' } = req.body;
  let targetEmail = 'sarah@example.com';

  if (role === 'doctor') targetEmail = 'dr.chen@medcare.com';
  else if (role === 'admin') targetEmail = 'admin@medcare.com';

  const user = db.findUserByEmail(targetEmail);
  if (!user) {
    return res.status(404).json({ error: `Demo account for ${role} not found` });
  }

  const token = generateToken(user);
  const { password: _, ...userWithoutPassword } = user;

  let doctorProfile = null;
  if (user.role === 'doctor') {
    doctorProfile = db.findDoctorByUserId(user.id);
  }

  res.json({
    token,
    user: userWithoutPassword,
    doctorProfile
  });
});

// Get Current Profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const { password: _, ...userWithoutPassword } = req.user;
  let doctorProfile = null;
  if (req.user.role === 'doctor') {
    doctorProfile = db.findDoctorByUserId(req.user.id);
  }
  res.json({
    user: userWithoutPassword,
    doctorProfile
  });
});

// ==================== DOCTORS ROUTES ====================

// List Doctors with search, specialty, and sorting
app.get('/api/doctors', (req, res) => {
  try {
    const { specialty, search, sortBy } = req.query;
    let doctors = [...db.getDoctors()];

    if (specialty && specialty !== 'All') {
      doctors = doctors.filter(d => d.specialty.toLowerCase() === specialty.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      doctors = doctors.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.subSpecialty.toLowerCase().includes(q) ||
        d.hospital.toLowerCase().includes(q) ||
        d.about.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'rating') {
      doctors.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'experience') {
      doctors.sort((a, b) => b.experienceYears - a.experienceYears);
    } else if (sortBy === 'fee_low') {
      doctors.sort((a, b) => a.consultationFee - b.consultationFee);
    } else if (sortBy === 'fee_high') {
      doctors.sort((a, b) => b.consultationFee - a.consultationFee);
    }

    res.json({ doctors, total: doctors.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Doctor Detail
app.get('/api/doctors/:id', (req, res) => {
  const doctor = db.findDoctorById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  const reviews = db.getReviews(doctor.id);
  res.json({ doctor, reviews });
});

// Doctor Available Slots for a given date (real availability)
app.get('/api/doctors/:id/slots', (req, res) => {
  const { date } = req.query;
  const doctor = db.findDoctorById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  if (!date) {
    return res.status(400).json({ error: 'Date query param required (YYYY-MM-DD)' });
  }

  // Get active appointments for this doctor on this date
  const bookedSlots = db.getAppointments()
    .filter(a => a.doctorId === doctor.id && a.date === date && a.status !== 'cancelled')
    .map(a => a.timeSlot);

  // Return base slots with booked flag
  const slotsWithStatus = doctor.slots.map(slot => ({
    time: slot,
    available: !bookedSlots.includes(slot)
  }));

  res.json({
    doctorId: doctor.id,
    date,
    slots: slotsWithStatus,
    availableCount: slotsWithStatus.filter(s => s.available).length
  });
});

// Add doctor (Admin / Coordinator)
app.post('/api/doctors', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can add doctors' });
  }

  const {
    name, specialty, subSpecialty, experienceYears, hospital, address,
    consultationFee, qualifications, languages, slots
  } = req.body;

  const doctorId = 'doc-' + uuidv4().slice(0, 8);
  const newDoctor = {
    id: doctorId,
    userId: null,
    name,
    title: `Consultant ${specialty}, MD`,
    specialty,
    subSpecialty: subSpecialty || 'General Specialist',
    experienceYears: Number(experienceYears) || 5,
    hospital: hospital || 'Metro City Hospital',
    address: address || '100 Medical Center Way, NY',
    consultationFee: Number(consultationFee) || 100,
    rating: 5.0,
    reviewCount: 0,
    about: req.body.about || `${name} brings years of compassionate care and medical excellence.`,
    qualifications: qualifications ? qualifications.split(',').map(s => s.trim()) : ['MD, Board Certified'],
    languages: languages ? languages.split(',').map(s => s.trim()) : ['English'],
    avatar: req.body.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    availabilityDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    workingHours: '09:00 AM - 05:00 PM',
    slots: slots || ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'],
    badges: ['Verified Specialist']
  };

  db.createDoctor(newDoctor);
  res.status(201).json({ message: 'Doctor added successfully', doctor: newDoctor });
});

// ==================== APPOINTMENTS ROUTES ====================

// List Appointments (Role filtered)
app.get('/api/appointments', authenticateToken, (req, res) => {
  try {
    const { status } = req.query;
    let appointments = db.getAppointments();

    if (req.user.role === 'patient') {
      appointments = appointments.filter(a => a.patientId === req.user.id);
    } else if (req.user.role === 'doctor') {
      const doctor = db.findDoctorByUserId(req.user.id);
      if (doctor) {
        appointments = appointments.filter(a => a.doctorId === doctor.id);
      } else {
        appointments = [];
      }
    }
    // admin gets all

    if (status && status !== 'all') {
      appointments = appointments.filter(a => a.status === status);
    }

    // Sort by date upcoming first
    appointments.sort((a, b) => new Date(`${b.date} ${b.timeSlot}`) - new Date(`${a.date} ${a.timeSlot}`));

    res.json({ appointments, count: appointments.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get Appointment by ID
app.get('/api/appointments/:id', authenticateToken, (req, res) => {
  const apt = db.findAppointmentById(req.params.id);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  res.json({ appointment: apt });
});

// Book New Appointment
app.post('/api/appointments', authenticateToken, (req, res) => {
  try {
    const {
      doctorId,
      date,
      timeSlot,
      reason,
      symptoms,
      paymentMethod = 'Credit Card (Simulated)',
      discount = 0
    } = req.body;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ error: 'Doctor, date, and time slot are required' });
    }

    const doctor = db.findDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Double-booking check
    const isConflict = db.getAppointments().some(
      a => a.doctorId === doctorId && a.date === date && a.timeSlot === timeSlot && a.status !== 'cancelled'
    );

    if (isConflict) {
      return res.status(409).json({ error: 'This time slot was just booked by another patient. Please choose another slot.' });
    }

    // Calculation
    const consultationFee = doctor.consultationFee;
    const platformFee = 5;
    const tax = Math.round(consultationFee * 0.05);
    const total = Math.max(0, consultationFee + platformFee + tax - discount);

    const bookingCode = 'MC-' + Math.floor(10000 + Math.random() * 90000);
    const appointmentId = 'apt-' + uuidv4().slice(0, 8);

    const newAppointment = {
      id: appointmentId,
      bookingCode,
      patientId: req.user.id,
      patientName: req.user.name,
      patientEmail: req.user.email,
      patientPhone: req.user.phone || '+1 (555) 123-4567',
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorTitle: doctor.title,
      doctorSpecialty: doctor.specialty,
      doctorHospital: doctor.hospital,
      doctorAvatar: doctor.avatar,
      date,
      timeSlot,
      type: 'In-Clinic Consultation',
      reason: reason || 'General Consultation',
      symptoms: symptoms || '',
      status: 'upcoming',
      feeBreakdown: {
        consultationFee,
        platformFee,
        tax,
        discount: Number(discount) || 0,
        total
      },
      paymentStatus: 'paid',
      paymentMethod,
      prescriptionNotes: '',
      doctorNotes: '',
      createdAt: new Date().toISOString()
    };

    db.createAppointment(newAppointment);

    // Notify Patient
    db.createNotification({
      id: 'notif-' + uuidv4().slice(0, 8),
      userId: req.user.id,
      title: 'Appointment Confirmed',
      message: `Your appointment with ${doctor.name} (${doctor.specialty}) is confirmed for ${date} at ${timeSlot}. Booking code: ${bookingCode}`,
      type: 'booking_success',
      read: false,
      timestamp: new Date().toISOString(),
      appointmentId
    });

    // Notify Doctor (if doctor is registered user)
    if (doctor.userId) {
      db.createNotification({
        id: 'notif-' + uuidv4().slice(0, 8),
        userId: doctor.userId,
        title: 'New Patient Scheduled',
        message: `${req.user.name} booked an appointment for ${date} at ${timeSlot}.`,
        type: 'new_booking',
        read: false,
        timestamp: new Date().toISOString(),
        appointmentId
      });
    }

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: newAppointment
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update Status (Cancel or Complete)
app.patch('/api/appointments/:id/status', authenticateToken, (req, res) => {
  const { status, cancelReason } = req.body;
  const apt = db.findAppointmentById(req.params.id);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  if (!['upcoming', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updated = db.updateAppointment(apt.id, {
    status,
    cancelReason: cancelReason || '',
    updatedAt: new Date().toISOString()
  });

  // Create notifications
  if (status === 'cancelled') {
    db.createNotification({
      id: 'notif-' + uuidv4().slice(0, 8),
      userId: apt.patientId,
      title: 'Appointment Cancelled',
      message: `Your appointment with ${apt.doctorName} on ${apt.date} was cancelled.`,
      type: 'status_change',
      read: false,
      timestamp: new Date().toISOString(),
      appointmentId: apt.id
    });
  } else if (status === 'completed') {
    db.createNotification({
      id: 'notif-' + uuidv4().slice(0, 8),
      userId: apt.patientId,
      title: 'Consultation Completed',
      message: `Your consultation with ${apt.doctorName} is complete. View any clinical notes in your appointments dashboard.`,
      type: 'status_change',
      read: false,
      timestamp: new Date().toISOString(),
      appointmentId: apt.id
    });
  }

  res.json({ message: `Appointment marked as ${status}`, appointment: updated });
});

// Reschedule Appointment
app.patch('/api/appointments/:id/reschedule', authenticateToken, (req, res) => {
  const { date, timeSlot } = req.body;
  const apt = db.findAppointmentById(req.params.id);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  if (!date || !timeSlot) {
    return res.status(400).json({ error: 'New date and time slot required' });
  }

  // Conflict check
  const isConflict = db.getAppointments().some(
    a => a.id !== apt.id && a.doctorId === apt.doctorId && a.date === date && a.timeSlot === timeSlot && a.status !== 'cancelled'
  );
  if (isConflict) {
    return res.status(409).json({ error: 'The selected slot is already booked. Please pick another slot.' });
  }

  const updated = db.updateAppointment(apt.id, {
    date,
    timeSlot,
    status: 'upcoming',
    updatedAt: new Date().toISOString()
  });

  db.createNotification({
    id: 'notif-' + uuidv4().slice(0, 8),
    userId: apt.patientId,
    title: 'Appointment Rescheduled',
    message: `Your appointment with ${apt.doctorName} was rescheduled to ${date} at ${timeSlot}.`,
    type: 'rescheduled',
    read: false,
    timestamp: new Date().toISOString(),
    appointmentId: apt.id
  });

  res.json({ message: 'Appointment rescheduled successfully', appointment: updated });
});

// Doctor updates diagnosis / prescription notes
app.patch('/api/appointments/:id/notes', authenticateToken, (req, res) => {
  const { prescriptionNotes, doctorNotes } = req.body;
  const apt = db.findAppointmentById(req.params.id);
  if (!apt) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const updated = db.updateAppointment(apt.id, {
    prescriptionNotes: prescriptionNotes || apt.prescriptionNotes,
    doctorNotes: doctorNotes || apt.doctorNotes,
    status: 'completed',
    updatedAt: new Date().toISOString()
  });

  // Notify Patient
  db.createNotification({
    id: 'notif-' + uuidv4().slice(0, 8),
    userId: apt.patientId,
    title: 'Medical Notes & Prescription Added',
    message: `${apt.doctorName} added prescription notes for your consultation. Check your appointment details.`,
    type: 'prescription_added',
    read: false,
    timestamp: new Date().toISOString(),
    appointmentId: apt.id
  });

  res.json({ message: 'Prescription notes saved and consultation marked complete', appointment: updated });
});

// ==================== NOTIFICATIONS ROUTES ====================

app.get('/api/notifications', authenticateToken, (req, res) => {
  const notifs = db.getNotifications(req.user.id);
  const unreadCount = notifs.filter(n => !n.read).length;
  res.json({ notifications: notifs, unreadCount });
});

app.patch('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const notif = db.markNotificationRead(req.params.id);
  res.json({ notification: notif });
});

app.post('/api/notifications/mark-all-read', authenticateToken, (req, res) => {
  db.markAllNotificationsRead(req.user.id);
  res.json({ message: 'All notifications marked as read' });
});

// ==================== ADMIN STATS ====================

app.get('/api/stats', authenticateToken, (req, res) => {
  const allAppointments = db.getAppointments();
  const allDoctors = db.getDoctors();
  const allUsers = db.getUsers();

  const totalRevenue = allAppointments
    .filter(a => a.status !== 'cancelled' && a.feeBreakdown)
    .reduce((sum, a) => sum + (a.feeBreakdown.total || 0), 0);

  const specialtyCounts = {};
  allDoctors.forEach(d => {
    specialtyCounts[d.specialty] = (specialtyCounts[d.specialty] || 0) + 1;
  });

  const statusCounts = {
    upcoming: allAppointments.filter(a => a.status === 'upcoming').length,
    completed: allAppointments.filter(a => a.status === 'completed').length,
    cancelled: allAppointments.filter(a => a.status === 'cancelled').length,
  };

  res.json({
    totalAppointments: allAppointments.length,
    totalDoctors: allDoctors.length,
    totalPatients: allUsers.filter(u => u.role === 'patient').length,
    totalRevenue,
    specialtyCounts,
    statusCounts,
    recentAppointments: allAppointments.slice(0, 5)
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Doctor Booking API' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Doctor Booking API server running on http://localhost:${PORT}`);
});
