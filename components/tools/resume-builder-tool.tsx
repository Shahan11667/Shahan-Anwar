'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Eye,
  Sliders,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
}

interface EducationItem {
  id: string;
  degree: string;
  school: string;
  year: string;
  details: string;
}

interface ProjectItem {
  id: string;
  name: string;
  tech: string;
  summary: string;
  link: string;
}

interface ResumeData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
  summary: string;
  skills: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
}

const SAMPLE_RESUME: ResumeData = {
  fullName: 'Alex Vance',
  jobTitle: 'Senior Full Stack Software Engineer',
  email: 'alex.vance@example.com',
  phone: '+1 (555) 234-5678',
  location: 'San Francisco, CA',
  website: 'https://alexvance.dev',
  github: 'https://github.com/alexvance',
  linkedin: 'https://linkedin.com/in/alexvance',
  summary: 'Results-driven software engineer with 6+ years of experience architecting high-scale web platforms, distributed microservices, and client-side web applications. Proven track record of improving application throughput by 40% and mentoring high-velocity teams.',
  skills: 'TypeScript, React, Next.js, Node.js, Python, PostgreSQL, Redis, Docker, Kubernetes, AWS, GraphQL, Tailwind CSS, System Design',
  experience: [
    {
      id: 'exp-1',
      role: 'Lead Full Stack Engineer',
      company: 'TechFlow Systems',
      location: 'San Francisco, CA',
      period: '2022 - Present',
      highlights: [
        'Architected real-time analytics pipeline processing 15M+ events daily with sub-50ms latency.',
        'Migrated monolithic frontend to Next.js server components, boosting Core Web Vitals score from 62 to 98.',
        'Spearheaded transition to micro-frontends, reducing deployment cycle times from 4 days to 45 minutes.'
      ]
    },
    {
      id: 'exp-2',
      role: 'Software Engineer',
      company: 'Nexus Cloud Technologies',
      location: 'Austin, TX',
      period: '2019 - 2022',
      highlights: [
        'Engineered responsive web client supporting 350K monthly active users using React and Redux.',
        'Developed REST & GraphQL APIs with automated unit & end-to-end test coverage exceeding 92%.',
        'Optimized PostgreSQL query execution plans, slashing 95th-percentile query times by 65%.'
      ]
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. in Computer Science',
      school: 'University of California, Berkeley',
      year: '2015 - 2019',
      details: 'Magna Cum Laude • Dean’s Honor List • Coursework: Distributed Systems, Algorithms, Machine Learning'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'OmniStream Video Platform',
      tech: 'Next.js, WebSockets, Redis, FFmpeg',
      summary: 'Open-source distributed transcoder delivering real-time HLS video streaming to 20K+ concurrent viewers.',
      link: 'https://github.com/alexvance/omnistream'
    },
    {
      id: 'proj-2',
      name: 'DocuSync Engine',
      tech: 'TypeScript, CRDTs, Node.js, WebRTC',
      summary: 'Collaborative local-first markdown document editor with peer-to-peer conflict resolution.',
      link: 'https://github.com/alexvance/docusync'
    }
  ]
};

export default function ResumeBuilderTool() {
  const [data, setData] = useState<ResumeData>(SAMPLE_RESUME);
  const [theme, setTheme] = useState<'minimal' | 'modern' | 'serif'>('minimal');
  const [accentColor, setAccentColor] = useState<string>('#0f172a');
  const [fontSize, setFontSize] = useState<'compact' | 'normal' | 'spacious'>('normal');
  const [activeTab, setActiveTab] = useState<'info' | 'experience' | 'education' | 'projects' | 'skills'>('info');

  const resumeRef = useRef<HTMLDivElement>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('agy_resume_builder_data');
      if (saved) {
        setData(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem('agy_resume_builder_data', JSON.stringify(data));
    } catch (e) {
      // ignore
    }
  }, [data]);

  const handlePrintPdf = () => {
    window.print();
    confetti({ particleCount: 35, spread: 60 });
  };

  const handleResetToSample = () => {
    if (confirm('Load sample tech resume? This will overwrite current changes.')) {
      setData(SAMPLE_RESUME);
      toast.success('Sample resume loaded!');
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear all fields to start from scratch?')) {
      setData({
        fullName: '',
        jobTitle: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        github: '',
        linkedin: '',
        summary: '',
        skills: '',
        experience: [],
        education: [],
        projects: []
      });
      toast.success('Form cleared!');
    }
  };

  // Experience Handlers
  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: 'exp-' + Date.now(),
          role: 'Job Title',
          company: 'Company Name',
          location: 'City, Country',
          period: '2023 - Present',
          highlights: ['Key accomplishment or primary responsibility.']
        }
      ]
    }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.filter(e => e.id !== id)
    }));
  };

  const updateExperience = (id: string, field: keyof ExperienceItem, value: any) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    }));
  };

  // Education Handlers
  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: 'edu-' + Date.now(),
          degree: 'Degree or Certification',
          school: 'University or Institution',
          year: 'Graduation Year',
          details: 'Honors, GPA, or notable coursework'
        }
      ]
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id)
    }));
  };

  // Project Handlers
  const addProject = () => {
    setData(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: 'proj-' + Date.now(),
          name: 'Project Name',
          tech: 'Technologies Used',
          summary: 'Brief description of the outcome and tech stack.',
          link: 'https://github.com/...'
        }
      ]
    }));
  };

  const removeProject = (id: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Minimalist Resume & CV Builder
            </h4>
            <p className="text-[11px] text-slate-400">
              Zero login walls • Local-first privacy • Recruiter-approved formatting
            </p>
          </div>
        </div>

        {/* Style Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['minimal', 'modern', 'serif'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2.5 py-1 rounded-lg capitalize font-medium cursor-pointer transition-all ${theme === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetToSample}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 cursor-pointer"
          >
            Load Sample
          </button>

          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 text-xs border border-slate-800 cursor-pointer"
          >
            Clear
          </button>

          <button
            onClick={handlePrintPdf}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Form, Right Live Recruiter-Ready Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Section (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-950 border border-slate-800 max-h-[850px] overflow-y-auto">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === 'info' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
            >
              Info
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === 'experience' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
            >
              Experience
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === 'education' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
            >
              Education
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === 'projects' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === 'skills' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
            >
              Skills
            </button>
          </div>

          {/* TAB 1: Personal Info & Summary */}
          {activeTab === 'info' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={e => setData({ ...data, fullName: e.target.value })}
                  placeholder="e.g. Alex Vance"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Professional Title</label>
                <input
                  type="text"
                  value={data.jobTitle}
                  onChange={e => setData({ ...data, jobTitle: e.target.value })}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Email</label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={e => setData({ ...data, email: e.target.value })}
                    placeholder="alex@example.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={data.phone}
                    onChange={e => setData({ ...data, phone: e.target.value })}
                    placeholder="+1 555-0192"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Location</label>
                  <input
                    type="text"
                    value={data.location}
                    onChange={e => setData({ ...data, location: e.target.value })}
                    placeholder="City, State"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Portfolio Website</label>
                  <input
                    type="text"
                    value={data.website}
                    onChange={e => setData({ ...data, website: e.target.value })}
                    placeholder="https://mysite.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">GitHub / Code</label>
                  <input
                    type="text"
                    value={data.github}
                    onChange={e => setData({ ...data, github: e.target.value })}
                    placeholder="github.com/username"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">LinkedIn</label>
                  <input
                    type="text"
                    value={data.linkedin}
                    onChange={e => setData({ ...data, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Professional Summary</label>
                <textarea
                  rows={4}
                  value={data.summary}
                  onChange={e => setData({ ...data, summary: e.target.value })}
                  placeholder="2-3 punchy sentences highlighting your biggest value and career trajectory..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white leading-relaxed resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Experience */}
          {activeTab === 'experience' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Work Experience ({data.experience.length})</span>
                <button
                  onClick={addExperience}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              {data.experience.map((exp, idx) => (
                <div key={exp.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400">Position #{idx + 1}</span>
                    <button
                      onClick={() => removeExperience(exp.id)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Role (e.g. Senior Engineer)"
                      value={exp.role}
                      onChange={e => updateExperience(exp.id, 'role', e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company}
                      onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Location (e.g. Remote / NYC)"
                      value={exp.location}
                      onChange={e => updateExperience(exp.id, 'location', e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Dates (e.g. 2021 - Present)"
                      value={exp.period}
                      onChange={e => updateExperience(exp.id, 'period', e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Key Accomplishments (1 per line):</label>
                    <textarea
                      rows={3}
                      value={exp.highlights.join('\n')}
                      onChange={e => updateExperience(exp.id, 'highlights', e.target.value.split('\n'))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Education */}
          {activeTab === 'education' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Education ({data.education.length})</span>
                <button
                  onClick={addEducation}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add School</span>
                </button>
              </div>

              {data.education.map((edu, idx) => (
                <div key={edu.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400">School #{idx + 1}</span>
                    <button
                      onClick={() => removeEducation(edu.id)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Degree (e.g. B.S. in Computer Science)"
                    value={edu.degree}
                    onChange={e => {
                      const updated = data.education.map(item => item.id === edu.id ? { ...item, degree: e.target.value } : item);
                      setData({ ...data, education: updated });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="University / College"
                      value={edu.school}
                      onChange={e => {
                        const updated = data.education.map(item => item.id === edu.id ? { ...item, school: e.target.value } : item);
                        setData({ ...data, education: updated });
                      }}
                      className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Year (e.g. 2018 - 2022)"
                      value={edu.year}
                      onChange={e => {
                        const updated = data.education.map(item => item.id === edu.id ? { ...item, year: e.target.value } : item);
                        setData({ ...data, education: updated });
                      }}
                      className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Honors / Coursework"
                    value={edu.details}
                    onChange={e => {
                      const updated = data.education.map(item => item.id === edu.id ? { ...item, details: e.target.value } : item);
                      setData({ ...data, education: updated });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Featured Projects ({data.projects.length})</span>
                <button
                  onClick={addProject}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              {data.projects.map((proj, idx) => (
                <div key={proj.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400">Project #{idx + 1}</span>
                    <button
                      onClick={() => removeProject(proj.id)}
                      className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Project Name"
                      value={proj.name}
                      onChange={e => {
                        const updated = data.projects.map(p => p.id === proj.id ? { ...p, name: e.target.value } : p);
                        setData({ ...data, projects: updated });
                      }}
                      className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Tech Stack"
                      value={proj.tech}
                      onChange={e => {
                        const updated = data.projects.map(p => p.id === proj.id ? { ...p, tech: e.target.value } : p);
                        setData({ ...data, projects: updated });
                      }}
                      className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="URL Link (Optional)"
                    value={proj.link}
                    onChange={e => {
                      const updated = data.projects.map(p => p.id === proj.id ? { ...p, link: e.target.value } : p);
                      setData({ ...data, projects: updated });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />

                  <textarea
                    rows={2}
                    placeholder="Short description of what the project does and its impact..."
                    value={proj.summary}
                    onChange={e => {
                      const updated = data.projects.map(p => p.id === proj.id ? { ...p, summary: e.target.value } : p);
                      setData({ ...data, projects: updated });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white resize-none"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: Skills */}
          {activeTab === 'skills' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Technical Skills & Competencies (Comma separated):</label>
                <textarea
                  rows={6}
                  value={data.skills}
                  onChange={e => setData({ ...data, skills: e.target.value })}
                  placeholder="e.g. JavaScript, TypeScript, React, Node.js, Python, AWS, Docker..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white leading-relaxed resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Live Resume Sheet Preview (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/40 p-4 sm:p-8 rounded-2xl border border-slate-800 flex justify-center overflow-x-auto">
          <div
            ref={resumeRef}
            id="printable-resume"
            className={`w-full max-w-[750px] bg-white text-slate-900 p-8 sm:p-12 rounded-sm shadow-2xl transition-all select-text ${theme === 'serif' ? 'font-serif' : 'font-sans'
              }`}
            style={{
              minHeight: '980px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0,0,0,0.1)'
            }}
          >
            {/* Header */}
            <div className="border-b border-slate-300 pb-5 mb-5 space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
                {data.fullName || 'Your Name'}
              </h1>
              <p className="text-sm font-semibold text-slate-700">
                {data.jobTitle || 'Your Professional Title'}
              </p>

              {/* Contact Meta Line */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1 font-mono">
                {data.email && <span>{data.email}</span>}
                {data.phone && <span>• {data.phone}</span>}
                {data.location && <span>• {data.location}</span>}
                {data.website && (
                  <span>
                    • <a href={data.website} className="underline text-blue-700">{data.website.replace('https://', '')}</a>
                  </span>
                )}
                {data.github && (
                  <span>
                    • <a href={data.github} className="underline text-slate-800">GitHub</a>
                  </span>
                )}
                {data.linkedin && (
                  <span>
                    • <a href={data.linkedin} className="underline text-blue-800">LinkedIn</a>
                  </span>
                )}
              </div>
            </div>

            {/* Summary */}
            {data.summary && (
              <div className="mb-5 space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Professional Summary
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed pt-1">
                  {data.summary}
                </p>
              </div>
            )}

            {/* Experience */}
            {data.experience.length > 0 && (
              <div className="mb-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Experience
                </h3>
                {data.experience.map(exp => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-950">{exp.role}</span>
                        <span className="text-slate-600 font-medium"> — {exp.company}</span>
                        {exp.location && <span className="text-slate-500 italic"> ({exp.location})</span>}
                      </div>
                      <span className="font-mono text-slate-600 text-[11px]">{exp.period}</span>
                    </div>

                    <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-slate-700 leading-relaxed">
                      {exp.highlights.filter(Boolean).map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
              <div className="mb-5 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Projects & Open Source
                </h3>
                {data.projects.map(proj => (
                  <div key={proj.id} className="text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-950">
                        {proj.name}
                        {proj.tech && <span className="font-normal text-slate-500 text-[11px]"> ({proj.tech})</span>}
                      </span>
                      {proj.link && (
                        <a href={proj.link} className="text-blue-600 underline font-mono text-[11px]">
                          Link ↗
                        </a>
                      )}
                    </div>
                    <p className="text-slate-700 leading-relaxed">{proj.summary}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {data.education.length > 0 && (
              <div className="mb-5 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Education
                </h3>
                {data.education.map(edu => (
                  <div key={edu.id} className="text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-950">{edu.degree}</span>
                      <span className="font-mono text-slate-600 text-[11px]">{edu.year}</span>
                    </div>
                    <p className="text-slate-700">{edu.school} {edu.details && `• ${edu.details}`}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {data.skills && (
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-0.5">
                  Technical Skills
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed pt-1">
                  {data.skills}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print CSS Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-resume, #printable-resume * {
            visibility: visible;
          }
          #printable-resume {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
