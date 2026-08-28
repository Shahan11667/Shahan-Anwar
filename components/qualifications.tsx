"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, GraduationCap, FileCheck, ChevronDown, Calendar, Building2 } from 'lucide-react'
import AppointmentModal from './appointment-modal'

interface QualificationItem {
  _id?: string
  type: 'awards' | 'certifications' | 'qualifications'
  title: string
  institution: string
  year: string
  description?: string
}

export default function Qualifications({ initialData }: { initialData?: QualificationItem[] }) {
  const [qualifications, setQualifications] = useState<QualificationItem[]>(initialData || [])
  const [activeTab, setActiveTab] = useState<'all' | 'awards' | 'certifications' | 'qualifications'>('qualifications')
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [modalOpen, setModalOpen] = useState(false)

  const defaultQualifications: QualificationItem[] = [
    {
      type: "qualifications",
      title: "Doctor of Medicine (MD)",
      institution: "Harvard Medical School",
      year: "2014",
      description: "Graduated with High Honors in General Medicine & Patient Care Clinical Rotations."
    },
    {
      type: "qualifications",
      title: "Clinical Fellowship in Cardiology & Internal Medicine",
      institution: "Johns Hopkins Hospital",
      year: "2016",
      description: "Specialized post-doctoral clinical fellowship emphasizing cardiovascular prevention and intensive patient care."
    },
    {
      type: "certifications",
      title: "Board Certified in Internal Medicine & General Practice",
      institution: "American Board of Medical Specialties (ABMS)",
      year: "2018",
      description: "National certification signifying highest standards of clinical knowledge and patient safety."
    },
    {
      type: "certifications",
      title: "Advanced Cardiac Life Support (ACLS) & BLS",
      institution: "American Heart Association",
      year: "2023",
      description: "Certified expert in emergency cardiovascular care and resuscitation management."
    },
    {
      type: "awards",
      title: "Excellence in Compassionate Patient Care Award",
      institution: "National Healthcare Association",
      year: "2022",
      description: "Recognized for outstanding bedside care, high patient satisfaction rates, and clinical dedication."
    },
    {
      type: "awards",
      title: "Top Doctor Award in Internal & Preventive Medicine",
      institution: "Medical Excellence Review",
      year: "2024",
      description: "Awarded based on peer evaluations, patient outcomes, and clinical leadership."
    }
  ]

  const items = qualifications.length > 0 ? qualifications : defaultQualifications
  const filteredItems = activeTab === 'all' ? items : items.filter((item) => item.type === activeTab)

  return (
    <section id="qualifications" className="py-20 md:py-28 bg-white text-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a382c]/10 text-[#0a382c] text-xs font-semibold uppercase tracking-wider">
            <span>EDUCATION & QUALIFICATIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#0a382c]">
            Research, <span className="text-[#d97745]">Accreditations & Experience</span>
          </h2>
          <p className="text-sm sm:text-base text-[#0a382c]/90 font-medium">
            Backed by top-tier medical education, rigorous board certifications, and recognized clinical awards.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center flex-wrap gap-3 mb-10">
          {[
            { id: 'qualifications', label: 'Qualifications' },
            { id: 'certifications', label: 'Certifications' },
            { id: 'awards', label: 'Awards' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any)
                setOpenIndex(0)
              }}
              className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-[#0a382c] text-[#faf7f2] shadow-md'
                  : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredItems.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0a382c]/10 text-[#0a382c] flex items-center justify-center shrink-0">
                      {item.type === 'awards' ? (
                        <Award className="w-5 h-5" />
                      ) : item.type === 'certifications' ? (
                        <FileCheck className="w-5 h-5" />
                      ) : (
                        <GraduationCap className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#0a382c]">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-slate-600 mt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Building2 className="w-3.5 h-3.5" />
                          {item.institution}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-[#d97745]">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.year}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-2 rounded-full transition-transform ${isOpen ? 'rotate-180 bg-[#0a382c]/10' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-[#0a382c]" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 pt-0 text-xs sm:text-sm text-slate-700 border-t border-slate-100 font-medium"
                    >
                      <p className="pt-4">{item.description || "Official medical qualification record verified by clinical institution."}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* View All CTA */}
        <div className="text-center pt-10">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#0a382c] hover:bg-[#072b22] text-[#faf7f2] px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
          >
            View All Credentials
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
