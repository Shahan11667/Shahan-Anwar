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
import { X, Plus, XCircle } from 'lucide-react'
import { IProject } from '@/models/Project'

interface ProjectFormProps {
  project?: IProject | null
  onSave: (project: IProject) => void
  onClose: () => void
}

interface ProjectFormData {
  title: string
  description: string
  techStack: string[]
  githubLink: string
  demoLink: string
  image: string
}

const ProjectForm = ({ project, onSave, onClose }: ProjectFormProps) => {
  const [techInput, setTechInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProjectFormData>({
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      techStack: project?.techStack || [],
      githubLink: project?.githubLink || '',
      demoLink: project?.demoLink || '',
      image: project?.image || '',
    }
  })

  const techStack = watch('techStack')

  const addTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setValue('techStack', [...techStack, techInput.trim()])
      setTechInput('')
    }
  }

  const removeTech = (tech: string) => {
    setValue('techStack', techStack.filter(t => t !== tech))
  }

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true)
    
    try {
      const url = project ? `/api/projects/${project._id}` : '/api/projects'
      const method = project ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const savedProject = await response.json()
        onSave(savedProject)
        toast({
          title: project ? "Project updated" : "Project created",
          description: `The project has been ${project ? 'updated' : 'created'} successfully.`,
        })
      } else {
        throw new Error('Failed to save project')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project. Please try again.",
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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{project ? 'Edit Project' : 'Add New Project'}</CardTitle>
                <CardDescription>
                  {project ? 'Update the project details below.' : 'Fill in the project details below.'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Project Title *
                </label>
                <Input
                  id="title"
                  {...register('title', { required: 'Title is required' })}
                  placeholder="Enter project title"
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.title.message}
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
                  placeholder="Enter project description"
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
                  Tech Stack *
                </label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="Add technology"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                  />
                  <Button type="button" onClick={addTech} disabled={!techInput.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="ml-2 hover:text-destructive"
                      >
                        <XCircle className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {techStack.length === 0 && (
                  <p className="text-sm text-destructive mt-1">
                    At least one technology is required
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="githubLink" className="block text-sm font-medium mb-2">
                    GitHub Link *
                  </label>
                  <Input
                    id="githubLink"
                    {...register('githubLink', { 
                      required: 'GitHub link is required',
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid URL'
                      }
                    })}
                    placeholder="https://github.com/username/repo"
                    className={errors.githubLink ? 'border-destructive' : ''}
                  />
                  {errors.githubLink && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.githubLink.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="demoLink" className="block text-sm font-medium mb-2">
                    Demo Link *
                  </label>
                  <Input
                    id="demoLink"
                    {...register('demoLink', { 
                      required: 'Demo link is required',
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid URL'
                      }
                    })}
                    placeholder="https://your-demo.com"
                    className={errors.demoLink ? 'border-destructive' : ''}
                  />
                  {errors.demoLink && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.demoLink.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Project Image *
                </label>
                <ImageUpload
                  value={watch('image') || ''}
                  onChange={(url) => setValue('image', url)}
                  placeholder="Upload project screenshot"
                />
                {errors.image && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.image.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || techStack.length === 0}>
                  {isSubmitting ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default ProjectForm
