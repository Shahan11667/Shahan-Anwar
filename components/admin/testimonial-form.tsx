"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { X, Plus, Edit, Trash2, Star } from 'lucide-react'

interface TestimonialItem {
  _id?: string
  patientName: string
  patientRole?: string
  rating: number
  quote: string
}

interface TestimonialFormProps {
  testimonials: TestimonialItem[]
  onRefresh: () => void
  onClose: () => void
}

export default function TestimonialForm({ testimonials, onRefresh, onClose }: TestimonialFormProps) {
  const [editingItem, setEditingItem] = useState<TestimonialItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<TestimonialItem>({
    patientName: '',
    patientRole: 'Verified Patient',
    rating: 5,
    quote: ''
  })

  const handleEdit = (item: TestimonialItem) => {
    setEditingItem(item)
    setFormData(item)
  }

  const handleReset = () => {
    setEditingItem(null)
    setFormData({
      patientName: '',
      patientRole: 'Verified Patient',
      rating: 5,
      quote: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const method = editingItem?._id ? 'PUT' : 'POST'
      const payload = editingItem?._id ? { id: editingItem._id, ...formData } : formData

      const res = await fetch('/api/testimonials', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast({
          title: editingItem ? "Testimonial Updated" : "Testimonial Added",
          description: "Patient review saved successfully.",
        })
        handleReset()
        onRefresh()
      } else {
        throw new Error('Failed to save testimonial')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save patient testimonial.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this patient review?")) return

    try {
      const res = await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: "Testimonial Deleted" })
        onRefresh()
      }
    } catch (error) {
      toast({ title: "Error deleting testimonial", variant: "destructive" })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="bg-white dark:bg-[#0d2820]">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-xl font-serif text-[#0a382c] dark:text-[#faf7f2]">
                Manage Patient Testimonials
              </CardTitle>
              <CardDescription>
                Add, edit, or remove patient reviews & 5-star ratings displayed on the portfolio homepage.
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-[#071d17] p-5 rounded-2xl border space-y-4">
              <h4 className="font-semibold text-sm text-[#0a382c] dark:text-[#faf7f2] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#d97745]" />
                {editingItem ? "Edit Patient Review" : "Add New Patient Review"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Patient Name *</label>
                  <Input
                    required
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Patient Role / Tag</label>
                  <Input
                    value={formData.patientRole || ''}
                    onChange={(e) => setFormData({ ...formData, patientRole: e.target.value })}
                    placeholder="e.g. Verified Patient"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Rating Stars (1-5)</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full h-10 px-3 text-xs bg-white dark:bg-[#0d2820] border rounded-lg"
                  >
                    <option value={5}>5 Stars (★★★★★)</option>
                    <option value={4}>4 Stars (★★★★☆)</option>
                    <option value={3}>3 Stars (★★★☆☆)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Review Quote *</label>
                <Textarea
                  required
                  rows={3}
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="Patient's review feedback..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {editingItem && (
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Cancel Edit
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting} className="bg-[#0a382c] text-white hover:bg-[#072b22]">
                  {isSubmitting ? "Saving..." : editingItem ? "Update Review" : "Save Review"}
                </Button>
              </div>
            </form>

            {/* List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-[#0a382c] dark:text-[#faf7f2]">
                Active Patient Reviews ({testimonials.length})
              </h4>
              {testimonials.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-[#071d17] shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-sm text-[#0a382c] dark:text-[#faf7f2]">{item.patientName}</h5>
                      <span className="text-xs text-amber-500 font-semibold flex items-center">
                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" /> {item.rating}/5
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 italic">"{item.quote}"</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item._id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
