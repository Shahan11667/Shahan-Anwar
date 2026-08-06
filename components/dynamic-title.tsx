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
    const baseTitle = process.env.NEXT_PUBLIC_PORTFOLIO_NAME || 'Portfolio - Full Stack Developer'
    
    let pageTitle = baseTitle
    let pageDescription = 'Professional Full Stack Developer specializing in modern web and mobile applications. Explore my portfolio showcasing innovative projects.'

    // Set page specific title and description
    if (pathname === '/') {
      pageTitle = `Home | ${baseTitle}`
      pageDescription = 'Professional Full Stack Developer and expert. Explore my portfolio showcasing innovative web applications, mobile apps, and modern development projects.'
    } else if (pathname?.startsWith('/admin')) {
      if (pathname === '/admin') {
        pageTitle = `Admin Dashboard | ${baseTitle}`
        pageDescription = 'Admin dashboard for managing portfolio content.'
      } else if (pathname === '/admin/login') {
        pageTitle = `Admin Login | ${baseTitle}`
        pageDescription = 'Login to access the portfolio admin dashboard.'
      } else {
        const adminPage = pathname.split('/').pop()
        const formattedAdminPage = adminPage ? adminPage.charAt(0).toUpperCase() + adminPage.slice(1) : 'Dashboard'
        pageTitle = `${formattedAdminPage} | Admin | ${baseTitle}`
        pageDescription = `Manage ${formattedAdminPage} settings for the portfolio.`
      }
    } else {
      const pageName = pathname?.split('/').pop()
      const formattedPageName = pageName ? pageName.charAt(0).toUpperCase() + pageName.slice(1) : ''
      if (formattedPageName) {
        pageTitle = `${formattedPageName} | ${baseTitle}`
        if (formattedPageName === 'Projects') {
          pageDescription = 'View detailed information about development projects and technical implementations.'
        }
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
