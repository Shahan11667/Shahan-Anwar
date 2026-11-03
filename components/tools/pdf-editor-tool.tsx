'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Upload,
  Download,
  Type,
  PenTool,
  Highlighter,
  Square,
  Circle,
  ArrowRight,
  Check,
  X,
  Stamp,
  Trash2,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Eye,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Hash,
  Droplet,
  Move,
  Image as ImageIcon,
  Save,
  Undo2,
  FileDown,
  BookOpen,
  Network,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Grid,
  Sliders,
  Copy,
  ExternalLink,
  GitBranch,
  Bookmark,
  Share2
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

type EditorMode = 'select' | 'text' | 'draw' | 'highlight' | 'shape' | 'stamp' | 'redact' | 'watermark' | 'pageNumber';

interface TextAnnotation {
  id: string;
  pageIndex: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  text: string;
  fontSize: number;
  color: string;
  fontFamily: 'Helvetica' | 'TimesRoman' | 'Courier';
  isBold?: boolean;
  letterSpacing?: number; // px tracking
  wordSpacing?: number; // px word spacing
  lineHeight?: number; // leading ratio
}

interface ShapeAnnotation {
  id: string;
  pageIndex: number;
  type: 'rect' | 'circle' | 'arrow' | 'check' | 'cross' | 'redact' | 'highlight';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  fill?: boolean;
}

interface StampAnnotation {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  text: string;
  color: string;
  imageUrl?: string;
}

interface DrawingPath {
  id: string;
  pageIndex: number;
  points: Array<{ x: number; y: number }>;
  color: string;
  strokeWidth: number;
}

interface ReferenceItem {
  id: string;
  title: string;
  authors: string;
  year: string;
  journal: string;
  doi?: string;
  url?: string;
  type: 'article' | 'book' | 'conference';
}

interface MindMapNode {
  id: string;
  title: string;
  page: number;
  level: number;
  children?: MindMapNode[];
}

const STAMP_PRESETS = [
  { text: 'APPROVED', color: '#16a34a' },
  { text: 'CONFIDENTIAL', color: '#dc2626' },
  { text: 'DRAFT', color: '#d97706' },
  { text: 'PAID', color: '#2563eb' },
  { text: 'VOID', color: '#ef4444' },
  { text: 'FINAL', color: '#059669' },
  { text: 'URGENT', color: '#ea580c' },
];

export default function PdfEditorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.2);
  const [mode, setMode] = useState<EditorMode>('select');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Admin Settings Flags
  const [settings, setSettings] = useState<{
    pdfTextReflowEnabled: boolean;
    pdfBulkHighlightsEnabled: boolean;
    pdfAdvancedTypographyEnabled: boolean;
    pdfMultiObjectAlignmentEnabled: boolean;
    pdfReferenceManagerEnabled: boolean;
    pdfMindMapEnabled: boolean;
  }>({
    pdfTextReflowEnabled: true,
    pdfBulkHighlightsEnabled: true,
    pdfAdvancedTypographyEnabled: true,
    pdfMultiObjectAlignmentEnabled: true,
    pdfReferenceManagerEnabled: true,
    pdfMindMapEnabled: true,
  });

  // Fetch admin settings on mount
  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.pdfTextReflowEnabled === 'boolean') {
          setSettings({
            pdfTextReflowEnabled: data.pdfTextReflowEnabled ?? true,
            pdfBulkHighlightsEnabled: data.pdfBulkHighlightsEnabled ?? true,
            pdfAdvancedTypographyEnabled: data.pdfAdvancedTypographyEnabled ?? true,
            pdfMultiObjectAlignmentEnabled: data.pdfMultiObjectAlignmentEnabled ?? true,
            pdfReferenceManagerEnabled: data.pdfReferenceManagerEnabled ?? true,
            pdfMindMapEnabled: data.pdfMindMapEnabled ?? true,
          });
        }
      })
      .catch(() => {
        // graceful fallback to defaults
      });
  }, []);

  // PDF Page Data URLs & Text Layers
  const [pageThumbnails, setPageThumbnails] = useState<string[]>([]);
  const [pageRotations, setPageRotations] = useState<Record<number, number>>({});
  const [deletedPages, setDeletedPages] = useState<Set<number>>(new Set());
  const [pageTextContents, setPageTextContents] = useState<Record<number, string>>({});

  // Annotations
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [shapeAnnotations, setShapeAnnotations] = useState<ShapeAnnotation[]>([]);
  const [stampAnnotations, setStampAnnotations] = useState<StampAnnotation[]>([]);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);

  // Current Tool Properties
  const [activeColor, setActiveColor] = useState<string>('#2563eb');
  const [fontSize, setFontSize] = useState<number>(16);
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [selectedShape, setSelectedShape] = useState<'rect' | 'circle' | 'arrow' | 'check' | 'cross'>('rect');

  // Specialist Feature 3: Advanced Typography
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [wordSpacing, setWordSpacing] = useState<number>(0);
  const [lineHeight, setLineHeight] = useState<number>(1.4);
  const [fontFamily, setFontFamily] = useState<'Helvetica' | 'TimesRoman' | 'Courier'>('Helvetica');

  // Specialist Feature 4: Smart Alignment & Snapping
  const [snapToGrid, setSnapToGrid] = useState<boolean>(false);
  const [gridSize, setGridSize] = useState<number>(20); // 20px grid
  const [selectedAnnotationIds, setSelectedAnnotationIds] = useState<string[]>([]);

  // Specialist Feature 1: True Word Processor Text Reflow Mode
  const [showReflowModal, setShowReflowModal] = useState<boolean>(false);
  const [reflowContent, setReflowContent] = useState<string>('');
  const [reflowLoading, setReflowLoading] = useState<boolean>(false);

  // Specialist Feature 2: Bulk Highlights Extraction
  const [showHighlightsModal, setShowHighlightsModal] = useState<boolean>(false);

  // Specialist Feature 5: Native Reference Manager & Citations
  const [showReferenceModal, setShowReferenceModal] = useState<boolean>(false);
  const [citationStyle, setCitationStyle] = useState<'APA' | 'MLA' | 'Chicago' | 'IEEE' | 'Harvard'>('APA');
  const [references, setReferences] = useState<ReferenceItem[]>([
    {
      id: 'ref-1',
      title: 'Attention Is All You Need',
      authors: 'Vaswani, A., Shazeer, N., Parmar, N., et al.',
      year: '2017',
      journal: 'Advances in Neural Information Processing Systems (NeurIPS)',
      doi: '10.48550/arXiv.1706.03762',
      type: 'article'
    },
    {
      id: 'ref-2',
      title: 'Deep Residual Learning for Image Recognition',
      authors: 'He, K., Zhang, X., Ren, S., & Sun, J.',
      year: '2016',
      journal: 'IEEE Conference on Computer Vision and Pattern Recognition (CVPR)',
      doi: '10.1109/CVPR.2016.90',
      type: 'article'
    }
  ]);
  const [newRefTitle, setNewRefTitle] = useState('');
  const [newRefAuthors, setNewRefAuthors] = useState('');
  const [newRefYear, setNewRefYear] = useState('');
  const [newRefJournal, setNewRefJournal] = useState('');
  const [newRefDoi, setNewRefDoi] = useState('');

  // Specialist Feature 6: Dynamic PDF-to-Mind-Map Conversion
  const [showMindMapModal, setShowMindMapModal] = useState<boolean>(false);
  const [mindMapRoot, setMindMapRoot] = useState<MindMapNode | null>(null);

  // Watermark Settings
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.2);
  const [watermarkColor, setWatermarkColor] = useState<string>('#dc2626');

  // Page Numbers Settings
  const [pageNumberFormat, setPageNumberFormat] = useState<'page_of_total' | 'simple'>('page_of_total');
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom_center' | 'bottom_right' | 'top_right'>('bottom_center');

  // Signature Modal
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [signatureType, setSignatureType] = useState<'draw' | 'type'>('draw');
  const [typedSignatureName, setTypedSignatureName] = useState<string>('');
  const [signatureColor, setSignatureColor] = useState<string>('#000000');
  const [isDrawingSig, setIsDrawingSig] = useState<boolean>(false);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);

  // Interactive Canvas State
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<Array<{ x: number; y: number }>>([]);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load PDF.js script dynamically
  const ensurePdfJsLoaded = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const lib = (window as any).pdfjsLib;
        if (lib) {
          lib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve(lib);
        } else {
          reject(new Error('Failed to initialize PDF.js'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js engine'));
      document.body.appendChild(script);
    });
  };

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a valid .pdf file');
      return;
    }

    setFile(selectedFile);
    setLoading(true);
    setCurrentPage(1);
    setTextAnnotations([]);
    setShapeAnnotations([]);
    setStampAnnotations([]);
    setDrawingPaths([]);
    setDeletedPages(new Set());
    setPageRotations({});
    setSelectedAnnotationIds([]);

    try {
      const pdfjs = await ensurePdfJsLoaded();
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;

      const total = pdfDoc.numPages;
      setNumPages(total);

      const thumbnails: string[] = [];
      const textMap: Record<number, string> = {};

      for (let i = 1; i <= total; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        thumbnails.push(canvas.toDataURL('image/jpeg', 0.9));

        // Extract text layer for reflow, mind map, and highlights
        try {
          const textContent = await page.getTextContent();
          const pageStrings = textContent.items
            .map((item: any) => item.str || '')
            .filter((s: string) => s.trim().length > 0);
          textMap[i - 1] = pageStrings.join(' ');
        } catch (e) {
          textMap[i - 1] = '';
        }
      }

      setPageThumbnails(thumbnails);
      setPageTextContents(textMap);
      toast.success(`Loaded ${total} pages! Document ready.`);
    } catch (err: any) {
      console.error('PDF load error:', err);
      toast.error('Failed to load PDF: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Snapping helper function
  const snapCoordinate = (coord: number, isX: boolean = true) => {
    if (!snapToGrid || !pageContainerRef.current) return coord;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const pixelVal = (coord / 100) * (isX ? rect.width : rect.height);
    const snappedPixel = Math.round(pixelVal / gridSize) * gridSize;
    return (snappedPixel / (isX ? rect.width : rect.height)) * 100;
  };

  // Add text annotation on canvas click
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pageContainerRef.current) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;

    if (snapToGrid) {
      x = snapCoordinate(x, true);
      y = snapCoordinate(y, false);
    }

    if (mode === 'text') {
      const text = prompt('Enter text to place on PDF:', 'Type text here');
      if (text) {
        setTextAnnotations((prev) => [
          ...prev,
          {
            id: 'txt-' + Date.now(),
            pageIndex: currentPage - 1,
            x: Math.max(2, Math.min(90, x)),
            y: Math.max(2, Math.min(90, y)),
            text,
            fontSize,
            color: activeColor,
            fontFamily,
            isBold: true,
            letterSpacing,
            wordSpacing,
            lineHeight,
          },
        ]);
        toast.success('Text placed with typography settings');
      }
    } else if (mode === 'shape') {
      setShapeAnnotations((prev) => [
        ...prev,
        {
          id: 'shp-' + Date.now(),
          pageIndex: currentPage - 1,
          type: selectedShape,
          x: Math.max(2, Math.min(85, x)),
          y: Math.max(2, Math.min(85, y)),
          width: 15,
          height: 10,
          color: activeColor,
          opacity: 1,
          fill: false,
        },
      ]);
      toast.success('Shape added');
    } else if (mode === 'highlight') {
      setShapeAnnotations((prev) => [
        ...prev,
        {
          id: 'hl-' + Date.now(),
          pageIndex: currentPage - 1,
          type: 'highlight',
          x: Math.max(2, Math.min(80, x)),
          y: Math.max(2, Math.min(92, y)),
          width: 25,
          height: 4,
          color: '#facc15',
          opacity: 0.45,
          fill: true,
        },
      ]);
      toast.success('Highlight marked');
    } else if (mode === 'redact') {
      setShapeAnnotations((prev) => [
        ...prev,
        {
          id: 'rd-' + Date.now(),
          pageIndex: currentPage - 1,
          type: 'redact',
          x: Math.max(2, Math.min(80, x)),
          y: Math.max(2, Math.min(92, y)),
          width: 20,
          height: 4,
          color: '#000000',
          opacity: 1,
          fill: true,
        },
      ]);
      toast.success('Redaction blackout box placed');
    }
  };

  // Freehand Drawing Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'draw' || !pageContainerRef.current) return;
    setIsDrawing(true);
    const rect = pageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentPath([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || mode !== 'draw' || !pageContainerRef.current) return;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentPath((prev) => [...prev, { x, y }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || mode !== 'draw') return;
    setIsDrawing(false);
    if (currentPath.length > 1) {
      setDrawingPaths((prev) => [
        ...prev,
        {
          id: 'draw-' + Date.now(),
          pageIndex: currentPage - 1,
          points: currentPath,
          color: activeColor,
          strokeWidth,
        },
      ]);
    }
    setCurrentPath([]);
  };

  // Page Management
  const rotatePage = (clockwise: boolean = true) => {
    setPageRotations((prev) => {
      const current = prev[currentPage - 1] || 0;
      const next = (current + (clockwise ? 90 : 270)) % 360;
      return { ...prev, [currentPage - 1]: next };
    });
    toast.success(`Rotated page ${currentPage}`);
  };

  const deleteCurrentPage = () => {
    if (numPages - deletedPages.size <= 1) {
      toast.error('Cannot delete the only remaining page');
      return;
    }
    setDeletedPages((prev) => new Set(prev).add(currentPage - 1));
    toast.success(`Page ${currentPage} deleted`);
    if (currentPage < numPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const addStamp = (preset: { text: string; color: string }) => {
    setStampAnnotations((prev) => [
      ...prev,
      {
        id: 'stamp-' + Date.now(),
        pageIndex: currentPage - 1,
        x: 40,
        y: 40,
        text: preset.text,
        color: preset.color,
      },
    ]);
    toast.success(`Stamp "${preset.text}" added to page ${currentPage}`);
  };

  // Digital Signature
  const handleSaveSignature = () => {
    let dataUrl = '';
    if (signatureType === 'draw') {
      if (!sigCanvasRef.current) return;
      dataUrl = sigCanvasRef.current.toDataURL('image/png');
    } else {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 150;
      const ctx = canvas.getContext('2d')!;
      ctx.font = 'italic bold 42px "Brush Script MT", "Caveat", "Segoe Script", cursive';
      ctx.fillStyle = signatureColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedSignatureName || 'Signature', 200, 75);
      dataUrl = canvas.toDataURL('image/png');
    }

    setStampAnnotations((prev) => [
      ...prev,
      {
        id: 'sig-' + Date.now(),
        pageIndex: currentPage - 1,
        x: 45,
        y: 75,
        text: 'SIGNATURE',
        color: signatureColor,
        imageUrl: dataUrl,
      },
    ]);

    setShowSignatureModal(false);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    toast.success('Digital signature placed on document!');
  };

  const startSigDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawingSig(true);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const drawSig = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = signatureColor;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const clearSigCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // FEATURE 1: True Word Processor Text Reflow Implementation
  const openTextReflowMode = () => {
    const rawText = pageTextContents[currentPage - 1] || 'No text content detected on this page.';
    setReflowContent(rawText);
    setShowReflowModal(true);
  };

  const applyReflowToPage = () => {
    // Add reflowed text block on the current page
    setTextAnnotations((prev) => [
      ...prev,
      {
        id: 'reflow-' + Date.now(),
        pageIndex: currentPage - 1,
        x: 8,
        y: 12,
        text: reflowContent.slice(0, 300) + (reflowContent.length > 300 ? '...' : ''),
        fontSize: 14,
        color: '#1e293b',
        fontFamily: 'Helvetica',
        isBold: false,
        lineHeight: 1.6,
      },
    ]);
    setShowReflowModal(false);
    toast.success('Reflowed text applied to page!');
  };

  const exportReflowAsDocx = async () => {
    const doc = new DocxDocument({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: `Reflowed Content - Page ${currentPage}`,
              heading: HeadingLevel.HEADING_1,
            }),
            ...reflowContent.split('\n').map(
              (line) =>
                new Paragraph({
                  children: [new TextRun({ text: line, size: 24 })],
                  spacing: { after: 200 },
                })
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace('.pdf', '') || 'document'}-page-${currentPage}-reflow.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Reflow exported as Word DOCX!');
  };

  // FEATURE 2: Bulk Extraction of Highlights
  const getAllHighlights = () => {
    const highlights = shapeAnnotations.filter((s) => s.type === 'highlight');
    return highlights.map((h, i) => {
      // Find approximate text snippet from that page
      const pageText = pageTextContents[h.pageIndex] || '';
      const snippet = pageText.slice(i * 45, i * 45 + 120) || `Highlight annotation #${i + 1} at coordinates (${Math.round(h.x)}%, ${Math.round(h.y)}%)`;
      return {
        id: h.id,
        pageIndex: h.pageIndex,
        color: h.color,
        snippet,
      };
    });
  };

  const copyAllHighlights = () => {
    const items = getAllHighlights();
    if (!items.length) {
      toast.error('No highlights found in this document yet. Add some highlights first!');
      return;
    }
    const compiled = items
      .map((h, idx) => `[Page ${h.pageIndex + 1}] Highlight #${idx + 1}:\n"${h.snippet.trim()}"\n`)
      .join('\n---\n\n');

    navigator.clipboard.writeText(compiled);
    confetti({ particleCount: 30, spread: 60 });
    toast.success(`Copied ${items.length} highlights to clipboard!`);
  };

  const downloadHighlightsNotes = () => {
    const items = getAllHighlights();
    if (!items.length) {
      toast.error('No highlights to export.');
      return;
    }
    const compiled = `# Document Highlights & Study Guide\nSource: ${file?.name || 'Document'}\nDate: ${new Date().toLocaleDateString()}\n\n` +
      items.map((h, idx) => `### Page ${h.pageIndex + 1} (Highlight ${idx + 1})\n> ${h.snippet.trim()}\n`).join('\n');

    const blob = new Blob([compiled], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace('.pdf', '') || 'document'}-study-notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Study guide downloaded!');
  };

  // FEATURE 4: Multi-Object Alignment & Distribution
  const handleToggleSelectAnnotation = (id: string) => {
    setSelectedAnnotationIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const alignSelected = (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'distributeHorizontally') => {
    if (selectedAnnotationIds.length < 2) {
      toast.error('Select at least 2 objects to align');
      return;
    }

    const selectedTexts = textAnnotations.filter((t) => selectedAnnotationIds.includes(t.id));
    const selectedShapes = shapeAnnotations.filter((s) => selectedAnnotationIds.includes(s.id));

    if (direction === 'left') {
      const minX = Math.min(...selectedTexts.map((t) => t.x), ...selectedShapes.map((s) => s.x));
      setTextAnnotations((prev) =>
        prev.map((t) => (selectedAnnotationIds.includes(t.id) ? { ...t, x: minX } : t))
      );
      setShapeAnnotations((prev) =>
        prev.map((s) => (selectedAnnotationIds.includes(s.id) ? { ...s, x: minX } : s))
      );
      toast.success('Aligned Left');
    } else if (direction === 'center') {
      const allX = [...selectedTexts.map((t) => t.x), ...selectedShapes.map((s) => s.x)];
      const avgX = allX.reduce((a, b) => a + b, 0) / allX.length;
      setTextAnnotations((prev) =>
        prev.map((t) => (selectedAnnotationIds.includes(t.id) ? { ...t, x: avgX } : t))
      );
      setShapeAnnotations((prev) =>
        prev.map((s) => (selectedAnnotationIds.includes(s.id) ? { ...s, x: avgX } : s))
      );
      toast.success('Aligned Center');
    } else if (direction === 'top') {
      const minY = Math.min(...selectedTexts.map((t) => t.y), ...selectedShapes.map((s) => s.y));
      setTextAnnotations((prev) =>
        prev.map((t) => (selectedAnnotationIds.includes(t.id) ? { ...t, y: minY } : t))
      );
      setShapeAnnotations((prev) =>
        prev.map((s) => (selectedAnnotationIds.includes(s.id) ? { ...s, y: minY } : s))
      );
      toast.success('Aligned Top');
    } else if (direction === 'distributeHorizontally') {
      const sortedIds = [...selectedAnnotationIds];
      const step = 60 / sortedIds.length;
      setTextAnnotations((prev) =>
        prev.map((t) => {
          const idx = sortedIds.indexOf(t.id);
          return idx !== -1 ? { ...t, x: 15 + idx * step } : t;
        })
      );
      setShapeAnnotations((prev) =>
        prev.map((s) => {
          const idx = sortedIds.indexOf(s.id);
          return idx !== -1 ? { ...s, x: 15 + idx * step } : s;
        })
      );
      toast.success('Distributed Evenly');
    }
  };

  const deleteSelectedObjects = () => {
    setTextAnnotations((prev) => prev.filter((t) => !selectedAnnotationIds.includes(t.id)));
    setShapeAnnotations((prev) => prev.filter((s) => !selectedAnnotationIds.includes(s.id)));
    setStampAnnotations((prev) => prev.filter((s) => !selectedAnnotationIds.includes(s.id)));
    setSelectedAnnotationIds([]);
    toast.success('Selected objects deleted');
  };

  // FEATURE 5: Native Reference Manager & Citations
  const formatCitation = (ref: ReferenceItem, style: string) => {
    const firstAuthor = ref.authors.split(',')[0] || ref.authors;
    if (style === 'APA') {
      return `(${firstAuthor} et al., ${ref.year})`;
    } else if (style === 'MLA') {
      return `(${firstAuthor} ${ref.year})`;
    } else if (style === 'IEEE') {
      const index = references.findIndex((r) => r.id === ref.id) + 1;
      return `[${index}]`;
    } else if (style === 'Chicago') {
      return `(${firstAuthor} ${ref.year})`;
    } else {
      return `(${firstAuthor}, ${ref.year})`;
    }
  };

  const insertCitationToPage = (ref: ReferenceItem) => {
    const citText = formatCitation(ref, citationStyle);
    setTextAnnotations((prev) => [
      ...prev,
      {
        id: 'cit-' + Date.now(),
        pageIndex: currentPage - 1,
        x: 50,
        y: 80,
        text: citText,
        fontSize: 12,
        color: '#2563eb',
        fontFamily: 'Helvetica',
        isBold: true,
      },
    ]);
    setShowReferenceModal(false);
    toast.success(`Citation "${citText}" inserted into page ${currentPage}`);
  };

  const exportBibTex = () => {
    const bibContent = references
      .map(
        (r) =>
          `@article{${r.authors.split(' ')[0].toLowerCase()}${r.year},\n  author = {${r.authors}},\n  title = {${r.title}},\n  journal = {${r.journal}},\n  year = {${r.year}},\n  doi = {${r.doi || ''}}\n}`
      )
      .join('\n\n');

    const blob = new Blob([bibContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name.replace('.pdf', '') || 'references'}.bib`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('BibTeX (.bib) file exported! Compatible with Zotero and Mendeley.');
  };

  // FEATURE 6: Dynamic PDF-to-Mind-Map Conversion
  const generateMindMap = () => {
    const docTitle = file?.name.replace('.pdf', '') || 'Document Overview';
    const children: MindMapNode[] = [];

    for (let i = 0; i < Math.min(numPages, 10); i++) {
      const text = pageTextContents[i] || '';
      // Heuristic extraction of key sections / headings
      const words = text.split(' ').filter(Boolean);
      const headingCandidate = words.slice(0, 5).join(' ') || `Section on Page ${i + 1}`;
      const subKeypoint = words.slice(15, 23).join(' ') || `Key details and analysis`;

      children.push({
        id: `page-node-${i + 1}`,
        title: `Page ${i + 1}: ${headingCandidate.slice(0, 32)}...`,
        page: i + 1,
        level: 1,
        children: [
          {
            id: `sub-node-${i + 1}`,
            title: subKeypoint.slice(0, 36) + '...',
            page: i + 1,
            level: 2,
          },
        ],
      });
    }

    setMindMapRoot({
      id: 'root-node',
      title: docTitle,
      page: 1,
      level: 0,
      children,
    });
    setShowMindMapModal(true);
  };

  // Export & Compile Modified PDF using pdf-lib
  const exportEditedPdf = async () => {
    if (!file) return;
    setExporting(true);
    const toastId = toast.loading('Compiling vector PDF with annotations...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const helvetica = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const times = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const courier = await pdfDoc.embedFont(StandardFonts.CourierBold);

      const totalSourcePages = pdfDoc.getPageCount();

      // Apply Rotations
      Object.entries(pageRotations).forEach(([idxStr, rot]) => {
        const idx = parseInt(idxStr);
        if (idx < totalSourcePages) {
          const p = pdfDoc.getPage(idx);
          const currentRot = p.getRotation().angle;
          p.setRotation(degrees((currentRot + rot) % 360));
        }
      });

      // Burn Text Annotations
      for (const ann of textAnnotations) {
        if (ann.pageIndex < totalSourcePages && !deletedPages.has(ann.pageIndex)) {
          const page = pdfDoc.getPage(ann.pageIndex);
          const { width, height } = page.getSize();
          const x = (ann.x / 100) * width;
          const y = height - (ann.y / 100) * height;

          const hexColor = ann.color.replace('#', '');
          const r = parseInt(hexColor.substring(0, 2), 16) / 255 || 0;
          const g = parseInt(hexColor.substring(2, 4), 16) / 255 || 0;
          const b = parseInt(hexColor.substring(4, 6), 16) / 255 || 0;

          page.drawText(ann.text, {
            x,
            y,
            size: ann.fontSize,
            font: ann.fontFamily === 'Courier' ? courier : ann.fontFamily === 'TimesRoman' ? times : helvetica,
            color: rgb(r, g, b),
          });
        }
      }

      // Burn Shapes, Highlights & Redactions
      for (const shape of shapeAnnotations) {
        if (shape.pageIndex < totalSourcePages && !deletedPages.has(shape.pageIndex)) {
          const page = pdfDoc.getPage(shape.pageIndex);
          const { width, height } = page.getSize();
          const x = (shape.x / 100) * width;
          const shapeW = (shape.width / 100) * width;
          const shapeH = (shape.height / 100) * height;
          const y = height - (shape.y / 100) * height - shapeH;

          const hexColor = shape.color.replace('#', '');
          const r = parseInt(hexColor.substring(0, 2), 16) / 255 || 0;
          const g = parseInt(hexColor.substring(2, 4), 16) / 255 || 0;
          const b = parseInt(hexColor.substring(4, 6), 16) / 255 || 0;

          if (shape.type === 'rect' || shape.type === 'redact' || shape.type === 'highlight') {
            page.drawRectangle({
              x,
              y,
              width: shapeW,
              height: shapeH,
              color: rgb(r, g, b),
              opacity: shape.opacity,
              borderColor: rgb(r, g, b),
              borderWidth: shape.fill ? 0 : 2,
            });
          } else if (shape.type === 'circle') {
            page.drawEllipse({
              x: x + shapeW / 2,
              y: y + shapeH / 2,
              xScale: shapeW / 2,
              yScale: shapeH / 2,
              borderColor: rgb(r, g, b),
              borderWidth: 2,
              opacity: shape.opacity,
            });
          }
        }
      }

      // Burn Stamps & Signatures
      for (const stamp of stampAnnotations) {
        if (stamp.pageIndex < totalSourcePages && !deletedPages.has(stamp.pageIndex)) {
          const page = pdfDoc.getPage(stamp.pageIndex);
          const { width, height } = page.getSize();
          const x = (stamp.x / 100) * width;
          const y = height - (stamp.y / 100) * height;

          if (stamp.imageUrl) {
            const imageBytes = await fetch(stamp.imageUrl).then((res) => res.arrayBuffer());
            const pngImage = await pdfDoc.embedPng(imageBytes);
            page.drawImage(pngImage, {
              x,
              y: y - 40,
              width: 140,
              height: 50,
            });
          } else {
            const hexColor = stamp.color.replace('#', '');
            const r = parseInt(hexColor.substring(0, 2), 16) / 255 || 0;
            const g = parseInt(hexColor.substring(2, 4), 16) / 255 || 0;
            const b = parseInt(hexColor.substring(4, 6), 16) / 255 || 0;

            page.drawRectangle({
              x: x - 10,
              y: y - 8,
              width: 130,
              height: 32,
              borderColor: rgb(r, g, b),
              borderWidth: 3,
            });

            page.drawText(stamp.text, {
              x,
              y,
              size: 16,
              font: helvetica,
              color: rgb(r, g, b),
            });
          }
        }
      }

      // Burn Freehand Drawings
      for (const draw of drawingPaths) {
        if (draw.pageIndex < totalSourcePages && !deletedPages.has(draw.pageIndex) && draw.points.length > 1) {
          const page = pdfDoc.getPage(draw.pageIndex);
          const { width, height } = page.getSize();

          const hexColor = draw.color.replace('#', '');
          const r = parseInt(hexColor.substring(0, 2), 16) / 255 || 0;
          const g = parseInt(hexColor.substring(2, 4), 16) / 255 || 0;
          const b = parseInt(hexColor.substring(4, 6), 16) / 255 || 0;

          for (let p = 0; p < draw.points.length - 1; p++) {
            const p1 = draw.points[p];
            const p2 = draw.points[p + 1];
            page.drawLine({
              start: { x: (p1.x / 100) * width, y: height - (p1.y / 100) * height },
              end: { x: (p2.x / 100) * width, y: height - (p2.y / 100) * height },
              thickness: draw.strokeWidth,
              color: rgb(r, g, b),
            });
          }
        }
      }

      // Burn Watermark
      if (mode === 'watermark' && watermarkText.trim()) {
        const pages = pdfDoc.getPages();
        const hexColor = watermarkColor.replace('#', '');
        const r = parseInt(hexColor.substring(0, 2), 16) / 255 || 0.8;
        const g = parseInt(hexColor.substring(2, 4), 16) / 255 || 0;
        const b = parseInt(hexColor.substring(4, 6), 16) / 255 || 0;

        pages.forEach((p, idx) => {
          if (!deletedPages.has(idx)) {
            const { width, height } = p.getSize();
            p.drawText(watermarkText, {
              x: width * 0.2,
              y: height * 0.45,
              size: 54,
              font: helvetica,
              color: rgb(r, g, b),
              opacity: watermarkOpacity,
              rotate: degrees(45),
            });
          }
        });
      }

      // Burn Page Numbers
      if (mode === 'pageNumber') {
        const pages = pdfDoc.getPages();
        const validPages = pages.filter((_, idx) => !deletedPages.has(idx));
        const totalValid = validPages.length;
        let counter = 1;

        pages.forEach((p, idx) => {
          if (!deletedPages.has(idx)) {
            const { width, height } = p.getSize();
            const text = pageNumberFormat === 'page_of_total' ? `Page ${counter} of ${totalValid}` : `${counter}`;
            let x = width / 2 - 30;
            let y = 25;
            if (pageNumberPosition === 'bottom_right') x = width - 80;
            if (pageNumberPosition === 'top_right') { x = width - 80; y = height - 25; }

            p.drawText(text, {
              x,
              y,
              size: 11,
              font: helvetica,
              color: rgb(0.3, 0.3, 0.3),
            });
            counter++;
          }
        });
      }

      // Apply Page Deletions
      const sortedDeleted = Array.from(deletedPages).sort((a, b) => b - a);
      for (const delIdx of sortedDeleted) {
        if (delIdx < pdfDoc.getPageCount()) {
          pdfDoc.removePage(delIdx);
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      a.download = `${baseName}-edited.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
      toast.success('Edited PDF exported and downloaded successfully!', { id: toastId });
    } catch (err: any) {
      console.error('PDF export error:', err);
      toast.error('Failed to export edited PDF: ' + err.message, { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone if no file loaded */}
      {!pageThumbnails.length && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
          }}
          className={`relative p-10 sm:p-14 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer group ${isDragOver
              ? 'border-rose-500 bg-rose-500/10 scale-[1.01]'
              : 'border-slate-800 bg-slate-950/60 hover:border-rose-500/50 hover:bg-slate-900/40'
            }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            accept=".pdf,application/pdf"
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-transform">
              <PenTool className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Upload PDF to Edit & Annotate
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Featuring Next-Gen Word Reflow, Bulk Highlights, Micro-Typography, Citations & Mind Maps
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
              <span className="px-2.5 py-1 rounded-md bg-rose-950/30 text-rose-300 border border-rose-800/40 font-medium">★ Word Processor Reflow</span>
              <span className="px-2.5 py-1 rounded-md bg-amber-950/30 text-amber-300 border border-amber-800/40 font-medium">★ Bulk Highlights</span>
              <span className="px-2.5 py-1 rounded-md bg-cyan-950/30 text-cyan-300 border border-cyan-800/40 font-medium">★ Snapping & Align</span>
              <span className="px-2.5 py-1 rounded-md bg-purple-950/30 text-purple-300 border border-purple-800/40 font-medium">★ Mind Map</span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-950/30 text-emerald-300 border border-emerald-800/40 font-medium">★ Zotero/BibTeX</span>
            </div>

            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-500/20 transition-all inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Select PDF File</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Editing Workspace */}
      {pageThumbnails.length > 0 && (
        <div className="space-y-4">
          {/* Top Master Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                  {file?.name}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Page {currentPage} of {numPages} • {deletedPages.size > 0 && `${deletedPages.size} deleted`}
                </p>
              </div>
            </div>

            {/* Specialist Quick Action Innovation Hub */}
            <div className="flex flex-wrap items-center gap-1.5">
              {settings.pdfTextReflowEnabled && (
                <button
                  onClick={openTextReflowMode}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-900/40 to-pink-900/40 border border-rose-700/50 hover:border-rose-500 text-rose-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Edit text in fluid reflow mode like MS Word"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>Word Reflow</span>
                </button>
              )}

              {settings.pdfBulkHighlightsEnabled && (
                <button
                  onClick={() => setShowHighlightsModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-900/40 to-yellow-900/40 border border-amber-700/50 hover:border-amber-500 text-amber-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Extract all highlights into a clean study guide"
                >
                  <Highlighter className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bulk Highlights</span>
                </button>
              )}

              {settings.pdfMindMapEnabled && (
                <button
                  onClick={generateMindMap}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-700/50 hover:border-purple-500 text-purple-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Convert PDF structure into an interactive Mind Map"
                >
                  <Network className="w-3.5 h-3.5 text-purple-400" />
                  <span>Mind Map</span>
                </button>
              )}

              {settings.pdfReferenceManagerEnabled && (
                <button
                  onClick={() => setShowReferenceModal(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-700/50 hover:border-emerald-500 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Scholarly citation generator and Zotero/BibTeX sync"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Citations / BibTeX</span>
                </button>
              )}
            </div>

            {/* Zoom & Page Navigation */}
            <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-white px-2">
                {currentPage} / {numPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                disabled={currentPage >= numPages}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="h-4 w-[1px] bg-slate-800 mx-1" />

              <button
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-slate-300 text-[11px]">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPageThumbnails([]);
                  setFile(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 cursor-pointer"
              >
                Change PDF
              </button>

              <button
                onClick={exportEditedPdf}
                disabled={exporting}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Save & Download PDF</span>
              </button>
            </div>
          </div>

          {/* Tool Modes Strip */}
          <div className="p-2 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-1.5 text-xs text-slate-300 shadow-md">
            <button
              onClick={() => setMode('select')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${mode === 'select' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-900 text-slate-400'
                }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span>Navigate</span>
            </button>

            <button
              onClick={() => setMode('text')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${mode === 'text' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-900 text-slate-400'
                }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Add Text</span>
            </button>

            <button
              onClick={() => setShowSignatureModal(true)}
              className="px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800"
            >
              <PenTool className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Document</span>
            </button>

            <button
              onClick={() => setMode('draw')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${mode === 'draw' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-900 text-slate-400'
                }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Freehand Pen</span>
            </button>

            <button
              onClick={() => setMode('highlight')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${mode === 'highlight' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-900 text-slate-400'
                }`}
            >
              <Highlighter className="w-3.5 h-3.5 text-yellow-400" />
              <span>Highlight</span>
            </button>

            <button
              onClick={() => setMode('shape')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${mode === 'shape' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-900 text-slate-400'
                }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>Shapes</span>
            </button>

            <button
              onClick={() => setMode('redact')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${mode === 'redact' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-900 text-slate-400'
                }`}
              title="Blackout sensitive private details"
            >
              <Eraser className="w-3.5 h-3.5 text-slate-300" />
              <span>Redact (Censor)</span>
            </button>

            <button
              onClick={() => setMode('watermark')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${mode === 'watermark' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-900 text-slate-400'
                }`}
            >
              <Stamp className="w-3.5 h-3.5 text-amber-400" />
              <span>Watermark</span>
            </button>

            <button
              onClick={() => setMode('pageNumber')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer ${mode === 'pageNumber' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-slate-900 text-slate-400'
                }`}
            >
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              <span>Page Numbers</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-800 mx-1" />

            {/* Smart Snapping Grid Toggle */}
            {settings.pdfMultiObjectAlignmentEnabled && (
              <button
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`px-2.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${snapToGrid
                    ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                title="Toggle visual snapping grid for pixel-perfect alignment"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Snap Grid {snapToGrid ? 'ON' : 'OFF'}</span>
              </button>
            )}

            <div className="h-4 w-[1px] bg-slate-800 mx-1" />

            {/* Page Manipulation */}
            <button
              onClick={() => rotatePage(true)}
              className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
              title="Rotate Page 90° Clockwise"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={deleteCurrentPage}
              className="p-1.5 rounded-lg hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 cursor-pointer"
              title="Delete Current Page"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Sub-tool Properties & Advanced Typography Controls */}
          {mode === 'text' && (
            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-slate-400">Font:</span>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-medium"
              >
                <option value="Helvetica">Helvetica / Sans</option>
                <option value="TimesRoman">Times Roman / Serif</option>
                <option value="Courier">Courier / Monospace</option>
              </select>

              <select
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white"
              >
                <option value="12">12px Small</option>
                <option value="14">14px Regular</option>
                <option value="16">16px Normal</option>
                <option value="20">20px Medium</option>
                <option value="24">24px Large</option>
                <option value="32">32px Title</option>
              </select>

              <div className="flex items-center gap-1">
                <span className="text-slate-400">Color:</span>
                <input
                  type="color"
                  value={activeColor}
                  onChange={(e) => setActiveColor(e.target.value)}
                  className="w-5 h-5 rounded border-none bg-transparent cursor-pointer"
                />
              </div>

              {/* Advanced Typography Controls (Tracking & Leading) */}
              {settings.pdfAdvancedTypographyEnabled && (
                <>
                  <div className="h-4 w-[1px] bg-slate-800 mx-1" />
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-medium">Tracking:</span>
                    <input
                      type="range"
                      min="-3"
                      max="15"
                      step="0.5"
                      value={letterSpacing}
                      onChange={(e) => setLetterSpacing(parseFloat(e.target.value))}
                      className="w-16 accent-rose-500"
                    />
                    <span className="font-mono text-slate-300 text-[11px]">{letterSpacing}px</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-medium">Word Space:</span>
                    <input
                      type="range"
                      min="-2"
                      max="20"
                      step="0.5"
                      value={wordSpacing}
                      onChange={(e) => setWordSpacing(parseFloat(e.target.value))}
                      className="w-16 accent-rose-500"
                    />
                    <span className="font-mono text-slate-300 text-[11px]">{wordSpacing}px</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-medium">Leading:</span>
                    <input
                      type="range"
                      min="1.0"
                      max="2.5"
                      step="0.1"
                      value={lineHeight}
                      onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                      className="w-16 accent-rose-500"
                    />
                    <span className="font-mono text-slate-300 text-[11px]">{lineHeight}x</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Multi-Object Alignment Bar (Shows when objects are selected) */}
          {settings.pdfMultiObjectAlignmentEnabled && selectedAnnotationIds.length > 0 && (
            <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-cyan-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>{selectedAnnotationIds.length} Objects Selected</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => alignSelected('left')}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => alignSelected('center')}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => alignSelected('top')}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
                  title="Align Top"
                >
                  Align Top
                </button>
                <button
                  onClick={() => alignSelected('distributeHorizontally')}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
                  title="Distribute Evenly"
                >
                  Distribute
                </button>
                <button
                  onClick={deleteSelectedObjects}
                  className="px-2 py-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 cursor-pointer ml-1"
                  title="Delete Selected"
                >
                  Delete ({selectedAnnotationIds.length})
                </button>
                <button
                  onClick={() => setSelectedAnnotationIds([])}
                  className="px-2 py-1 rounded text-slate-400 hover:text-white cursor-pointer ml-1"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Rubber Stamps Bar */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">1-Click Stamps:</span>
            {STAMP_PRESETS.map((st) => (
              <button
                key={st.text}
                onClick={() => addStamp(st)}
                className="px-2.5 py-1 rounded-md font-bold text-[11px] border tracking-wider transition-all hover:scale-105 cursor-pointer"
                style={{
                  color: st.color,
                  borderColor: st.color,
                  backgroundColor: `${st.color}15`,
                }}
              >
                {st.text}
              </button>
            ))}
          </div>

          {/* Dual Panel Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Sidebar Page Thumbnails Carousel */}
            <div className="lg:col-span-1 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 max-h-[800px] overflow-y-auto">
              <div className="text-xs font-semibold text-slate-400 px-1">
                Pages ({numPages - deletedPages.size})
              </div>
              <div className="space-y-2.5">
                {pageThumbnails.map((thumb, idx) => {
                  const isDeleted = deletedPages.has(idx);
                  const isCurrent = currentPage === idx + 1;
                  return (
                    <div
                      key={idx}
                      onClick={() => !isDeleted && setCurrentPage(idx + 1)}
                      className={`relative p-2 rounded-xl border transition-all cursor-pointer ${isCurrent
                          ? 'border-rose-500 bg-rose-500/10 shadow-lg'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                        } ${isDeleted ? 'opacity-30 pointer-events-none' : ''}`}
                    >
                      <img
                        src={thumb}
                        alt={`Page ${idx + 1}`}
                        className="w-full h-auto rounded border border-slate-800 shadow-sm"
                        style={{
                          transform: `rotate(${pageRotations[idx] || 0}deg)`,
                        }}
                      />
                      <div className="flex items-center justify-between text-[11px] mt-1.5 px-1 text-slate-400">
                        <span>Page {idx + 1}</span>
                        {isCurrent && <span className="text-rose-400 font-bold">Active</span>}
                        {isDeleted && <span className="text-red-500">Deleted</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Central High-Res Page Editor Canvas */}
            <div className="lg:col-span-4 rounded-2xl bg-slate-900/60 p-4 sm:p-8 border border-slate-800 overflow-x-auto flex justify-center items-start">
              <div
                ref={pageContainerRef}
                onClick={handlePageClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="relative bg-white shadow-2xl rounded-sm transition-all select-none"
                style={{
                  transform: `scale(${zoom}) rotate(${pageRotations[currentPage - 1] || 0}deg)`,
                  transformOrigin: 'top center',
                  cursor: mode === 'draw' ? 'crosshair' : mode === 'text' ? 'text' : 'default',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 0, 0, 0.2)',
                }}
              >
                {/* Visual Snapping Grid Canvas Overlay */}
                {snapToGrid && (
                  <div
                    className="absolute inset-0 pointer-events-none z-10 opacity-20"
                    style={{
                      backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
                      backgroundSize: `${gridSize}px ${gridSize}px`
                    }}
                  />
                )}

                {/* PDF Page Image */}
                {pageThumbnails[currentPage - 1] && (
                  <img
                    src={pageThumbnails[currentPage - 1]}
                    alt={`Page ${currentPage}`}
                    className="max-w-[700px] w-full h-auto pointer-events-none"
                  />
                )}

                {/* Overlaid Text Annotations with Typography */}
                {textAnnotations
                  .filter((a) => a.pageIndex === currentPage - 1)
                  .map((ann) => {
                    const isSelected = selectedAnnotationIds.includes(ann.id);
                    return (
                      <div
                        key={ann.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelectAnnotation(ann.id);
                        }}
                        className={`absolute font-bold px-1.5 py-0.5 rounded cursor-pointer group transition-all ${isSelected
                            ? 'ring-2 ring-cyan-500 bg-cyan-100/40'
                            : 'border border-dashed border-blue-400/60 bg-blue-500/10 hover:border-solid hover:bg-white'
                          }`}
                        style={{
                          left: `${ann.x}%`,
                          top: `${ann.y}%`,
                          fontSize: `${ann.fontSize}px`,
                          color: ann.color,
                          fontFamily: ann.fontFamily,
                          letterSpacing: ann.letterSpacing ? `${ann.letterSpacing}px` : undefined,
                          wordSpacing: ann.wordSpacing ? `${ann.wordSpacing}px` : undefined,
                          lineHeight: ann.lineHeight || 1.4,
                        }}
                      >
                        {ann.text}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTextAnnotations((prev) => prev.filter((a) => a.id !== ann.id));
                          }}
                          className="hidden group-hover:inline-block ml-1 text-red-500 font-normal hover:scale-110"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}

                {/* Overlaid Shapes, Highlights & Redactions */}
                {shapeAnnotations
                  .filter((s) => s.pageIndex === currentPage - 1)
                  .map((shape) => {
                    const isSelected = selectedAnnotationIds.includes(shape.id);
                    return (
                      <div
                        key={shape.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelectAnnotation(shape.id);
                        }}
                        className={`absolute group cursor-pointer ${isSelected ? 'ring-2 ring-cyan-500' : ''
                          }`}
                        style={{
                          left: `${shape.x}%`,
                          top: `${shape.y}%`,
                          width: `${shape.width}%`,
                          height: `${shape.height}%`,
                          backgroundColor: shape.fill ? shape.color : 'transparent',
                          borderColor: shape.color,
                          borderWidth: shape.fill ? '0' : '2px',
                          borderStyle: 'solid',
                          borderRadius: shape.type === 'circle' ? '9999px' : '2px',
                          opacity: shape.opacity,
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShapeAnnotations((prev) => prev.filter((s) => s.id !== shape.id));
                          }}
                          className="hidden group-hover:block absolute -top-3 -right-3 w-5 h-5 bg-red-600 text-white rounded-full text-xs font-bold leading-none text-center shadow"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}

                {/* Overlaid Stamps & Signatures */}
                {stampAnnotations
                  .filter((s) => s.pageIndex === currentPage - 1)
                  .map((stamp) => (
                    <div
                      key={stamp.id}
                      className="absolute group cursor-move select-none"
                      style={{
                        left: `${stamp.x}%`,
                        top: `${stamp.y}%`,
                      }}
                    >
                      {stamp.imageUrl ? (
                        <img
                          src={stamp.imageUrl}
                          alt="Signature"
                          className="h-14 w-auto pointer-events-none drop-shadow"
                        />
                      ) : (
                        <div
                          className="px-3 py-1 rounded font-black tracking-widest text-sm border-2 transform -rotate-12 select-none"
                          style={{
                            color: stamp.color,
                            borderColor: stamp.color,
                            backgroundColor: `${stamp.color}15`,
                          }}
                        >
                          {stamp.text}
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStampAnnotations((prev) => prev.filter((s) => s.id !== stamp.id));
                        }}
                        className="hidden group-hover:block absolute -top-2 -right-2 w-4 h-4 bg-red-600 text-white rounded-full text-xs font-bold leading-none text-center shadow"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                {/* Overlaid Freehand Drawing Vector SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {drawingPaths
                    .filter((d) => d.pageIndex === currentPage - 1)
                    .map((draw) => (
                      <polyline
                        key={draw.id}
                        points={draw.points.map((p) => `${(p.x / 100) * 700},${(p.y / 100) * 990}`).join(' ')}
                        fill="none"
                        stroke={draw.color}
                        strokeWidth={draw.strokeWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ))}
                  {isDrawing && currentPath.length > 1 && (
                    <polyline
                      points={currentPath.map((p) => `${(p.x / 100) * 700},${(p.y / 100) * 990}`).join(' ')}
                      fill="none"
                      stroke={activeColor}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>

                {/* Live Watermark Simulation */}
                {mode === 'watermark' && watermarkText.trim() && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none"
                    style={{
                      transform: 'rotate(-45deg)',
                      opacity: watermarkOpacity,
                      color: watermarkColor,
                      fontSize: '60px',
                      fontWeight: 'bold',
                    }}
                  >
                    {watermarkText}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SPECIALIST FEATURE 1: True Word Processor Text Reflow Modal */}
      {showReflowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Word Processor Text Reflow Mode
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fluid paragraph editing that pushes surrounding content naturally down (No overlapping coordinates!)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReflowModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Page {currentPage} Extracted Paragraphs:</span>
                <span>{reflowContent.split(/\s+/).filter(Boolean).length} words</span>
              </div>

              <textarea
                value={reflowContent}
                onChange={(e) => setReflowContent(e.target.value)}
                rows={12}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white font-sans text-sm leading-relaxed focus:outline-none focus:border-rose-500 resize-none"
                placeholder="Type or edit text here... Notice how words wrap and paragraphs flow naturally down!"
              />

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Reflow engine preserves margins and structure, allowing unlimited typing without geometric clipping.
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={exportReflowAsDocx}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-blue-400" />
                <span>Export as Word DOCX</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReflowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={applyReflowToPage}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-rose-500/20 cursor-pointer"
                >
                  Apply Reflow to PDF Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SPECIALIST FEATURE 2: Bulk Extraction of Highlights Modal */}
      {showHighlightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Highlighter className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Bulk Highlights Extractor
                  </h3>
                  <p className="text-xs text-slate-400">
                    Extract all highlighted passages across document into a clean study guide
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHighlightsModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {getAllHighlights().length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl space-y-2">
                  <AlertCircle className="w-6 h-6 mx-auto text-amber-500/60" />
                  <p>No highlights detected yet.</p>
                  <p className="text-slate-600">Select "Highlight" tool in the toolbar and drag across any text.</p>
                </div>
              ) : (
                getAllHighlights().map((h, idx) => (
                  <div
                    key={h.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-400">
                        Page {h.pageIndex + 1} • Highlight #{idx + 1}
                      </span>
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                    </div>
                    <p className="text-xs text-slate-200 italic leading-relaxed">
                      "{h.snippet}"
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={downloadHighlightsNotes}
                disabled={getAllHighlights().length === 0}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Download Study Guide (.md)</span>
              </button>

              <button
                onClick={copyAllHighlights}
                disabled={getAllHighlights().length === 0}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All to Clipboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPECIALIST FEATURE 5: Native Reference Manager & Citations Modal */}
      {showReferenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Native Reference Manager & Dynamic Citation Generator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Insert APA, MLA, Chicago & IEEE citations right on page and sync with Zotero/Mendeley
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReferenceModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Citation Style Picker */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Citation Style:</span>
              {(['APA', 'MLA', 'Chicago', 'IEEE', 'Harvard'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setCitationStyle(st)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${citationStyle === st
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* References List */}
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {references.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-white">{r.title}</p>
                    <p className="text-slate-400">{r.authors} ({r.year}) • {r.journal}</p>
                    <div className="text-[11px] text-emerald-400 font-mono">
                      Preview: {formatCitation(r, citationStyle)}
                    </div>
                  </div>
                  <button
                    onClick={() => insertCitationToPage(r)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shrink-0 cursor-pointer shadow"
                  >
                    Insert In-Text
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Reference Form */}
            <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-slate-300">Quick Add Paper / Reference:</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Paper Title"
                  value={newRefTitle}
                  onChange={(e) => setNewRefTitle(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Authors (e.g. Smith, J., Doe, A.)"
                  value={newRefAuthors}
                  onChange={(e) => setNewRefAuthors(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Year (e.g. 2024)"
                  value={newRefYear}
                  onChange={(e) => setNewRefYear(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                />
                <input
                  type="text"
                  placeholder="Journal / Conference / Publisher"
                  value={newRefJournal}
                  onChange={(e) => setNewRefJournal(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                />
              </div>
              <button
                onClick={() => {
                  if (!newRefTitle.trim() || !newRefAuthors.trim()) {
                    toast.error('Please enter title and authors');
                    return;
                  }
                  setReferences((prev) => [
                    ...prev,
                    {
                      id: 'ref-' + Date.now(),
                      title: newRefTitle,
                      authors: newRefAuthors,
                      year: newRefYear || '2024',
                      journal: newRefJournal || 'Scholarly Publication',
                      type: 'article',
                    },
                  ]);
                  setNewRefTitle('');
                  setNewRefAuthors('');
                  setNewRefYear('');
                  setNewRefJournal('');
                  toast.success('Reference added');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium cursor-pointer"
              >
                + Add to Reference Library
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={exportBibTex}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export BibTeX (.bib) for Zotero / Mendeley</span>
              </button>

              <button
                onClick={() => setShowReferenceModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPECIALIST FEATURE 6: Dynamic PDF-to-Mind-Map Conversion Modal */}
      {showMindMapModal && mindMapRoot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-4xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Dynamic Document Mind Map & Conceptual Navigator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Instantly navigate complex 100-page files conceptually rather than page-by-page. Click any node to jump!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMindMapModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive SVG Mind Map Canvas */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-auto max-h-[460px]">
              <div className="flex flex-col items-center space-y-6 min-w-[700px]">
                {/* Root Document Node */}
                <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-purple-500/20 flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  <span>{mindMapRoot.title}</span>
                </div>

                {/* Connecting Line Down */}
                <div className="w-0.5 h-6 bg-gradient-to-b from-purple-500 to-indigo-500" />

                {/* Level 1 Page & Section Branch Nodes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                  {mindMapRoot.children?.map((child) => (
                    <div
                      key={child.id}
                      onClick={() => {
                        setCurrentPage(child.page);
                        setShowMindMapModal(false);
                        toast.success(`Jumped directly to Page ${child.page}!`);
                      }}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/60 hover:bg-purple-950/20 transition-all cursor-pointer group shadow-md"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono text-purple-400 font-bold">
                          Page {child.page}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                          Jump →
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white group-hover:text-purple-300">
                        {child.title}
                      </p>
                      {child.children?.map((sub) => (
                        <p key={sub.id} className="text-[11px] text-slate-400 mt-1 italic">
                          ↳ {sub.title}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
              <span>💡 Tip: Click any card to navigate immediately to that section in the editor.</span>
              <button
                onClick={() => setShowMindMapModal(false)}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold cursor-pointer shadow"
              >
                Close Mind Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Signature Pad Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 text-rose-400" />
                <span>Create Digital Signature</span>
              </h3>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type vs Draw Switch */}
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                onClick={() => setSignatureType('draw')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${signatureType === 'draw' ? 'bg-rose-600 text-white' : 'text-slate-400'
                  }`}
              >
                Draw Signature
              </button>
              <button
                onClick={() => setSignatureType('type')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${signatureType === 'type' ? 'bg-rose-600 text-white' : 'text-slate-400'
                  }`}
              >
                Type Signature
              </button>
            </div>

            {/* Color Choice */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Ink Color:</span>
              <div className="flex items-center gap-2">
                {['#000000', '#1e3a8a', '#166534', '#991b1b'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSignatureColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${signatureColor === c ? 'border-white scale-110' : 'border-transparent'
                      }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Drawing Canvas or Type Input */}
            {signatureType === 'draw' ? (
              <div className="space-y-2">
                <canvas
                  ref={sigCanvasRef}
                  width={380}
                  height={140}
                  onMouseDown={startSigDraw}
                  onMouseMove={drawSig}
                  onMouseUp={() => setIsDrawingSig(false)}
                  onMouseLeave={() => setIsDrawingSig(false)}
                  className="w-full bg-white rounded-xl border border-slate-800 cursor-crosshair touch-none shadow-inner"
                />
                <button
                  type="button"
                  onClick={clearSigCanvas}
                  className="text-xs text-slate-400 hover:text-rose-400 underline cursor-pointer"
                >
                  Clear drawing
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={typedSignatureName}
                  onChange={(e) => setTypedSignatureName(e.target.value)}
                  placeholder="Type your full name..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500"
                />
                <div className="p-4 bg-white rounded-xl text-center shadow-inner">
                  <p
                    className="text-3xl italic tracking-wide"
                    style={{
                      fontFamily: '"Brush Script MT", "Caveat", "Segoe Script", cursive',
                      color: signatureColor,
                    }}
                  >
                    {typedSignatureName || 'Your Signature'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowSignatureModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSignature}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                Place Signature on Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
