export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolStep {
  step: number;
  title: string;
  description: string;
}

export interface ToolFeature {
  title: string;
  description: string;
  iconName?: string;
}

export interface ToolDefinition {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  category: 'pdf' | 'image' | 'ocr' | 'audio' | 'text' | 'dev' | 'video';
  categoryName: string;
  icon: string;
  badge?: string;
  gradient: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  features: ToolFeature[];
  howToSteps: ToolStep[];
  faqs: ToolFAQ[];
  relatedSlugs: string[];
}

export const CATEGORIES = [
  { id: 'all', name: 'All Tools', icon: 'Sparkles', count: 36 },
  { id: 'pdf', name: 'PDF Tools', icon: 'FileText', count: 15 },
  { id: 'image', name: 'Image Tools', icon: 'Image', count: 5 },
  { id: 'ocr', name: 'OCR & Vision', icon: 'ScanText', count: 2 },
  { id: 'audio', name: 'Audio & Speech', icon: 'Mic', count: 2 },
  { id: 'text', name: 'Text Utilities', icon: 'Type', count: 5 },
  { id: 'dev', name: '3D & Dev Tools', icon: 'Code2', count: 6 },
  { id: 'video', name: 'Video Tools', icon: 'Video', count: 2 },
] as const;

export const TOOLS_DATA: Record<string, ToolDefinition> = {
  'jpg-to-pdf': {
    id: 'jpg-to-pdf',
    slug: 'jpg-to-pdf',
    title: 'JPG to PDF Converter',
    shortTitle: 'JPG to PDF',
    tagline: 'Convert JPG, PNG, and WebP images to high-quality PDF documents online in seconds. 100% private, processed in your browser.',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'FileImage',
    badge: 'Popular',
    gradient: 'from-rose-500 to-red-600',
    metaTitle: 'Free JPG to PDF Converter Online - Fast & 100% Private',
    metaDescription: 'Convert JPG, JPEG, and PNG images into high-resolution PDF documents online for free. No file upload to servers, no limits, instant download.',
    keywords: [
      'jpg to pdf',
      'convert jpg to pdf online',
      'image to pdf converter',
      'png to pdf free',
      'pictures to pdf',
      'best free jpg to pdf'
    ],
    features: [
      {
        title: '100% In-Browser Privacy',
        description: 'Your images are never sent to a remote server. Everything is compiled directly in your browser using WebAssembly and canvas.'
      },
      {
        title: 'Custom Margins & Orientation',
        description: 'Choose portrait or landscape layout and adjust page margins (None, Small, or Normal) to fit your document needs.'
      },
      {
        title: 'Batch Reordering',
        description: 'Upload multiple images, drag to reorder pages, and merge them into a single organized PDF document.'
      },
      {
        title: 'Zero File Size Limits',
        description: 'No 5MB or 10MB limits imposed by cloud converters. Process as many photos as your device memory allows.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Select or Drop Images',
        description: 'Choose one or multiple JPG, PNG, or WebP files from your computer or phone.'
      },
      {
        step: 2,
        title: 'Customize Layout & Page Order',
        description: 'Select page orientation (Portrait/Landscape), choose margin spacing, and reorder images as desired.'
      },
      {
        step: 3,
        title: 'Generate & Download PDF',
        description: 'Click "Convert to PDF" and instantly download your crisp, perfectly formatted PDF file.'
      }
    ],
    faqs: [
      {
        question: 'Is this JPG to PDF converter completely free?',
        answer: 'Yes, this converter is 100% free with no hidden paywalls, no watermark, and no registration required.'
      },
      {
        question: 'Are my photos or documents uploaded to your servers?',
        answer: 'No! Unlike traditional converters, our tool runs purely client-side in your web browser. Your private documents never leave your computer or smartphone.'
      },
      {
        question: 'Can I combine multiple pictures into one PDF?',
        answer: 'Absolutely. You can upload dozens of photos at once, reorder them as pages, and export them into a single consolidated PDF.'
      },
      {
        question: 'What image formats are supported?',
        answer: 'We support JPG, JPEG, PNG, WebP, GIF, and SVG formats.'
      }
    ],
    relatedSlugs: ['pdf-to-jpg', 'merge-pdf', 'image-compressor', 'image-resizer']
  },

  'pdf-to-jpg': {
    id: 'pdf-to-jpg',
    slug: 'pdf-to-jpg',
    title: 'PDF to JPG Converter',
    shortTitle: 'PDF to JPG',
    tagline: 'Extract and convert PDF pages into high-resolution JPG images. Fast, crisp rendering with zero cloud uploads.',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'FileSpreadsheet',
    badge: 'Trending',
    gradient: 'from-amber-500 to-orange-600',
    metaTitle: 'Free PDF to JPG Converter Online - High Resolution Page Extractor',
    metaDescription: 'Extract PDF pages to high-resolution JPG images online. Fast, secure, zero file uploads, download individual pages or all images in one click.',
    keywords: [
      'pdf to jpg',
      'convert pdf to jpg online',
      'extract images from pdf',
      'pdf to image free',
      'pdf to picture converter'
    ],
    features: [
      {
        title: 'High DPI Image Rendering',
        description: 'Render pages in ultra-crisp resolution suitable for printing, presentations, or sharing.'
      },
      {
        title: 'Single or Multi-Page Download',
        description: 'Preview all rendered pages and download individual pages or all pages at once.'
      },
      {
        title: 'Client-Side Security',
        description: 'Confidential PDF contracts, financial statements, and IDs stay secure on your local device.'
      },
      {
        title: 'Lightning Speed',
        description: 'Eliminates cloud server upload and download queues by rendering directly via browser hardware acceleration.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Upload Your PDF Document',
        description: 'Click to browse or drag and drop any PDF file into the converter area.'
      },
      {
        step: 2,
        title: 'Preview Rendered Pages',
        description: 'Our in-browser engine will immediately render each page as an ultra-clear preview.'
      },
      {
        step: 3,
        title: 'Download JPGs',
        description: 'Download specific page images or grab all pages in high quality with one click.'
      }
    ],
    faqs: [
      {
        question: 'How do I convert a multi-page PDF to JPG?',
        answer: 'Upload your document and our system will render each page individually. You can download each page as a JPG with a single click.'
      },
      {
        question: 'Does this compromise document confidentiality?',
        answer: 'Not at all. The entire rendering process is done inside your browser. No PDF contents are ever uploaded to any third party.'
      },
      {
        question: 'What is the resolution of the output JPGs?',
        answer: 'Pages are rendered at high DPI (up to 2x display scaling) ensuring razor-sharp text and vibrant graphics.'
      }
    ],
    relatedSlugs: ['jpg-to-pdf', 'merge-pdf', 'split-pdf', 'pdf-to-text']
  },

  'merge-pdf': {
    id: 'merge-pdf',
    slug: 'merge-pdf',
    title: 'Merge PDF Online',
    shortTitle: 'Merge PDF',
    tagline: 'Combine multiple PDF files into one single document in seconds. Easy drag-and-drop reordering with complete privacy.',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'Layers',
    badge: 'Essential',
    gradient: 'from-violet-500 to-purple-600',
    metaTitle: 'Merge PDF Files Online Free - Combine PDFs in Seconds',
    metaDescription: 'Combine multiple PDF documents into a single file online. Fast, secure, drag and drop to reorder, 100% private in-browser merging.',
    keywords: [
      'merge pdf',
      'combine pdf online',
      'join pdf files free',
      'merge pdf documents',
      'pdf combiner free'
    ],
    features: [
      {
        title: 'Drag & Drop Reordering',
        description: 'Arrange and organize the sequence of your files easily before merging.'
      },
      {
        title: 'Lossless Quality',
        description: 'Maintains original vector text, embedded fonts, and high-res images without degradation.'
      },
      {
        title: 'Zero File Limits',
        description: 'Merge 2 or 50 PDFs without running into artificial paywalls or limits.'
      },
      {
        title: 'Private & Offline Capable',
        description: 'Processed entirely on your computer or mobile device using pdf-lib.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Upload Two or More PDFs',
        description: 'Select all the PDF files you wish to combine into one single document.'
      },
      {
        step: 2,
        title: 'Reorder Files',
        description: 'Drag and drop or use the up/down arrows to put the files in your preferred sequence.'
      },
      {
        step: 3,
        title: 'Merge and Download',
        description: 'Click "Merge PDFs" to instantly stitch them together and save the output.'
      }
    ],
    faqs: [
      {
        question: 'Can I reorder the PDF files before merging?',
        answer: 'Yes! You can reorder files up and down with our intuitive buttons to achieve the exact order you need.'
      },
      {
        question: 'Is there a limit on how many files I can combine?',
        answer: 'No artificial limits! You can combine as many PDFs as your system memory supports.'
      },
      {
        question: 'Will the merged document lose bookmarks or quality?',
        answer: 'Our engine preserves all original vector graphics, font embeddings, and imagery with lossless fidelity.'
      }
    ],
    relatedSlugs: ['split-pdf', 'jpg-to-pdf', 'pdf-to-jpg', 'pdf-to-text']
  },

  'split-pdf': {
    id: 'split-pdf',
    slug: 'split-pdf',
    title: 'Split PDF Online',
    shortTitle: 'Split PDF',
    tagline: 'Extract specific pages or page ranges from any PDF document quickly and privately.',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'Split',
    gradient: 'from-blue-500 to-cyan-600',
    metaTitle: 'Split PDF Online Free - Extract Pages from PDF Document',
    metaDescription: 'Extract specific pages or page ranges from any PDF online. Free, secure, client-side tool with instant download.',
    keywords: [
      'split pdf',
      'extract pdf pages',
      'separate pdf pages',
      'cut pdf pages online',
      'split pdf free'
    ],
    features: [
      {
        title: 'Range or Single Page Selection',
        description: 'Extract ranges like "1-5, 8, 11-14" or individual pages with precision.'
      },
      {
        title: 'Instant Extraction',
        description: 'Lightning-fast client-side page slicing powered by pdf-lib.'
      },
      {
        title: '100% Confidential',
        description: 'Sensitive pages stay completely on your machine.'
      },
      {
        title: 'Page Count Detection',
        description: 'Automatically detects and displays the total number of pages in your document.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Upload Your PDF',
        description: 'Choose any PDF file from your device.'
      },
      {
        step: 2,
        title: 'Specify Pages to Extract',
        description: 'Enter your desired page numbers or ranges (e.g., "1-3, 5").'
      },
      {
        step: 3,
        title: 'Download New PDF',
        description: 'Click "Split & Extract" to immediately download the sliced PDF.'
      }
    ],
    faqs: [
      {
        question: 'How do I specify page ranges to split?',
        answer: 'Enter comma-separated numbers and ranges, such as "1-4, 7, 9-12". The tool extracts those exact pages.'
      },
      {
        question: 'Can I extract a single page from a 100-page PDF?',
        answer: 'Yes! Simply enter the single page number (e.g., "42") to extract just that one page.'
      }
    ],
    relatedSlugs: ['merge-pdf', 'pdf-to-jpg', 'jpg-to-pdf', 'pdf-to-text']
  },

  'image-compressor': {
    id: 'image-compressor',
    slug: 'image-compressor',
    title: 'Image Compressor Online',
    shortTitle: 'Image Compressor',
    tagline: 'Reduce JPG, PNG, and WebP image file sizes by up to 90% without visible loss in quality.',
    category: 'image',
    categoryName: 'Image Tools',
    icon: 'Minimize2',
    badge: 'Popular',
    gradient: 'from-emerald-500 to-teal-600',
    metaTitle: 'Compress Image Online Free - Reduce JPG, PNG & WebP Size',
    metaDescription: 'Compress images online for free without losing quality. Reduce file size of JPG, PNG, and WebP photos by up to 90%. Instant client-side compression.',
    keywords: [
      'compress image',
      'reduce image file size',
      'compress jpg online',
      'compress png free',
      'image size reducer',
      'tinypng alternative free'
    ],
    features: [
      {
        title: 'Adjustable Quality Slider',
        description: 'Tune quality between 10% and 100% with real-time file size and savings calculation.'
      },
      {
        title: 'Side-by-Side Comparison',
        description: 'Compare original vs. compressed image preview to ensure no perceptible quality loss.'
      },
      {
        title: 'Multiple Formats Supported',
        description: 'Seamlessly optimize JPG, JPEG, PNG, and next-gen WebP formats.'
      },
      {
        title: '100% In-Browser Compression',
        description: 'Uses HTML5 Canvas and offscreen compression algorithms without cloud latency.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Upload Image',
        description: 'Drag and drop your image or select it from your device.'
      },
      {
        step: 2,
        title: 'Adjust Compression Level',
        description: 'Move the quality slider to find your preferred balance between file size and sharpness.'
      },
      {
        step: 3,
        title: 'Download Compressed File',
        description: 'Inspect the percentage saved and download your optimized image instantly.'
      }
    ],
    faqs: [
      {
        question: 'Will compressing my image make it blurry?',
        answer: 'Our smart compression algorithm removes redundant metadata and imperceptible color data, retaining crisp visual sharpness down to 70-80% quality.'
      },
      {
        question: 'How much can I reduce my file size?',
        answer: 'Typically, users achieve between 60% and 85% file size reduction for high-resolution camera photos.'
      },
      {
        question: 'Is there a limit on how many images I can compress?',
        answer: 'No limits! You can compress as many images as you need, completely free.'
      }
    ],
    relatedSlugs: ['image-resizer', 'jpg-to-png', 'jpg-to-pdf', 'image-to-text']
  },

  'image-resizer': {
    id: 'image-resizer',
    slug: 'image-resizer',
    title: 'Image Resizer Online',
    shortTitle: 'Image Resizer',
    tagline: 'Resize JPG, PNG, and WebP images by exact pixels or percentage while maintaining aspect ratio.',
    category: 'image',
    categoryName: 'Image Tools',
    icon: 'Scaling',
    gradient: 'from-cyan-500 to-blue-600',
    metaTitle: 'Free Image Resizer Online - Change Dimensions in Pixels or %',
    metaDescription: 'Resize images online for free. Change dimensions by width, height, or percentage with aspect ratio lock. Fast in-browser image scaler.',
    keywords: [
      'image resizer',
      'resize image online',
      'change image dimensions',
      'resize picture in pixels',
      'photo resizer free'
    ],
    features: [
      {
        title: 'Aspect Ratio Lock',
        description: 'Keep proportions locked so your images never look stretched or squished.'
      },
      {
        title: 'Presets for Social Media',
        description: 'Quick presets for Instagram (1080x1080), YouTube thumbnails (1280x720), and Twitter.'
      },
      {
        title: 'Percentage or Exact Pixels',
        description: 'Scale down by 50%, 25%, or type exact target width and height.'
      },
      {
        title: 'Format Converter On Export',
        description: 'Export your resized image as JPG, PNG, or modern WebP format.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Upload Image',
        description: 'Drop any image into the tool to read its current width and height.'
      },
      {
        step: 2,
        title: 'Set Target Dimensions',
        description: 'Enter desired width/height or choose a percentage reduction.'
      },
      {
        step: 3,
        title: 'Download Resized Image',
        description: 'Click "Resize & Download" for an instant, sharp output file.'
      }
    ],
    faqs: [
      {
        question: 'Does resizing reduce image file size?',
        answer: 'Yes! Reducing pixel dimensions directly shrinks the total file size substantially.'
      },
      {
        question: 'Can I upscale an image to larger dimensions?',
        answer: 'Yes, though slight softening may occur if the original resolution is low.'
      }
    ],
    relatedSlugs: ['image-compressor', 'jpg-to-png', 'jpg-to-pdf']
  },

  'jpg-to-png': {
    id: 'jpg-to-png',
    slug: 'jpg-to-png',
    title: 'Image Format Converter',
    shortTitle: 'Image Converter',
    tagline: 'Convert images between JPG, PNG, WebP, and BMP formats with a single click. Zero quality loss.',
    category: 'image',
    categoryName: 'Image Tools',
    icon: 'RefreshCw',
    gradient: 'from-pink-500 to-rose-600',
    metaTitle: 'Free Image Converter Online - JPG to PNG, WebP & More',
    metaDescription: 'Convert images to PNG, JPG, or WebP online for free. Transparent background support, high speed, and 100% private in-browser conversion.',
    keywords: [
      'jpg to png',
      'png to jpg',
      'convert image to webp',
      'image format converter online',
      'png converter free'
    ],
    features: [
      {
        title: 'Multi-Format Conversion',
        description: 'Switch freely between JPG, PNG, WebP, and other standard formats.'
      },
      {
        title: 'Transparency Retention',
        description: 'Preserve alpha transparency when converting to PNG or WebP.'
      },
      {
        title: 'Instant Browser Processing',
        description: 'No waiting in queue, converted natively using modern Canvas APIs.'
      },
      {
        title: 'Lossless Mode',
        description: 'Guarantees maximum clarity and color reproduction.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Upload Your Image',
        description: 'Drag and drop any image file.'
      },
      {
        step: 2,
        title: 'Select Target Format',
        description: 'Choose whether you want PNG, JPG, or WebP.'
      },
      {
        step: 3,
        title: 'Convert & Save',
        description: 'Hit Convert and download the converted image immediately.'
      }
    ],
    faqs: [
      {
        question: 'Why should I convert JPG to PNG?',
        answer: 'PNG supports transparent backgrounds and lossless compression, making it ideal for logos, graphics, and text-heavy images.'
      },
      {
        question: 'Why convert to WebP?',
        answer: 'WebP provides superior compression and smaller file sizes compared to JPG and PNG without sacrificing visual clarity.'
      }
    ],
    relatedSlugs: ['image-compressor', 'image-resizer', 'jpg-to-pdf']
  },

  'image-to-text': {
    id: 'image-to-text',
    slug: 'image-to-text',
    title: 'Image to Text Converter (OCR)',
    shortTitle: 'Image to Text',
    tagline: 'Extract text from images, screenshots, scanned documents, and photos using AI-powered optical character recognition.',
    category: 'ocr',
    categoryName: 'OCR Tools',
    icon: 'ScanText',
    badge: 'AI Powered',
    gradient: 'from-indigo-500 to-blue-600',
    metaTitle: 'Free Image to Text Converter Online (OCR) - Extract Text from Photos',
    metaDescription: 'Extract editable text from images, photos, and screenshots online for free. AI-powered in-browser OCR with 1-click copy and text download.',
    keywords: [
      'image to text',
      'ocr online free',
      'extract text from image',
      'picture to text converter',
      'screenshot to text online'
    ],
    features: [
      {
        title: 'In-Browser AI OCR',
        description: 'Extracts printed and handwritten text using Tesseract WebAssembly engine.'
      },
      {
        title: 'Multiple Language Support',
        description: 'Recognizes English, Spanish, French, German, and more.'
      },
      {
        title: 'One-Click Copy & Export',
        description: 'Instantly copy recognized text to your clipboard or download as a .txt file.'
      },
      {
        title: 'Complete Document Privacy',
        description: 'Scanned receipts, bills, and sensitive forms stay on your device.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Upload Image or Screenshot',
        description: 'Select an image containing text, receipt, book page, or document.'
      },
      {
        step: 2,
        title: 'Run AI OCR Recognition',
        description: 'Click "Extract Text" and watch the neural recognition engine process the characters.'
      },
      {
        step: 3,
        title: 'Copy or Download Text',
        description: 'Edit, review, copy to clipboard, or save as a text document.'
      }
    ],
    faqs: [
      {
        question: 'How accurate is this image to text OCR tool?',
        answer: 'Our OCR engine offers 98%+ accuracy on high-contrast scanned documents, clean screenshots, and clear printed text.'
      },
      {
        question: 'Can I extract text from a mobile screenshot?',
        answer: 'Yes! Screenshots from iPhone, Android, or desktop computers work exceptionally well.'
      },
      {
        question: 'Is my scanned data kept private?',
        answer: 'Yes, 100%. The OCR engine executes inside your browser via WebAssembly without uploading images anywhere.'
      }
    ],
    relatedSlugs: ['pdf-to-text', 'word-counter', 'case-converter', 'image-compressor']
  },

  'pdf-to-text': {
    id: 'pdf-to-text',
    slug: 'pdf-to-text',
    title: 'PDF to Text Converter',
    shortTitle: 'PDF to Text',
    tagline: 'Extract all digital text and readable content from PDF documents into clean, editable plain text.',
    category: 'ocr',
    categoryName: 'OCR Tools',
    icon: 'FileText',
    gradient: 'from-teal-500 to-emerald-600',
    metaTitle: 'PDF to Text Converter Online Free - Extract Text from PDF',
    metaDescription: 'Extract text from any PDF file online for free. Fast, private, no file uploads, copy text or download as TXT file in one click.',
    keywords: [
      'pdf to text',
      'extract text from pdf',
      'convert pdf to text free',
      'read pdf text online',
      'pdf to txt'
    ],
    features: [
      {
        title: 'Batch Page Text Extraction',
        description: 'Pulls readable text across all pages in the PDF document.'
      },
      {
        title: 'Clean Text Formatting',
        description: 'Strips unwanted formatting artifacts for easy copy-pasting.'
      },
      {
        title: 'One-Click Download',
        description: 'Download the compiled text as a lightweight .txt file.'
      },
      {
        title: 'Zero Latency',
        description: 'Reads digital text streams directly in your browser.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Choose PDF File',
        description: 'Select your PDF document.'
      },
      {
        step: 2,
        title: 'Extract Content',
        description: 'Click "Extract Text" to process all embedded digital text streams.'
      },
      {
        step: 3,
        title: 'Copy or Save',
        description: 'Copy the text with one click or export to a .txt file.'
      }
    ],
    faqs: [
      {
        question: 'Does this work on scanned PDFs?',
        answer: 'This tool extracts native digital text. For scanned paper documents or photos of pages, use our Image to Text (OCR) tool!'
      },
      {
        question: 'Can I extract text from password-protected files?',
        answer: 'If the document requires an opening password, you must decrypt it first.'
      }
    ],
    relatedSlugs: ['image-to-text', 'pdf-to-jpg', 'split-pdf', 'word-counter']
  },

  'voice-message-to-text': {
    id: 'voice-message-to-text',
    slug: 'voice-message-to-text',
    title: 'Audio to Text & WhatsApp Voice Transcriber',
    shortTitle: 'Audio to Text',
    tagline: 'Transcribe audio files, WhatsApp voice notes, and recordings directly to text using in-browser Whisper AI. Also supports real-time live microphone dictation.',
    category: 'audio',
    categoryName: 'Audio Tools',
    icon: 'Mic',
    badge: 'Whisper AI',
    gradient: 'from-amber-500 to-red-500',
    metaTitle: 'Free Audio to Text & WhatsApp Voice Transcriber - Whisper AI Online',
    metaDescription: 'Transcribe WhatsApp audio, voice notes, MP3, WAV, and M4A directly to text online for free with OpenAI Whisper AI in your browser. 100% private, zero uploads.',
    keywords: [
      'audio to text',
      'whatsapp voice message to text',
      'voice note to text free',
      'transcribe audio file online',
      'whisper speech to text online',
      'voice to text converter'
    ],
    features: [
      {
        title: 'Direct Audio File Transcription',
        description: 'Upload WhatsApp voice notes (.opus, .ogg), MP3, WAV, M4A, or AAC files and transcribe directly with Whisper AI.'
      },
      {
        title: 'Multi-lingual Speech AI',
        description: 'Transcribe speech in English, Urdu, Hindi, Spanish, French, Arabic, German, and 10+ languages.'
      },
      {
        title: '100% Client-Side Privacy',
        description: 'Audio is decoded and processed completely inside your browser. No voice recordings are ever sent to external cloud servers.'
      },
      {
        title: 'Live Microphone Voice Typing',
        description: 'Switch to live dictation mode to speak directly into your microphone with instant real-time text output.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Upload Audio File or Choose Dictation',
        description: 'Select an audio file (WhatsApp voice note, MP3, WAV, M4A) or switch to the Live Dictation tab.'
      },
      {
        step: 2,
        title: 'Select Language & Transcribe',
        description: 'Choose your audio language (or Auto-detect) and click "Transcribe Audio with Whisper AI".'
      },
      {
        step: 3,
        title: 'Copy or Download Text',
        description: 'Review the transcribed text, copy it with 1-click, or export as a .txt file.'
      }
    ],
    faqs: [
      {
        question: 'How does direct audio file transcription work without uploading to a server?',
        answer: 'We run OpenAI Whisper directly in your web browser using WebAssembly and Web Audio API. Your computer processes the audio file locally with complete privacy and zero data transfer.'
      },
      {
        question: 'Can I transcribe WhatsApp voice messages (.opus / .ogg)?',
        answer: 'Yes! Simply save or forward the WhatsApp voice note to your computer or phone and upload the .opus, .ogg, .m4a, or .mp3 file directly.'
      },
      {
        question: 'Which languages are supported?',
        answer: 'Our multi-lingual Whisper AI model supports English, Urdu, Hindi, Spanish, French, German, Arabic, Chinese, Portuguese, Italian, Japanese, and more.'
      },
      {
        question: 'Is there a limit on audio file length?',
        answer: 'Because processing happens entirely on your local device, there are no artificial subscription paywalls or file limits. Standard voice notes and audio clips transcribe in seconds.'
      }
    ],
    relatedSlugs: ['word-counter', 'case-converter', 'image-to-text']
  },

  'word-counter': {
    id: 'word-counter',
    slug: 'word-counter',
    title: 'Word & Character Counter',
    shortTitle: 'Word Counter',
    tagline: 'Count words, characters, sentences, paragraphs, reading time, speaking time, and keyword density in real-time.',
    category: 'text',
    categoryName: 'Text Tools',
    icon: 'Type',
    badge: 'Popular',
    gradient: 'from-blue-600 to-indigo-600',
    metaTitle: 'Free Word Counter Online - Character, Sentence & Reading Time Stats',
    metaDescription: 'Accurate online word counter and character counter. Calculate words, characters with/without spaces, sentences, reading time, and keyword density in real time.',
    keywords: [
      'word counter',
      'character counter',
      'word count online',
      'character count with spaces',
      'reading time calculator',
      'keyword density checker'
    ],
    features: [
      {
        title: 'Real-Time Metrics',
        description: 'Instant counting for words, characters (with and without spaces), sentences, and paragraphs.'
      },
      {
        title: 'Estimated Reading & Speaking Time',
        description: 'Know exactly how long your essay, blog post, or speech will take to present.'
      },
      {
        title: 'Top Keyword Density Table',
        description: 'Identifies the most frequent words and their percentage density for SEO optimization.'
      },
      {
        title: 'Social Media Character Limits',
        description: 'Visual progress trackers for X / Twitter (280), Instagram caption (2,200), and LinkedIn post (3,000).'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Paste or Type Text',
        description: 'Type directly into the editor or paste text from an article, essay, or draft.'
      },
      {
        step: 2,
        title: 'Review Detailed Metrics',
        description: 'View live counts of words, characters, reading time, and keyword frequency.'
      },
      {
        step: 3,
        title: 'Copy or Clear',
        description: 'One-click copy formatted text or clear with one button.'
      }
    ],
    faqs: [
      {
        question: 'Does this count spaces as characters?',
        answer: 'We provide both stats side-by-side: Character count including spaces and character count excluding spaces.'
      },
      {
        question: 'How is reading time calculated?',
        answer: 'Reading time is calculated using the standard average reading speed of 225 words per minute.'
      },
      {
        question: 'Can I check keyword density for SEO?',
        answer: 'Yes! The keyword density table automatically displays your top keywords, occurrences, and percentage.'
      }
    ],
    relatedSlugs: ['case-converter', 'json-formatter', 'image-to-text', 'voice-message-to-text']
  },

  'case-converter': {
    id: 'case-converter',
    slug: 'case-converter',
    title: 'Text Case Converter',
    shortTitle: 'Case Converter',
    tagline: 'Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case instantly.',
    category: 'text',
    categoryName: 'Text Tools',
    icon: 'CaseSensitive',
    gradient: 'from-purple-500 to-indigo-600',
    metaTitle: 'Free Case Converter Online - UPPERCASE, lowercase, Title Case & More',
    metaDescription: 'Convert any text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, or kebab-case online for free with 1-click copy.',
    keywords: [
      'case converter',
      'uppercase to lowercase',
      'title case converter',
      'sentence case online',
      'camelcase converter',
      'snake case to camelcase'
    ],
    features: [
      {
        title: '8+ Format Conversions',
        description: 'Convert between Sentence case, lower case, UPPER CASE, Title Case, camelCase, snake_case, kebab-case, and PascalCase.'
      },
      {
        title: 'Instant 1-Click Copy',
        description: 'Copy any converted variation with a single tap.'
      },
      {
        title: 'Whitespace Cleaner',
        description: 'Trim leading, trailing, and duplicate spaces automatically.'
      },
      {
        title: 'Live Character Counter',
        description: 'See immediate word and character counts as you transform.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Enter Your Text',
        description: 'Type or paste the text you want to transform.'
      },
      {
        step: 2,
        title: 'Select Desired Case',
        description: 'Click any case style button (e.g. "Title Case", "UPPER CASE", "camelCase").'
      },
      {
        step: 3,
        title: 'Copy Transformed Text',
        description: 'Click the copy button and paste your formatted text anywhere.'
      }
    ],
    faqs: [
      {
        question: 'What is Title Case?',
        answer: 'Title Case capitalizes the first letter of major words while keeping conjunctions, prepositions, and articles lowercase.'
      },
      {
        question: 'Is this useful for programmers?',
        answer: 'Yes! Developers frequently use our camelCase, snake_case, and kebab-case buttons for variable and CSS naming.'
      }
    ],
    relatedSlugs: ['word-counter', 'json-formatter', 'base64-tool']
  },

  'json-formatter': {
    id: 'json-formatter',
    slug: 'json-formatter',
    title: 'JSON Formatter & Validator',
    shortTitle: 'JSON Formatter',
    tagline: 'Format, beautify, validate, and minify JSON data with instant syntax error highlighting and clean tree view.',
    category: 'dev',
    categoryName: 'Developer Tools',
    icon: 'Code2',
    badge: 'Popular',
    gradient: 'from-emerald-500 to-cyan-600',
    metaTitle: 'Free JSON Formatter & Validator Online - Beautify, Minify & Inspect JSON',
    metaDescription: 'Format, beautify, validate, and minify JSON data online for free. Instant syntax error highlighting, 2 or 4 space indentation, and 1-click copy.',
    keywords: [
      'json formatter',
      'json validator',
      'beautify json online',
      'format json string',
      'json minifier free',
      'json parser online'
    ],
    features: [
      {
        title: 'Syntax Error Detection',
        description: 'Pinpoints missing commas, brackets, and syntax errors with clear line numbers.'
      },
      {
        title: '2-Space, 4-Space & Tab Indent',
        description: 'Choose your desired indentation style to match your codebase.'
      },
      {
        title: 'Minify & Compact',
        description: 'Remove all unnecessary whitespace for production payloads with one click.'
      },
      {
        title: '100% In-Browser Privacy',
        description: 'Sensitive API responses, payloads, and tokens are never posted to an external server.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Paste Raw JSON',
        description: 'Paste unformatted or minified JSON text into the editor, or click "Load Sample".'
      },
      {
        step: 2,
        title: 'Format or Minify',
        description: 'Click "Beautify" to format with clean indentations, or "Minify" to compress into one line.'
      },
      {
        step: 3,
        title: 'Copy or Download',
        description: 'Copy the valid JSON with one click or save as a .json file.'
      }
    ],
    faqs: [
      {
        question: 'Is my JSON data kept private?',
        answer: 'Yes! Unlike many online tools that send your JSON to a backend server, our tool validates and formats 100% locally in your browser.'
      },
      {
        question: 'Does this detect syntax errors?',
        answer: 'Yes! If your JSON is invalid, the validator highlights the exact error reason and position.'
      },
      {
        question: 'Can I format large JSON files?',
        answer: 'Yes, our lightweight engine comfortably parses multi-megabyte payloads in milliseconds.'
      }
    ],
    relatedSlugs: ['base64-tool', 'word-counter', 'case-converter']
  },

  'base64-tool': {
    id: 'base64-tool',
    slug: 'base64-tool',
    title: 'Base64 Encoder & Decoder',
    shortTitle: 'Base64 Tool',
    tagline: 'Encode and decode text and files to and from Base64 format instantly. 100% private in-browser tool.',
    category: 'dev',
    categoryName: 'Developer Tools',
    icon: 'Binary',
    gradient: 'from-cyan-500 to-indigo-600',
    metaTitle: 'Free Base64 Encoder & Decoder Online - Text & File Converter',
    metaDescription: 'Encode or decode text and files to and from Base64 online for free. Fast, private, in-browser developer utility with 1-click copy.',
    keywords: [
      'base64 encoder',
      'base64 decoder',
      'encode text to base64',
      'decode base64 online',
      'base64 string converter free'
    ],
    features: [
      {
        title: 'Two-Way Conversion',
        description: 'Easily switch between Encode mode and Decode mode.'
      },
      {
        title: 'UTF-8 & Special Character Support',
        description: 'Accurately handles emojis, foreign accents, and non-ASCII characters.'
      },
      {
        title: 'File to Base64 Data URL',
        description: 'Upload any image or document to generate an instant Data URL.'
      },
      {
        title: '1-Click Copy & Download',
        description: 'Copy encoded/decoded text instantly to clipboard.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Choose Mode',
        description: 'Select either "Encode to Base64" or "Decode from Base64".'
      },
      {
        step: 2,
        title: 'Enter Text or File',
        description: 'Type or paste your content in the input area.'
      },
      {
        step: 3,
        title: 'View Result & Copy',
        description: 'Copy the transformed result with a single tap.'
      }
    ],
    faqs: [
      {
        question: 'What is Base64 encoding used for?',
        answer: 'Base64 is used to encode binary data into an ASCII string format, commonly used in email attachments, data URLs in web pages, and API transfers.'
      },
      {
        question: 'Does Base64 provide encryption?',
        answer: 'No, Base64 is an encoding format, not an encryption method. Anyone can easily decode a Base64 string.'
      }
    ],
    relatedSlugs: ['json-formatter', 'case-converter', 'word-counter']
  },

  'word-to-pdf': {
    id: 'word-to-pdf',
    slug: 'word-to-pdf',
    title: 'Word to PDF Converter',
    shortTitle: 'Word to PDF',
    tagline: 'Convert Microsoft Word (.docx) documents to crisp, high-quality PDF files online with 100% in-browser privacy and formatting preservation.',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'FileText',
    badge: 'Essential',
    gradient: 'from-blue-600 to-indigo-600',
    metaTitle: 'Free Word to PDF Converter Online - Convert DOCX to PDF',
    metaDescription: 'Convert Microsoft Word documents (.docx) to PDF online for free. Preserves formatting, tables, lists, and images with 100% privacy in your browser.',
    keywords: [
      'word to pdf',
      'convert word to pdf online',
      'docx to pdf free',
      'convert docx to pdf',
      'word document to pdf',
      'best free word to pdf'
    ],
    features: [
      {
        title: 'Preserves Complex Formatting',
        description: 'Maintains headings, bulleted lists, tables, bold/italic text, and embedded images accurately.'
      },
      {
        title: 'Customizable PDF Layout',
        description: 'Choose A4, US Letter, or Legal paper sizes, portrait or landscape orientation, and custom margins.'
      },
      {
        title: 'Vector Print to PDF',
        description: 'Built-in support for browser-native vector PDF generation ensuring 100% sharp text.'
      },
      {
        title: '100% In-Browser Privacy',
        description: 'Your confidential business documents are parsed directly on your device and never uploaded to remote servers.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Upload Word Document',
        description: 'Select or drag and drop your .docx file into the converter.'
      },
      {
        step: 2,
        title: 'Preview & Customize Layout',
        description: 'Review the live paginated preview and adjust paper size or margins if desired.'
      },
      {
        step: 3,
        title: 'Download PDF',
        description: 'Click "Download PDF" to save your high-resolution document instantly.'
      }
    ],
    faqs: [
      {
        question: 'Will my formatting and tables look identical?',
        answer: 'Yes! Our parser extracts Word styling, tables, font weights, and embedded graphics into clean PDF layout.'
      },
      {
        question: 'Is my Word document uploaded to a server?',
        answer: 'No. The entire conversion process occurs locally in your browser using WebAssembly. Your data never leaves your computer.'
      },
      {
        question: 'Can I convert large DOCX files?',
        answer: 'Yes, multi-page business reports, academic papers, and resumes convert seamlessly in seconds.'
      }
    ],
    relatedSlugs: ['pdf-to-word', 'pdf-editor', 'word-editor', 'merge-pdf']
  },

  'pdf-to-word': {
    id: 'pdf-to-word',
    slug: 'pdf-to-word',
    title: 'PDF to Word (.docx) Converter',
    shortTitle: 'PDF to Word',
    tagline: 'Convert PDF files into fully editable Microsoft Word (.docx) documents with intelligent heading and paragraph detection.',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'FileCode',
    badge: 'Popular',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-600',
    metaTitle: 'Free PDF to Word Converter Online - Convert PDF to DOCX',
    metaDescription: 'Convert PDF documents to editable Microsoft Word files (.docx) online for free. Preserves headings, text flow, and structure with zero cloud uploads.',
    keywords: [
      'pdf to word',
      'convert pdf to word online',
      'pdf to docx converter free',
      'pdf to editable docx',
      'convert pdf to word document',
      'best free pdf to word'
    ],
    features: [
      {
        title: 'Genuine Microsoft Word (.docx)',
        description: 'Generates real Office Open XML .docx files that open natively in Microsoft Word, Google Docs, and LibreOffice.'
      },
      {
        title: 'Smart Heading Detection',
        description: 'Automatically recognizes titles, subheadings, and body paragraphs based on font scale and positioning.'
      },
      {
        title: 'Page Break Preservation',
        description: 'Maintains distinct page boundaries so your converted Word document matches the original PDF layout.'
      },
      {
        title: 'Instant Text Extraction',
        description: 'Quickly preview formatted text or copy all extracted text to your clipboard with a single click.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Upload PDF File',
        description: 'Drag and drop your PDF document into the upload area.'
      },
      {
        step: 2,
        title: 'Automatic Extraction',
        description: 'Our engine extracts text lines, headings, and structure page-by-page in real time.'
      },
      {
        step: 3,
        title: 'Download Word Document',
        description: 'Click "Download Word (.docx)" to edit your document freely in Microsoft Word.'
      }
    ],
    faqs: [
      {
        question: 'Can I edit the converted file in Microsoft Word?',
        answer: 'Yes! The output is a genuine .docx file with editable paragraphs, headings, and fonts.'
      },
      {
        question: 'Does this work on scanned PDFs?',
        answer: 'For digital PDFs, it extracts all vector text directly. For scanned image-only PDFs, use our Image to Text (OCR) tool.'
      },
      {
        question: 'Is there a page limit?',
        answer: 'Because processing runs client-side on your device, you can convert documents without paywalls or restrictive limits.'
      }
    ],
    relatedSlugs: ['word-to-pdf', 'pdf-editor', 'word-editor', 'pdf-to-text']
  },

  'pdf-editor': {
    id: 'pdf-editor',
    slug: 'pdf-editor',
    title: 'Free Online PDF Editor',
    shortTitle: 'PDF Editor',
    tagline: 'The ultimate in-browser PDF editor: Add text, draw digital signatures, highlight, redact private data, apply rubber stamps, and watermark.',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'PenTool',
    badge: 'Pro Suite',
    gradient: 'from-rose-600 via-pink-600 to-purple-600',
    metaTitle: 'Free Online PDF Editor - Edit, Sign, Highlight, Stamp & Redact PDFs',
    metaDescription: 'Edit PDF documents online for free. Add text, draw digital signatures, highlight, redact confidential information, insert stamps, and rotate pages with 100% privacy.',
    keywords: [
      'pdf editor',
      'edit pdf online free',
      'sign pdf online',
      'pdf annotator free',
      'redact pdf online',
      'add text to pdf',
      'watermark pdf free'
    ],
    features: [
      {
        title: 'Add & Edit Custom Text',
        description: 'Click anywhere to place text annotations with custom fonts, sizes, colors, and positioning.'
      },
      {
        title: 'Digital Signature Pad',
        description: 'Draw your signature with smooth vector strokes or type with elegant cursive script fonts.'
      },
      {
        title: 'Censorship & Redaction',
        description: 'Permanently blackout confidential information, ID numbers, or sensitive financial data.'
      },
      {
        title: 'Rubber Stamps & Watermarks',
        description: '1-click insert APPROVED, CONFIDENTIAL, DRAFT, and PAID stamps, or apply diagonal watermarks.'
      },
      {
        title: 'Organize & Rotate Pages',
        description: 'Rotate pages 90°/180°, delete unwanted pages, and reorder document sequence.'
      },
      {
        title: '100% Vector PDF Compilation',
        description: 'Uses pdf-lib to burn modifications directly into valid vector PDF bytes for crisp printing.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Open Your PDF',
        description: 'Select or drag and drop any PDF into the editor workspace.'
      },
      {
        step: 2,
        title: 'Annotate, Sign & Redact',
        description: 'Use the top toolbar to add text, sign, highlight, stamp, or rotate pages.'
      },
      {
        step: 3,
        title: 'Save & Download',
        description: 'Click "Save & Download PDF" to compile your edited document with crisp vector quality.'
      }
    ],
    faqs: [
      {
        question: 'Are my digital signatures legally binding?',
        answer: 'Electronic signatures placed via our tool are standard digital annotations suitable for contracts, approvals, and invoices.'
      },
      {
        question: 'Does the redaction actually remove sensitive data?',
        answer: 'Yes! Redaction boxes are burned permanently onto the page graphics context so the covered content cannot be viewed.'
      },
      {
        question: 'Is my confidential PDF uploaded to your servers?',
        answer: 'No. All editing and compilation happens strictly inside your browser using pdf-lib and WebAssembly.'
      }
    ],
    relatedSlugs: ['word-to-pdf', 'pdf-to-word', 'merge-pdf', 'split-pdf']
  },

  'word-editor': {
    id: 'word-editor',
    slug: 'word-editor',
    title: 'Online Word & Document Editor',
    shortTitle: 'Word Editor',
    tagline: 'Full-featured WYSIWYG document editor with pre-made templates, rich formatting, real-time analytics, and instant export to DOCX, PDF, and Markdown.',
    category: 'text',
    categoryName: 'Text Utilities',
    icon: 'FileText',
    badge: 'New',
    gradient: 'from-blue-600 via-indigo-600 to-violet-600',
    metaTitle: 'Free Online Word & Document Editor - Create & Edit DOCX Files',
    metaDescription: 'Edit and create Word documents online for free. Rich formatting, templates for resumes and proposals, find & replace, and export to DOCX, PDF, HTML, or Markdown.',
    keywords: [
      'online word editor',
      'free docx editor',
      'word processor online',
      'edit docx in browser',
      'free google docs alternative',
      'create word document online'
    ],
    features: [
      {
        title: 'Rich WYSIWYG Word Processor',
        description: 'Complete formatting suite: headings, fonts, colors, lists, tables, image insertion, and code blocks.'
      },
      {
        title: 'Professional Template Library',
        description: '1-click load pre-designed templates for Resumes, Cover Letters, Project Proposals, and Invoices.'
      },
      {
        title: 'Multi-Format Export',
        description: 'Download your work as genuine Microsoft Word (.docx), high-res PDF, Markdown, HTML, or Plain Text.'
      },
      {
        title: 'Find & Replace Engine',
        description: 'Easily search for words across long documents and replace individual or all occurrences.'
      },
      {
        title: 'Real-Time Writing Analytics',
        description: 'Tracks word count, character count, and estimated reading time live as you write.'
      },
      {
        title: 'Auto-Save & Local Backup',
        description: 'Your document is automatically saved to local browser storage so work is never lost.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Start Writing or Load File',
        description: 'Type from scratch, pick a template (Resume, Cover Letter), or open an existing .docx file.'
      },
      {
        step: 2,
        title: 'Format & Polish',
        description: 'Use the toolbar to style headings, insert tables, add images, and adjust layout.'
      },
      {
        step: 3,
        title: 'Export to DOCX or PDF',
        description: 'Click "Save .DOCX" or "PDF" to download your finished document instantly.'
      }
    ],
    faqs: [
      {
        question: 'Can I open an existing Word (.docx) file?',
        answer: 'Yes! Click "Open DOCX" to import your Word document directly into the editor.'
      },
      {
        question: 'Will my work be saved if I accidentally close the tab?',
        answer: 'Yes, our editor automatically caches your draft in browser localStorage so your content is preserved.'
      },
      {
        question: 'Is it completely free without subscriptions?',
        answer: 'Yes, 100% free with zero paywalls, account requirements, or watermark restrictions.'
      }
    ],
    relatedSlugs: ['word-to-pdf', 'pdf-to-word', 'pdf-editor', 'word-counter']
  },

  'image-editor': {
    id: 'image-editor',
    slug: 'image-editor',
    title: 'Professional Online Image Editor',
    shortTitle: 'Image Editor',
    tagline: 'Comprehensive photo studio in your browser: Crop, rotate, aesthetic filters, freehand brush, text overlays, color eyedropper, and social media presets.',
    category: 'image',
    categoryName: 'Image Tools',
    icon: 'Image',
    badge: 'Pro Studio',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    metaTitle: 'Free Online Image Editor - Filters, Crop, Brush, Text & Social Presets',
    metaDescription: 'Edit photos online for free in your browser. Crop, rotate, adjust brightness & contrast, apply aesthetic filters, add text overlays, and export for Instagram, YouTube, and TikTok.',
    keywords: [
      'image editor online',
      'photo editor free',
      'crop image online',
      'photo filters online',
      'add text to image',
      'instagram photo resizer',
      'online photoshop alternative free'
    ],
    features: [
      {
        title: 'Filters & Pro Adjustments',
        description: 'Fine-tune brightness, contrast, saturation, exposure, sepia, blur, hue, and 1-click aesthetic presets (Vintage, Cyberpunk, Noir).'
      },
      {
        title: 'Social Media Presets',
        description: '1-click format for Instagram Post (1:1), Story/Reel (9:16), YouTube Thumbnail (16:9), Twitter Banner, and LinkedIn Cover.'
      },
      {
        title: 'Freehand Brush & Doodling',
        description: 'Draw smoothly with custom brush colors, stroke sizes, and eraser mode.'
      },
      {
        title: 'Draggable Text Overlays',
        description: 'Overlay custom meme and promotional text with Impact, Inter, and Georgia fonts with background badges.'
      },
      {
        title: 'Live Eyedropper Color Picker',
        description: 'Sample exact pixel colors anywhere on your photo to match color schemes and copy HEX codes.'
      },
      {
        title: 'Before vs After Comparison',
        description: 'Hold the comparison button to instantly view original vs edited photo side-by-side.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Upload or Paste Image',
        description: 'Drag and drop an image or paste directly from your clipboard (Ctrl+V).'
      },
      {
        step: 2,
        title: 'Edit & Enhance',
        description: 'Adjust lighting, apply filters, crop for social media, draw, or add text overlays.'
      },
      {
        step: 3,
        title: 'Export in High Quality',
        description: 'Choose PNG, JPG, or WebP with custom quality compression and download.'
      }
    ],
    faqs: [
      {
        question: 'Does editing reduce image resolution?',
        answer: 'No! Our canvas engine preserves the full native resolution of your uploaded image.'
      },
      {
        question: 'Can I paste images directly from my clipboard?',
        answer: 'Yes! Simply press Ctrl+V (or Cmd+V on Mac) anywhere on the page to paste screenshots immediately.'
      },
      {
        question: 'Are my photos private and secure?',
        answer: 'Yes. All image transformations and filters are rendered on your local device GPU without uploading to any remote server.'
      }
    ],
    relatedSlugs: ['image-compressor', 'image-resizer', 'jpg-to-png', 'image-to-text']
  },

  'screenshot-studio': {
    id: 'screenshot-studio',
    slug: 'screenshot-studio',
    title: 'Screenshot Studio & Mockup Generator',
    shortTitle: 'Screenshot Studio',
    tagline: 'Transform screenshots into stunning, marketing-ready mockups with macOS & browser frames, aesthetic gradient backdrops, 3D tilt, and instant in-browser screen capture.',
    category: 'image',
    categoryName: 'Image Tools',
    icon: 'Camera',
    badge: 'Specialist',
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    metaTitle: 'Free Screenshot Studio & Mockup Generator Online - macOS Frames & 3D Tilt',
    metaDescription: 'Capture your screen or paste screenshots to generate studio-grade mockups with macOS window frames, browser tabs, beautiful gradient backgrounds, and numbered step badges. 100% free and in-browser.',
    keywords: [
      'screenshot mockup generator',
      'screenshot beautifier online',
      'shots so alternative free',
      'ray so alternative',
      'macos window screenshot generator',
      'screen capture to mockup',
      'browser mockup generator'
    ],
    features: [
      {
        title: '1-Click Screen & Tab Capture',
        description: 'Capture any desktop window, application screen, or browser tab directly in high-DPI resolution without installing plugins.'
      },
      {
        title: 'macOS & Browser Frames',
        description: 'Wrap your image in authentic macOS traffic-light frames, light/dark modes, or Safari browser windows with customizable URL bars.'
      },
      {
        title: 'Studio Mesh Gradients',
        description: 'Choose from vibrant designer gradients (Hyper Mesh, Sunset Glow, Aurora Teal, Obsidian Dark) or transparent backgrounds.'
      },
      {
        title: '3D Perspective & Shadows',
        description: 'Dial in 3D tilt angles, corner radiuses, inset shadows, and custom canvas padding for social media appeal.'
      },
      {
        title: 'Numbered Step Badges',
        description: 'Click anywhere to place numbered step callout badges (1, 2, 3...) for software guides and tutorial documentation.'
      },
      {
        title: 'Instant Clipboard Copy',
        description: 'Copy the compiled image directly to your clipboard to paste instantly into Twitter, Slack, LinkedIn, or Notion.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Capture or Paste Screenshot',
        description: 'Click "Capture Screen" to grab your window or press Ctrl+V to paste an existing screenshot.'
      },
      {
        step: 2,
        title: 'Customize Frame & Studio Backdrop',
        description: 'Select macOS or browser frames, pick a mesh gradient, and adjust 3D tilt and padding.'
      },
      {
        step: 3,
        title: 'Copy or Download 4K Mockup',
        description: '1-click copy directly to your clipboard or download in crystal-clear 4K PNG.'
      }
    ],
    faqs: [
      {
        question: 'How do I take a screenshot directly in the tool?',
        answer: 'Simply click "Capture Screen / Tab" and pick the browser tab, app window, or entire screen you wish to capture in high resolution.'
      },
      {
        question: 'Can I paste a screenshot from my clipboard?',
        answer: 'Yes! Press Ctrl+V (or Cmd+V on macOS) anywhere on the page and your screenshot will appear in the studio immediately.'
      },
      {
        question: 'Can I use the exported mockups commercially?',
        answer: 'Yes! All mockups generated are 100% royalty-free and yours to use in marketing materials, social posts, portfolios, and docs.'
      }
    ],
    relatedSlugs: ['image-editor', 'image-compressor', 'image-to-text']
  },

  'resume-builder': {
    id: 'resume-builder',
    slug: 'resume-builder',
    title: 'Minimalist Resume & CV Builder',
    shortTitle: 'Resume Builder',
    tagline: 'Create recruiter-approved, single-page PDF resumes in seconds with zero login walls, distraction-free markdown inputs, and local-first privacy.',
    category: 'text',
    categoryName: 'Text & Career',
    icon: 'FileText',
    badge: 'Popular',
    gradient: 'from-blue-600 via-indigo-600 to-sky-600',
    metaTitle: 'Free Minimalist Resume Builder Online - No Login, Instant Clean PDF',
    metaDescription: 'Build modern, clean, single-page resumes online for free. No login walls or subscriptions. Recruiter-approved formatting, instant PDF export, and local-first privacy.',
    keywords: [
      'minimalist resume builder',
      'free resume builder no sign up',
      'clean cv maker online',
      'developer resume template pdf',
      'markdown resume builder',
      'harvard style resume builder free'
    ],
    features: [
      {
        title: 'Zero Login & No Paywalls',
        description: 'No accounts, no email gates, and no watermarks. Open the tool, craft your resume, and download.'
      },
      {
        title: 'Recruiter-Approved Minimalist Design',
        description: 'Clean typography, single-page layout hierarchy, and ATS-friendly parsing structure.'
      },
      {
        title: 'Local-First Privacy',
        description: 'All contact details and career history stay private in your browser localStorage without server tracking.'
      },
      {
        title: 'Instant High-DPI Vector Print',
        description: '1-click native print engine ensures crisp vector text and sharp lines at any zoom level.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Fill Your Career Details',
        description: 'Enter your summary, experience bullets, education, and technical competencies.'
      },
      {
        step: 2,
        title: 'Pick Theme & Typography',
        description: 'Toggle between Minimalist, Modern Tech, and Classic Serif styling.'
      },
      {
        step: 3,
        title: 'Download Clean PDF',
        description: 'Click "Download PDF" to generate your job application resume.'
      }
    ],
    faqs: [
      {
        question: 'Is this resume builder truly 100% free?',
        answer: 'Yes! There are no hidden fees, paywalls, or subscriptions. You can export as many PDF copies as you need.'
      },
      {
        question: 'Is my personal data saved to an external database?',
        answer: 'No. All data is saved exclusively inside your local browser storage.'
      }
    ],
    relatedSlugs: ['word-editor', 'pdf-editor', 'invoice-generator']
  },

  'invoice-generator': {
    id: 'invoice-generator',
    slug: 'invoice-generator',
    title: 'Simple PDF Invoice & Receipt Generator',
    shortTitle: 'Invoice Generator',
    tagline: 'Generate clean, professional PDF invoices and client receipts with auto-calculated taxes, discounts, and custom currencies. Zero database setup.',
    category: 'dev',
    categoryName: 'Finance & Tools',
    icon: 'DollarSign',
    badge: 'Popular',
    gradient: 'from-emerald-600 via-teal-600 to-green-600',
    metaTitle: 'Free Invoice Generator Online - Instant PDF Invoices & Receipts',
    metaDescription: 'Create professional freelance and small business invoices online in seconds. Auto-calculate subtotals, tax rates, and discounts with 1-click clean PDF download.',
    keywords: [
      'simple invoice generator online',
      'free pdf invoice maker',
      'freelance receipt generator',
      'no login invoice builder',
      'contractor bill generator'
    ],
    features: [
      {
        title: 'Instant PDF Invoicing',
        description: 'Type line items, hourly rates, and client details, then generate an audit-ready PDF invoice.'
      },
      {
        title: 'Auto-Calculated Taxes & Discounts',
        description: 'Automatic subtotaling, custom percentage discounts, and multi-jurisdiction tax rate calculations.'
      },
      {
        title: 'Multi-Currency Support',
        description: 'Supports USD ($), EUR (€), GBP (£), INR (₹), JPY (¥), and CHF (Fr.).'
      },
      {
        title: 'Payment & Wire Instructions',
        description: 'Include your IBAN, ACH routing, SWIFT code, PayPal, or Stripe payment links directly on the bill.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Enter Billing Parties',
        description: 'Fill in your business name and address alongside your client details and issue dates.'
      },
      {
        step: 2,
        title: 'Add Services & Line Items',
        description: 'Add project deliverables, hours worked, unit rates, and applicable tax percentages.'
      },
      {
        step: 3,
        title: 'Print or Save PDF',
        description: 'Export a professional PDF invoice ready to email to your client.'
      }
    ],
    faqs: [
      {
        question: 'Do I need an account to bill a client?',
        answer: 'No account is needed. You can create and export invoices instantly.'
      },
      {
        question: 'Can I reuse this invoice for repeat clients?',
        answer: 'Yes! Your latest invoice data is preserved in browser storage so you can easily update dates and line items for future bills.'
      }
    ],
    relatedSlugs: ['smart-calculator', 'resume-builder', 'pdf-editor']
  },

  'smart-calculator': {
    id: 'smart-calculator',
    slug: 'smart-calculator',
    title: 'Niche Unit, Rate & Financial Calculators',
    shortTitle: 'Smart Calculators',
    tagline: 'Specialized calculation utilities: Print-bleed DPI dimensions, freelance hourly billing rates, compound investment growth, and file transfer durations.',
    category: 'dev',
    categoryName: 'Calculators & Math',
    icon: 'Calculator',
    badge: 'Utility',
    gradient: 'from-amber-600 via-orange-600 to-yellow-600',
    metaTitle: 'Niche Calculators Online - Print Bleed DPI, Freelance Rates & Growth',
    metaDescription: 'Instant-load, ad-free calculators for designers, developers, and freelancers. Calculate print-bleed canvas sizes, target hourly rates, compound growth, and data bandwidth.',
    keywords: [
      'print bleed calculator online',
      'dpi to pixel calculator',
      'freelance hourly rate calculator',
      'compound interest calculator instant',
      'file transfer time estimator'
    ],
    features: [
      {
        title: 'Print & Bleed Canvas Calculator',
        description: 'Convert print dimensions (inches/mm) to exact canvas pixel requirements with bleed margin allowances at 72, 150, 300, and 600 DPI.'
      },
      {
        title: 'Freelancer Hourly & Day Rate Estimator',
        description: 'Calculate your exact target billing rate based on billable hours, business expenses, and tax liabilities.'
      },
      {
        title: 'Compound Growth Projection',
        description: 'Calculate long-term future wealth with initial principal, monthly contributions, and compounding interest.'
      },
      {
        title: 'Data & Bandwidth Estimator',
        description: 'Calculate exact real-world download and upload durations for multi-gigabyte datasets over any network speed.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Select Calculator Mode',
        description: 'Choose Print Bleed, Freelance Rate, Compound Growth, or Data Transfer.'
      },
      {
        step: 2,
        title: 'Input Project Variables',
        description: 'Slide or type values to see live instant calculations.'
      },
      {
        step: 3,
        title: 'Copy Accurate Results',
        description: '1-click copy calculated pixel dimensions or billing targets.'
      }
    ],
    faqs: [
      {
        question: 'Why does print bleed matter?',
        answer: 'Bleed margins ensure that when print sheets are trimmed, no white edge borders appear on the final product.'
      }
    ],
    relatedSlugs: ['invoice-generator', 'image-resizer', 'dev-text-converter']
  },

  'dev-text-converter': {
    id: 'dev-text-converter',
    slug: 'dev-text-converter',
    title: 'Plain-Text, Markdown & Data Conversion Utilities',
    shortTitle: 'Data Converter',
    tagline: 'Fast browser-based data converters: CSV to JSON, Markdown to HTML, CSS/JS code minifier, and email list de-duplicator with zero latency.',
    category: 'dev',
    categoryName: 'Developer Tools',
    icon: 'Code2',
    badge: 'Utility',
    gradient: 'from-purple-600 via-violet-600 to-indigo-600',
    metaTitle: 'Free Data & Markdown Converter Online - CSV to JSON, HTML & Minifier',
    metaDescription: 'Convert CSV to JSON, Markdown to HTML, minify CSS and JavaScript, and deduplicate list lines directly in your browser. 100% private, client-side execution.',
    keywords: [
      'csv to json online converter',
      'markdown to html clean converter',
      'css minifier free online',
      'email list deduplicator',
      'remove duplicate lines online'
    ],
    features: [
      {
        title: 'Two-Way CSV ↔ JSON Conversion',
        description: 'Convert spreadsheet CSV exports into structured JSON arrays of objects and vice versa with 1 click.'
      },
      {
        title: 'Markdown ↔ Clean HTML',
        description: 'Convert markdown content into semantic, cleanly structured HTML markup with zero extraneous wrapper tags.'
      },
      {
        title: 'Code Minifier & Whitespace Compactor',
        description: 'Strip comments, compress whitespace, and minimize CSS and JavaScript payload sizes.'
      },
      {
        title: 'Email & Text List De-duplicator',
        description: 'Remove duplicate lines, normalize casing, sort alphabetically, and report removal counts.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Select Conversion Tool',
        description: 'Pick CSV ↔ JSON, Markdown ↔ HTML, Minifier, or List De-duplicator.'
      },
      {
        step: 2,
        title: 'Paste Your Text or Code',
        description: 'Paste your raw data into the left input pane.'
      },
      {
        step: 3,
        title: 'Copy or Download Output',
        description: 'Copy the converted output or download it directly as a formatted file.'
      }
    ],
    faqs: [
      {
        question: 'Is my data transmitted over the internet?',
        answer: 'No. All conversions happen entirely in your browser using client-side JavaScript.'
      }
    ],
    relatedSlugs: ['json-formatter', 'case-converter', 'word-counter']
  },

  'focus-habit-tracker': {
    id: 'focus-habit-tracker',
    slug: 'focus-habit-tracker',
    title: 'Single-Screen Focus & Habit Tracker',
    shortTitle: 'Focus Tracker',
    tagline: 'Distraction-free productivity workspace: 25-minute Deep Work Pomodoro timer, 7-day habit streak check-in grid, and priority scratchpad in one clean tab.',
    category: 'text',
    categoryName: 'Focus & Productivity',
    icon: 'Clock',
    badge: 'Productivity',
    gradient: 'from-rose-600 via-pink-600 to-red-600',
    metaTitle: 'Single-Screen Focus & Habit Tracker Online - Pomodoro & Streak Grid',
    metaDescription: 'Distraction-free focus timer and daily habit streak tracker. No logins, no social feeds, zero notification spam. Minimalist Pomodoro and daily goal scratchpad.',
    keywords: [
      'minimalist pomodoro timer online',
      'daily habit streak tracker grid',
      'distraction free focus tracker',
      'single screen productivity tool',
      'deep work timer browser'
    ],
    features: [
      {
        title: 'Deep Work Pomodoro Timer',
        description: 'Customizable 25-minute focus intervals and 5/15-minute breaks with audio chime synthesizer.'
      },
      {
        title: '7-Day Habit Streak Grid',
        description: 'GitHub-style streak matrix to track daily consistency across your top habits with 1-click check-ins.'
      },
      {
        title: '3 Daily Priorities Checklist',
        description: 'Focus exclusively on your 3 non-negotiable daily objectives to eliminate cognitive overload.'
      },
      {
        title: 'Auto-Saved Scratchpad',
        description: 'Instantly jot thoughts, notes, and ideas during focus blocks without switching context or losing data.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Start a 25-Minute Focus Block',
        description: 'Press "Start Focus" to begin uninterrupted deep work.'
      },
      {
        step: 2,
        title: 'Check Off Habits & Goals',
        description: 'Toggle your daily habit squares and complete your 3 primary objectives.'
      },
      {
        step: 3,
        title: 'Build Consistent Streaks',
        description: 'Keep this lightweight tab pinned to maintain steady productivity without burnout.'
      }
    ],
    faqs: [
      {
        question: 'Does the timer work if I switch browser tabs?',
        answer: 'Yes! The timer runs smoothly in background tabs and chimes when your session finishes.'
      }
    ],
    relatedSlugs: ['word-counter', 'smart-calculator', 'resume-builder']
  },

  'music-studio': {
    id: 'music-studio',
    slug: 'music-studio',
    title: 'Real-Time Music Collaboration & DAW Studio',
    shortTitle: 'Music Studio',
    tagline: 'Ultra-low latency browser-based DAW inspired by BandLab and Sessionwire: 16-step drum machine, polyphonic synthesizer keyboard, live microphone recording, and virtual session jam rooms.',
    category: 'audio',
    categoryName: 'Audio & Music',
    icon: 'Music',
    badge: 'Specialist',
    gradient: 'from-violet-600 via-indigo-600 to-pink-600',
    metaTitle: 'Free Online Music Collaboration Studio & DAW - Low Latency Web Audio',
    metaDescription: 'Make music online in real-time. Full browser DAW featuring a 16-step drum sequencer, virtual polyphonic synth keyboard, live microphone recorder, stereo visualizer, and Sessionwire-style jam rooms.',
    keywords: [
      'online music collaboration web app',
      'browser daw free online',
      'sessionwire alternative free',
      'bandlab browser alternative',
      'online drum machine sequencer',
      'web audio synthesizer keyboard',
      'low latency online recording studio'
    ],
    features: [
      {
        title: 'Ultra-Low Latency Audio Engine',
        description: 'Zero-lag sound generation using modern Web Audio API with sub-10ms hardware monitoring and latency compensation.'
      },
      {
        title: '16-Step Drum Machine & Beat Sequencer',
        description: '4-voice drum matrix (Kick, Snare, Hi-Hat, Clap) with genre patterns (House, Trap, Lo-Fi) and tap tempo BPM.'
      },
      {
        title: 'Polyphonic Synthesizer & Virtual Keys',
        description: '2-octave piano keyboard with Sawtooth, Square, Sine, and Triangle waveforms, low-pass filter, and ADSR envelope controls.'
      },
      {
        title: 'Live Vocal & Mic Recording',
        description: 'Record microphone takes with hardware echo cancellation, noise suppression, and synchronized DAW playback.'
      },
      {
        title: 'Sessionwire-Style Virtual Jam Room',
        description: 'Create and join collaborative studio session rooms with room codes, live audio presence, and arranger chat.'
      },
      {
        title: 'Real-Time Stereo Frequency Visualizer',
        description: 'Live 64-band frequency spectrum analyser animating your mix on master bus playback.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Build Your Beat & Melody',
        description: 'Click steps on the drum machine or play melodies using your keyboard on the virtual synth.'
      },
      {
        step: 2,
        title: 'Track Vocals or Instruments',
        description: 'Arm Track 4 to record live microphone vocals synchronized with your background beat.'
      },
      {
        step: 3,
        title: 'Invite Collaborators to Jam',
        description: 'Share your 6-digit room code to collaborate remotely with bandmates in real-time.'
      }
    ],
    faqs: [
      {
        question: 'How does the app achieve low latency in the browser?',
        answer: 'All audio synthesis runs directly on your local device CPU/GPU through the native Web Audio API without passing through cloud servers, keeping audio roundtrip delay under 10ms.'
      },
      {
        question: 'Can I record with a USB microphone or audio interface?',
        answer: 'Yes! Any USB microphone, audio interface (Focusrite, PreSonus), or built-in laptop mic is fully supported.'
      },
      {
        question: 'Do I need to install plugins or software?',
        answer: 'No plugins or downloads required. Everything runs 100% inside your standard browser.'
      }
    ],
    relatedSlugs: ['voice-message-to-text', 'focus-habit-tracker', 'video-editor']
  },

  'interior-planner': {
    id: 'interior-planner',
    slug: 'interior-planner',
    title: 'Planner 5D Virtual Interior & 3D Floor Planner',
    shortTitle: 'Interior Planner',
    tagline: 'Design realistic 2D blueprints and interactive 3D virtual interiors with drag-and-drop furniture, customizable oak/marble flooring, wall paint palettes, and smart ergonomic layout suggestions.',
    category: 'dev',
    categoryName: '3D & Design',
    icon: 'Home',
    badge: 'Specialist',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    metaTitle: 'Free Online 3D Interior & Floor Planner - Planner 5D Web Alternative',
    metaDescription: 'Create virtual 3D room designs and 2D floor plans directly in your browser. Customize room dimensions, arrange living/bedroom/office furniture, pick hardwood or marble flooring, and export high-res blueprints.',
    keywords: [
      'planner 5d online alternative free',
      '3d interior design web app',
      'free floor plan creator online',
      'room layout planner 3d browser',
      'virtual home decor mockup tool',
      'furniture layout planner free'
    ],
    features: [
      {
        title: '2D Blueprint & 3D Isometric Engine',
        description: 'Seamlessly toggle between precise architectural 2D floor plans with dimension grids and realistic 3D isometric perspectives.'
      },
      {
        title: 'Drag-and-Drop Furniture Catalog',
        description: 'Extensive library of living room sectionals, king beds, standing desks, coffee tables, and plants with realistic scale.'
      },
      {
        title: 'Flooring & Wall Customizer',
        description: 'Choose from White Oak, Dark Walnut, Carrara Marble, or Polished Concrete alongside a curated interior designer paint palette.'
      },
      {
        title: '3D Orbit & Day/Golden/Night Lighting',
        description: 'Rotate camera orbit 360°, adjust tilt elevation, and preview room ambiance under bright daylight, golden hour, or evening lighting.'
      },
      {
        title: 'Ergonomic Clearance Checker',
        description: 'Built-in interior rules validate coffee table legroom, primary walkway clearances, and optimal TV viewing distances.'
      },
      {
        title: 'Live Bill of Materials & Cost Estimate',
        description: 'Instant square footage and budget calculations tallying flooring costs, wall paint gallons, and furniture expenditures.'
      }
    ],
    howToSteps: [
      {
        step: 1,
        title: 'Set Room Dimensions',
        description: 'Input width, length, and ceiling height, or load a pre-built designer template.'
      },
      {
        step: 2,
        title: 'Choose Finishes & Place Furniture',
        description: 'Pick hardwood or marble flooring, select wall paint, and drag furniture items onto the floor.'
      },
      {
        step: 3,
        title: 'Preview in 3D & Export',
        description: 'Switch to 3D mode to orbit the space and export high-resolution PNG blueprints or snapshots.'
      }
    ],
    faqs: [
      {
        question: 'Does this 3D interior planner require downloading software?',
        answer: 'No! Everything runs directly in your web browser with client-side canvas rendering.'
      },
      {
        question: 'Can I export blueprints to share with a contractor or landlord?',
        answer: 'Yes! Click "Export 2D Snapshot" to generate an architectural floor plan with exact measurements.'
      },
      {
        question: 'Is my design saved automatically?',
        answer: 'Yes! All room layouts, furniture coordinates, and material choices are preserved in your local browser storage.'
      }
    ],
    relatedSlugs: ['screenshot-studio', 'smart-calculator', 'invoice-generator']
  },
  'pdf-suite': {
    id: 'pdf-suite',
    slug: 'pdf-suite',
    title: 'Complete All-in-One PDF Suite Hub',
    shortTitle: 'PDF Suite',
    tagline: 'Every PDF utility categorized: organize, optimize, convert, edit, secure & AI analyze',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'Layers',
    badge: 'All-In-One',
    gradient: 'from-amber-500 via-orange-500 to-red-600',
    metaTitle: 'All-in-One PDF Suite | Free Online PDF Tools',
    metaDescription: 'Complete suite of free PDF tools: Merge, Split, Compress, Convert, Edit, Secure, Sign, and AI summarize PDFs directly in browser.',
    keywords: ['pdf suite', 'ilovepdf alternative', 'all in one pdf', 'free pdf tools', 'online pdf editor'],
    features: [
      { title: '7 Complete Tool Categories', description: 'Organize, Optimize, Convert to PDF, Convert from PDF, Edit, Security, and AI Intelligence.' },
      { title: 'Instant Local-First Processing', description: 'Zero waiting queues and zero file uploads to remote servers for absolute confidentiality.' },
      { title: 'Unified PDF Navigation', description: 'Seamlessly switch between any PDF operation in 1 click.' }
    ],
    howToSteps: [
      { step: 1, title: 'Select PDF Operation', description: 'Choose from 30+ PDF operations matching your exact task.' },
      { step: 2, title: 'Upload or Drop Documents', description: 'Drop your files into the selected tool workspace.' },
      { step: 3, title: 'Execute & Download', description: 'Apply edits or transforms and download your completed PDF.' }
    ],
    faqs: [
      { question: 'Is the PDF Suite completely free?', answer: 'Yes! All 30+ tools run 100% free with no account or paywall.' }
    ],
    relatedSlugs: ['pdf-editor', 'compress-pdf', 'organize-pdf']
  },
  'organize-pdf': {
    id: 'organize-pdf',
    slug: 'organize-pdf',
    title: 'Organize, Split, Extract & Scan to PDF',
    shortTitle: 'Organize PDF',
    tagline: 'Reorder pages visually, remove blanks, extract chapters, and scan paper documents',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'Layers',
    badge: 'Interactive',
    gradient: 'from-orange-500 to-amber-600',
    metaTitle: 'Organize PDF Pages & Scan to PDF Online',
    metaDescription: 'Drag-and-drop page organizer, remove pages, extract chapters, rotate, and capture camera scans directly into PDF.',
    keywords: ['organize pdf', 'remove pdf pages', 'extract pdf pages', 'scan to pdf', 'reorder pdf pages'],
    features: [
      { title: 'Visual Page Grid', description: 'See thumbnails of every page with drag & drop reordering.' },
      { title: '1-Click Page Extraction', description: 'Select any page numbers to export as a clean new PDF.' },
      { title: 'Webcam Scan-to-PDF', description: 'Use your camera or phone to capture paper documents directly into the document.' }
    ],
    howToSteps: [
      { step: 1, title: 'Upload PDF', description: 'Select your PDF to populate the interactive page grid.' },
      { step: 2, title: 'Reorder, Rotate or Delete', description: 'Drag pages or click buttons to rearrange, rotate or remove.' },
      { step: 3, title: 'Save & Export', description: 'Download your restructured PDF document instantly.' }
    ],
    faqs: [
      { question: 'Can I scan multiple physical pages with my camera?', answer: 'Yes! The Scan-to-PDF feature lets you take multiple photos and automatically appends them as new pages.' }
    ],
    relatedSlugs: ['merge-pdf', 'split-pdf', 'pdf-suite']
  },
  'compress-pdf': {
    id: 'compress-pdf',
    slug: 'compress-pdf',
    title: 'Compress, Repair & OCR Scanned PDF',
    shortTitle: 'Compress PDF',
    tagline: 'Shrink file sizes up to 80%, recover corrupted files, and extract text with neural OCR',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'Minimize2',
    badge: 'Popular',
    gradient: 'from-emerald-500 to-teal-600',
    metaTitle: 'Compress PDF, Repair & OCR Scanned PDF Online',
    metaDescription: 'Drastically reduce PDF file size, fix damaged PDF cross-reference tables, and perform optical character recognition with Tesseract.',
    keywords: ['compress pdf', 'reduce pdf size', 'repair damaged pdf', 'ocr pdf', 'scanned pdf to text'],
    features: [
      { title: '3 Compression Presets', description: 'Extreme, Recommended, and Low compression with live percentage savings indicator.' },
      { title: 'Corrupt File Reconstruction', description: 'Rebuilds trailer catalogs and recovers corrupted or broken PDFs.' },
      { title: 'Tesseract Neural OCR', description: 'Extracts searchable and selectable digital text from photo scans and books.' }
    ],
    howToSteps: [
      { step: 1, title: 'Choose Mode', description: 'Select Compress, Repair, or OCR from the top tab switcher.' },
      { step: 2, title: 'Upload Document', description: 'Drop the target PDF file into the dropzone.' },
      { step: 3, title: 'Process & Download', description: 'View the file size reduction and download the optimized PDF.' }
    ],
    faqs: [
      { question: 'Will compressing my PDF reduce text readability?', answer: 'Our recommended compression optimizes image streams while preserving sharp vector text.' }
    ],
    relatedSlugs: ['pdf-suite', 'organize-pdf', 'pdf-editor']
  },
  'convert-to-pdf': {
    id: 'convert-to-pdf',
    slug: 'convert-to-pdf',
    title: 'Convert Office, PowerPoint, Excel & HTML to PDF',
    shortTitle: 'Convert to PDF',
    tagline: 'Transform presentations, spreadsheets, CSVs, and web markup into standard PDF',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'Presentation',
    badge: 'Multi-Format',
    gradient: 'from-amber-500 to-orange-600',
    metaTitle: 'PowerPoint, Excel & HTML to PDF Converter',
    metaDescription: 'Convert PPTX slides, Excel XLSX tables, and HTML markup into beautifully formatted PDF documents.',
    keywords: ['powerpoint to pdf', 'excel to pdf', 'html to pdf', 'csv to pdf table', 'slides to pdf'],
    features: [
      { title: 'PowerPoint Slide Decks', description: 'Converts presentation slides and speaker notes into landscape PDF decks.' },
      { title: 'Excel Table Formatter', description: 'Transforms tabular sheets into styled reports with zebra rows.' },
      { title: 'Live HTML Engine', description: 'Renders raw HTML/CSS into standard A4 PDF pages with preview.' }
    ],
    howToSteps: [
      { step: 1, title: 'Select Source Type', description: 'Choose PowerPoint, Excel, or HTML mode.' },
      { step: 2, title: 'Enter or Paste Content', description: 'Input your slide text, spreadsheet CSV, or web markup.' },
      { step: 3, title: 'Export PDF', description: 'Click Export to generate and download the formatted PDF.' }
    ],
    faqs: [
      { question: 'Can I customize slide styles?', answer: 'Yes! Add custom headlines, bullet items, and slide titles with live preview.' }
    ],
    relatedSlugs: ['word-to-pdf', 'jpg-to-pdf', 'pdf-suite']
  },
  'convert-from-pdf': {
    id: 'convert-from-pdf',
    slug: 'convert-from-pdf',
    title: 'Convert PDF to PowerPoint, Excel & PDF/A',
    shortTitle: 'Convert from PDF',
    tagline: 'Extract presentation decks, spreadsheet tables, or export ISO-compliant archival PDF/A',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'Table',
    badge: 'Export Suite',
    gradient: 'from-blue-500 to-indigo-600',
    metaTitle: 'PDF to PowerPoint, Excel & ISO PDF/A Converter',
    metaDescription: 'Extract slide presentations, spreadsheet matrices, or convert standard PDFs into ISO 19005-1 archival format.',
    keywords: ['pdf to powerpoint', 'pdf to excel', 'pdf to pdf/a', 'pdf table extractor', 'archival pdf'],
    features: [
      { title: 'PDF to Presentation Decks', description: 'Separates document pages into widescreen slide templates.' },
      { title: 'PDF to Excel CSV', description: 'Detects table rows, financial data, and line items for spreadsheets.' },
      { title: 'ISO 19005-1 PDF/A', description: 'Generates long-term archival PDFs with embedded metadata.' }
    ],
    howToSteps: [
      { step: 1, title: 'Select Target Format', description: 'Choose PowerPoint, Excel, or PDF/A mode.' },
      { step: 2, title: 'Upload PDF', description: 'Drop your document into the conversion area.' },
      { step: 3, title: 'Download Converted Assets', description: 'Save the extracted slides, CSV table, or PDF/A file.' }
    ],
    faqs: [
      { question: 'What is PDF/A used for?', answer: 'PDF/A is an ISO-standardized version of PDF specialized for archiving and long-term preservation of electronic documents.' }
    ],
    relatedSlugs: ['pdf-to-word', 'pdf-to-jpg', 'pdf-suite']
  },
  'pdf-annotate': {
    id: 'pdf-annotate',
    slug: 'pdf-annotate',
    title: 'Rotate, Watermark, Page Numbers & PDF Forms',
    shortTitle: 'Annotate PDF',
    tagline: 'Add custom stamps, confidentiality watermarks, pagination, and fillable form fields',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'Stamp',
    badge: 'Stamps & Forms',
    gradient: 'from-purple-500 to-pink-600',
    metaTitle: 'Add Watermark, Page Numbers, Rotate & PDF Forms',
    metaDescription: 'Stamp custom watermarks with opacity control, add headers/footers with page numbers, rotate pages, and fill digital forms.',
    keywords: ['add watermark to pdf', 'add page numbers pdf', 'rotate pdf online', 'pdf form filler', 'stamp pdf'],
    features: [
      { title: 'Diagonal Watermark Stamp', description: 'Custom text notices (e.g. CONFIDENTIAL, DRAFT) with opacity and angle sliders.' },
      { title: 'Configurable Page Numbering', description: 'Stamp Page X of Y, X/Y or simple numbers at bottom/top coordinates.' },
      { title: 'Permanent Page Rotation', description: 'Rotate all or specific pages by 90°, 180°, or 270°.' },
      { title: 'PDF Form Filling', description: 'Interactively fill text fields and checkboxes on digital documents.' }
    ],
    howToSteps: [
      { step: 1, title: 'Upload PDF', description: 'Choose the document you wish to annotate.' },
      { step: 2, title: 'Configure Stamp or Format', description: 'Adjust watermark text, pagination format, or rotation angle.' },
      { step: 3, title: 'Apply & Download', description: 'Process changes and download your stamped document.' }
    ],
    faqs: [
      { question: 'Can I customize the opacity of the watermark?', answer: 'Yes! Use the opacity slider to make the watermark subtle so underlying text remains readable.' }
    ],
    relatedSlugs: ['pdf-editor', 'pdf-security', 'pdf-suite']
  },
  'pdf-security': {
    id: 'pdf-security',
    slug: 'pdf-security',
    title: 'Protect, Unlock, Sign, Redact & Compare PDF',
    shortTitle: 'PDF Security',
    tagline: 'AES password encryption, legally-binding signatures, blackout redaction & visual diff',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'Lock',
    badge: 'Enterprise Security',
    gradient: 'from-blue-600 to-cyan-600',
    metaTitle: 'PDF Security Suite: Protect, Sign, Redact & Compare',
    metaDescription: 'Encrypt PDF with AES-256 passwords, strip permissions, stamp verified digital signatures, permanently redact PII, and compare revisions.',
    keywords: ['protect pdf password', 'unlock pdf', 'sign pdf online', 'redact pdf blackout', 'compare pdf diff'],
    features: [
      { title: 'AES-256 Encryption & Unlock', description: 'Lock PDFs with passwords or strip restrictions from unprotected documents.' },
      { title: 'Digital Signature & Stamp', description: 'Stamp certified signatures with legal timestamp and SHA-256 verification.' },
      { title: 'Permanent PII Redaction', description: 'Irreversibly black out SSNs, bank details, and sensitive credentials.' },
      { title: 'Side-by-Side Document Diff', description: 'Compare original vs modified contracts with visual addition/deletion highlights.' }
    ],
    howToSteps: [
      { step: 1, title: 'Choose Security Operation', description: 'Select Protect, Unlock, Sign, Redact, or Compare.' },
      { step: 2, title: 'Configure Security Parameters', description: 'Enter password, provide digital signature, or select redaction targets.' },
      { step: 3, title: 'Export Secured Document', description: 'Download your encrypted or signed PDF.' }
    ],
    faqs: [
      { question: 'Is the redaction permanent and unrecoverable?', answer: 'Yes! The redaction draws solid opaque black vectors directly into the PDF content stream, ensuring blacked-out information cannot be highlighted or copied.' }
    ],
    relatedSlugs: ['pdf-editor', 'pdf-annotate', 'pdf-suite']
  },
  'pdf-intelligence': {
    id: 'pdf-intelligence',
    slug: 'pdf-intelligence',
    title: 'AI Summarizer, Translate PDF & PDF to Markdown',
    shortTitle: 'PDF Intelligence',
    tagline: 'Cognitive executive summaries, 50+ language translations, and structured Markdown export',
    category: 'pdf',
    categoryName: 'PDF Tools',
    icon: 'Bot',
    badge: 'AI Cognitive',
    gradient: 'from-indigo-500 via-purple-500 to-pink-600',
    metaTitle: 'AI PDF Summarizer, Translate PDF & PDF to Markdown',
    metaDescription: 'Extract executive summaries, key takeaways, translate documents across 50+ languages, and convert PDFs to GitHub-flavored Markdown.',
    keywords: ['ai pdf summarizer', 'translate pdf online', 'pdf to markdown', 'document summary ai', 'pdf translation'],
    features: [
      { title: 'Executive Briefs & Takeaways', description: 'Instantly extracts high-level summaries and actionable next steps.' },
      { title: 'Multi-Language Translation', description: 'Translates document text across Spanish, French, German, Urdu, Arabic, and more.' },
      { title: 'GitHub-Flavored Markdown', description: 'Converts PDF headings, bullet lists, tables, and code snippets into clean .md format.' }
    ],
    howToSteps: [
      { step: 1, title: 'Upload PDF', description: 'Drop your document into the intelligence workspace.' },
      { step: 2, title: 'Select Intelligence Action', description: 'Choose AI Summarizer, Multi-Language Translation, or Markdown Export.' },
      { step: 3, title: 'Review & Copy/Download', description: 'Copy text to clipboard or download your .md and translated files.' }
    ],
    faqs: [
      { question: 'Does PDF Intelligence upload my documents to third-party AI clouds?', answer: 'No! Everything processes locally on your client machine with complete privacy.' }
    ],
    relatedSlugs: ['pdf-suite', 'pdf-editor', 'dev-text-converter']
  }
};

export const ALL_TOOLS_LIST = Object.values(TOOLS_DATA);
