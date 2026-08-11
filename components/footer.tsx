"use client"

import Link from 'next/link'
import { Stethoscope, Phone, Mail, MapPin, Clock } from 'lucide-react'

interface FooterProps {
  doctorName?: string
}

export default function Footer({ doctorName = "Dr. Jessica Walsh" }: FooterProps) {
  return (
    <footer className="bg-[#0a382c] text-[#faf7f2] pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#d97745] flex items-center justify-center text-white shadow-md">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-xl text-[#faf7f2]">
                {doctorName}
              </span>
            </Link>
            <p className="text-xs text-[#faf7f2]/70 leading-relaxed font-light">
              Dedicated to compassionate, comprehensive healthcare for patients. Clinical excellence, preventive care, and personalized treatments.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#d97745] uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-[#faf7f2]/80">
              <li><a href="#hero" className="hover:text-[#d97745] transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-[#d97745] transition-colors">About Professional</a></li>
              <li><a href="#services" className="hover:text-[#d97745] transition-colors">Our Services</a></li>
              <li><a href="#values" className="hover:text-[#d97745] transition-colors">Why Choose Me</a></li>
              <li><a href="#qualifications" className="hover:text-[#d97745] transition-colors">Education & Credentials</a></li>
              <li><a href="#testimonials" className="hover:text-[#d97745] transition-colors">Patient Reviews</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#d97745] uppercase tracking-wider">
              Medical Specialties
            </h4>
            <ul className="space-y-2 text-xs text-[#faf7f2]/80">
              <li><span>Internal Medicine</span></li>
              <li><span>Pediatric Care</span></li>
              <li><span>Cardiology Consultations</span></li>
              <li><span>General Health Checkups</span></li>
              <li><span>Preventive Wellness</span></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-[#d97745] uppercase tracking-wider">
              Clinic Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-[#faf7f2]/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#d97745] shrink-0 mt-0.5" />
                <span>123 Healthcare Ave, Suite 400, Medical Plaza</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#d97745] shrink-0" />
                <span>(555) 123-4567 (24/7 Urgent Line)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#d97745] shrink-0" />
                <span>contact@doctorwalshclinic.com</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#d97745] shrink-0 mt-0.5" />
                <span>Mon - Fri: 8:00 AM - 6:00 PM<br />Sat: 9:00 AM - 2:00 PM</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 text-center sm:flex sm:justify-between sm:text-left text-xs text-[#faf7f2]/60 font-light">
          <p>© {new Date().getFullYear()} {doctorName}. All rights reserved.</p>
          <div className="mt-2 sm:mt-0 space-x-4">
            <a href="/admin" className="hover:text-[#d97745] transition-colors">Admin Dashboard</a>
            <span>•</span>
            <a href="#" className="hover:text-[#d97745] transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
