"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { X, Plus, Edit, Trash2 } from 'lucide-react'

interface QualificationItem {
  _id?: string
  type: 'awards' | 'certifications' | 'qualifications'
  title: string
  institution: string
  year: string
  description?: string
}

interface QualificationFormProps {
  qualifications: QualificationItem[]
  onRefresh: () => void
  onClose: () => void
}

export default function QualificationForm({ qualifications, onRefresh, onClose }: QualificationFormProps) {
  const [editingItem, setEditingItem] = useState<QualificationItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<QualificationItem>({
    type: 'qualifications',
    title: '',
    institution: '',
    year: '2024',
    description: ''
  })

  const handleEdit = (item: QualificationItem) => {
    setEditingItem(item)
    setFormData(item)
  }

  const handleReset = () => {
    setEditingItem(null)
    setFormData({
      type: 'qualifications',
      title: '',
      institution: '',
      year: '2024',
      description: ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const method = editingItem?._id ? 'PUT' : 'POST'
      const payload = editingItem?._id ? { id: editingItem._id, ...formData } : formData

      const res = await fetch('/api/qualifications', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast({
          title: editingItem ? "Qualification Updated" : "Qualification Added",
          description: "Credential saved successfully.",
        })
        handleReset()
        onRefresh()
      } else {
        throw new Error('Failed to save qualification')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save credential.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this credential?")) return

    try {
      const res = await fetch(`/api/qualifications?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast({ title: "Qualification Deleted" })
        onRefresh()
      }
    } catch (error) {
      toast({ title: "Error deleting credential", variant: "destructive" })
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
                Manage Accreditations & Qualifications
              </CardTitle>
              <CardDescription>
                Add, edit, or remove medical degrees, board certifications, and clinical awards.
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
                {editingItem ? "Edit Credential" : "Add New Credential"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Category Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full h-10 px-3 text-xs bg-white dark:bg-[#0d2820] border rounded-lg"
                  >
                    <option value="qualifications">Qualifications / Education</option>
                    <option value="certifications">Certifications / Licenses</option>
                    <option value="awards">Awards & Honors</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1">Title *</label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Doctor of Medicine (MD)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1">Institution / Issuer *</label>
                  <Input
                    required
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. Harvard Medical School"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Year *</label>
                  <Input
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    placeholder="e.g. 2018"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <Textarea
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details about honors or specialization..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {editingItem && (
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Cancel Edit
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting} className="bg-[#0a382c] text-white hover:bg-[#072b22]">
                  {isSubmitting ? "Saving..." : editingItem ? "Update Credential" : "Save Credential"}
                </Button>
              </div>
            </form>

            {/* List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-[#0a382c] dark:text-[#faf7f2]">
                Active Credentials ({qualifications.length})
              </h4>
              {qualifications.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-[#071d17] shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#0a382c]/10 text-[#0a382c] dark:text-[#d97745]">
                        {item.type}
                      </span>
                      <h5 className="font-bold text-sm text-[#0a382c] dark:text-[#faf7f2]">{item.title}</h5>
                    </div>
                    <p className="text-xs text-slate-500">{item.institution} ({item.year})</p>
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
