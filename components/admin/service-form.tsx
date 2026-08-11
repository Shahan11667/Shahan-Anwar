"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { X, Plus, Edit, Trash2 } from 'lucide-react'

interface ServiceItem {
  _id?: string
  title: string
  accentTitle?: string
  description: string
  icon?: string
  category?: string
}

interface ServiceFormProps {
  services: ServiceItem[]
  onRefresh: () => void
  onClose: () => void
}

export default function ServiceForm({ services, onRefresh, onClose }: ServiceFormProps) {
  const [editingItem, setEditingItem] = useState<ServiceItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<ServiceItem>({
    title: '',
    description: '',
    icon: 'Stethoscope',
    category: 'General Practice'
  })

  const handleEdit = (item: ServiceItem) => {
    setEditingItem(item)
    setFormData(item)
  }

  const handleReset = () => {
    setEditingItem(null)
    setFormData({
      title: '',
      description: '',
      icon: 'Stethoscope',
      category: 'General Practice'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const method = editingItem?._id ? 'PUT' : 'POST'
      const payload = editingItem?._id ? { id: editingItem._id, ...formData } : formData

      const res = await fetch('/api/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast({
          title: editingItem ? "Service Updated" : "Service Created",
          description: "Medical service saved successfully.",
        })
        handleReset()
        onRefresh()
      } else {
        throw new Error('Failed to save service')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save medical service.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this service?")) return

    try {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: "Service Deleted" })
        onRefresh()
      }
    } catch (error) {
      toast({ title: "Error deleting service", variant: "destructive" })
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
                Manage Medical Services
              </CardTitle>
              <CardDescription>
                Add, edit, or remove medical practice services displayed on the frontend 2x2 grid.
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
                {editingItem ? "Edit Medical Service" : "Add New Medical Service"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Service Title *</label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Internal Medicine & Prevention"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Icon Name</label>
                  <select
                    value={formData.icon || 'Stethoscope'}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full h-10 px-3 text-xs bg-white dark:bg-[#0d2820] border rounded-lg"
                  >
                    <option value="Stethoscope">Stethoscope (General)</option>
                    <option value="Baby">Baby (Pediatrics)</option>
                    <option value="HeartPulse">HeartPulse (Cardiology)</option>
                    <option value="ShieldCheck">ShieldCheck (Checkups)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Service Description *</label>
                <Textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the medical service or consultation..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {editingItem && (
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Cancel Edit
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting} className="bg-[#0a382c] text-white hover:bg-[#072b22]">
                  {isSubmitting ? "Saving..." : editingItem ? "Update Service" : "Save Service"}
                </Button>
              </div>
            </form>

            {/* List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-[#0a382c] dark:text-[#faf7f2]">
                Active Medical Services ({services.length})
              </h4>
              {services.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-[#071d17] shadow-sm"
                >
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-[#0a382c] dark:text-[#faf7f2]">{item.title}</h5>
                    <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
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
