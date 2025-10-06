"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface DynamicTitleProps {
  title?: string
  description?: string
}

const DynamicTitle = ({ title, description }: DynamicTitleProps) => {
  const pathname = usePathname()

  useEffect(() => {
    const baseTitle = process.env.NEXT_PUBLIC_PORTFOLIO_NAME || 'Shahan Anwar - Full Stack Developer'
    
    let pageTitle = baseTitle
    let pageDescription = 'Shahan Anwar - Professional Full Stack Developer specializing in Next.js, React, TypeScript, and mobile app development. Explore my portfolio showcasing innovative web applications and projects.'

    // Set title based on current page
    switch (pathname) {
      case '/':
        pageTitle = `${baseTitle} | Next.js Expert & Mobile App Developer`
        pageDescription = 'Shahan Anwar - Professional Full Stack Developer and Next.js expert. Explore my portfolio showcasing innovative web applications, mobile apps, and modern development projects.'
        break
      case '/admin':
        pageTitle = `${baseTitle} - Admin Dashboard`
        pageDescription = 'Admin dashboard for managing Shahan Anwar portfolio content.'
        break
      case '/admin/login':
        pageTitle = `${baseTitle} - Admin Login`
        pageDescription = 'Login to access the Shahan Anwar portfolio admin dashboard.'
        break
      default:
        if (pathname?.startsWith('/projects/')) {
          pageTitle = `${baseTitle} - Project Details`
          pageDescription = 'View detailed information about Shahan Anwar\'s development projects and technical implementations.'
        } else {
          const pageName = pathname ? pathname.charAt(1).toUpperCase() + pathname.slice(2) : 'Page';
          pageTitle = `${baseTitle} - ${pageName}`;
        }
    }

    // Override with custom title/description if provided
    if (title) {
      pageTitle = `${baseTitle} - ${title}`
    }
    if (description) {
      pageDescription = description
    }

    // Update document title
    document.title = pageTitle

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', pageDescription)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = pageDescription
      document.head.appendChild(meta)
    }

    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) {
      ogTitle.setAttribute('content', pageTitle)
    }

    // Update Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]')
    if (ogDescription) {
      ogDescription.setAttribute('content', pageDescription)
    }

    // Update Twitter title
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')
    if (twitterTitle) {
      twitterTitle.setAttribute('content', pageTitle)
    }

    // Update Twitter description
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')
    if (twitterDescription) {
      twitterDescription.setAttribute('content', pageDescription)
    }

  }, [pathname, title, description])

  return null
}

export default DynamicTitle
