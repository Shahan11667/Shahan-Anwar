"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { UploadCloud, FileText, Loader2, CheckCircle2, X } from 'lucide-react'

interface CVParserFormProps {
  onClose: () => void
}

export default function CVParserForm({ onClose }: CVParserFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parsedData, setParsedData] = useState<any>(null)
  const [isApplying, setIsApplying] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile)
        setParsedData(null)
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF document.",
          variant: "destructive"
        })
      }
    }
  }

  const handleParse = async () => {
    if (!file) return

    setIsParsing(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setParsedData(result.data)
        toast({
          title: "Success",
          description: "CV parsed successfully!",
        })
      } else {
        throw new Error(result.error || "Failed to parse CV")
      }
    } catch (error: any) {
      toast({
        title: "Parsing Failed",
        description: error.message || "An error occurred while communicating with the Python API.",
        variant: "destructive"
      })
    } finally {
      setIsParsing(false)
    }
  }

  const handleApplyToPortfolio = async () => {
    if (!parsedData) return

    setIsApplying(true)
    try {
      // Fetch current about data to merge
      const aboutResponse = await fetch('/api/about')
      const currentAbout = aboutResponse.ok ? await aboutResponse.json() : {}

      // Merge experience
      const newExperience = (parsedData.experience || []).map((exp: any) => ({
        year: `${exp.startDate || ''} - ${exp.endDate || ''}`,
        title: exp.position || '',
        company: exp.company || '',
        description: exp.description || ''
      }))

      // Merge education
      const newEducation = (parsedData.education || []).map((edu: any) => ({
        year: `${edu.startDate || ''} - ${edu.endDate || ''}`,
        school: edu.institution || '',
        degree: edu.degree || ''
      }))

      // Create new skills block if needed
      const currentSkills = currentAbout.skills || []
      if (parsedData.skills && parsedData.skills.length > 0) {
        currentSkills.push({
          name: 'Core Skills (Auto)',
          icon: 'Code',
          technologies: parsedData.skills
        })
      }

      const mergedData = {
        ...currentAbout,
        title: currentAbout.title || parsedData.name || 'About Me',
        subtitle: currentAbout.subtitle || parsedData.about || '',
        experience: [...(currentAbout.experience || []), ...newExperience],
        education: [...(currentAbout.education || []), ...newEducation],
        skills: currentSkills
      }

      // Update about section
      const updateResponse = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedData)
      })

      if (updateResponse.ok) {
        toast({
          title: "Portfolio Updated",
          description: "CV data has been applied to your About section.",
        })
        onClose()
      } else {
        throw new Error('Failed to update portfolio')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to apply changes to portfolio.",
        variant: "destructive"
      })
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-background rounded-lg shadow-xl"
      >
        <Card className="border-none shadow-none flex-1 flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0 border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>AI CV Parser</CardTitle>
                <CardDescription>
                  Upload your CV (PDF) and let AI extract your experience, education, and skills.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
            {!parsedData ? (
              <div className="space-y-6">
                <div 
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="cv-upload"
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer flex flex-col items-center gap-4">
                    <div className="p-4 bg-background rounded-full shadow-sm border">
                      {file ? (
                        <FileText className="h-8 w-8 text-primary" />
                      ) : (
                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-lg">
                        {file ? file.name : "Click to upload your CV"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {file ? "Ready to parse" : "PDF files only"}
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleParse} 
                    disabled={!file || isParsing}
                    className="w-full sm:w-auto"
                  >
                    {isParsing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Extracting Data with AI...
                      </>
                    ) : (
                      'Extract Data'
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-700 dark:text-green-400">Successfully extracted!</h4>
                    <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                      Review the data below. Click apply to merge it with your portfolio.
                    </p>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <pre>{JSON.stringify(parsedData, null, 2)}</pre>
                </div>
              </div>
            )}
          </CardContent>

          {parsedData && (
            <CardFooter className="border-t p-6 flex justify-between bg-muted/20">
              <Button variant="outline" onClick={() => setParsedData(null)}>
                Upload Another
              </Button>
              <Button onClick={handleApplyToPortfolio} disabled={isApplying}>
                {isApplying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  'Apply to Portfolio'
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
