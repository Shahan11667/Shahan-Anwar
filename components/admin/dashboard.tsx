"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { LogOut, Plus, Eye, Edit, Trash2, Mail, FolderOpen, User, Settings, Users, CheckCircle, XCircle, Video, Scissors, Maximize2, FileText, BarChart2, PenTool, Sparkles, Highlighter, GitBranch, Bookmark, Image as ImageIcon, Sliders, Type, Grid, Camera, DollarSign, Calculator, Code2, Clock, Music, Home, Box, Layers, Minimize2, Presentation, Table, Stamp, Lock, Bot, Film } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import ProjectForm from './project-form'
import ContactList from './contact-list'
import HeroForm from './hero-form'
import AboutForm from './about-form'
import ContactInfoForm from './contact-info-form'
import CVParserForm from './cv-parser-form'
import AnalyticsDashboard from './analytics-dashboard'
import YoutubeAutomationView from './youtube-automation-view'
import VideoEditorPro from './video-editor-pro'
import DailyPackView from './daily-pack-view'
import { IProject } from '@/models/Project'

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
  createdAt?: string
  updatedAt?: string
}

interface Contact {
  _id: string
  name: string
  email: string
  message: string
  createdAt: string
}

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'projects' | 'contacts' | 'contact-info' | 'chat-users' | 'settings' | 'cv-parser' | 'analytics' | 'automation' | 'video-studio' | 'daily-pack'>('hero')
  const [projects, setProjects] = useState<Project[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [chatUsers, setChatUsers] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showHeroForm, setShowHeroForm] = useState(false)
  const [showAboutForm, setShowAboutForm] = useState(false)
  const [showContactInfoForm, setShowContactInfoForm] = useState(false)
  const [showCVParser, setShowCVParser] = useState(false)
  const [editingProject, setEditingProject] = useState<IProject | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tabParam = urlParams.get('tab')
      const hash = window.location.hash.replace('#', '')
      if (tabParam === 'automation' || hash === 'automation') {
        setActiveTab('automation')
      }
    }
  }, [])

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...')
      const response = await fetch('/api/auth/verify')
      console.log('Auth response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Auth data:', data)
        if (data.user) {
          console.log('User authenticated:', data.user)
          setIsAuthenticated(true)
          fetchData()
        } else {
          console.log('No user data, redirecting to login')
          router.push('/admin/login')
        }
      } else {
        console.log('Auth failed, redirecting to login')
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    try {
      const [projectsRes, contactsRes, chatUsersRes, settingsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/contacts'),
        fetch('/api/chat/users'),
        fetch('/api/admin/settings')
      ])

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setProjects(projectsData)
      }

      if (contactsRes.ok) {
        const contactsData = await contactsRes.json()
        setContacts(contactsData)
      }

      if (chatUsersRes.ok) {
        const chatUsersData = await chatUsersRes.json()
        // The API returns users in a 'data' property
        const users = chatUsersData.data || chatUsersData
        setChatUsers(Array.isArray(users) ? users : [])
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        if (settingsData.success) {
          setSettings(settingsData.data)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleApproveUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/chat/users/${userId}/approve`, {
        method: 'PUT'
      })

      if (response.ok) {
        toast({
          title: "User Approved",
          description: "User has been approved successfully.",
        })
        // Refresh chat users
        const chatUsersRes = await fetch('/api/chat/users')
        if (chatUsersRes.ok) {
          const chatUsersData = await chatUsersRes.json()
          const users = chatUsersData.data || chatUsersData
          setChatUsers(Array.isArray(users) ? users : [])
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to approve user.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error approving user:', error)
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      })
    }
  }

  const handleRejectUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/chat/users/${userId}/reject`, {
        method: 'PUT'
      })

      if (response.ok) {
        toast({
          title: "User Rejected",
          description: "User has been rejected.",
        })
        // Refresh chat users
        const chatUsersRes = await fetch('/api/chat/users')
        if (chatUsersRes.ok) {
          const chatUsersData = await chatUsersRes.json()
          const users = chatUsersData.data || chatUsersData
          setChatUsers(Array.isArray(users) ? users : [])
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to reject user.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error rejecting user:', error)
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProjects(projects.filter(p => p._id !== id))
        toast({
          title: "Project deleted",
          description: "The project has been successfully deleted.",
        })
      } else {
        throw new Error('Failed to delete project')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleProjectSaved = (project: IProject) => {
    const projectData: Project = {
      _id: String(project._id),
      title: project.title,
      description: project.description,
      longDescription: project.longDescription,
      techStack: project.techStack,
      githubLink: project.githubLink,
      demoLink: project.demoLink,
      image: project.image,
      images: project.images || [],
      createdAt: typeof project.createdAt === 'string'
        ? project.createdAt
        : project.createdAt?.toISOString(),
      updatedAt: typeof project.updatedAt === 'string'
        ? project.updatedAt
        : project.updatedAt?.toISOString()
    }

    if (editingProject) {
      setProjects(projects.map(p => p._id === projectData._id ? projectData : p))
      setEditingProject(null)
    } else {
      setProjects([projectData, ...projects])
    }
    setShowProjectForm(false)
  }

  const handleToggleSetting = async (settingName: string, currentValue: boolean) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [settingName]: !currentValue
        })
      })

      const data = await response.json()

      if (data.success) {
        setSettings(data.data)
        toast({
          title: "Settings updated",
          description: data.message || "Settings have been successfully updated.",
        })
      } else {
        throw new Error(data.error || 'Failed to update settings')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={activeTab === 'hero' ? 'default' : 'outline'}
            onClick={() => setActiveTab('hero')}
            size="sm"
          >
            <User className="h-4 w-4 mr-2" />
            Hero Section
          </Button>
          <Button
            variant={activeTab === 'about' ? 'default' : 'outline'}
            onClick={() => setActiveTab('about')}
            size="sm"
          >
            <User className="h-4 w-4 mr-2" />
            About Section
          </Button>
          <Button
            variant={activeTab === 'cv-parser' ? 'default' : 'outline'}
            onClick={() => setActiveTab('cv-parser')}
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            AI CV Parser
          </Button>
          <Button
            variant={activeTab === 'projects' ? 'default' : 'outline'}
            onClick={() => setActiveTab('projects')}
            size="sm"
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Projects ({projects.length})
          </Button>
          <Button
            variant={activeTab === 'contacts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('contacts')}
            size="sm"
          >
            <Mail className="h-4 w-4 mr-2" />
            Messages ({contacts.length})
          </Button>
          <Button
            variant={activeTab === 'contact-info' ? 'default' : 'outline'}
            onClick={() => setActiveTab('contact-info')}
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Contact Info
          </Button>
          <Button
            variant={activeTab === 'chat-users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('chat-users')}
            size="sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Chat Users
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('settings')}
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'outline'}
            onClick={() => setActiveTab('analytics')}
            size="sm"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button
            variant={activeTab === 'automation' ? 'default' : 'outline'}
            onClick={() => setActiveTab('automation')}
            size="sm"
            className={activeTab === 'automation' ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-bold border-0 shadow-lg shadow-red-500/30' : 'bg-red-950/40 border-red-500/50 text-red-200 hover:bg-red-900/50 font-bold'}
          >
            <Bot className="h-4 w-4 mr-2 text-red-400" />
            AI Video Automation &amp; Channels 🎬
          </Button>
          <Button
            variant={activeTab === 'daily-pack' ? 'default' : 'outline'}
            onClick={() => setActiveTab('daily-pack')}
            size="sm"
            className={activeTab === 'daily-pack' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 shadow-md shadow-emerald-500/20' : ''}
          >
            <Film className="h-4 w-4 mr-2 text-emerald-400" />
            Daily Pack
          </Button>
          <Button
            variant={activeTab === 'video-studio' ? 'default' : 'outline'}
            onClick={() => setActiveTab('video-studio')}
            size="sm"
            className={activeTab === 'video-studio' ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white border-0 shadow-md shadow-violet-500/20' : ''}
          >
            <Film className="h-4 w-4 mr-2 text-violet-400" />
            Video Editor
          </Button>
        </div>

        {/* Hero Tab */}
        {activeTab === 'hero' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Hero Section Management</h2>
              <Button onClick={() => setShowHeroForm(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Hero Section
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face"
                      alt="Hero Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Hero Section Preview</h3>
                  <p className="text-muted-foreground mb-4">
                    This is how your hero section appears on the homepage. Click "Edit Hero Section" to customize the content.
                  </p>
                  <Button onClick={() => setShowHeroForm(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Hero Section
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">About Section Management</h2>
              <Button onClick={() => setShowAboutForm(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit About Section
              </Button>
            </div>

            <Card>
              <CardContent className="p-6 text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">About Section Management</h3>
                <p className="text-muted-foreground mb-4">
                  Manage your bio, skills, experience, and education information.
                </p>
                <Button onClick={() => setShowAboutForm(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit About Section
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CV Parser Tab */}
        {activeTab === 'cv-parser' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">AI CV Parser</h2>
              <Button onClick={() => setShowCVParser(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Upload CV
              </Button>
            </div>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Automate with AI</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your PDF CV and let AI automatically extract your experience, education, and skills.
                </p>
                <Button onClick={() => setShowCVParser(true)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Upload CV
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Projects Management</h2>
              <Button onClick={() => setShowProjectForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>

            {projects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No projects found. Add your first project!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project._id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{project.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {project.description}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const projectData: IProject = {
                                ...project,
                                _id: project._id as any,
                                createdAt: project.createdAt ?
                                  (typeof project.createdAt === 'string' ? new Date(project.createdAt) : project.createdAt) :
                                  new Date(),
                                updatedAt: project.updatedAt ?
                                  (typeof project.updatedAt === 'string' ? new Date(project.updatedAt) : project.updatedAt) :
                                  new Date()
                              } as IProject
                              setEditingProject(projectData)
                              setShowProjectForm(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProject(project._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-2" />
                            View Code
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={project.demoLink} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-2" />
                            View Demo
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <ContactList contacts={contacts} />
        )}

        {/* Contact Info Tab */}
        {activeTab === 'contact-info' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Contact Information</h2>
              <Button onClick={() => setShowContactInfoForm(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Contact Info
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Settings className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Contact Information Management</h3>
                  <p className="text-muted-foreground mb-4">
                    This information appears in the contact section of your portfolio. 
                    Click "Edit Contact Info" to update your email, phone, and location.
                  </p>
                  <Button onClick={() => setShowContactInfoForm(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Contact Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chat Users Tab */}
        {activeTab === 'chat-users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Chat Users Management</h2>
              <div className="text-sm text-muted-foreground">
                Total Users: {Array.isArray(chatUsers) ? chatUsers.length : 0} |
                Pending: {Array.isArray(chatUsers) ? chatUsers.filter(user => !user.isApproved).length : 0} |
                Approved: {Array.isArray(chatUsers) ? chatUsers.filter(user => user.isApproved).length : 0}
              </div>
            </div>

            <div className="space-y-4">
              {!Array.isArray(chatUsers) || chatUsers.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No chat users found.</p>
                  </CardContent>
                </Card>
              ) : (
                Array.isArray(chatUsers) && chatUsers.map((user) => (
                  <Card key={user._id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{user.displayName}</h3>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isApproved
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {user.isApproved ? 'Approved' : 'Pending Approval'}
                              </span>
                              {user.isAdmin && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!user.isApproved && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveUser(user._id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectUser(user._id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {user.isApproved && (
                            <span className="text-sm text-green-600 font-medium">
                              ✓ Approved
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Quick Link Banner to AI Video Automation & Pre-Connected Social Hub */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/60 border-2 border-red-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🎬 YouTube, Instagram &amp; AI Video Automation</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">ALL CHANNELS PRE-CONNECTED ✅</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Beshaan YouTube (@BeshaanVibe), Instagram Reels (@beshaan_vibe), TikTok &amp; Facebook Page are already connected. Click below to generate Bisma Shootable Shorts &amp; 10s AI prompts.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setActiveTab('automation')}
                className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shrink-0 shadow-lg cursor-pointer"
              >
                Open AI Video Automation ➔
              </Button>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1">Platform Feature & Tool Settings</h2>
              <p className="text-sm text-muted-foreground">
                Activate or deactivate platform tools and cutting-edge specialist PDF features in real time.
              </p>
            </div>

            {/* SECTION 1: Groundbreaking Specialist PDF Innovations */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-rose-500 font-semibold text-sm uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Specialist PDF Editor Innovations (Industry First)</span>
              </div>

              {/* 1. True Word Processor Text Reflow */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-rose-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfTextReflow" className="text-base font-semibold cursor-pointer">
                          1. True "Word Processor" Text Reflow Mode
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allows fluid paragraph text reflow that naturally pushes surrounding content down like a Google Doc.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfTextReflow"
                      checked={settings?.pdfTextReflowEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfTextReflowEnabled', settings?.pdfTextReflowEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 2. Bulk Highlights Extraction */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
                        <Highlighter className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfBulkHighlights" className="text-base font-semibold cursor-pointer">
                          2. Bulk Extraction of Highlights & Study Guide
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          1-click copy all marked highlights across the entire PDF or export as study guide notes.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfBulkHighlights"
                      checked={settings?.pdfBulkHighlightsEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfBulkHighlightsEnabled', settings?.pdfBulkHighlightsEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 3. Advanced Typography Controls */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
                        <Sliders className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfAdvancedTypography" className="text-base font-semibold cursor-pointer">
                          3. Advanced Typography (Kerning, Tracking & Leading)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Fine-grained letter tracking and line-height controls to seamlessly match original designer metrics.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfAdvancedTypography"
                      checked={settings?.pdfAdvancedTypographyEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfAdvancedTypographyEnabled', settings?.pdfAdvancedTypographyEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 4. Smart Multi-Object Editing & Alignment */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Maximize2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfMultiObjectAlignment" className="text-base font-semibold cursor-pointer">
                          4. Smart Multi-Object Alignment & Snap-to-Grid
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Multi-select annotations, snap-to-grid guidelines, and 1-click horizontal/vertical alignment.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfMultiObjectAlignment"
                      checked={settings?.pdfMultiObjectAlignmentEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfMultiObjectAlignmentEnabled', settings?.pdfMultiObjectAlignmentEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 5. Native Reference Manager & Citation Generator */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
                        <Bookmark className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfReferenceManager" className="text-base font-semibold cursor-pointer">
                          5. Academic Citation Generator & Zotero/BibTeX Export
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Built-in APA/MLA/Chicago citation injector and bibliography sync with external reference managers.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfReferenceManager"
                      checked={settings?.pdfReferenceManagerEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfReferenceManagerEnabled', settings?.pdfReferenceManagerEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 6. Dynamic PDF-to-Mind-Map Conversion */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-950/40 flex items-center justify-center">
                        <GitBranch className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfMindMap" className="text-base font-semibold cursor-pointer">
                          6. Dynamic PDF-to-Mind-Map Visual Converter
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically transforms long document sections and headings into an interactive concept tree map.
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfMindMap"
                      checked={settings?.pdfMindMapEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfMindMapEnabled', settings?.pdfMindMapEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* SECTION 2: Document & Media Tools Management */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-2 text-blue-500 font-semibold text-sm uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>Document & Media Utilities</span>
              </div>

              {/* PDF Editor Suite */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
                        <PenTool className="h-5 w-5 text-rose-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfEditor" className="text-base font-semibold cursor-pointer">
                          Online PDF Editor Suite
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/pdf-editor (text annotations, digital signatures, stamps, redaction)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfEditor"
                      checked={settings?.pdfEditorEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfEditorEnabled', settings?.pdfEditorEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Word to PDF */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="wordToPdf" className="text-base font-semibold cursor-pointer">
                          Word to PDF Converter (.docx to .pdf)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/word-to-pdf conversion tool
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="wordToPdf"
                      checked={settings?.wordToPdfEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('wordToPdfEnabled', settings?.wordToPdfEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* PDF to Word */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfToWord" className="text-base font-semibold cursor-pointer">
                          PDF to Word Converter (.pdf to .docx)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/pdf-to-word conversion tool
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfToWord"
                      checked={settings?.pdfToWordEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfToWordEnabled', settings?.pdfToWordEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Word Editor */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="wordEditor" className="text-base font-semibold cursor-pointer">
                          Online Word & Document Editor
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/word-editor (WYSIWYG document processor with templates)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="wordEditor"
                      checked={settings?.wordEditorEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('wordEditorEnabled', settings?.wordEditorEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Image Editor */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="imageEditor" className="text-base font-semibold cursor-pointer">
                          Professional Canvas Image Studio
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/image-editor (crop, rotate, filters, brush, eyedropper, social presets)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="imageEditor"
                      checked={settings?.imageEditorEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('imageEditorEnabled', settings?.imageEditorEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Screenshot Studio */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                        <Camera className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="screenshotStudio" className="text-base font-semibold cursor-pointer">
                          Screenshot Studio & Mockup Generator
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/screenshot-studio (in-browser screen capture, macOS frames, 3D tilt, mesh gradients)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="screenshotStudio"
                      checked={settings?.screenshotStudioEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('screenshotStudioEnabled', settings?.screenshotStudioEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Minimalist Resume Builder */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="resumeBuilder" className="text-base font-semibold cursor-pointer">
                          Minimalist Resume & CV Builder
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/resume-builder (clean markdown & form CV builder, recruiter-approved formats, zero login walls)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="resumeBuilder"
                      checked={settings?.resumeBuilderEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('resumeBuilderEnabled', settings?.resumeBuilderEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Simple Invoice Generator */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="invoiceGenerator" className="text-base font-semibold cursor-pointer">
                          Simple Invoice & Receipt Generator
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/invoice-generator (local-first freelance billing, tax & discount auto-calc, print PDF)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="invoiceGenerator"
                      checked={settings?.invoiceGeneratorEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('invoiceGeneratorEnabled', settings?.invoiceGeneratorEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Niche Calculators */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                        <Calculator className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="nicheCalculators" className="text-base font-semibold cursor-pointer">
                          Niche Unit, Rate & Financial Calculators
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/smart-calculator (print-bleed DPI, freelance hourly rate, compound growth, data transfer)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="nicheCalculators"
                      checked={settings?.nicheCalculatorsEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('nicheCalculatorsEnabled', settings?.nicheCalculatorsEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data & Text Converter */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                        <Code2 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="dataConverter" className="text-base font-semibold cursor-pointer">
                          Plain-Text, Markdown & Data Conversion Utilities
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/dev-text-converter (CSV to JSON, Markdown to HTML, CSS/JS minifier, email list de-duplicator)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="dataConverter"
                      checked={settings?.dataConverterEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('dataConverterEnabled', settings?.dataConverterEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Focus & Habit Tracker */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-rose-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="focusTimer" className="text-base font-semibold cursor-pointer">
                          Single-Screen Focus & Habit Tracker
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/focus-habit-tracker (distraction-free Pomodoro, 7-day daily streak matrix, priority scratchpad)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="focusTimer"
                      checked={settings?.focusTimerEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('focusTimerEnabled', settings?.focusTimerEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Music Collaboration Studio */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center">
                        <Music className="h-5 w-5 text-violet-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="musicStudio" className="text-base font-semibold cursor-pointer">
                          Real-Time Music Collaboration & DAW Studio
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/music-studio (ultra-low latency Web Audio DAW, 16-step beat sequencer, synth keys, live mic recording & Sessionwire rooms)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="musicStudio"
                      checked={settings?.musicStudioEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('musicStudioEnabled', settings?.musicStudioEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 3D Interior & Floor Planner */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                        <Home className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="interiorPlanner" className="text-base font-semibold cursor-pointer">
                          Planner 5D Virtual Interior & 3D Floor Planner
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/interior-planner (interactive 2D/3D blueprint & perspective modeling, furniture placement, flooring/wall customization, smart design suggestions)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="interiorPlanner"
                      checked={settings?.interiorPlannerEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('interiorPlannerEnabled', settings?.interiorPlannerEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Complete PDF Suite Hub */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfSuite" className="text-base font-semibold cursor-pointer">
                          All-in-One PDF Suite Hub
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/pdf-suite (Unified categorized matrix of all 30+ PDF tools)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfSuite"
                      checked={settings?.pdfSuiteEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfSuiteEnabled', settings?.pdfSuiteEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Organize & Scan PDF */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="organizePdf" className="text-base font-semibold cursor-pointer">
                          Organize, Split, Extract & Scan to PDF
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/organize-pdf (Visual reordering grid, delete blank pages, extract ranges, and webcam scanner)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="organizePdf"
                      checked={settings?.organizePdfEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('organizePdfEnabled', settings?.organizePdfEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Compress, Repair & OCR */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                        <Minimize2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="compressPdf" className="text-base font-semibold cursor-pointer">
                          Compress, Repair & OCR Scanned PDF
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/compress-pdf (Up to 80% file size reduction, rebuild corrupt XRef tables & neural OCR)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="compressPdf"
                      checked={settings?.compressPdfEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('compressPdfEnabled', settings?.compressPdfEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Convert Office & HTML to PDF */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                        <Presentation className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="convertToPdf" className="text-base font-semibold cursor-pointer">
                          Convert Office, PPTX, Excel & HTML to PDF
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/convert-to-pdf (PowerPoint slide decks, Excel CSV tables & web markup to PDF)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="convertToPdf"
                      checked={settings?.convertToPdfEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('convertToPdfEnabled', settings?.convertToPdfEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Convert PDF to PPTX, Excel & PDF/A */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Table className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="convertFromPdf" className="text-base font-semibold cursor-pointer">
                          Convert PDF to PowerPoint, Excel & ISO PDF/A
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/convert-from-pdf (Export presentation decks, spreadsheet matrices & ISO-19005 archival standard)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="convertFromPdf"
                      checked={settings?.convertFromPdfEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('convertFromPdfEnabled', settings?.convertFromPdfEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* PDF Annotate & Forms */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                        <Stamp className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfAnnotate" className="text-base font-semibold cursor-pointer">
                          Watermark, Rotate, Page Numbers & PDF Forms
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/pdf-annotate (Custom transparency watermarks, pagination formatting, rotation & interactive forms)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfAnnotate"
                      checked={settings?.pdfAnnotateEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfAnnotateEnabled', settings?.pdfAnnotateEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* PDF Security */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfSecurity" className="text-base font-semibold cursor-pointer">
                          Protect, Unlock, Sign, Redact & Compare PDF
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/pdf-security (AES-256 encryption, digital verified signing, blackout PII redaction & visual diff)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfSecurity"
                      checked={settings?.pdfSecurityEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfSecurityEnabled', settings?.pdfSecurityEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* PDF Intelligence */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="pdfIntelligence" className="text-base font-semibold cursor-pointer">
                          AI Summarizer, Translate PDF & PDF to Markdown
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable /tools/pdf-intelligence (Executive brief generation, 50+ language document translation & GitHub markdown)
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="pdfIntelligence"
                      checked={settings?.pdfIntelligenceEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('pdfIntelligenceEnabled', settings?.pdfIntelligenceEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Video Editor */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Video className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-0.5">
                        <Label htmlFor="videoEditor" className="text-base font-semibold cursor-pointer">
                          Convert to 9:16 (Video Editor)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable video conversion at /video-editor
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="videoEditor"
                      checked={settings?.videoEditorEnabled ?? true}
                      onCheckedChange={() => handleToggleSetting('videoEditorEnabled', settings?.videoEditorEnabled ?? true)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <AnalyticsDashboard />
          </div>
        )}

        {/* AI Video Automation Tab */}
        {activeTab === 'automation' && (
          <div>
            <YoutubeAutomationView />
          </div>
        )}

        {/* Daily Content Pack Tab */}
        {activeTab === 'daily-pack' && (
          <div>
            <DailyPackView onOpenStudio={() => setActiveTab('automation')} />
          </div>
        )}

        {/* CapCut Studio Pro Tab */}
        {activeTab === 'video-studio' && (
          <div>
            <VideoEditorPro />
          </div>
        )}
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <ProjectForm
          project={editingProject}
          onSave={handleProjectSaved}
          onClose={() => {
            setShowProjectForm(false)
            setEditingProject(null)
          }}
        />
      )}

      {/* Hero Form Modal */}
      {showHeroForm && (
        <HeroForm
          onSave={() => {
            setShowHeroForm(false)
            // Optionally refresh the page to show updated hero data
            window.location.reload()
          }}
          onClose={() => setShowHeroForm(false)}
        />
      )}

      {/* About Form Modal */}
      {showAboutForm && (
        <AboutForm
          onSave={() => {
            setShowAboutForm(false)
            window.location.reload()
          }}
          onClose={() => setShowAboutForm(false)}
        />
      )}

      {/* Contact Info Form Modal */}
      {showContactInfoForm && (
        <ContactInfoForm
          onSave={() => {
            setShowContactInfoForm(false)
            // Optionally refresh the page to show updated contact info
            window.location.reload()
          }}
          onClose={() => setShowContactInfoForm(false)}
        />
      )}

      {/* CV Parser Modal */}
      {showCVParser && (
        <CVParserForm
          onClose={() => {
            setShowCVParser(false)
            if (activeTab === 'cv-parser') setActiveTab('about')
          }}
        />
      )}
    </div>
  )
}

export default AdminDashboard
