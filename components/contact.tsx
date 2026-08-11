"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ContactForm {
  name: string
  email: string
  message: string
}

interface ContactInfoData {
  email?: string
  phone?: string
  location?: string
}

export default function Contact() {
  const [contactInfo, setContactInfo] = useState<ContactInfoData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>()

  useEffect(() => {
    fetch('/api/contact-info')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setContactInfo(data)
        }
      })
      .catch((err) => console.error('Error loading contact info:', err))
  }, [])

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (res.ok) {
        toast({
          title: "Message Sent!",
          description: "Thank you for reaching out. Our clinic staff will respond shortly.",
        })
        reset()
      } else {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      toast({
        title: "Error Sending Message",
        description: "Please try calling our office directly or try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const email = contactInfo?.email || 'contact@doctorwalshclinic.com'
  const phone = contactInfo?.phone || '(555) 123-4567'
  const location = contactInfo?.location || '123 Healthcare Ave, Suite 400, Medical Plaza'

  return (
    <section id="contact" className="py-20 md:py-28 bg-white text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a382c]/10 text-[#0a382c] text-xs font-semibold uppercase tracking-wider">
            <span>GET IN TOUCH</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#0a382c]">
            Contact <span className="text-[#d97745]">Our Medical Office</span>
          </h2>
          <p className="text-sm sm:text-base text-[#0a382c]/90 font-medium">
            Have questions about consultations, appointment schedules, or medical services? We are here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Contact Info Cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg space-y-6">
              <h3 className="text-xl font-serif font-bold text-[#0a382c]">
                Clinic Contact Details
              </h3>

              <div className="space-y-5">
                {/* Email Card */}
                <a
                  href={`mailto:${email}`}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#d97745] transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0a382c] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <Mail className="w-5 h-5 text-[#d97745]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</span>
                    <span className="text-sm font-bold text-[#0a382c] break-all">{email}</span>
                  </div>
                </a>

                {/* Phone Card */}
                <a
                  href={`tel:${phone.replace(/\D/g, '')}`}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#d97745] transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0a382c] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5 text-[#d97745]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Phone & Emergency Line</span>
                    <span className="text-sm font-bold text-[#0a382c]">{phone}</span>
                  </div>
                </a>

                {/* Location Card */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl bg-[#0a382c] text-white flex items-center justify-center shrink-0 shadow-md">
                    <MapPin className="w-5 h-5 text-[#d97745]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Clinic Location</span>
                    <span className="text-sm font-bold text-[#0a382c]">{location}</span>
                  </div>
                </div>

                {/* Operating Hours Card */}
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl bg-[#0a382c] text-white flex items-center justify-center shrink-0 shadow-md">
                    <Clock className="w-5 h-5 text-[#d97745]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Working Hours</span>
                    <span className="text-xs font-bold text-[#0a382c] block">Mon - Fri: 8:00 AM - 6:00 PM</span>
                    <span className="text-xs text-slate-600 font-medium block">Sat: 9:00 AM - 2:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Message Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-lg space-y-6">
              <div>
                <h3 className="text-2xl font-serif font-bold text-[#0a382c]">
                  Send a Direct Message
                </h3>
                <p className="text-xs sm:text-sm text-[#0a382c]/85 font-medium mt-1">
                  Fill out the form below and our clinical staff will get back to you promptly.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0a382c] mb-1">
                      Your Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Jane Doe"
                      {...register('name', { required: 'Name is required' })}
                      className="w-full h-11 px-4 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0a382c] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0a382c] mb-1">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="jane@example.com"
                      {...register('email', { required: 'Email is required' })}
                      className="w-full h-11 px-4 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0a382c] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0a382c] mb-1">
                    Your Message / Inquiry *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can Dr. Walsh and our clinical team assist you today?"
                    {...register('message', { required: 'Message is required' })}
                    className="w-full p-4 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:ring-2 focus:ring-[#0a382c] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#d97745] hover:bg-[#c86030] text-white py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
