"use client"

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Code, Database, Smartphone, Palette, Server, Globe } from 'lucide-react'

const About = () => {
  const skills = [
    { name: 'Frontend', icon: Code, technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
    { name: 'Backend', icon: Server, technologies: ['Node.js', 'Express', 'Python', 'Django'] },
    { name: 'Database', icon: Database, technologies: ['MongoDB', 'PostgreSQL', 'Redis', 'MySQL'] },
    { name: 'Mobile', icon: Smartphone, technologies: ['React Native', 'Flutter', 'iOS', 'Android'] },
    { name: 'Design', icon: Palette, technologies: ['Figma', 'Adobe XD', 'Sketch', 'Photoshop'] },
    { name: 'DevOps', icon: Globe, technologies: ['AWS', 'Docker', 'Vercel', 'GitHub Actions'] },
  ]

  const experience = [
    {
      year: '2023 - Present',
      title: 'Senior Full Stack Developer',
      company: 'Tech Corp',
      description: 'Leading development of scalable web applications and mentoring junior developers.',
    },
    {
      year: '2021 - 2023',
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      description: 'Built and maintained multiple client projects using modern web technologies.',
    },
    {
      year: '2020 - 2021',
      title: 'Frontend Developer',
      company: 'Digital Agency',
      description: 'Created responsive and interactive user interfaces for various clients.',
    },
  ]

  const education = [
    {
      degree: 'Bachelor of Computer Science',
      school: 'University of Technology',
      year: '2016 - 2020',
    },
    {
      degree: 'Full Stack Web Development',
      school: 'Coding Bootcamp',
      year: '2020',
    },
  ]

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
            About Me
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            I'm a passionate full-stack developer with over 4 years of experience
            creating digital solutions that make a real impact.
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
            <h3 className="text-2xl font-bold mb-6">Who I Am</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                I'm a creative problem-solver who loves turning complex ideas into
                simple, beautiful, and intuitive solutions. With a strong foundation
                in both frontend and backend development, I enjoy the full spectrum
                of web development.
              </p>
              <p>
                When I'm not coding, you can find me exploring new technologies,
                contributing to open-source projects, or sharing knowledge with
                the developer community.
              </p>
              <p>
                I believe in writing clean, maintainable code and creating
                user experiences that are both functional and delightful.
              </p>
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
              {skills.map((skill, index) => (
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
                        <skill.icon className="h-5 w-5 text-primary mr-2" />
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
              {experience.map((exp, index) => (
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
              {education.map((edu, index) => (
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
