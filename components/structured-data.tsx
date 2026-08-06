"use client"

import { useEffect } from 'react'

interface StructuredDataProps {
  type?: 'person' | 'website' | 'organization'
  data?: {
    name?: string;
    jobTitle?: string;
    description?: string;
    url?: string;
  }
}

const StructuredData = ({ type = 'person', data }: StructuredDataProps) => {
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": type === 'person' ? "Person" : type === 'organization' ? "Organization" : "WebSite",
      ...(type === 'person' && {
        name: data?.name || "Portfolio",
        alternateName: data?.name,
        jobTitle: data?.jobTitle || "Developer",
        description: data?.description || "Professional portfolio.",
        url: data?.url || "https://shahananwar.vercel.app",
        image: "https://res.cloudinary.com/dbu5uajzc/image/upload/v1/portfolio/profile.jpg",
        sameAs: [
          "https://github.com/shahananwar39",
          "https://linkedin.com/in/shahananwar",
          "https://twitter.com/shahananwar"
        ],
        knowsAbout: [
          "Next.js",
          "React",
          "TypeScript",
          "JavaScript",
          "Node.js",
          "MongoDB",
          "Mobile App Development",
          "Web Development",
          "Full Stack Development",
          "UI/UX Design"
        ],
        hasOccupation: {
          "@type": "Occupation",
          name: "Full Stack Developer",
          description: "Develops web applications and mobile apps using modern technologies"
        },
        address: {
          "@type": "PostalAddress",
          addressCountry: "PK",
          addressLocality: "Karachi"
        },
        ...data
      }),
      ...(type === 'website' && {
        name: "Shahan Anwar Portfolio",
        url: "https://shahananwar.vercel.app",
        description: "Professional portfolio showcasing web development and mobile app projects",
        author: {
          "@type": "Person",
          name: "Shahan Anwar"
        },
        ...data
      })
    }

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Add new structured data
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(structuredData)
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [type, data])

  return null
}

export default StructuredData
