import { NextResponse } from 'next/server';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
const PDFParser = require('pdf2json');

// Helper to wrap pdf2json in a Promise
function parsePdfBuffer(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
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

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ success: false, error: 'Only PDF files are supported.' }, { status: 400 });
    }

    // Convert the uploaded file to a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF
    let text = '';
    try {
      text = await parsePdfBuffer(buffer);
      // pdf2json includes some formatting artifacts like \r\n and Page markers. Let's clean it up slightly.
      text = text.replace(/\r\n/g, ' ').replace(/[-]+Page \(\d+\) Break[-]+/g, '');
    } catch (parseError: any) {
      console.error('PDF parsing error:', parseError);
      return NextResponse.json({ success: false, error: 'Failed to extract text from PDF.' }, { status: 500 });
    }

    if (!text.trim()) {
      return NextResponse.json({ success: false, error: 'Could not extract any text from the PDF.' }, { status: 400 });
    }

    // Prepare Hugging Face API request
    const hfToken = process.env.HUGGINGFACE_API_KEY;
    if (!hfToken) {
      console.error("HUGGINGFACE_API_KEY is not configured.");
      return NextResponse.json({ success: false, error: 'AI processing is not configured on the server.' }, { status: 500 });
    }

    // Mistral-7B is generally a good reliable free model for instruct tasks
    const modelUrl = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
    
    const prompt = `
You are an expert resume parser. Extract the following information from the provided CV text.
Return the output strictly as a JSON object with the following structure, and do not include any other text or markdown formatting outside of the JSON block:
{
  "name": "Full Name",
  "about": "A short professional summary",
  "email": "email address",
  "phone": "phone number",
  "location": "city, country",
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "Start Date",
      "endDate": "End Date or Present",
      "description": "Short description of responsibilities"
    }
  ],
  "education": [
    {
      "institution": "School/University Name",
      "degree": "Degree Name",
      "startDate": "Start Date",
      "endDate": "End Date",
      "description": "Details"
    }
  ],
  "skills": ["Skill 1", "Skill 2"]
}

CV Text:
${text}
`;

    const response = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        inputs: prompt,
        parameters: {
          max_new_tokens: 1500,
          temperature: 0.1,
          return_full_text: false,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API Error:', errorText);
      return NextResponse.json({ success: false, error: 'AI Model failed to process the CV. Make sure your API token is valid.' }, { status: 500 });
    }

    const aiResult = await response.json();
    let responseText = '';
    
    if (Array.isArray(aiResult) && aiResult.length > 0) {
      responseText = aiResult[0].generated_text || '';
    } else {
      responseText = aiResult.generated_text || '';
    }

    // Clean up response if the model returned markdown code blocks
    let cleanResponse = responseText.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.substring(7);
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.substring(3);
    }
    if (cleanResponse.endsWith('```')) {
      cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3);
    }
    cleanResponse = cleanResponse.trim();

    try {
      const parsedData = JSON.parse(cleanResponse);
      return NextResponse.json({ success: true, data: parsedData });
    } catch (jsonError) {
      console.error('JSON parsing failed. Raw response:', responseText);
      return NextResponse.json({ success: false, error: 'The AI model did not return valid JSON.', raw_output: responseText }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Parse CV Route Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
