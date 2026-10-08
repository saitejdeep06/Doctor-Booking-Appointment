import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  XCircle,
  RotateCcw,
  CheckCircle2,
  Ticket,
  ChevronRight,
  AlertTriangle,
  Stethoscope,
  Pill,
  Sparkles
} from 'lucide-react';
import { api } from '../api';

export default function AppointmentsView({
  appointments,
  onRefresh,
  onBookNew,
  user
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // all, upcoming, completed, cancelled
  const [selectedAptForNotes, setSelectedAptForNotes] = useState(null);
  const [reschedulingApt, setReschedulingApt] = useState(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [newRescheduleSlot, setNewRescheduleSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [actionError, setActionError] = useState('');
  const [cancelModalApt, setCancelModalApt] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const filtered = appointments.filter((apt) => {
    if (activeFilter === 'all') return true;
    return apt.status === activeFilter;
  });

  // Handle Cancel
  const handleConfirmCancel = async () => {
    if (!cancelModalApt) return;
    try {
      await api.updateAppointmentStatus(cancelModalApt.id, 'cancelled', cancelReason);
      setCancelModalApt(null);
      setCancelReason('');
      onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to cancel appointment');
    }
  };

  // Open Reschedule Modal
  const handleStartReschedule = async (apt) => {
    setReschedulingApt(apt);
    setNewRescheduleDate(apt.date);
    setNewRescheduleSlot('');
    setActionError('');
    setLoadingSlots(true);

    try {
      const res = await api.getDoctorSlots(apt.doctorId, apt.date);
      setAvailableSlots(res.slots || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateChangeReschedule = async (newDate) => {
    setNewRescheduleDate(newDate);
    setNewRescheduleSlot('');
    if (!reschedulingApt) return;
    setLoadingSlots(true);
    try {
      const res = await api.getDoctorSlots(reschedulingApt.doctorId, newDate);
      setAvailableSlots(res.slots || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!newRescheduleSlot || !newRescheduleDate || !reschedulingApt) return;
    try {
      await api.rescheduleAppointment(reschedulingApt.id, newRescheduleDate, newRescheduleSlot);
      setReschedulingApt(null);
      onRefresh();
    } catch (err) {
      setActionError(err.message || 'Failed to reschedule');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600" />
            My Medical Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your consultations, doctor schedules, digital passes, and prescriptions.
          </p>
        </div>

        <button
          onClick={onBookNew}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/30 transition flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          Book New Consultation
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
        {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
              activeFilter === tab
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab} (
            {tab === 'all'
              ? appointments.length
              : appointments.filter((a) => a.status === tab).length}
            )
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No {activeFilter !== 'all' ? activeFilter : ''} appointments found</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto">
            You don't have any bookings matching this category. Find verified specialists and reserve your time slot today!
          </p>
          <button
            onClick={onBookNew}
            className="mt-5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition"
          >
            Browse Doctors & Specialties
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt) => {
            const isUpcoming = apt.status === 'upcoming';
            const isCompleted = apt.status === 'completed';
            const isCancelled = apt.status === 'cancelled';

            return (
              <div
                key={apt.id}
                className="bg-white rounded-3xl border border-slate-200/80 hover:border-teal-500/30 p-5 shadow-sm transition flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Doctor & Appointment info */}
                <div className="flex items-start gap-4">
                  <img
                    src={apt.doctorAvatar}
                    alt={apt.doctorName}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">{apt.doctorName}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
                        {apt.doctorSpecialty}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isUpcoming
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">{apt.doctorHospital}</p>

                    {/* Date & Slot Badge */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-700 font-medium">
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        {apt.date}
                      </span>
                      <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        {apt.timeSlot}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Ref: <span className="text-slate-800 font-semibold">{apt.bookingCode}</span>
                      </span>
                    </div>

                    {apt.reason && (
                      <p className="text-[11px] text-slate-500 pt-1">
                        <span className="font-semibold text-slate-600">Reason:</span> {apt.reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-wrap md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 gap-2 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Total Paid</span>
                    <span className="text-base font-bold text-slate-900">
                      ${apt.feeBreakdown?.total || 120}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* If upcoming: Reschedule or Cancel */}
                    {isUpcoming && (
                      <>
                        <button
                          onClick={() => handleStartReschedule(apt)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1"
                          title="Reschedule Slot"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          Reschedule
                        </button>
                        <button
                          onClick={() => setCancelModalApt(apt)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center gap-1"
                          title="Cancel Booking"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </>
                    )}

                    {/* If completed: View Prescription Notes */}
                    {isCompleted && (
                      <button
                        onClick={() => setSelectedAptForNotes(apt)}
                        className="px-3.5 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Prescription & Notes
                      </button>
                    )}

                    {/* View Digital Pass Slip */}
                    <button
                      onClick={() => {
                        setSelectedAptForNotes(apt);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl transition flex items-center gap-1"
                      title="View Details"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Prescription & Clinical Notes Modal */}
      {selectedAptForNotes && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Consultation Summary</h3>
                  <p className="text-[11px] text-slate-400">Ref: {selectedAptForNotes.bookingCode}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAptForNotes(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Doctor info */}
            <div className="bg-slate-50 rounded-2xl p-3.5 text-xs space-y-1">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Doctor: {selectedAptForNotes.doctorName}</span>
                <span className="text-teal-700">{selectedAptForNotes.doctorSpecialty}</span>
              </div>
              <p className="text-slate-500 text-[11px]">Date: {selectedAptForNotes.date} at {selectedAptForNotes.timeSlot}</p>
              <p className="text-slate-500 text-[11px]">Clinic: {selectedAptForNotes.doctorHospital}</p>
            </div>

            {/* Prescription Notes */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                <Pill className="w-4 h-4 text-teal-600" />
                Doctor's Medical Prescription & Advice
              </h4>
              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl text-xs text-slate-700 leading-relaxed font-sans">
                {selectedAptForNotes.prescriptionNotes ? (
                  <p className="whitespace-pre-line">{selectedAptForNotes.prescriptionNotes}</p>
                ) : (
                  <p className="text-slate-400 italic">
                    No prescription notes recorded for this visit yet.
                  </p>
                )}
              </div>
            </div>

            {/* Doctor Diagnostic Notes */}
            {selectedAptForNotes.doctorNotes && (
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-1">Clinical Observations</h4>
                <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600">
                  {selectedAptForNotes.doctorNotes}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Print Slip
              </button>
              <button
                onClick={() => setSelectedAptForNotes(null)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Slot Modal */}
      {reschedulingApt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-teal-600" />
                Reschedule Appointment
              </h3>
              <button
                onClick={() => setReschedulingApt(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-xl">{actionError}</p>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select New Date</label>
              <input
                type="date"
                value={newRescheduleDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => handleDateChangeReschedule(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Available Time Slots</label>
              {loadingSlots ? (
                <p className="text-xs text-slate-400">Loading slots...</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((s) => (
                    <button
                      key={s.time}
                      disabled={!s.available}
                      onClick={() => setNewRescheduleSlot(s.time)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition ${
                        !s.available
                          ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                          : newRescheduleSlot === s.time
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white hover:border-teal-500'
                      }`}
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => setReschedulingApt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                disabled={!newRescheduleSlot}
                onClick={handleConfirmReschedule}
                className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white rounded-xl shadow-md transition"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancelModalApt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Cancel Appointment?</h3>
                <p className="text-xs text-slate-500">Ref: {cancelModalApt.bookingCode}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel your consultation with{' '}
              <span className="font-bold text-slate-800">{cancelModalApt.doctorName}</span> on{' '}
              <span className="font-semibold text-slate-800">{cancelModalApt.date} at {cancelModalApt.timeSlot}</span>?
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for cancellation (optional):
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict or feeling better"
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-rose-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setCancelModalApt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md transition"
              >
                Yes, Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
