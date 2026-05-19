from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import logging
import asyncio
import time

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

@app.get("/")
def read_root():
    return {"message": "Downloader API Online"}
