from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import logging
import asyncio
import time
import fitz # PyMuPDF
import os
import json
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

# Load environment variables from .env file (for local development)
load_dotenv(dotenv_path="../.env")

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

class YTDLLogger:
    def debug(self, msg):
        logger.info(f"YT-DLP DEBUG: {msg}")
    def info(self, msg):
        logger.info(f"YT-DLP INFO: {msg}")
    def warning(self, msg):
        logger.warning(f"YT-DLP WARN: {msg}")
    def error(self, msg):
        logger.error(f"YT-DLP ERROR: {msg}")

app = FastAPI(title="YouTube Downloader API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VideoRequest(BaseModel):
    url: str

@app.post("/api/info")
async def get_video_info(request: VideoRequest):
    logger.info(f"--> Requesting: {request.url}")
    
    # These are the most stable options for Hugging Face right now.
    # Using ONLY the iOS client often bypasses the SSL EOF error.
    ydl_opts = {
        'skip_download': True,
        'quiet': True,
        'no_warnings': True,
        'cookiefile': 'cookies.txt',
        'nocheckcertificate': True,
        # Force the TV client - No JS runtime needed!
        'extractor_args': {'youtube': ['player_client=android,mweb']},
        'user_agent': 'Mozilla/5.0 (SMART-TV; LINUX; Tizen 5.0) AppleWebkit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 TV Safari/537.36',
    }
    
    def fetch():
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # process=False gets raw data without checking ffmpeg/JS
            info = ydl.extract_info(request.url, download=False, process=False)
            if not info:
                raise Exception("YouTube did not return any raw data.")
            return info

    try:
        info_dict = await asyncio.to_thread(fetch)
        
        video_formats = []
        audio_formats = []
        
        # When process=False, YouTube data is often in 'streamingData'
        raw_formats = info_dict.get('formats', [])
        if not raw_formats and 'streamingData' in info_dict:
            sd = info_dict['streamingData']
            raw_formats = sd.get('formats', []) + sd.get('adaptiveFormats', [])

        for f in raw_formats:
            url = f.get('url') or f.get('signatureCipher') or f.get('cipher')
            if not url: continue
            
            # Handle signatureCipher if present
            if 'signatureCipher' in f or 'cipher' in f:
                # We can't easily decrypt cipher in raw mode without yt-dlp processing
                continue 

            is_video = 'video' in f.get('mimeType', '')
            res = f.get('qualityLabel') or f.get('height')
            
            format_obj = {
                'url': url,
                'ext': f.get('mimeType', '').split(';')[0].split('/')[-1],
                'resolution': str(res) if res else 'Unknown',
                'filesize': f.get('contentLength'),
                'vcodec': 'none' if not is_video else 'exists'
            }

            if is_video:
                video_formats.append(format_obj)
            else:
                audio_formats.append(format_obj)
            
        return {
            "success": True,
            "title": info_dict.get('title'),
            "thumbnail": info_dict.get('thumbnail'),
            "duration": info_dict.get('duration'),
            "video_formats": video_formats[:15], # Limit count to keep response small
            "audio_formats": audio_formats[:10],
        }
    except Exception as e:
        logger.error(f"Failed: {str(e)}")
        return {"success": False, "error": str(e)}

@app.post("/api/parse-cv")
async def parse_cv(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        # Read the uploaded PDF file in memory
        content = await file.read()
        
        # Extract text using PyMuPDF
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
            
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract any text from the PDF.")
            
        # Call Hugging Face API
        hf_token = os.getenv("HUGGINGFACE_API_KEY")
        if not hf_token:
            raise HTTPException(status_code=500, detail="Hugging Face API key not configured on server.")
            
        # Using a reliable free model (Mistral or Llama-3 depending on availability)
        client = InferenceClient(model="mistralai/Mistral-7B-Instruct-v0.2", token=hf_token)
        
        prompt = f"""
You are an expert resume parser. Extract the following information from the provided CV text.
Return the output strictly as a JSON object with the following structure, and do not include any other text or markdown formatting outside of the JSON block:
{{
  "name": "Full Name",
  "about": "A short professional summary",
  "email": "email address",
  "phone": "phone number",
  "location": "city, country",
  "experience": [
    {{
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "Start Date",
      "endDate": "End Date or Present",
      "description": "Short description of responsibilities"
    }}
  ],
  "education": [
    {{
      "institution": "School/University Name",
      "degree": "Degree Name",
      "startDate": "Start Date",
      "endDate": "End Date",
      "description": "Details"
    }}
  ],
  "skills": ["Skill 1", "Skill 2"]
}}

CV Text:
{text}
"""
        response = client.text_generation(prompt, max_new_tokens=1500, temperature=0.1)
        
        # Try to parse the JSON from the response
        try:
            # Clean the response in case the model wraps it in markdown code blocks
            clean_response = response.strip()
            if clean_response.startswith('```json'):
                clean_response = clean_response[7:]
            if clean_response.startswith('```'):
                clean_response = clean_response[3:]
            if clean_response.endswith('```'):
                clean_response = clean_response[:-3]
            
            parsed_data = json.loads(clean_response)
            return {"success": True, "data": parsed_data}
        except json.JSONDecodeError:
            logger.error(f"Failed to parse model output as JSON: {{response}}")
            return {"success": False, "error": "Model did not return valid JSON.", "raw_output": response}

    except Exception as e:
        logger.error(f"CV Parsing failed: {{str(e)}}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Downloader API Online"}
