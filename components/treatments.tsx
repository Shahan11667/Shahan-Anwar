"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Activity, ShieldCheck, Heart, Stethoscope } from 'lucide-react'
import AppointmentModal from './appointment-modal'

export default function Treatments() {
  const [modalOpen, setModalOpen] = useState(false)

  const treatments = [
    {
      title: "General Health Screening",
      description: "Routine diagnostic tests, blood panels, metabolic profiling, and early disease prevention consultations.",
      icon: CheckCircle2
    },
    {
      title: "Heart Health Check",
      description: "Cardiovascular risk factor evaluation, lipid management, ECG interpretation, and blood pressure monitoring.",
      icon: Heart
    },
    {
      title: "Preventive Care",
      description: "Customized immunization schedules, nutritional wellness plans, and chronic illness risk reduction.",
      icon: ShieldCheck
    },
    {
      title: "Emergency Medical Care",
      description: "Rapid acute clinical assessment, urgent consultation, minor injury care, and triage referral services.",
      icon: Activity
    }
  ]

  return (
    <section id="treatments" className="py-20 md:py-28 bg-white text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a382c]/10 text-[#0a382c] text-xs font-semibold uppercase tracking-wider">
            <span>MEDICAL SPECIALTIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#0a382c]">
            Specialized <span className="text-[#d97745]">Medical Treatments</span> for All Patients
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-light">
            Providing tailored medical care solutions focused on accurate diagnosis and long-term health management.
          </p>
        </div>

        {/* 2x2 Grid of Treatment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {treatments.map((treatment, idx) => {
            const Icon = treatment.icon
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex items-start gap-6 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0a382c] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <Icon className="w-7 h-7 text-[#d97745]" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-serif font-bold text-[#0a382c]">
                    {treatment.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {treatment.description}
                  </p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0a382c] uppercase tracking-wider group-hover:text-[#d97745] transition-colors pt-2"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}
