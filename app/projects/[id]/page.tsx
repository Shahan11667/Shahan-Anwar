"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Calendar, Tag } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import DynamicTitle from '@/components/dynamic-title'

interface Project {
  _id: string
  title: string
  description: string
  longDescription?: string
  techStack: string[]
  githubLink: string
  demoLink: string
  image: string
  images?: string[]
  createdAt: string
  updatedAt: string
}

const ProjectDetailPage = () => {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params?.id}`)
        if (response.ok) {
          const data = await response.json()
          setProject(data)
        } else {
          console.error('Failed to fetch project')
        }
      } catch (error) {
        console.error('Error fetching project:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params?.id) {
      fetchProject()
    }
  }, [params?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-32 mb-4" />
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <Skeleton className="h-96 w-full rounded-lg mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <Skeleton className="h-20 w-20 rounded-lg" />
                <Skeleton className="h-20 w-20 rounded-lg" />
              </div>
            </div>
            <div>
              <Skeleton className="h-6 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              <Skeleton className="h-10 w-32 mb-4" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const allImages = project.images && project.images.length > 0 
    ? [project.image, ...project.images] 
    : [project.image]

  return (
    <div className="min-h-screen bg-background">
      <DynamicTitle 
        title={project ? project.title : "Project Details"} 
        description={project ? project.description : "View detailed information about this project."}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
          <p className="text-xl text-muted-foreground mb-4">{project.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              <span>{project.techStack.length} technologies</span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={allImages[selectedImage]}
                    alt={project.title}
                    width={600}
                    height={400}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                      <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
                        {selectedImage + 1} / {allImages.length}
                      </div>
                    </div>
                  )}
                </div>
                
                {allImages.length > 1 && (
                  <div className="p-4">
                    <div className="flex gap-2 overflow-x-auto">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImage === index 
                              ? 'border-primary' 
                              : 'border-transparent hover:border-muted-foreground'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${project.title} ${index + 1}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Project Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Tech Stack */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech, index) => (
                  <Badge key={index} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Long Description */}
            {project.longDescription && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Project Details</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {project.longDescription.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex-1">
                <a href={project.demoLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live Demo
                </a>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                  <FaGithub className="h-4 w-4 mr-2" />
                  View Source Code
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailPage
