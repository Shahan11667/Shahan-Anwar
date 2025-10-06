"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { X, Save, Eye, Mail, Phone, MapPin } from 'lucide-react'

interface ContactInfoFormProps {
  onSave: () => void
  onClose: () => void
}

interface ContactInfoFormData {
  email: string
  phone: string
  location: string
}

const ContactInfoForm = ({ onSave, onClose }: ContactInfoFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentData, setCurrentData] = useState<ContactInfoFormData | null>(null)
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ContactInfoFormData>()

  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        const response = await fetch('/api/contact-info')
        if (response.ok) {
          const data = await response.json()
          setCurrentData(data)
          // Set form values
          setValue('email', data.email)
          setValue('phone', data.phone)
          setValue('location', data.location)
        }
      } catch (error) {
        console.error('Error fetching contact info:', error)
      }
    }

    fetchCurrentData()
  }, [setValue])

  const onSubmit = async (data: ContactInfoFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Contact info updated",
          description: "The contact information has been updated successfully.",
        })
        onSave()
      } else {
        throw new Error('Failed to update contact info')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact info. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const previewData = watch()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Edit Contact Information</CardTitle>
                <CardDescription>
                  Update the contact information that appears in the contact section.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Please enter a valid email'
                          }
                        })}
                        placeholder="your.email@example.com"
                        className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        {...register('phone', { required: 'Phone number is required' })}
                        placeholder="+1 (555) 123-4567"
                        className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        {...register('location', { required: 'Location is required' })}
                        placeholder="San Francisco, CA"
                        className={`pl-10 ${errors.location ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.location && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Preview */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Live Preview
                </h4>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{previewData.email || 'your.email@example.com'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{previewData.phone || '+1 (555) 123-4567'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{previewData.location || 'San Francisco, CA'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default ContactInfoForm
