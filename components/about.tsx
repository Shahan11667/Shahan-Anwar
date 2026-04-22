"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code, Database, Smartphone, Palette, Server, Globe, User } from 'lucide-react'

const iconMap: Record<string, any> = {
  Code, Database, Smartphone, Palette, Server, Globe, User
}

interface Skill {
  name: string
  icon: string
  technologies: string[]
}

interface Experience {
  year: string
  title: string
  company: string
  description: string
}

interface Education {
  degree: string
  school: string
  year: string
}

interface AboutData {
  title: string
  subtitle: string
  bioParagraphs: string[]
  skills: Skill[]
  experience: Experience[]
  education: Education[]
}

const About = () => {
  const [data, setData] = useState<AboutData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/about')
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Error fetching about data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <section id="about" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </section>
    )
  }

  if (!data) return null

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || User
    return <IconComponent className="h-5 w-5 text-primary mr-2" />
  }

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {data.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-6">Personal Bio</h3>
            <div className="space-y-4 text-muted-foreground">
              {data.bioParagraphs.map((para, index) => (
                <p key={index}>{para}</p>
              ))}
            </div>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-6">Skills & Technologies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-3">
                        {getIcon(skill.icon)}
                        <h4 className="font-semibold">{skill.name}</h4>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {skill.technologies.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Experience & Education */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-6">Experience</h3>
            <div className="space-y-6">
              {data.experience.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative pl-6 border-l-2 border-primary/20"
                >
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                  <div className="text-sm text-primary font-medium mb-1">
                    {exp.year}
                  </div>
                  <h4 className="font-semibold text-lg mb-1">{exp.title}</h4>
                  <div className="text-muted-foreground font-medium mb-2">
                    {exp.company}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {exp.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Education */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-6">Education</h3>
            <div className="space-y-6">
              {data.education.map((edu, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative pl-6 border-l-2 border-secondary/20"
                >
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-secondary rounded-full" />
                  <div className="text-sm text-secondary font-medium mb-1">
                    {edu.year}
                  </div>
                  <h4 className="font-semibold text-lg mb-1">{edu.degree}</h4>
                  <div className="text-muted-foreground font-medium">
                    {edu.school}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About
