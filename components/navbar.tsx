"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Stethoscope, Menu, X, Calendar } from 'lucide-react'
import AppointmentModal from './appointment-modal'

interface NavbarProps {
  userName?: string
}

export default function Navbar({ userName = "Dr. Jessica Walsh" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Values', href: '#values' },
    { name: 'Treatments', href: '#treatments' },
    { name: 'Credentials', href: '#qualifications' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0a382c]/95 backdrop-blur-md shadow-lg py-3 border-b border-[#0a382c]/30'
            : 'bg-[#0a382c] py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand / Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-[#d97745] flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-[#faf7f2] leading-tight tracking-wide">
                  {userName}
                </span>
                <span className="text-[10px] text-[#faf7f2]/70 font-sans tracking-wider uppercase">
                  Doctor & Clinic Services
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-xs font-medium text-[#faf7f2]/80 hover:text-[#d97745] transition-colors uppercase tracking-wider"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* CTA Button & Mobile Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAppointmentModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 bg-[#d97745] hover:bg-[#c86030] text-white px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Calendar className="w-4 h-4" />
                <span>Get an Appointment</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-[#faf7f2] hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0a382c] border-t border-white/10 px-4 pt-3 pb-6 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-[#faf7f2]/90 hover:text-[#d97745] py-2 border-b border-white/5"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  setAppointmentModalOpen(true)
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#d97745] text-white py-3 rounded-full text-xs font-semibold uppercase tracking-wider shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span>Get an Appointment</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Appointment Popup Modal */}
      <AppointmentModal
        isOpen={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
      />
    </>
  )
}
