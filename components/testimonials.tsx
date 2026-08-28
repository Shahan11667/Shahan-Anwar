"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Quote, CheckCircle2 } from 'lucide-react'

interface TestimonialItem {
  _id?: string
  patientName: string
  patientRole?: string
  rating: number
  quote: string
  avatar?: string
}

interface TestimonialsProps {
  doctorName?: string
}

export default function Testimonials({ doctorName = "Dr. Jessica Walsh", initialData }: TestimonialsProps & { initialData?: TestimonialItem[] }) {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialData || [])

  const defaultTestimonials: TestimonialItem[] = [
    {
      patientName: "Sarah Jenkins",
      patientRole: "Verified Patient",
      rating: 5,
      quote: "Dr. Walsh provided exceptional care during my diagnosis and treatment. Extremely knowledgeable, attentive, and answered every question with genuine empathy."
    },
    {
      patientName: "Michael Roberts",
      patientRole: "Verified Patient",
      rating: 5,
      quote: "Very professional, caring, and thorough medical consultation. The preventive health advice gave me complete peace of mind and improved my quality of life."
    },
    {
      patientName: "Emily Clark",
      patientRole: "Verified Patient",
      rating: 5,
      quote: "The best experience I've had with a medical practitioner. Clear explanations, comfortable bedside manner, and top-tier clinical expertise."
    },
    {
      patientName: "David Miller",
      patientRole: "Verified Patient",
      rating: 5,
      quote: "Attentive, skilled, and highly recommended for anyone seeking dedicated family medicine and specialized preventive healthcare."
    }
  ]

  const items = testimonials.length > 0 ? testimonials : defaultTestimonials

  return (
    <section id="testimonials" className="py-20 md:py-28 bg-white text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a382c]/10 text-[#0a382c] text-xs font-semibold uppercase tracking-wider">
            <span>TESTIMONIALS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#0a382c]">
            What patients say about <span className="text-[#d97745]">{doctorName}</span>
          </h2>
          <p className="text-sm sm:text-base text-[#0a382c]/90 font-medium">
            Real feedback and reviews from patients who experienced our compassionate medical care firsthand.
          </p>
        </div>

        {/* 2x2 Grid of Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg relative flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: item.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              {/* Patient Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <div className="w-10 h-10 rounded-full bg-[#0a382c] text-[#faf7f2] font-serif font-bold flex items-center justify-center text-sm shadow-md">
                  {item.patientName ? item.patientName.charAt(0) : 'P'}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#0a382c]">
                    {item.patientName}
                  </h4>
                  <span className="text-[11px] text-[#0a382c] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#0a382c]" />
                    {item.patientRole || "Verified Patient"}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
