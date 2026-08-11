"use client"

import { useState } from 'react'
import { PhoneCall, Calendar, Clock } from 'lucide-react'
import AppointmentModal from './appointment-modal'

export default function AppointmentBanner() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-[#0a382c] rounded-3xl p-8 sm:p-12 md:p-14 text-white overflow-hidden shadow-2xl border border-white/10">
          
          {/* Background Ambient Blur */}
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-[#d97745]/20 rounded-full filter blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#d97745] text-xs font-semibold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>NEED A DOCTOR NOW?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#faf7f2] leading-tight">
                Schedule an immediate <span className="text-[#d97745]">appointment today</span>
              </h2>
              <p className="text-sm sm:text-base text-[#faf7f2]/80 font-light max-w-2xl">
                Call us 24/7 at <span className="font-semibold text-white">(555) 123-4567</span> or pick a preferred time slot to consult directly with our primary healthcare specialists.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4 justify-end">
              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#d97745] hover:bg-[#c86030] text-white px-8 py-4 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book an Appointment</span>
              </button>

              <a
                href="tel:5551234567"
                className="bg-white/10 hover:bg-white/20 text-[#faf7f2] border border-white/20 px-6 py-4 rounded-full text-xs font-semibold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-[#d97745]" />
                <span>Emergency Call</span>
              </a>
            </div>

          </div>

        </div>
      </div>

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}
