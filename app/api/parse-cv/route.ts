import { NextResponse } from 'next/server';
import dns from 'dns';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
dns.setDefaultResultOrder('ipv4first');
const PDFParser = require('pdf2json');

// Helper to wrap pdf2json in a Promise
function parsePdfBuffer(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // Fixed typo: was "new PDFParser(this :, 1)", now "new PDFParser(this, 1)"
    const pdfParser = new PDFParser(this, 1);
    
    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(errData.parserError);
    });
    
    pdfParser.on('pdfParser_dataReady', () => {
      const text = pdfParser.getRawTextContent();
      resolve(text);
    });
    
    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ success: false, error: 'Only PDF files are supported.' }, { status: 400 });
    }

    // Convert the uploaded file to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF
    let text = '';
    try {
      text = await parsePdfBuffer(buffer);
      text = text.replace(/\r\n/g, ' ').replace(/[-]+Page \(\d+\) Break[-]+/g, '');
    } catch (parseError: any) {
      console.error('PDF parsing error:', parseError);
      return NextResponse.json({ success: false, error: 'Failed to extract text from PDF.' }, { status: 500 });
    }

    if (!text.trim()) {
      return NextResponse.json({ success: false, error: 'Could not extract any text from the PDF.' }, { status: 400 });
    }

    // Call Gemini API
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return NextResponse.json({ success: false, error: 'AI parsing is currently unavailable (Missing API Key).' }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(geminiKey);
    // Use the fast, lightweight model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3.5-flash',
      // Force JSON output with strict schema
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            name: { type: SchemaType.STRING },
            title: { type: SchemaType.STRING, description: "The professional title of the person, e.g., Senior Software Engineer or Paediatrician" },
            subtitle: { type: SchemaType.STRING, description: "A short, punchy subtitle or tagline for the hero section." },
            about: { type: SchemaType.STRING },
            email: { type: SchemaType.STRING },
            phone: { type: SchemaType.STRING },
            location: { type: SchemaType.STRING },
            linkedin: { type: SchemaType.STRING, description: "LinkedIn profile URL if found" },
            github: { type: SchemaType.STRING, description: "GitHub profile URL if found" },
            seoKeywords: { 
              type: SchemaType.ARRAY, 
              items: { type: SchemaType.STRING },
              description: "Generate 10-15 highly optimized SEO keywords based on the person's skills, job title, industry, and location."
            },
            seoDescription: { 
              type: SchemaType.STRING, 
              description: "Generate a highly optimized SEO meta description (under 160 characters) summarizing their professional profile."
            },
            experience: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  company: { type: SchemaType.STRING },
                  position: { type: SchemaType.STRING },
                  startDate: { type: SchemaType.STRING },
                  endDate: { type: SchemaType.STRING },
                  description: { type: SchemaType.STRING }
                }
              }
            },
            education: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  institution: { type: SchemaType.STRING },
                  degree: { type: SchemaType.STRING },
                  startDate: { type: SchemaType.STRING },
                  endDate: { type: SchemaType.STRING },
                  description: { type: SchemaType.STRING }
                }
              }
            },
            skills: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
            }
          }
        }
      }
    });
    
    const prompt = `
You are an expert resume parser. Extract the following information from the provided CV text.
Return the output strictly as a JSON object matching the provided schema.

CV Text:
${text}
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let cleanResponse = response.text().trim();
      
      // Robustly extract just the JSON object from the response
      const firstBrace = cleanResponse.indexOf('{');
      const lastBrace = cleanResponse.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleanResponse = cleanResponse.substring(firstBrace, lastBrace + 1);
      }
      
      cleanResponse = cleanResponse.trim();

      const parsedData = JSON.parse(cleanResponse);
      return NextResponse.json({ success: true, data: parsedData });
    } catch (aiError: any) {
      console.error('Gemini API Error:', aiError);
      return NextResponse.json({ success: false, error: 'AI Model failed to process the CV. ' + aiError.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Parse CV Route Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
