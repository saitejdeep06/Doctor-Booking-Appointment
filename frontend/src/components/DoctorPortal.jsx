import React, { useState } from 'react';
import {
  Stethoscope,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  FileEdit,
  XCircle,
  AlertCircle,
  Pill,
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';
import { api } from '../api';

export default function DoctorPortal({
  doctor,
  appointments,
  onRefresh,
  user
}) {
  const [selectedAptForRx, setSelectedAptForRx] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [filterDate, setFilterDate] = useState('all'); // 'all', 'today'
  const [savingNotes, setSavingNotes] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((a) => {
    if (filterDate === 'today') return a.date === todayStr;
    return true;
  });

  const handleOpenRxModal = (apt) => {
    setSelectedAptForRx(apt);
    setPrescriptionText(
      apt.prescriptionNotes ||
      'Rx:\n1. Tab. Amoxicillin 500mg - 1 tablet twice daily after meals for 5 days.\n2. Tab. Paracetamol 650mg - SOS for pain/fever.'
    );
    setDiagnosisNotes(apt.doctorNotes || `Clinical evaluation conducted for ${apt.reason}. Vital signs normal.`);
  };

  const handleSavePrescription = async () => {
    if (!selectedAptForRx) return;
    setSavingNotes(true);
    try {
      await api.savePrescriptionNotes(selectedAptForRx.id, prescriptionText, diagnosisNotes);
      setSelectedAptForRx(null);
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      await api.updateAppointmentStatus(id, 'completed');
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleCancelApt = async (id) => {
    if (!window.confirm('Cancel this patient consultation?')) return;
    try {
      await api.updateAppointmentStatus(id, 'cancelled', 'Doctor unavailable or emergency');
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to cancel');
    }
  };

  const upcomingCount = appointments.filter((a) => a.status === 'upcoming').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const totalRevenue = appointments
    .filter((a) => a.status !== 'cancelled')
    .reduce((sum, a) => sum + (a.feeBreakdown?.consultationFee || 100), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold">{doctor?.name || user?.name || 'Doctor Portal'}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Doctor On Duty
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {doctor?.title || 'Senior Consultant'} • {doctor?.hospital || 'MedCare Medical Center'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60 font-mono">
              Date: {todayStr}
            </span>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block font-medium">Upcoming In Queue</span>
            <span className="text-2xl font-bold text-white mt-1 block">{upcomingCount} Patients</span>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block font-medium">Completed Consultations</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">{completedCount} Completed</span>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <span className="text-xs text-slate-400 block font-medium">Total Fees Generated</span>
            <span className="text-2xl font-bold text-teal-400 mt-1 block">${totalRevenue}</span>
          </div>
        </div>
      </div>

      {/* Patient Queue Management Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Patient Queue & Schedule</h2>
          <p className="text-xs text-slate-500">Review patient records, symptoms, and issue medical prescriptions.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterDate('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterDate === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Appointments
          </button>
          <button
            onClick={() => setFilterDate('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterDate === 'today'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Today's Schedule
          </button>
        </div>
      </div>

      {/* Appointments Master Table / Cards */}
      {filteredAppointments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No scheduled consultations found</p>
          <p className="text-xs text-slate-400 mt-1">New patient bookings will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-base">{apt.patientName}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {apt.bookingCode}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      apt.status === 'upcoming'
                        ? 'bg-blue-50 text-blue-700 border border-blue-100'
                        : apt.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-semibold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    {apt.date}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-teal-700">
                    <Clock className="w-3.5 h-3.5" />
                    {apt.timeSlot}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                    {apt.patientPhone}
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                    {apt.patientEmail}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                  <p className="text-slate-800">
                    <span className="font-bold text-slate-900">Reason:</span> {apt.reason}
                  </p>
                  {apt.symptoms && (
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-700">Reported Symptoms:</span> {apt.symptoms}
                    </p>
                  )}
                  {apt.prescriptionNotes && (
                    <p className="text-emerald-700 font-medium">
                      ✓ Prescription Issued
                    </p>
                  )}
                </div>
              </div>

              {/* Doctor Actions */}
              <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                <button
                  onClick={() => handleOpenRxModal(apt)}
                  className="px-3.5 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  {apt.prescriptionNotes ? 'Edit Rx Notes' : 'Write Rx & Complete'}
                </button>

                {apt.status === 'upcoming' && (
                  <>
                    <button
                      onClick={() => handleMarkCompleted(apt.id)}
                      className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition flex items-center gap-1"
                      title="Mark consultation done"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete
                    </button>
                    <button
                      onClick={() => handleCancelApt(apt.id)}
                      className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                      title="Cancel appointment"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prescription & Clinical Diagnosis Modal */}
      {selectedAptForRx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Issue Medical Prescription</h3>
                  <p className="text-xs text-slate-500">Patient: {selectedAptForRx.patientName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAptForRx(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Diagnosis & Consultation Remarks
              </label>
              <textarea
                value={diagnosisNotes}
                onChange={(e) => setDiagnosisNotes(e.target.value)}
                rows={2}
                placeholder="Diagnostic findings, blood pressure, advice..."
                className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Medication Prescription & Dosage Plan
              </label>
              <textarea
                value={prescriptionText}
                onChange={(e) => setPrescriptionText(e.target.value)}
                rows={6}
                placeholder="Rx: Medicines, dosages, frequency, and instructions..."
                className="w-full text-xs p-3 border border-slate-200 rounded-xl font-mono focus:outline-teal-600 bg-slate-50/50"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedAptForRx(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                disabled={savingNotes}
                onClick={handleSavePrescription}
                className="px-5 py-2.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/30 transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {savingNotes ? 'Saving...' : 'Save & Mark Completed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
