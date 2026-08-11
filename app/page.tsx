import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import About from '@/components/about'
import Services from '@/components/services'
import Values from '@/components/values'
import Treatments from '@/components/treatments'
import Qualifications from '@/components/qualifications'
import AppointmentBanner from '@/components/appointment-banner'
import ClinicUpdates from '@/components/clinic-updates'
import Testimonials from '@/components/testimonials'
import Contact from '@/components/contact'
import Footer from '@/components/footer'
import DynamicTitle from '@/components/dynamic-title'
import StructuredData from '@/components/structured-data'

import connectDB from '@/lib/mongodb'
import HeroModel from '@/models/Hero'

export default async function Home() {
  let heroData = null
  try {
    await connectDB()
    heroData = await HeroModel.findOne({ isActive: true })
  } catch (error) {
    console.error('Error loading DB in page:', error)
  }

  const doctorName = heroData?.name || "Dr. Jessica Walsh"
  const doctorTitle = heroData?.title || "A dedicated doctor you can trust"
  const doctorDesc = heroData?.seoDescription || heroData?.description || "Providing compassionate, comprehensive healthcare for patients."

  const structData = {
    name: doctorName,
    jobTitle: doctorTitle,
    description: doctorDesc,
    url: "https://drjessicawalsh.com"
  }

  return (
    <main className="min-h-screen bg-white text-slate-800">
      <StructuredData type="person" data={structData} />
      <DynamicTitle
        title={`${doctorName} | Medical Practice & Doctor Portfolio`}
        description={doctorDesc}
      />
      <Navbar userName={doctorName} />
      <Hero />
      <About />
      <Services />
      <Values />
      <Treatments />
      <Qualifications />
      <AppointmentBanner />
      <ClinicUpdates />
      <Testimonials doctorName={doctorName} />
      <Contact />
      <Footer doctorName={doctorName} />
    </main>
  )
}
