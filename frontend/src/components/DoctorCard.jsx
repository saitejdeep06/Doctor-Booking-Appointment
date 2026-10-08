import React from 'react';
import { Star, MapPin, Briefcase, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export default function DoctorCard({ doctor, onBook, onViewDetails }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-teal-500/40 p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Top Badges & Experience */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
            {doctor.specialty}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {doctor.rating} <span className="text-slate-400 font-normal">({doctor.reviewCount})</span>
          </span>
        </div>

        {/* Doctor Header */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="relative shrink-0">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-100 shadow-sm"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Available today" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-teal-700 transition">
              {doctor.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
              {doctor.title}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                {doctor.experienceYears} yrs exp
              </span>
              <span>•</span>
              <span className="truncate">{doctor.languages?.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Hospital & Location */}
        <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 mb-3 space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">{doctor.hospital}</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate pl-5">
            {doctor.address}
          </p>
        </div>

        {/* Available Hours */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Hours: {doctor.workingHours}</span>
        </div>

        {/* Doctor Badges */}
        {doctor.badges && doctor.badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {doctor.badges.map((badge, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-teal-600" />
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Fee & Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Consultation</span>
          <span className="text-lg font-bold text-slate-900">${doctor.consultationFee}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(doctor)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Profile
          </button>
          <button
            onClick={() => onBook(doctor)}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm shadow-teal-600/30 transition flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            Book Slot
          </button>
        </div>
      </div>
    </div>
  );
}
