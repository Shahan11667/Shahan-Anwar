"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { X, Calendar, Clock, Phone, Mail, CheckCircle, XCircle, Trash2, User } from 'lucide-react'

interface AppointmentItem {
  _id: string
  patientName: string
  patientEmail: string
  patientPhone: string
  serviceRequested?: string
  appointmentDate: string
  appointmentTime: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  createdAt: string
}

interface AppointmentListProps {
  appointments: AppointmentItem[]
  onRefresh: () => void
  onClose: () => void
}

export default function AppointmentList({ appointments, onRefresh, onClose }: AppointmentListProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { toast } = useToast()

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })

      if (res.ok) {
        toast({
          title: `Appointment ${newStatus}`,
          description: `Appointment status changed to ${newStatus}.`,
        })
        onRefresh()
      }
    } catch (error) {
      toast({ title: "Error updating status", variant: "destructive" })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this appointment record?")) return
    try {
      const res = await fetch(`/api/appointments?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: "Appointment Deleted" })
        onRefresh()
      }
    } catch (error) {
      toast({ title: "Error deleting appointment", variant: "destructive" })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="bg-white dark:bg-[#0d2820]">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-xl font-serif text-[#0a382c] dark:text-[#faf7f2]">
                Booked Patient Appointments ({appointments.length})
              </CardTitle>
              <CardDescription>
                View patient consultation booking requests submitted through the portfolio website.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="p-6">
            {appointments.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No patient appointment requests found yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((item) => (
                  <div
                    key={item._id}
                    className="p-5 rounded-2xl border bg-slate-50 dark:bg-[#071d17] border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0a382c] text-white flex items-center justify-center font-bold text-sm">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-[#0a382c] dark:text-[#faf7f2]">
                            {item.patientName}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            Requested: {item.serviceRequested || "General Consultation"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${
                            item.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : item.status === 'cancelled'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#d97745]" />
                        <span>Date: {new Date(item.appointmentDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#d97745]" />
                        <span>Time Slot: {item.appointmentTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#d97745]" />
                        <span>Phone: {item.patientPhone}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <Mail className="w-4 h-4 text-[#d97745]" />
                        <span>Email: {item.patientEmail}</span>
                      </div>
                    </div>

                    {item.notes && (
                      <div className="bg-white dark:bg-[#0d2820] p-3 rounded-lg border text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-semibold text-[#0a382c] dark:text-[#faf7f2]">Patient Notes: </span>
                        {item.notes}
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      {item.status !== 'confirmed' && (
                        <Button
                          size="sm"
                          disabled={updatingId === item._id}
                          onClick={() => handleStatusChange(item._id, 'confirmed')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirm
                        </Button>
                      )}
                      {item.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingId === item._id}
                          onClick={() => handleStatusChange(item._id, 'cancelled')}
                          className="text-xs text-red-600 border-red-200"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
