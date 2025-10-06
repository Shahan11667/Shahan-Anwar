import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import About from '@/components/about'
import Projects from '@/components/projects'
import Contact from '@/components/contact'
import Footer from '@/components/footer'
import DynamicTitle from '@/components/dynamic-title'
import StructuredData from '@/components/structured-data'

export default function Home() {
  return (
    <main className="min-h-screen">
      <StructuredData type="person" />
      <DynamicTitle
        title="Home"
        description="Welcome to my portfolio. Explore my projects, skills, and experience as a developer."
      />
      <Navbar />
      <Hero />
      <About />
      <Projects />
      <Contact />
      <Footer />
    </main>
  )
}
