const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const getInitialData = () => {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  const users = [
    {
      id: 'usr-patient-1',
      name: 'Sarah Jenkins',
      email: 'sarah@example.com',
      password: passwordHash,
      role: 'patient',
      phone: '+1 (555) 234-5678',
      gender: 'Female',
      age: 29,
      bloodGroup: 'O+',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'usr-patient-2',
      name: 'Michael Davis',
      email: 'michael@example.com',
      password: passwordHash,
      role: 'patient',
      phone: '+1 (555) 876-5432',
      gender: 'Male',
      age: 42,
      bloodGroup: 'A+',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
    },
    {
      id: 'usr-doc-1',
      name: 'Dr. Robert Chen, MD',
      email: 'dr.chen@medcare.com',
      password: passwordHash,
      role: 'doctor',
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'usr-doc-2',
      name: 'Dr. Emily Vance, MD',
      email: 'dr.vance@medcare.com',
      password: passwordHash,
      role: 'doctor',
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'usr-admin-1',
      name: 'Admin Coordinator',
      email: 'admin@medcare.com',
      password: passwordHash,
      role: 'admin',
      phone: '+1 (555) 999-0000',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256'
    }
  ];

  const doctors = [
    {
      id: 'doc-1',
      userId: 'usr-doc-1',
      name: 'Dr. Robert Chen',
      title: 'Senior Cardiologist, MD, FACC',
      specialty: 'Cardiology',
      subSpecialty: 'Interventional Cardiology & Preventive Heart Health',
      experienceYears: 14,
      hospital: 'Metro Heart Institute, Suite 402',
      address: '742 Evergreen Terrace, Medical District, NY',
      consultationFee: 120,
      rating: 4.9,
      reviewCount: 142,
      about: 'Dr. Robert Chen is a board-certified cardiologist with over 14 years of clinical experience specializing in preventive cardiology, hypertension, arrhythmia management, and heart health optimization.',
      qualifications: ['MD - Harvard Medical School', 'Fellowship in Cardiology - Johns Hopkins', 'Board Certified in Internal Medicine & Cardiology'],
      languages: ['English', 'Mandarin'],
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
      availabilityDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: '09:00 AM - 05:00 PM',
      slots: [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:30 AM', '02:00 PM', '02:30 PM', '03:30 PM', '04:00 PM'
      ],
      badges: ['Top Rated', 'Verified Specialist', 'Instant Booking']
    },
    {
      id: 'doc-2',
      userId: 'usr-doc-2',
      name: 'Dr. Emily Vance',
      title: 'Consultant Dermatologist, MD, FAAD',
      specialty: 'Dermatology',
      subSpecialty: 'Clinical & Cosmetic Dermatology, Eczema & Acne Care',
      experienceYears: 11,
      hospital: 'Aura Skin & Laser Center',
      address: '120 Blossom Hill Blvd, Building B, NY',
      consultationFee: 95,
      rating: 4.85,
      reviewCount: 118,
      about: 'Dr. Emily Vance specializes in diagnosing complex skin conditions, treating persistent acne, psoriasis, dermatitis, and offering advanced medical skin rejuvenations.',
      qualifications: ['MD - Stanford University School of Medicine', 'Residency in Dermatology - NYU Langone', 'FAAD Member'],
      languages: ['English', 'Spanish'],
      avatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?auto=format&fit=crop&q=80&w=300',
      availabilityDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
      workingHours: '10:00 AM - 06:00 PM',
      slots: [
        '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '02:00 PM', '02:45 PM', '03:30 PM', '04:15 PM', '05:00 PM'
      ],
      badges: ['Skin Expert', 'High Patient Satisfaction']
    },
    {
      id: 'doc-3',
      userId: null,
      name: 'Dr. Marcus Reynolds',
      title: 'Pediatric Specialist, MD, FAAP',
      specialty: 'Pediatrics',
      subSpecialty: 'Child Wellness, Immunizations & Pediatric Asthma',
      experienceYears: 16,
      hospital: 'St. Jude Children Care Center',
      address: '350 Willow Creek Rd, Suite 101, NY',
      consultationFee: 85,
      rating: 4.95,
      reviewCount: 205,
      about: 'Compassionate pediatric care provider dedicated to infant milestones, adolescent health, developmental wellness, and warm bedside manner for young families.',
      qualifications: ['MD - Columbia University College of Physicians and Surgeons', 'Pediatric Residency - Boston Children’s Hospital'],
      languages: ['English'],
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
      availabilityDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      workingHours: '08:30 AM - 04:00 PM',
      slots: [
        '08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM',
        '01:00 PM', '01:45 PM', '02:30 PM', '03:15 PM'
      ],
      badges: ['Kid Friendly', 'Family Choice 2026']
    },
    {
      id: 'doc-4',
      userId: null,
      name: 'Dr. Sophia Al-Mansoor',
      title: 'Orthopedic Surgeon, MS, FRCS',
      specialty: 'Orthopedics',
      subSpecialty: 'Sports Injuries, Joint Preservation & Spine Health',
      experienceYears: 13,
      hospital: 'Apollo Ortho & Sports Medicine Clinic',
      address: '88 Grand Avenue, 6th Floor, NY',
      consultationFee: 140,
      rating: 4.88,
      reviewCount: 96,
      about: 'Specializing in minimally invasive arthroscopy, sports trauma, knee and shoulder reconstructions, and non-surgical degenerative joint therapy.',
      qualifications: ['MS Orthopedics - Oxford University', 'Fellowship in Sports Injury Reconstruction - Munich'],
      languages: ['English', 'Arabic'],
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
      availabilityDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: '09:00 AM - 05:00 PM',
      slots: [
        '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'
      ],
      badges: ['Sports Medicine Pro', 'Surgery Specialist']
    },
    {
      id: 'doc-5',
      userId: null,
      name: 'Dr. Aaron Patel',
      title: 'Consultant Neurologist, DM Neurology',
      specialty: 'Neurology',
      subSpecialty: 'Migraines, Neuro-muscular disorders & Sleep Medicine',
      experienceYears: 18,
      hospital: 'NeuroCare Health Pavilion',
      address: '512 Park Ave, Suite 300, NY',
      consultationFee: 150,
      rating: 4.92,
      reviewCount: 164,
      about: 'Extensive expertise treating chronic headaches, epilepsy, neuropathy, and balance issues using cutting-edge neuro-diagnostic assessments.',
      qualifications: ['DM Neurology - Cleveland Clinic', 'MD Internal Medicine - UCLA'],
      languages: ['English', 'Hindi', 'Gujarati'],
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
      availabilityDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
      workingHours: '09:30 AM - 04:30 PM',
      slots: [
        '09:30 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:00 PM', '04:00 PM'
      ],
      badges: ['Senior Neurologist', 'Neuro Diagnostics']
    },
    {
      id: 'doc-6',
      userId: null,
      name: 'Dr. Clara Gomez',
      title: 'General Physician & Primary Care',
      specialty: 'General Medicine',
      subSpecialty: 'Annual Checkups, Preventive Health & Diabetes Care',
      experienceYears: 9,
      hospital: 'Downtown Family Wellness Practice',
      address: '210 Lexington Ave, Suite 12, NY',
      consultationFee: 70,
      rating: 4.79,
      reviewCount: 180,
      about: 'Dedicated to everyday primary health, routine metabolic panels, lifestyle counseling, and chronic illness monitoring with an empathetic ear.',
      qualifications: ['MD Family Medicine - Yale School of Medicine'],
      languages: ['English', 'Spanish'],
      avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=300',
      availabilityDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      workingHours: '08:00 AM - 03:00 PM',
      slots: [
        '08:00 AM', '08:45 AM', '09:30 AM', '10:15 AM', '11:00 AM', '01:00 PM', '01:45 PM', '02:30 PM'
      ],
      badges: ['Affordable Care', 'Quick Checkup']
    },
    {
      id: 'doc-7',
      userId: null,
      name: 'Dr. Nathan Brooks',
      title: 'Psychiatrist & Behavioral Health, MD',
      specialty: 'Psychiatry',
      subSpecialty: 'Anxiety, Mood Disorders & Stress Management',
      experienceYears: 12,
      hospital: 'Serenity Mind Health Clinic',
      address: '400 Central Park West, NY',
      consultationFee: 130,
      rating: 4.91,
      reviewCount: 88,
      about: 'Compassionate, evidence-based mental health support offering psychiatric evaluations, psychotherapy guidance, and medication management.',
      qualifications: ['MD Psychiatry - UPenn Perelman School of Medicine', 'Board Certified Adult Psychiatry'],
      languages: ['English'],
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
      availabilityDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      workingHours: '10:00 AM - 06:00 PM',
      slots: [
        '10:00 AM', '11:15 AM', '01:30 PM', '02:45 PM', '04:00 PM', '05:15 PM'
      ],
      badges: ['Confidential', 'Telehealth Available']
    },
    {
      id: 'doc-8',
      userId: null,
      name: 'Dr. Linda Zhao',
      title: 'Ophthalmologist & Vision Specialist',
      specialty: 'Ophthalmology',
      subSpecialty: 'Cataract, Cornea Care & Refractive Screening',
      experienceYears: 15,
      hospital: 'Precision Eye Care Institute',
      address: '615 5th Avenue, Suite 704, NY',
      consultationFee: 110,
      rating: 4.87,
      reviewCount: 134,
      about: 'State-of-the-art vision health, diabetic retinopathy checks, dry eye treatments, and advanced refractive assessments.',
      qualifications: ['MD Ophthalmology - Johns Hopkins University School of Medicine'],
      languages: ['English', 'Mandarin'],
      avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=300',
      availabilityDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      workingHours: '09:00 AM - 05:00 PM',
      slots: [
        '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'
      ],
      badges: ['Vision Specialist', 'High Tech Equipment']
    }
  ];

  // Helper date generator for tomorrow and upcoming days
  const today = new Date();
  const getOffsetDate = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const appointments = [
    {
      id: 'apt-101',
      bookingCode: 'MC-72914',
      patientId: 'usr-patient-1',
      patientName: 'Sarah Jenkins',
      patientEmail: 'sarah@example.com',
      patientPhone: '+1 (555) 234-5678',
      doctorId: 'doc-1',
      doctorName: 'Dr. Robert Chen',
      doctorTitle: 'Senior Cardiologist, MD',
      doctorSpecialty: 'Cardiology',
      doctorHospital: 'Metro Heart Institute, Suite 402',
      doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
      date: getOffsetDate(1),
      timeSlot: '10:00 AM',
      type: 'In-Clinic Consultation',
      reason: 'Routine cardiac health review and mild palpitations after exercise',
      symptoms: 'Occasional flutter, elevated resting heart rate',
      status: 'upcoming', // 'upcoming', 'completed', 'cancelled'
      feeBreakdown: {
        consultationFee: 120,
        platformFee: 5,
        tax: 5,
        discount: 0,
        total: 130
      },
      paymentStatus: 'paid',
      paymentMethod: 'Credit Card (**** 4242)',
      prescriptionNotes: '',
      doctorNotes: '',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'apt-102',
      bookingCode: 'MC-83190',
      patientId: 'usr-patient-1',
      patientName: 'Sarah Jenkins',
      patientEmail: 'sarah@example.com',
      patientPhone: '+1 (555) 234-5678',
      doctorId: 'doc-2',
      doctorName: 'Dr. Emily Vance',
      doctorTitle: 'Consultant Dermatologist, MD',
      doctorSpecialty: 'Dermatology',
      doctorHospital: 'Aura Skin & Laser Center',
      doctorAvatar: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?auto=format&fit=crop&q=80&w=300',
      date: getOffsetDate(-4),
      timeSlot: '02:00 PM',
      type: 'In-Clinic Consultation',
      reason: 'Persistent skin redness and sensitivity flareup',
      symptoms: 'Dryness, itchy cheek patches',
      status: 'completed',
      feeBreakdown: {
        consultationFee: 95,
        platformFee: 5,
        tax: 4,
        discount: 10,
        total: 94
      },
      paymentStatus: 'paid',
      paymentMethod: 'UPI / Digital Wallet',
      prescriptionNotes: 'Prescribed Hydrocortisone 1% cream topically twice daily for 5 days. Recommended gentle ceramide barrier cream and daily mineral sunscreen (SPF 50+). Follow up in 3 weeks if symptoms persist.',
      doctorNotes: 'Diagnosis: Contact dermatitis / mild barrier compromise. Patient advised to avoid fragrances.',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'apt-103',
      bookingCode: 'MC-91402',
      patientId: 'usr-patient-2',
      patientName: 'Michael Davis',
      patientEmail: 'michael@example.com',
      patientPhone: '+1 (555) 876-5432',
      doctorId: 'doc-1',
      doctorName: 'Dr. Robert Chen',
      doctorTitle: 'Senior Cardiologist, MD',
      doctorSpecialty: 'Cardiology',
      doctorHospital: 'Metro Heart Institute, Suite 402',
      doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
      date: getOffsetDate(2),
      timeSlot: '11:30 AM',
      type: 'In-Clinic Consultation',
      reason: 'Post-stent 6-month checkup and blood pressure adjustment',
      symptoms: 'Mild fatigue',
      status: 'upcoming',
      feeBreakdown: {
        consultationFee: 120,
        platformFee: 5,
        tax: 5,
        discount: 0,
        total: 130
      },
      paymentStatus: 'paid',
      paymentMethod: 'Pay at Clinic',
      prescriptionNotes: '',
      doctorNotes: '',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const notifications = [
    {
      id: 'notif-1',
      userId: 'usr-patient-1',
      title: 'Appointment Confirmed',
      message: 'Your appointment with Dr. Robert Chen (Cardiology) is confirmed for tomorrow at 10:00 AM.',
      type: 'booking_success',
      read: false,
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      appointmentId: 'apt-101'
    },
    {
      id: 'notif-2',
      userId: 'usr-patient-1',
      title: 'Prescription Available',
      message: 'Dr. Emily Vance added prescription notes for your consultation on dermatitis.',
      type: 'prescription_added',
      read: true,
      timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
      appointmentId: 'apt-102'
    },
    {
      id: 'notif-3',
      userId: 'usr-doc-1',
      title: 'New Patient Booking',
      message: 'Sarah Jenkins scheduled an appointment for tomorrow at 10:00 AM.',
      type: 'new_booking',
      read: false,
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      appointmentId: 'apt-101'
    },
    {
      id: 'notif-4',
      userId: 'usr-doc-1',
      title: 'Upcoming Patient in Queue',
      message: 'Michael Davis is scheduled for consultation in 2 days at 11:30 AM.',
      type: 'reminder',
      read: false,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      appointmentId: 'apt-103'
    }
  ];

  const reviews = [
    {
      id: 'rev-1',
      doctorId: 'doc-1',
      patientName: 'Evelyn Taylor',
      rating: 5,
      comment: 'Dr. Chen was extremely thorough and took the time to explain every single ECG reading clearly. Felt very reassured.',
      date: '2026-09-18'
    },
    {
      id: 'rev-2',
      doctorId: 'doc-1',
      patientName: 'David K.',
      rating: 5,
      comment: 'Top class clinic experience. The wait time was under 5 minutes and his preventive medicine advice helped normalize my blood pressure.',
      date: '2026-09-24'
    },
    {
      id: 'rev-3',
      doctorId: 'doc-2',
      patientName: 'Hannah Cole',
      rating: 5,
      comment: 'Dr. Vance transformed my skin health! After months of cystic breakouts, her targeted regimen worked within weeks.',
      date: '2026-09-30'
    }
  ];

  return { users, doctors, appointments, notifications, reviews };
};

// Database wrapper
class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      const data = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      this.data = data;
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Error reading db file, resetting seed:', err);
        const data = getInitialData();
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
        this.data = data;
      }
    }
  }

  save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // Users
  getUsers() { return this.data.users; }
  findUserById(id) { return this.data.users.find(u => u.id === id); }
  findUserByEmail(email) { return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  createUser(user) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Doctors
  getDoctors() { return this.data.doctors; }
  findDoctorById(id) { return this.data.doctors.find(d => d.id === id); }
  findDoctorByUserId(userId) { return this.data.doctors.find(d => d.userId === userId); }
  createDoctor(doctor) {
    this.data.doctors.push(doctor);
    this.save();
    return doctor;
  }

  // Appointments
  getAppointments() { return this.data.appointments; }
  findAppointmentById(id) { return this.data.appointments.find(a => a.id === id); }
  createAppointment(appointment) {
    this.data.appointments.push(appointment);
    this.save();
    return appointment;
  }
  updateAppointment(id, updates) {
    const idx = this.data.appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.data.appointments[idx] = { ...this.data.appointments[idx], ...updates };
      this.save();
      return this.data.appointments[idx];
    }
    return null;
  }

  // Notifications
  getNotifications(userId) {
    if (!userId) return this.data.notifications;
    return this.data.notifications.filter(n => n.userId === userId);
  }
  createNotification(notif) {
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }
  markNotificationRead(id) {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
    return notif;
  }
  markAllNotificationsRead(userId) {
    this.data.notifications.forEach(n => {
      if (!userId || n.userId === userId) {
        n.read = true;
      }
    });
    this.save();
  }

  // Reviews
  getReviews(doctorId) {
    if (!doctorId) return this.data.reviews;
    return this.data.reviews.filter(r => r.doctorId === doctorId);
  }
  createReview(review) {
    this.data.reviews.push(review);
    this.save();
    return review;
  }
}

module.exports = new Database();
