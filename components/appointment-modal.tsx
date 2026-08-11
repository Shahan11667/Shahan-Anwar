"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, User, Mail, Phone, Stethoscope, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AppointmentModal({ isOpen, onClose }: AppointmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    serviceRequested: 'General Consultation',
    appointmentDate: '',
    appointmentTime: '10:00 AM',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setSubmitted(true)
        toast({
          title: "Appointment Requested!",
          description: "We have received your appointment request and will contact you to confirm.",
        })
      } else {
        const data = await res.json()
        toast({
          title: "Booking Error",
          description: data.error || "Could not submit appointment request.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Submission Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setFormData({
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      serviceRequested: 'General Consultation',
      appointmentDate: '',
      appointmentTime: '10:00 AM',
      notes: ''
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-xl bg-white dark:bg-[#0d2820] rounded-2xl shadow-2xl overflow-hidden border border-[#0a382c]/10"
          >
            {/* Modal Header */}
            <div className="bg-[#0a382c] px-6 py-5 text-white flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#d97745]">
                  Quick Booking
                </span>
                <h3 className="text-xl font-bold font-serif text-[#faf7f2]">
                  Book an Appointment
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {submitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-[#0a382c]/10 text-[#0a382c] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-[#0a382c]" />
                  </div>
                  <h4 className="text-2xl font-bold font-serif text-[#0a382c] dark:text-[#faf7f2]">
                    Request Received!
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto text-sm">
                    Thank you <span className="font-semibold">{formData.patientName}</span>. Our medical team will review your requested slot for <span className="font-semibold">{formData.appointmentDate} at {formData.appointmentTime}</span> and reach out to confirm your visit.
                  </p>
                  <div className="pt-4">
                    <Button
                      onClick={handleReset}
                      className="bg-[#0a382c] hover:bg-[#072b22] text-[#faf7f2] px-8 rounded-full"
                    >
                      Close Window
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        Full Name *
                      </Label>
                      <div className="relative mt-1">
                        <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <Input
                          required
                          type="text"
                          placeholder="John Doe"
                          value={formData.patientName}
                          onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                          className="pl-9 text-sm rounded-lg focus-visible:ring-[#0a382c]"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        Phone Number *
                      </Label>
                      <div className="relative mt-1">
                        <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <Input
                          required
                          type="tel"
                          placeholder="(555) 000-0000"
                          value={formData.patientPhone}
                          onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                          className="pl-9 text-sm rounded-lg focus-visible:ring-[#0a382c]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      Email Address *
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <Input
                        required
                        type="email"
                        placeholder="john@example.com"
                        value={formData.patientEmail}
                        onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                        className="pl-9 text-sm rounded-lg focus-visible:ring-[#0a382c]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        Requested Service
                      </Label>
                      <div className="relative mt-1">
                        <Stethoscope className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <select
                          value={formData.serviceRequested}
                          onChange={(e) => setFormData({ ...formData, serviceRequested: e.target.value })}
                          className="w-full h-10 pl-9 pr-3 text-xs bg-white dark:bg-[#071d17] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0a382c]"
                        >
                          <option value="General Consultation">General Consultation</option>
                          <option value="Internal Medicine">Internal Medicine</option>
                          <option value="Pediatric Care">Pediatric Care</option>
                          <option value="Cardiology Consultation">Cardiology Consultation</option>
                          <option value="Routine Checkup">Routine Checkup</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        Date *
                      </Label>
                      <div className="relative mt-1">
                        <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <Input
                          required
                          type="date"
                          value={formData.appointmentDate}
                          onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                          className="pl-9 text-xs rounded-lg focus-visible:ring-[#0a382c]"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        Time Slot
                      </Label>
                      <div className="relative mt-1">
                        <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <select
                          value={formData.appointmentTime}
                          onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                          className="w-full h-10 pl-9 pr-3 text-xs bg-white dark:bg-[#071d17] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0a382c]"
                        >
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="11:30 AM">11:30 AM</option>
                          <option value="02:00 PM">02:00 PM</option>
                          <option value="04:00 PM">04:00 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      Notes / Symptoms (Optional)
                    </Label>
                    <textarea
                      rows={2}
                      placeholder="Briefly describe your symptoms or visit purpose..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full mt-1 p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#071d17] text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#0a382c] focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="text-xs rounded-full border-slate-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-[#d97745] hover:bg-[#c86030] text-white text-xs font-medium rounded-full px-6 shadow-md transition-all"
                    >
                      {loading ? "Submitting..." : "Confirm Booking Request"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
