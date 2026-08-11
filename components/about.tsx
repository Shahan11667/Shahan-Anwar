"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Download, Award, Users, ShieldCheck, CheckCircle } from 'lucide-react'
import AppointmentModal from './appointment-modal'

interface AboutData {
  badge?: string
  title?: string
  accentTitle?: string
  subtitle?: string
  image?: string
  bioParagraphs?: string[]
  stats?: Array<{
    value: string
    label: string
  }>
}

export default function About() {
  const [data, setData] = useState<AboutData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/about').then(r => r.json()).catch(() => null),
      fetch('/api/hero').then(r => r.json()).catch(() => null)
    ]).then(([aboutData, heroData]) => {
      let combined = aboutData && !aboutData.error ? aboutData : {}
      if (!combined.image && heroData && heroData.image) {
        combined.image = heroData.image
      }
      if (Object.keys(combined).length > 0) {
        setData(combined)
      }
    })
  }, [])

  const defaultAbout = {
    badge: "ABOUT ME",
    title: "Professional Summary",
    accentTitle: "Summary",
    subtitle: "As a dedicated medical practitioner with over 15 years of experience, I specialize in providing compassionate, comprehensive healthcare for patients of all ages.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=700&fit=crop",
    bioParagraphs: [
      "With over 15 years of active clinical practice, I am committed to advancing patient outcomes through evidence-based diagnosis, preventive health strategies, and empathetic bedside care.",
      "Our clinic provides a welcoming, modern environment equipped with state-of-the-art diagnostic tools to handle everything from routine health checkups to complex specialized treatments.",
      "We focus on empowering patients with knowledge and tailored wellness plans that foster long-term health, vitality, and peace of mind for you and your family."
    ],
    stats: [
      { value: "15+", label: "Years Experience" },
      { value: "10k+", label: "Happy Patients" },
      { value: "100%", label: "Quality Healthcare" }
    ]
  }

  const about = data || defaultAbout
  const stats = about.stats && about.stats.length > 0 ? about.stats : defaultAbout.stats
  const bios = about.bioParagraphs && about.bioParagraphs.length > 0 ? about.bioParagraphs : defaultAbout.bioParagraphs

  return (
    <section id="about" className="py-20 md:py-28 bg-white text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Doctor Photo Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-md">
              {/* Back Accent Container */}
              <div className="absolute -top-4 -left-4 w-full h-full bg-[#0a382c]/10 rounded-3xl -z-10 transform -rotate-2" />
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#0a382c]">
                <img
                  src={about.image || defaultAbout.image}
                  alt="Doctor Professional Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Right Column: Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Section Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a382c]/10 text-[#0a382c] text-xs font-semibold uppercase tracking-wider">
              <span>{about.badge || "ABOUT ME"}</span>
            </div>

            {/* Heading with Highlighted Accent Word */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#0a382c]">
              Professional <span className="text-[#d97745]">Summary</span>
            </h2>

            {/* Paragraphs */}
            <div className="space-y-4 text-sm sm:text-base text-[#0a382c]/90 font-medium leading-relaxed">
              {bios.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* 3 Key Stats Box */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-b border-slate-200 py-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center space-y-1">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#d97745] block">
                    {stat.value}
                  </span>
                  <span className="text-xs text-[#0a382c] font-bold block uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#0a382c] hover:bg-[#072b22] text-[#faf7f2] px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#d97745]" />
                <span>Schedule Appointment</span>
              </button>

              <a
                href="#contact"
                className="bg-[#0a382c] hover:bg-[#072b22] text-[#faf7f2] px-7 py-3.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                Contact Clinic
              </a>
            </div>
          </motion.div>

        </div>
      </div>

      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  )
}
