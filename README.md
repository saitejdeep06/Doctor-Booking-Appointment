# 🩺 MedCare - Full-Stack Doctor Appointment Booking System

A modern, production-ready Full-Stack Doctor Appointment Booking Web Application built with **React**, **Vite**, **Tailwind CSS**, and **Node.js/Express**.

---

## 🌟 Features Overview

### 1. 🔍 Doctor Directory & Advanced Search
- **8 Medical Specialties**: Cardiology, Dermatology, Pediatrics, Orthopedics, Neurology, General Medicine, Psychiatry, and Ophthalmology.
- **Real-Time Search & Filters**: Search doctors by name, clinic/hospital, symptoms, or specialty. Sort by Highest Rating, Experience, or Consultation Fee.
- **Detailed Doctor Profiles**: Qualifications, board certifications, bio, patient reviews, and clinic directions.

### 2. 📅 Interactive Calendar & Conflict-Free Slot Picker
- **14-Day Dynamic Calendar Strip**: Choose any day with live slot availability checks.
- **Double-Booking Protection**: Automatically disables and prevents booking conflicts for the same doctor and time slot.
- **Appointment Types**: In-Clinic Consultations with customizable reasons for visit and symptom notes.

### 3. 💳 Checkout & Consultation Fee Simulation
- **Transparent Fee Breakdown**: Consultation fee, platform fee ($5), healthcare tax (5%), and promo discounts.
- **Promo Code Discounts**: Try promo codes `SAVE20` ($20 off), `HEALTH10` ($10 off), or `WELCOME50` ($50 off).
- **Payment Methods**: Simulated Credit/Debit Card, UPI / Digital Wallet, or Pay at Clinic.
- **Digital Appointment Pass**: Instant reference code (e.g. `MC-72914`), clinic location, and printable/saveable slip.

### 4. 👥 Role-Based Portals & Quick 1-Click Demo Switcher
- **1-Click Demo Switcher** at the top of the app:
  - 👤 **Patient Mode (Sarah Jenkins)**: Browse doctors, view booked consultations, reschedule slots, cancel bookings, and inspect doctor prescriptions.
  - 🩺 **Doctor Mode (Dr. Robert Chen, Cardiologist)**: View daily patient queue, mark consultations as completed, write clinical diagnosis, and issue medication prescriptions (`Rx`).
  - ⚙️ **Admin Mode**: Platform metrics (Total Appointments, Revenue, Doctors, Patients), Specialty distribution, and Add New Doctor form.
- **Authentication**: Supports real registration and sign-in with JWT security and bcrypt password hashing.

### 5. 🔔 In-App Notifications & Reminders
- Live notification center with unread badge counter.
- Automatic alerts on booking confirmation, status changes, and newly issued doctor prescriptions.

---

## 🚀 Quick Start Guide

### 1. Run the Entire App (One Command)
From the root directory:
```bash
npm run dev
```
This simultaneously launches:
- **Express Backend API**: `http://localhost:5000`
- **Vite React Frontend**: `http://localhost:5174` (or `5173`)

### 2. Run Independently
To start only the backend:
```bash
npm run backend
```
To start only the frontend:
```bash
npm run frontend
```

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Name | Email | Password |
|---|---|---|---|
| **Patient** | Sarah Jenkins | `sarah@example.com` | `password123` |
| **Doctor** | Dr. Robert Chen | `dr.chen@medcare.com` | `password123` |
| **Admin** | Admin Coordinator | `admin@medcare.com` | `password123` |

*(You can also use the top demo switcher bar to switch roles in a single click!)*

---

## 📁 Project Architecture

```
doctor-booking-app/
├── package.json               # Root scripts (unified runner)
├── run.js                     # Zero-dependency parallel runner
├── README.md                  # Documentation
├── backend/                   # Express.js REST API
│   ├── package.json
│   ├── server.js              # Auth, Doctors, Slots, Appointments, Notifications API
│   ├── db.js                  # Persistent file-based DB engine with rich seed data
│   └── data/
│       └── database.json      # Auto-generated database store
└── frontend/                  # React + Vite + Tailwind CSS
    ├── package.json
    ├── vite.config.js         # API proxy configured to localhost:5000
    ├── src/
    │   ├── api.js             # Centralized API service & JWT auth
    │   ├── App.jsx            # Main app shell & tab switcher
    │   ├── index.css          # Tailwind CSS styling
    │   └── components/
    │       ├── Navbar.jsx           # Demo switcher, notifications bell, user menu
    │       ├── DoctorCard.jsx       # Doctor preview card with ratings & fees
    │       ├── DoctorModal.jsx      # Doctor bio, reviews, and hospital profile
    │       ├── BookingModal.jsx     # 4-step calendar & checkout wizard
    │       ├── AppointmentsView.jsx # Patient appointment management & Rx viewer
    │       ├── DoctorPortal.jsx     # Doctor schedule queue & Rx prescription issuer
    │       ├── AdminPortal.jsx      # Revenue analytics, charts & doctor registration
    │       └── AuthModal.jsx        # Sign-in & registration with role picker
```
