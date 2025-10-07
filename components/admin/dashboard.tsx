"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { LogOut, Plus, Eye, Edit, Trash2, Mail, FolderOpen, User, Settings, Users, CheckCircle, XCircle, Video, Scissors, Maximize2 } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import ProjectForm from './project-form'
import ContactList from './contact-list'
import HeroForm from './hero-form'
import ContactInfoForm from './contact-info-form'
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
  const [activeTab, setActiveTab] = useState<'hero' | 'projects' | 'contacts' | 'contact-info' | 'chat-users' | 'settings'>('hero')
  const [projects, setProjects] = useState<Project[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [chatUsers, setChatUsers] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showHeroForm, setShowHeroForm] = useState(false)
  const [showContactInfoForm, setShowContactInfoForm] = useState(false)
  const [editingProject, setEditingProject] = useState<IProject | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
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
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Feature Settings</h2>
              <p className="text-muted-foreground">
                Control which features are visible on your portfolio website.
              </p>
            </div>

            <div className="space-y-4">
              {/* Video Editor - Convert to 9:16 */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Maximize2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="videoEditor" className="text-base font-semibold cursor-pointer">
                          Convert to 9:16 (Video Editor)
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Convert videos to YouTube Shorts format at /video-editor
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="videoEditor"
                      checked={settings?.videoEditorEnabled || false}
                      onCheckedChange={() => handleToggleSetting('videoEditorEnabled', settings?.videoEditorEnabled || false)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Video Trim Feature */}


              {/* Placeholder for future features */}
              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">More feature settings coming soon...</p>
                </CardContent>
              </Card>
            </div>
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
    </div>
  )
}

export default AdminDashboard
