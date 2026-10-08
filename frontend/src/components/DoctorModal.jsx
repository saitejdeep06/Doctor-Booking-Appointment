import React, { useEffect, useState } from 'react';
import { X, Star, MapPin, Briefcase, Award, Languages, Calendar, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

export default function DoctorModal({ doctor, onClose, onBook }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctor?.id) {
      setLoading(true);
      api.getDoctorById(doctor.id)
        .then((res) => {
          setReviews(res.reviews || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [doctor]);

  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Banner */}
        <div className="h-28 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 relative p-6 flex justify-end">
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Doctor Header Profile */}
        <div className="px-6 -mt-12 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-end gap-4">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
              />
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                  {doctor.specialty}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{doctor.name}</h2>
                <p className="text-xs text-slate-500 font-medium">{doctor.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Consultation</span>
                <span className="text-2xl font-bold text-slate-900">${doctor.consultationFee}</span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onBook(doctor);
                }}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/30 transition flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                Book Now
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 my-5 py-3 px-4 bg-slate-50 rounded-2xl text-center">
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Rating</p>
              <p className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {doctor.rating}
              </p>
            </div>
            <div className="border-x border-slate-200">
              <p className="text-[11px] text-slate-500 font-medium">Experience</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{doctor.experienceYears} Years</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Reviews</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{doctor.reviewCount} Patients</p>
            </div>
          </div>

          {/* About Doctor */}
          <div className="space-y-4 text-xs text-slate-600">
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">About Doctor</h4>
              <p className="leading-relaxed text-slate-600">{doctor.about}</p>
            </div>

            {/* Clinic & Address */}
            <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
              <h5 className="font-semibold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                Clinic Location
              </h5>
              <p className="text-slate-800 font-medium">{doctor.hospital}</p>
              <p className="text-slate-500 text-[11px]">{doctor.address}</p>
            </div>

            {/* Qualifications */}
            {doctor.qualifications && (
              <div>
                <h5 className="font-bold text-slate-900 text-xs mb-1.5 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-teal-600" />
                  Education & Accreditations
                </h5>
                <ul className="space-y-1">
                  {doctor.qualifications.map((q, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Patient Reviews Section */}
            <div className="pt-2">
              <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                Patient Feedback ({reviews.length})
              </h4>
              {loading ? (
                <p className="text-slate-400">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-slate-400">No patient reviews yet. Be the first to consult!</p>
              ) : (
                <div className="space-y-2">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{rev.patientName}</span>
                        <div className="flex items-center gap-0.5">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
