import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import About from '@/components/about'
import Projects from '@/components/projects'
import Contact from '@/components/contact'
import Footer from '@/components/footer'
import DynamicTitle from '@/components/dynamic-title'
import StructuredData from '@/components/structured-data'

import connectDB from '@/lib/mongodb'
import HeroModel from '@/models/Hero'

export default async function Home() {
  await connectDB();
  const heroData = await HeroModel.findOne({ isActive: true });
  
  const structData = heroData ? {
    name: heroData.name,
    jobTitle: heroData.title,
    description: heroData.seoDescription || heroData.description,
    url: "https://shahananwar.vercel.app" // In production this can be dynamic
  } : undefined;

  return (
    <main className="min-h-screen">
      <StructuredData type="person" data={structData} />
      <DynamicTitle
        title="Home"
        description={heroData?.seoDescription || heroData?.description || "Welcome to my portfolio. Explore my projects, skills, and experience as a developer."}
      />
      <Navbar userName={heroData?.name} />
      <Hero />
      <About />
      <Projects />
      <Contact />
      <Footer />
    </main>
  )
}
