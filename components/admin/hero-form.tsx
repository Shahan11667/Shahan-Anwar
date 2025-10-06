"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import ImageUpload from '@/components/ui/image-upload'
import { X, Save, Eye, Plus, XCircle } from 'lucide-react'

interface HeroFormProps {
  onSave: () => void
  onClose: () => void
}

interface HeroFormData {
  name: string
  title: string
  subtitle: string
  description: string
  image: string
  resumeLink: string
  socialLinks: {
    github: string
    linkedin: string
    email: string
  }
}

const HeroForm = ({ onSave, onClose }: HeroFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentData, setCurrentData] = useState<HeroFormData | null>(null)
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<HeroFormData>()

  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        const response = await fetch('/api/hero')
        if (response.ok) {
          const data = await response.json()
          setCurrentData(data)
          // Set form values
          setValue('name', data.name)
          setValue('title', data.title)
          setValue('subtitle', data.subtitle)
          setValue('description', data.description)
          setValue('image', data.image)
          setValue('resumeLink', data.resumeLink)
          setValue('socialLinks.github', data.socialLinks.github)
          setValue('socialLinks.linkedin', data.socialLinks.linkedin)
          setValue('socialLinks.email', data.socialLinks.email)
        }
      } catch (error) {
        console.error('Error fetching hero data:', error)
      }
    }

    fetchCurrentData()
  }, [setValue])

  const onSubmit = async (data: HeroFormData) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/hero', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Hero section updated",
          description: "The hero section has been updated successfully.",
        })
        onSave()
      } else {
        throw new Error('Failed to update hero data')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update hero section. Please try again.",
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
        className="w-full max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Edit Hero Section</CardTitle>
                <CardDescription>
                  Update the hero section content that appears on your portfolio homepage.
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
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name *
                    </label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                      placeholder="Your name"
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-2">
                      Title *
                    </label>
                    <Input
                      id="title"
                      {...register('title', { required: 'Title is required' })}
                      placeholder="Your professional title"
                      className={errors.title ? 'border-destructive' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="subtitle" className="block text-sm font-medium mb-2">
                      Subtitle *
                    </label>
                    <Input
                      id="subtitle"
                      {...register('subtitle', { required: 'Subtitle is required' })}
                      placeholder="A short tagline"
                      className={errors.subtitle ? 'border-destructive' : ''}
                    />
                    {errors.subtitle && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.subtitle.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                      Description *
                    </label>
                    <Textarea
                      id="description"
                      rows={4}
                      {...register('description', { required: 'Description is required' })}
                      placeholder="Your professional description"
                      className={errors.description ? 'border-destructive' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Profile Image *
                    </label>
                    <ImageUpload
                      value={watch('image') || ''}
                      onChange={(url) => setValue('image', url)}
                      placeholder="Upload your profile image"
                    />
                    {errors.image && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.image.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="resumeLink" className="block text-sm font-medium mb-2">
                      Resume Link *
                    </label>
                    <Input
                      id="resumeLink"
                      {...register('resumeLink', { 
                        required: 'Resume link is required',
                        pattern: {
                          value: /^https?:\/\/.+/,
                          message: 'Please enter a valid URL'
                        }
                      })}
                      placeholder="https://example.com/your-resume.pdf"
                      className={errors.resumeLink ? 'border-destructive' : ''}
                    />
                    {errors.resumeLink && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.resumeLink.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Social Links</h4>
                    
                    <div>
                      <label htmlFor="github" className="block text-sm font-medium mb-2">
                        GitHub URL *
                      </label>
                      <Input
                        id="github"
                        {...register('socialLinks.github', { 
                          required: 'GitHub URL is required',
                          pattern: {
                            value: /^https?:\/\/.+/,
                            message: 'Please enter a valid URL'
                          }
                        })}
                        placeholder="https://github.com/yourusername"
                        className={errors.socialLinks?.github ? 'border-destructive' : ''}
                      />
                      {errors.socialLinks?.github && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.socialLinks.github.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="linkedin" className="block text-sm font-medium mb-2">
                        LinkedIn URL *
                      </label>
                      <Input
                        id="linkedin"
                        {...register('socialLinks.linkedin', { 
                          required: 'LinkedIn URL is required',
                          pattern: {
                            value: /^https?:\/\/.+/,
                            message: 'Please enter a valid URL'
                          }
                        })}
                        placeholder="https://linkedin.com/in/yourusername"
                        className={errors.socialLinks?.linkedin ? 'border-destructive' : ''}
                      />
                      {errors.socialLinks?.linkedin && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.socialLinks.linkedin.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email *
                      </label>
                      <Input
                        id="email"
                        type="email"
                        {...register('socialLinks.email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Please enter a valid email'
                          }
                        })}
                        placeholder="your.email@example.com"
                        className={errors.socialLinks?.email ? 'border-destructive' : ''}
                      />
                      {errors.socialLinks?.email && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.socialLinks.email.message}
                        </p>
                      )}
                    </div>
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
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                      <img
                        src={previewData.image || '/placeholder.jpg'}
                        alt={previewData.name || 'Preview'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {previewData.name || 'Your Name'}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      {previewData.title || 'Your Title'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {previewData.description || 'Your description will appear here...'}
                    </p>
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

export default HeroForm
