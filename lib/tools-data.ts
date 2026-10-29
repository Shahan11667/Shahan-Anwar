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
  { id: 'all', name: 'All Tools', icon: 'Sparkles', count: 15 },
  { id: 'pdf', name: 'PDF Tools', icon: 'FileText', count: 4 },
  { id: 'image', name: 'Image Tools', icon: 'Image', count: 3 },
  { id: 'ocr', name: 'OCR & Vision', icon: 'ScanText', count: 2 },
  { id: 'audio', name: 'Audio & Speech', icon: 'Mic', count: 1 },
  { id: 'text', name: 'Text Utilities', icon: 'Type', count: 2 },
  { id: 'dev', name: 'Developer Tools', icon: 'Code2', count: 2 },
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
  }
};

export const ALL_TOOLS_LIST = Object.values(TOOLS_DATA);
