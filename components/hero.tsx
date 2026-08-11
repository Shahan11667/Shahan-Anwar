"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { PhoneCall, Clock, ShieldCheck, Calendar, ArrowRight } from 'lucide-react'
import AppointmentModal from './appointment-modal'

interface HeroData {
  badge?: string
  name?: string
  title?: string
  subtitle?: string
  description?: string
  image?: string
  emergencyPhone?: string
  featureCards?: Array<{
    title: string
    description: string
    icon: string
  }>
}

export default function Hero() {
  const [data, setData] = useState<HeroData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/hero').then(r => r.json()).catch(() => null),
      fetch('/api/contact-info').then(r => r.json()).catch(() => null)
    ]).then(([heroData, contactData]) => {
      let combined = heroData && !heroData.error ? heroData : {}
      if (contactData && contactData.phone) {
        combined.emergencyPhone = contactData.phone
      }
      if (Object.keys(combined).length > 0) {
        setData(combined)
      }
    })
  }, [])

  const defaultHero = {
    badge: "DOCTOR & CLINIC SERVICES",
    name: "Dr. Jessica Walsh",
    title: "A dedicated doctor you can trust",
    description: "Providing compassionate, comprehensive medical healthcare for patients. Dedicated to clinical excellence, preventive care, and holistic wellness.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=700&fit=crop",
    emergencyPhone: "(555) 123-4567",
    featureCards: [
      {
        title: "Emergency Call",
        description: "Immediate emergency assistance and direct telephone support for urgent medical needs.",
        icon: "PhoneCall"
      },
      {
        title: "24/7 Hours Service",
        description: "Round the clock patient consultation, emergency booking, and medical advice.",
        icon: "Clock"
      },
      {
        title: "Personalized Care",
        description: "Tailored treatment plans focused on individual health goals and sustained recovery.",
        icon: "ShieldCheck"
      }
    ]
  }

  const hero = data || defaultHero
  const cards = hero.featureCards && hero.featureCards.length > 0 ? hero.featureCards : defaultHero.featureCards

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Clock':
        return <Clock className="w-6 h-6 text-[#0a382c]" />
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-[#0a382c]" />
      default:
        return <PhoneCall className="w-6 h-6 text-[#0a382c]" />
    }
  }

  return (
    <section id="hero" className="bg-[#0a382c] pt-28 pb-16 md:pt-36 md:pb-24 text-white relative overflow-hidden">
      {/* Background Graphic Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#d97745]/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full filter blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Top Subtitle Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#d97745] text-xs font-semibold uppercase tracking-wider">
              <span>{hero.badge || "DOCTOR & CLINIC SERVICES"}</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#faf7f2] leading-tight">
              A dedicated doctor <br className="hidden sm:inline" />
              <span className="text-[#d97745]">you can trust</span>
            </h1>

            {/* Paragraph Bio */}
            <p className="text-base sm:text-lg text-[#faf7f2]/80 max-w-xl font-light leading-relaxed">
              {hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#d97745] hover:bg-[#c86030] text-white px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>

              {hero.emergencyPhone && (
                <a
                  href={`tel:${hero.emergencyPhone.replace(/\D/g, '')}`}
                  className="bg-white/10 hover:bg-white/20 text-[#faf7f2] border border-white/20 px-6 py-3.5 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4 text-[#d97745]" />
                  <span>Call {hero.emergencyPhone}</span>
                </a>
              )}
            </div>
          </motion.div>

          {/* Right Doctor Image Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-[#f4efe6]/10">
              <img
                src={hero.image || defaultHero.image}
                alt={hero.name || "Doctor"}
                className="w-full h-full object-cover object-center"
              />
              {/* Doctor Name Overlay Badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-[#0a382c]/90 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center">
                <span className="text-sm font-bold font-serif text-[#faf7f2] block">
                  {hero.name || "Dr. Jessica Walsh"}
                </span>
                <span className="text-[11px] text-[#d97745] uppercase tracking-wider font-semibold">
                  Primary Healthcare Practitioner
                </span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Bottom 3 Feature Cards (Floating / Section Bridge) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14"
        >
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 text-slate-800 shadow-xl border border-slate-100 flex items-start gap-4 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0a382c]/10 flex items-center justify-center shrink-0">
                {getIcon(card.icon)}
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-[#0a382c]">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Appointment Popup Modal */}
      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}
