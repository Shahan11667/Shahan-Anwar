"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HeartHandshake, Activity, ClipboardCheck, ArrowRight, Calendar } from 'lucide-react'
import AppointmentModal from './appointment-modal'

interface PromiseItem {
  _id?: string
  title: string
  description: string
  icon?: string
  ctaText?: string
}

export default function Values() {
  const [promises, setPromises] = useState<PromiseItem[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetch('/api/promises')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPromises(data)
        }
      })
      .catch((err) => console.error('Error fetching promises:', err))
  }, [])

  const defaultPromises: PromiseItem[] = [
    {
      title: "Compassionate Patient Care",
      description: "Putting patient dignity, empathetic listening, and individual care needs at the center of every medical decision.",
      icon: "HeartHandshake",
      ctaText: "Learn More"
    },
    {
      title: "Advanced Medical Technology",
      description: "Utilizing modern diagnostic equipment, evidence-based treatments, and cutting-edge healthcare technology.",
      icon: "Activity",
      ctaText: "Learn More"
    },
    {
      title: "Comprehensive Treatment Plans",
      description: "Tailoring holistic treatment plans focused on long-term wellness, prevention, and sustained patient recovery.",
      icon: "ClipboardCheck",
      ctaText: "Learn More"
    }
  ]

  const items = promises.length > 0 ? promises : defaultPromises

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity className="w-8 h-8 text-[#d97745]" />
      case 'ClipboardCheck':
        return <ClipboardCheck className="w-8 h-8 text-[#d97745]" />
      default:
        return <HeartHandshake className="w-8 h-8 text-[#d97745]" />
    }
  }

  return (
    <section id="values" className="py-20 md:py-28 bg-white text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a382c]/10 text-[#0a382c] text-xs font-semibold uppercase tracking-wider">
            <span>WHY CHOOSE ME</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#0a382c]">
            Values My <span className="text-[#d97745]">Promise to You</span>
          </h2>
          <p className="text-sm sm:text-base text-[#0a382c]/90 font-medium">
            Dedicated to providing transparent, patient-first healthcare built on trust, innovation, and clinical expertise.
          </p>
        </div>

        {/* 3 Column Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg text-center space-y-4 hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-between"
            >
              <div className="space-y-4 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-[#0a382c]/5 flex items-center justify-center border border-[#d97745]/20 shadow-inner">
                  {renderIcon(item.icon)}
                </div>
                <h3 className="text-xl font-serif font-bold text-[#0a382c]">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 w-full">
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0a382c] uppercase tracking-wider hover:text-[#d97745] transition-colors"
                >
                  <span>{item.ctaText || "Learn More"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Button */}
        <div className="text-center">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#d97745] hover:bg-[#c86030] text-white px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            Book Now
          </button>
        </div>

      </div>

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}
