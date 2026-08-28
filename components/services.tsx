"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Stethoscope, Baby, HeartPulse, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react'
import AppointmentModal from './appointment-modal'

interface ServiceItem {
  _id?: string
  title: string
  accentTitle?: string
  description: string
  icon?: string
  category?: string
  linkText?: string
}

export default function Services({ initialData }: { initialData?: ServiceItem[] }) {
  const [services, setServices] = useState<ServiceItem[]>(initialData || [])
  const [modalOpen, setModalOpen] = useState(false)

  const defaultServices = [
    {
      title: "Internal Medicine & Prevention",
      description: "Comprehensive health assessments, chronic condition management, and personalized preventive care strategies tailored to your lifestyle.",
      icon: "Stethoscope"
    },
    {
      title: "Pediatric Care",
      description: "Specialized healthcare for infants, children, and adolescents focusing on developmental growth, immunizations, and wellness monitoring.",
      icon: "Baby"
    },
    {
      title: "Cardiology Consultation",
      description: "Advanced cardiac risk evaluation, ECG assessments, heart disease prevention strategies, and blood pressure optimization.",
      icon: "HeartPulse"
    },
    {
      title: "General Health Checkup",
      description: "Full body screening, comprehensive laboratory diagnostics, lifestyle counselling, and routine wellness health examinations.",
      icon: "ShieldCheck"
    }
  ]

  const items = services.length > 0 ? services : defaultServices

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Baby':
        return <Baby className="w-6 h-6 text-white" />
      case 'HeartPulse':
        return <HeartPulse className="w-6 h-6 text-white" />
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-white" />
      default:
        return <Stethoscope className="w-6 h-6 text-white" />
    }
  }

  return (
    <section id="services" className="py-20 md:py-28 bg-white text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a382c]/10 text-[#0a382c] text-xs font-semibold uppercase tracking-wider">
            <span>OUR SERVICES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#0a382c]">
            Experienced in total <span className="text-[#d97745]">medical providers</span>
          </h2>
          <p className="text-sm sm:text-base text-[#0a382c]/90 font-medium">
            We provide a wide range of specialized medical treatments and clinical services designed to support long-term patient health.
          </p>
        </div>

        {/* 2x2 Grid of Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0a382c] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  {renderIcon(item.icon)}
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#0a382c]">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#0a382c] uppercase tracking-wider group-hover:text-[#d97745] transition-colors"
                >
                  <span>Book Service</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}
