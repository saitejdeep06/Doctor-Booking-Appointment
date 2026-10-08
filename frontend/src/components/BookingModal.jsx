import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Tag,
  Printer,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { api } from '../api';

export default function BookingModal({
  doctor,
  user,
  onClose,
  onBookingSuccess,
  onOpenAuth
}) {
  const [step, setStep] = useState(1); // 1: Date/Slot, 2: Patient Info, 3: Payment, 4: Confirmation
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slotsData, setSlotsData] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form Fields
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '+1 (555) 234-5678');
  const [reason, setReason] = useState('General Consultation');
  const [symptoms, setSymptoms] = useState('');

  // Payment Fields
  const [paymentMethod, setPaymentMethod] = useState('Credit Card (Simulated)');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  // Result state
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Generate next 14 days
  const dateOptions = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const isoDate = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    return { isoDate, dayName, dayNum, monthName };
  });

  // Default to tomorrow or today
  useEffect(() => {
    if (dateOptions.length > 0 && !selectedDate) {
      setSelectedDate(dateOptions[0].isoDate);
    }
  }, []);

  // Fetch real slots whenever selectedDate or doctor changes
  useEffect(() => {
    if (doctor?.id && selectedDate) {
      setLoadingSlots(true);
      setSelectedSlot('');
      api.getDoctorSlots(doctor.id, selectedDate)
        .then((res) => {
          setSlotsData(res.slots || []);
        })
        .catch((err) => {
          console.error(err);
          // Fallback slots if network error
          setSlotsData((doctor.slots || []).map(s => ({ time: s, available: true })));
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [doctor, selectedDate]);

  // Update user fields if user changes
  useEffect(() => {
    if (user) {
      if (!patientName) setPatientName(user.name);
      if (!patientEmail) setPatientEmail(user.email);
    }
  }, [user]);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'SAVE20') {
      setDiscount(20);
      setPromoMessage('Promo SAVE20 applied! $20 discount saved.');
    } else if (code === 'HEALTH10') {
      setDiscount(10);
      setPromoMessage('Promo HEALTH10 applied! $10 discount saved.');
    } else if (code === 'FIRSTFREE' || code === 'WELCOME50') {
      setDiscount(50);
      setPromoMessage('Welcome promo applied! $50 discount saved.');
    } else {
      setDiscount(0);
      setPromoMessage('Invalid promo code. Try SAVE20 or HEALTH10');
    }
  };

  const consultationFee = doctor?.consultationFee || 100;
  const platformFee = 5;
  const tax = Math.round(consultationFee * 0.05);
  const totalAmount = Math.max(0, consultationFee + platformFee + tax - discount);

  const handleSubmitBooking = async () => {
    if (!user) {
      setErrorMsg('Please sign in or select a demo user before finalizing booking.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.bookAppointment({
        doctorId: doctor.id,
        date: selectedDate,
        timeSlot: selectedSlot,
        reason,
        symptoms,
        paymentMethod,
        discount
      });

      setConfirmedBooking(res.appointment);
      setStep(4);
      onBookingSuccess(res.appointment);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to book slot. Please try another time slot.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-none">
                Book with {doctor.name}
              </h3>
              <p className="text-[11px] text-teal-600 font-semibold mt-1">
                {doctor.specialty} • ${doctor.consultationFee} fee
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span className={step >= 1 ? 'text-teal-600 font-bold flex items-center gap-1' : ''}>
              1. Date & Slot
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={step >= 2 ? 'text-teal-600 font-bold flex items-center gap-1' : ''}>
              2. Details
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={step >= 3 ? 'text-teal-600 font-bold flex items-center gap-1' : ''}>
              3. Payment
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={step >= 4 ? 'text-emerald-600 font-bold flex items-center gap-1' : ''}>
              4. Pass
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-teal-500 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Error banner if any */}
        {errorMsg && (
          <div className="mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Date & Time Picker */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                Select Appointment Date
              </label>
              
              {/* Date Scroll Strip */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {dateOptions.map((opt) => {
                  const isSelected = selectedDate === opt.isoDate;
                  return (
                    <button
                      key={opt.isoDate}
                      onClick={() => setSelectedDate(opt.isoDate)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[70px] border transition ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/30 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-teal-400'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-semibold opacity-80">{opt.dayName}</span>
                      <span className="text-lg font-bold my-0.5">{opt.dayNum}</span>
                      <span className="text-[10px] opacity-70">{opt.monthName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                  Available Time Slots ({selectedDate})
                </label>
                <span className="text-[11px] text-slate-400">30 min consultation</span>
              </div>

              {loadingSlots ? (
                <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                  Checking real-time doctor availability...
                </div>
              ) : slotsData.length === 0 ? (
                <div className="p-4 bg-amber-50 rounded-2xl text-amber-800 text-xs text-center">
                  Doctor has no available slots for this date. Please pick another date.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {slotsData.map((slot) => {
                    const isSelected = selectedSlot === slot.time;
                    const isAvailable = slot.available;
                    return (
                      <button
                        key={slot.time}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                          !isAvailable
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-teal-500 hover:bg-teal-50/50'
                        }`}
                      >
                        {slot.time}
                        {!isAvailable && <span className="block text-[9px] font-normal not-italic no-underline">Booked</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Continue Button */}
            <div className="pt-2 flex justify-end">
              <button
                disabled={!selectedSlot}
                onClick={() => setStep(2)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedSlot
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/30'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Continue to Details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Patient Info & Symptoms */}
        {step === 2 && (
          <div className="p-6 space-y-4">
            {!user && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                <span>You are currently not signed in. Please sign in or use demo mode.</span>
                <button
                  onClick={onOpenAuth}
                  className="px-2.5 py-1 bg-amber-600 text-white font-semibold rounded-lg text-xs hover:bg-amber-700"
                >
                  Sign In
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-teal-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-teal-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-teal-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Visit</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-teal-600 bg-white"
              >
                <option value="General Consultation">General Consultation / First Visit</option>
                <option value="Routine Health Checkup">Routine Health Checkup</option>
                <option value="Chronic Condition Follow-up">Chronic Condition Follow-up</option>
                <option value="Prescription Refill / Second Opinion">Prescription Refill / Second Opinion</option>
                <option value="Specific Symptom Check">Specific Symptom Check</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Describe Symptoms / Medical Background (Optional)
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={2}
                placeholder="e.g. Mild shortness of breath during workouts for the past 2 weeks..."
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-teal-600"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Back
              </button>
              <button
                disabled={!patientName || !patientEmail}
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/30 transition flex items-center gap-1.5"
              >
                Proceed to Payment
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Payment & Checkout */}
        {step === 3 && (
          <div className="p-6 space-y-5">
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Credit Card (Simulated)')}
                  className={`p-3 rounded-2xl border text-xs font-semibold text-left transition flex flex-col justify-between ${
                    paymentMethod.includes('Credit')
                      ? 'border-teal-600 bg-teal-50/50 text-teal-800'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-teal-600 mb-2" />
                  <span>Card Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI / Digital Wallet')}
                  className={`p-3 rounded-2xl border text-xs font-semibold text-left transition flex flex-col justify-between ${
                    paymentMethod.includes('UPI')
                      ? 'border-teal-600 bg-teal-50/50 text-teal-800'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-teal-600 mb-2" />
                  <span>UPI / Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Pay at Clinic')}
                  className={`p-3 rounded-2xl border text-xs font-semibold text-left transition flex flex-col justify-between ${
                    paymentMethod === 'Pay at Clinic'
                      ? 'border-teal-600 bg-teal-50/50 text-teal-800'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-teal-600 mb-2" />
                  <span>Pay at Clinic</span>
                </button>
              </div>
            </div>

            {/* Simulated Card Fields */}
            {paymentMethod.includes('Credit') && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Card Details (Simulation)</span>
                  <span className="text-[10px] text-teal-600">✓ Test Mode active</span>
                </div>
                <div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl font-mono"
                    placeholder="Card Number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="text-xs p-2 bg-white border border-slate-200 rounded-xl font-mono"
                    placeholder="MM/YY"
                  />
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="text-xs p-2 bg-white border border-slate-200 rounded-xl font-mono"
                    placeholder="CVC"
                  />
                </div>
              </div>
            )}

            {/* Promo Code Box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-teal-600" />
                Have a discount code? (Try: <span className="text-teal-600 font-mono">SAVE20</span>)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. SAVE20"
                  className="flex-1 text-xs p-2 border border-slate-200 rounded-xl uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p className={`text-[11px] mt-1 ${discount > 0 ? 'text-emerald-600 font-medium' : 'text-rose-500'}`}>
                  {promoMessage}
                </p>
              )}
            </div>

            {/* Fee Breakdown Summary */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Doctor Consultation Fee</span>
                <span className="font-semibold text-slate-800">${consultationFee}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Platform Booking Fee</span>
                <span className="font-semibold text-slate-800">${platformFee}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Healthcare Tax (5%)</span>
                <span className="font-semibold text-slate-800">${tax}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Promo Discount</span>
                  <span>-${discount}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Due</span>
                <span className="text-teal-700 text-base">${totalAmount}</span>
              </div>
            </div>

            {/* Checkout Action */}
            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Back
              </button>
              <button
                disabled={submitting}
                onClick={handleSubmitBooking}
                className="px-7 py-3 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/30 transition flex items-center gap-2"
              >
                {submitting ? (
                  <span>Securing slot...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Pay ${totalAmount} & Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Digital Confirmation Pass / Receipt */}
        {step === 4 && confirmedBooking && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Booking Confirmed
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-2">
                You're All Set!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your appointment slot is reserved and confirmed with the hospital clinic.
              </p>
            </div>

            {/* Digital Pass Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Reference Code</span>
                  <span className="font-mono font-bold text-teal-700 text-sm">
                    {confirmedBooking.bookingCode}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Status</span>
                  <span className="text-emerald-600 font-bold capitalize">
                    {confirmedBooking.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Doctor</span>
                  <span className="font-semibold text-slate-800">{confirmedBooking.doctorName}</span>
                  <span className="block text-[11px] text-slate-500">{confirmedBooking.doctorSpecialty}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Date & Time</span>
                  <span className="font-semibold text-slate-800">{confirmedBooking.date}</span>
                  <span className="block text-[11px] text-teal-700 font-bold">{confirmedBooking.timeSlot}</span>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block font-medium">Clinic Location</span>
                <span className="text-slate-700 font-medium">{confirmedBooking.doctorHospital}</span>
              </div>
            </div>

            {/* Done & Print Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save Pass
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/30 transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
