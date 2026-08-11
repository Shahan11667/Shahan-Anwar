"use client"

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import ImageUpload from '@/components/ui/image-upload'
import { X, Save, Eye, Plus, Trash2, Code, Database, Smartphone, Palette, Server, Globe } from 'lucide-react'

interface AboutFormProps {
  onSave: () => void
  onClose: () => void
}

interface SkillData {
  name: string
  icon: string
  technologies: string
}

interface ExperienceData {
  year: string
  title: string
  company: string
  description: string
}

interface EducationData {
  degree: string
  school: string
  year: string
}

interface AboutFormData {
  title: string
  subtitle: string
  image?: string
  bioParagraphs: { text: string }[]
  skills: SkillData[]
  experience: ExperienceData[]
  education: EducationData[]
}

const iconMap: Record<string, any> = {
  Code, Database, Smartphone, Palette, Server, Globe
}

const AboutForm = ({ onSave, onClose }: AboutFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'bio' | 'skills' | 'experience' | 'education'>('basic')
  const { toast } = useToast()
  
  const { register, control, handleSubmit, formState: { errors }, setValue, watch } = useForm<AboutFormData>({
    defaultValues: {
      bioParagraphs: [{ text: '' }],
      skills: [],
      experience: [],
      education: []
    }
  })

  const { fields: bioFields, append: appendBio, remove: removeBio } = useFieldArray({
    control,
    name: "bioParagraphs"
  })

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: "skills"
  })

  const { fields: experienceFields, append: appendExperience, remove: removeExperience } = useFieldArray({
    control,
    name: "experience"
  })

  const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
    control,
    name: "education"
  })

  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        const response = await fetch('/api/about')
        if (response.ok) {
          const data = await response.json()
          setValue('title', data.title)
          setValue('subtitle', data.subtitle)
          if (data.image) setValue('image', data.image)
          
          if (data.bioParagraphs) {
            setValue('bioParagraphs', data.bioParagraphs.map((text: string) => ({ text })))
          }
          
          if (data.skills) {
            setValue('skills', data.skills.map((s: any) => ({
              ...s,
              technologies: Array.isArray(s.technologies) ? s.technologies.join(', ') : s.technologies
            })))
          }
          
          if (data.experience) {
            setValue('experience', data.experience)
          }
          
          if (data.education) {
            setValue('education', data.education)
          }
        }
      } catch (error) {
        console.error('Error fetching about data:', error)
      }
    }

    fetchCurrentData()
  }, [setValue])

  const onSubmit = async (data: AboutFormData) => {
    setIsSubmitting(true)
    
    // Format data for saving
    const formattedData = {
      ...data,
      bioParagraphs: data.bioParagraphs.map(b => b.text),
      skills: data.skills.map(s => ({
        ...s,
        technologies: s.technologies.split(',').map(t => t.trim()).filter(t => t !== '')
      }))
    }
    
    try {
      const response = await fetch('/api/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      if (response.ok) {
        toast({
          title: "About section updated",
          description: "The about section has been updated successfully.",
        })
        onSave()
      } else {
        throw new Error('Failed to update about data')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update about section. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-background rounded-lg"
      >
        <Card className="border-none shadow-none flex-1 flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Edit About Section</CardTitle>
                <CardDescription>
                  Update your bio, skills, experience, and education details.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
              <Button 
                variant={activeTab === 'basic' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActiveTab('basic')}
              >
                Basic Info
              </Button>
              <Button 
                variant={activeTab === 'bio' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActiveTab('bio')}
              >
                Bio Paragraphs
              </Button>
              <Button 
                variant={activeTab === 'skills' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActiveTab('skills')}
              >
                Skills
              </Button>
              <Button 
                variant={activeTab === 'experience' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActiveTab('experience')}
              >
                Experience
              </Button>
              <Button 
                variant={activeTab === 'education' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setActiveTab('education')}
              >
                Education
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-6">
            <form id="about-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Doctor Profile Image *</label>
                    <ImageUpload
                      value={watch('image') || ''}
                      onChange={(url) => setValue('image', url)}
                      placeholder="Upload or paste doctor profile photo URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Section Title *</label>
                    <Input {...register('title', { required: 'Title is required' })} placeholder="e.g. Professional Summary" />
                    {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Section Subtitle/Introduction *</label>
                    <Textarea {...register('subtitle', { required: 'Subtitle is required' })} placeholder="Short introduction paragraph" rows={4} />
                    {errors.subtitle && <p className="text-xs text-destructive mt-1">{errors.subtitle.message}</p>}
                  </div>
                </div>
              )}

              {activeTab === 'bio' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium">Bio Paragraphs</label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendBio({ text: '' })}>
                      <Plus className="h-4 w-4 mr-1" /> Add Paragraph
                    </Button>
                  </div>
                  {bioFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Textarea {...register(`bioParagraphs.${index}.text` as const)} placeholder={`Paragraph ${index + 1}`} rows={3} />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeBio(index)} disabled={bioFields.length === 1}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium">Skills & Technologies</label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendSkill({ name: '', icon: 'Code', technologies: '' })}>
                      <Plus className="h-4 w-4 mr-1" /> Add Skill Category
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {skillFields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex justify-between mb-4">
                          <h5 className="font-medium">Category #{index + 1}</h5>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeSkill(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium mb-1">Name</label>
                            <Input {...register(`skills.${index}.name` as const)} placeholder="e.g. Frontend Development" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Icon (Code, Database, etc.)</label>
                            <Input {...register(`skills.${index}.icon` as const)} placeholder="Lucide icon name" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium mb-1">Technologies (comma separated)</label>
                            <Input {...register(`skills.${index}.technologies` as const)} placeholder="e.g. React, Next.js, TypeScript" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium">Work Experience</label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendExperience({ year: '', title: '', company: '', description: '' })}>
                      <Plus className="h-4 w-4 mr-1" /> Add Experience
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {experienceFields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex justify-between mb-2">
                          <h5 className="font-medium">Experience #{index + 1}</h5>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeExperience(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium mb-1">Year(s)</label>
                            <Input {...register(`experience.${index}.year` as const)} placeholder="e.g. 2023 - Present" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Title</label>
                            <Input {...register(`experience.${index}.title` as const)} placeholder="e.g. Senior Developer" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium mb-1">Company</label>
                            <Input {...register(`experience.${index}.company` as const)} placeholder="Company Name" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium mb-1">Description</label>
                            <Textarea {...register(`experience.${index}.description` as const)} placeholder="Role description" rows={2} />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium">Education</label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendEducation({ year: '', school: '', degree: '' })}>
                      <Plus className="h-4 w-4 mr-1" /> Add Education
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {educationFields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex justify-between mb-2">
                          <h5 className="font-medium">Education #{index + 1}</h5>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeEducation(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium mb-1">Degree</label>
                              <Input {...register(`education.${index}.degree` as const)} placeholder="Degree Name" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Year</label>
                              <Input {...register(`education.${index}.year` as const)} placeholder="e.g. 2020" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">School/Institution</label>
                            <Input {...register(`education.${index}.school` as const)} placeholder="School Name" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </CardContent>
          
          <div className="p-6 border-t flex justify-end space-x-4 flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" form="about-form" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default AboutForm
