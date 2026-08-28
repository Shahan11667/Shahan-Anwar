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
import { 
  Hero as HeroModel,
  About as AboutModel,
  Service as ServiceModel,
  PromiseModel,
  Qualification as QualificationModel,
  Testimonial as TestimonialModel,
  SocialPost as SocialPostModel,
  ContactInfo as ContactInfoModel
} from '@/models'

// Ensure dynamically rendered for fresh data
export const dynamic = 'force-dynamic'

export default async function Home() {
  let initialData: any = {}
  
  try {
    await connectDB()
    
    // Fetch all data concurrently
    const [
      heroData,
      aboutData,
      servicesData,
      promisesData,
      qualificationsData,
      testimonialsData,
      socialPostsData,
      contactData
    ] = await Promise.all([
      HeroModel.findOne({ isActive: true }).lean(),
      AboutModel.findOne({ isActive: true }).lean(),
      ServiceModel.find({ isActive: true }).sort({ order: 1 }).lean(),
      PromiseModel.find({ isActive: true }).sort({ order: 1 }).lean(),
      QualificationModel.find({ isActive: true }).sort({ order: 1 }).lean(),
      TestimonialModel.find({ isActive: true, isApproved: true }).lean(),
      SocialPostModel.find({ showOnPortfolio: true }).sort({ createdAt: -1 }).lean(),
      ContactInfoModel.findOne({ isActive: true }).lean()
    ])

    // Serialize to pass safely to Client Components (handles ObjectIds and Dates)
    initialData = JSON.parse(JSON.stringify({
      hero: heroData || null,
      about: aboutData || null,
      services: servicesData || [],
      promises: promisesData || [],
      qualifications: qualificationsData || [],
      testimonials: testimonialsData || [],
      socialPosts: socialPostsData || [],
      contactInfo: contactData || null
    }))
    
  } catch (error) {
    console.error('Error loading DB in page:', error)
  }

  const doctorName = initialData.hero?.name || "Dr. Jessica Walsh"
  const doctorTitle = initialData.hero?.title || "A dedicated doctor you can trust"
  const doctorDesc = initialData.hero?.seoDescription || initialData.hero?.description || "Providing compassionate, comprehensive healthcare for patients."

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
      <Hero initialData={initialData.hero} contactInfo={initialData.contactInfo} />
      <About initialData={initialData.about} heroData={initialData.hero} />
      <Services initialData={initialData.services} />
      <Values initialData={initialData.promises} />
      <Treatments />
      <Qualifications initialData={initialData.qualifications} />
      <AppointmentBanner />
      <ClinicUpdates initialData={initialData.socialPosts} />
      <Testimonials initialData={initialData.testimonials} doctorName={doctorName} />
      <Contact initialData={initialData.contactInfo} />
      <Footer doctorName={doctorName} />
    </main>
  )
}
