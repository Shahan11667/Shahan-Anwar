'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Box, 
  Layers, 
  RotateCw, 
  RotateCcw, 
  Trash2, 
  Copy, 
  Plus, 
  Download, 
  Sparkles, 
  Eye, 
  Sun, 
  Moon, 
  Sunset, 
  Maximize2, 
  Check, 
  Info, 
  Compass, 
  Sliders, 
  Grid, 
  Palette, 
  Sofa, 
  Bed, 
  Briefcase, 
  UtensilsCrossed, 
  Share2,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

type ViewMode = '2d' | '3d';
type LightingMood = 'day' | 'golden' | 'night';

interface FurnitureCatalogItem {
  id: string;
  name: string;
  category: 'living' | 'bedroom' | 'office' | 'dining';
  widthFt: number;
  depthFt: number;
  heightFt: number;
  defaultColor: string;
  priceUsd: number;
  icon: string;
}

interface PlacedFurniture {
  instanceId: string;
  catalogId: string;
  name: string;
  x: number; // ft from left
  y: number; // ft from top
  widthFt: number;
  depthFt: number;
  heightFt: number;
  rotationDeg: number;
  color: string;
  priceUsd: number;
}

const CATALOG: FurnitureCatalogItem[] = [
  // Living Room
  { id: 'sofa-sectional', name: 'L-Shape Sectional Sofa', category: 'living', widthFt: 8.0, depthFt: 5.5, heightFt: 2.8, defaultColor: '#334155', priceUsd: 1450, icon: 'Sofa' },
  { id: 'sofa-loveseat', name: 'Modern 2-Seater Loveseat', category: 'living', widthFt: 5.2, depthFt: 3.0, heightFt: 2.7, defaultColor: '#475569', priceUsd: 780, icon: 'Sofa' },
  { id: 'coffee-table', name: 'Marble Oval Coffee Table', category: 'living', widthFt: 4.0, depthFt: 2.2, heightFt: 1.5, defaultColor: '#e2e8f0', priceUsd: 380, icon: 'Box' },
  { id: 'tv-console', name: '75" OLED TV & Media Console', category: 'living', widthFt: 6.0, depthFt: 1.5, heightFt: 4.5, defaultColor: '#0f172a', priceUsd: 1200, icon: 'Tv' },
  { id: 'floor-lamp', name: 'Minimalist Arc Floor Lamp', category: 'living', widthFt: 1.8, depthFt: 1.8, heightFt: 6.2, defaultColor: '#f59e0b', priceUsd: 190, icon: 'Lamp' },
  { id: 'area-rug', name: 'Scandinavian Wool Area Rug', category: 'living', widthFt: 9.0, depthFt: 7.0, heightFt: 0.1, defaultColor: '#cbd5e1', priceUsd: 420, icon: 'Grid' },
  { id: 'bookshelf', name: 'Tall Wall Bookshelf', category: 'living', widthFt: 3.5, depthFt: 1.2, heightFt: 7.0, defaultColor: '#78350f', priceUsd: 320, icon: 'Layers' },

  // Bedroom
  { id: 'bed-king', name: 'King Size Platform Bed', category: 'bedroom', widthFt: 6.8, depthFt: 7.2, heightFt: 3.8, defaultColor: '#1e293b', priceUsd: 1350, icon: 'Bed' },
  { id: 'nightstand', name: 'Floating Bedside Nightstand', category: 'bedroom', widthFt: 2.0, depthFt: 1.6, heightFt: 1.8, defaultColor: '#94a3b8', priceUsd: 160, icon: 'Box' },
  { id: 'wardrobe', name: 'Triple-Door Wardrobe Closet', category: 'bedroom', widthFt: 6.0, depthFt: 2.2, heightFt: 7.5, defaultColor: '#334155', priceUsd: 890, icon: 'Layers' },

  // Office
  { id: 'standing-desk', name: 'Smart Motorized Standing Desk', category: 'office', widthFt: 5.0, depthFt: 2.5, heightFt: 2.8, defaultColor: '#0f172a', priceUsd: 650, icon: 'Briefcase' },
  { id: 'office-chair', name: 'Ergonomic High-Back Mesh Chair', category: 'office', widthFt: 2.2, depthFt: 2.2, heightFt: 3.5, defaultColor: '#2563eb', priceUsd: 380, icon: 'Briefcase' },
  { id: 'plant-fig', name: 'Potted Fiddle Leaf Fig Plant', category: 'office', widthFt: 1.8, depthFt: 1.8, heightFt: 5.5, defaultColor: '#16a34a', priceUsd: 120, icon: 'Tree' },

  // Dining
  { id: 'dining-table', name: 'Solid Oak 6-Person Dining Table', category: 'dining', widthFt: 6.0, depthFt: 3.2, heightFt: 2.5, defaultColor: '#854d0e', priceUsd: 950, icon: 'UtensilsCrossed' },
  { id: 'dining-chair', name: 'Upholstered Dining Chair', category: 'dining', widthFt: 1.8, depthFt: 1.8, heightFt: 3.0, defaultColor: '#64748b', priceUsd: 140, icon: 'UtensilsCrossed' },
];

const FLOOR_TEXTURES = [
  { id: 'oak', name: 'Natural White Oak', color: '#e8dcce', patternColor: '#dfcfbe', costPerSqFt: 7.5 },
  { id: 'walnut', name: 'Dark Smoked Walnut', color: '#574134', patternColor: '#473428', costPerSqFt: 9.0 },
  { id: 'marble', name: 'Carrara White Marble', color: '#f8fafc', patternColor: '#e2e8f0', costPerSqFt: 14.0 },
  { id: 'concrete', name: 'Industrial Polished Concrete', color: '#64748b', patternColor: '#475569', costPerSqFt: 6.0 },
  { id: 'carpet', name: 'Warm Cream Wool Carpet', color: '#f1ede4', patternColor: '#e5ded1', costPerSqFt: 5.5 },
];

const WALL_COLORS = [
  { id: 'white', name: 'Nordic Clean White', hex: '#f8fafc' },
  { id: 'sage', name: 'Muted Sage Green', hex: '#94a3b8' },
  { id: 'slate', name: 'Modern Deep Slate', hex: '#1e293b' },
  { id: 'beige', name: 'Warm Desert Sand', hex: '#d6c8b4' },
  { id: 'navy', name: 'Midnight Navy Blue', hex: '#1e1b4b' },
  { id: 'terracotta', name: 'Rustic Terracotta', hex: '#c2410c' },
];

export default function InteriorPlannerTool() {
  const [viewMode, setViewMode] = useState<ViewMode>('2d');
  const [lightingMood, setLightingMood] = useState<LightingMood>('day');

  // Room Architecture
  const [roomWidthFt, setRoomWidthFt] = useState<number>(20);
  const [roomLengthFt, setRoomLengthFt] = useState<number>(16);
  const [ceilingHeightFt, setCeilingHeightFt] = useState<number>(9.5);
  const [selectedFloor, setSelectedFloor] = useState<string>('oak');
  const [selectedWallColor, setSelectedWallColor] = useState<string>('#f8fafc');

  // 3D Camera Controls
  const [orbitAngle, setOrbitAngle] = useState<number>(45); // deg
  const [orbitElevation, setOrbitElevation] = useState<number>(55); // deg
  const [zoom, setZoom] = useState<number>(1.0);

  // Placed Furniture Items
  const [items, setItems] = useState<PlacedFurniture[]>([
    {
      instanceId: 'inst-1',
      catalogId: 'sofa-sectional',
      name: 'L-Shape Sectional Sofa',
      x: 3.5,
      y: 4.0,
      widthFt: 8.0,
      depthFt: 5.5,
      heightFt: 2.8,
      rotationDeg: 0,
      color: '#334155',
      priceUsd: 1450,
    },
    {
      instanceId: 'inst-2',
      catalogId: 'coffee-table',
      name: 'Marble Oval Coffee Table',
      x: 4.8,
      y: 7.2,
      widthFt: 4.0,
      depthFt: 2.2,
      heightFt: 1.5,
      rotationDeg: 0,
      color: '#e2e8f0',
      priceUsd: 380,
    },
    {
      instanceId: 'inst-3',
      catalogId: 'tv-console',
      name: '75" OLED TV & Media Console',
      x: 3.8,
      y: 13.5,
      widthFt: 6.0,
      depthFt: 1.5,
      heightFt: 4.5,
      rotationDeg: 0,
      color: '#0f172a',
      priceUsd: 1200,
    },
    {
      instanceId: 'inst-4',
      catalogId: 'plant-fig',
      name: 'Potted Fiddle Leaf Fig Plant',
      x: 1.5,
      y: 13.5,
      widthFt: 1.8,
      depthFt: 1.8,
      heightFt: 5.5,
      rotationDeg: 0,
      color: '#16a34a',
      priceUsd: 120,
    },
    {
      instanceId: 'inst-5',
      catalogId: 'floor-lamp',
      name: 'Minimalist Arc Floor Lamp',
      x: 12.0,
      y: 3.0,
      widthFt: 1.8,
      depthFt: 1.8,
      heightFt: 6.2,
      rotationDeg: 45,
      color: '#f59e0b',
      priceUsd: 190,
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCatalogTab, setActiveCatalogTab] = useState<'living' | 'bedroom' | 'office' | 'dining'>('living');

  // Dragging in 2D
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; origX: number; origY: number } | null>(null);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('agy_interior_planner_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.items) setItems(parsed.items);
        if (parsed.roomWidthFt) setRoomWidthFt(parsed.roomWidthFt);
        if (parsed.roomLengthFt) setRoomLengthFt(parsed.roomLengthFt);
        if (parsed.selectedFloor) setSelectedFloor(parsed.selectedFloor);
        if (parsed.selectedWallColor) setSelectedWallColor(parsed.selectedWallColor);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem('agy_interior_planner_data', JSON.stringify({
        items,
        roomWidthFt,
        roomLengthFt,
        selectedFloor,
        selectedWallColor,
      }));
    } catch (e) {
      // ignore
    }
  }, [items, roomWidthFt, roomLengthFt, selectedFloor, selectedWallColor]);

  // Calculations
  const roomAreaSqFt = roomWidthFt * roomLengthFt;
  const roomPerimeterFt = (roomWidthFt + roomLengthFt) * 2;
  const wallPaintSqFt = roomPerimeterFt * ceilingHeightFt;
  const floorConfig = FLOOR_TEXTURES.find(f => f.id === selectedFloor) || FLOOR_TEXTURES[0];
  const flooringCost = Math.round(roomAreaSqFt * floorConfig.costPerSqFt);
  const furnitureCost = items.reduce((acc, it) => acc + it.priceUsd, 0);
  const paintGallons = Math.ceil(wallPaintSqFt / 350); // 350 sq ft per gallon
  const totalCost = flooringCost + furnitureCost + (paintGallons * 55);

  // Add Item From Catalog
  const handleAddItem = (cat: FurnitureCatalogItem) => {
    const newItem: PlacedFurniture = {
      instanceId: 'inst-' + Date.now(),
      catalogId: cat.id,
      name: cat.name,
      x: Math.max(1, roomWidthFt / 2 - cat.widthFt / 2),
      y: Math.max(1, roomLengthFt / 2 - cat.depthFt / 2),
      widthFt: cat.widthFt,
      depthFt: cat.depthFt,
      heightFt: cat.heightFt,
      rotationDeg: 0,
      color: cat.defaultColor,
      priceUsd: cat.priceUsd,
    };
    setItems(prev => [...prev, newItem]);
    setSelectedId(newItem.instanceId);
    toast.success(`Placed ${cat.name} in room`);
  };

  // Rotate Selected
  const rotateSelected = (degrees: number = 45) => {
    if (!selectedId) return;
    setItems(prev =>
      prev.map(it => it.instanceId === selectedId ? { ...it, rotationDeg: (it.rotationDeg + degrees) % 360 } : it)
    );
  };

  // Delete Selected
  const deleteSelected = () => {
    if (!selectedId) return;
    setItems(prev => prev.filter(it => it.instanceId !== selectedId));
    setSelectedId(null);
    toast.success('Item removed');
  };

  // Duplicate Selected
  const duplicateSelected = () => {
    const target = items.find(it => it.instanceId === selectedId);
    if (!target) return;
    const clone: PlacedFurniture = {
      ...target,
      instanceId: 'inst-' + Date.now(),
      x: Math.min(roomWidthFt - target.widthFt, target.x + 1),
      y: Math.min(roomLengthFt - target.depthFt, target.y + 1),
    };
    setItems(prev => [...prev, clone]);
    setSelectedId(clone.instanceId);
    toast.success(`Duplicated ${target.name}`);
  };

  // Smart Designer Room Presets
  const applyPresetLayout = (preset: 'scandiLiving' | 'techOffice' | 'masterSuite') => {
    if (preset === 'scandiLiving') {
      setRoomWidthFt(20);
      setRoomLengthFt(16);
      setSelectedFloor('oak');
      setSelectedWallColor('#f8fafc');
      setItems([
        { instanceId: 'p1', catalogId: 'sofa-sectional', name: 'L-Shape Sectional Sofa', x: 3, y: 3.5, widthFt: 8, depthFt: 5.5, heightFt: 2.8, rotationDeg: 0, color: '#334155', priceUsd: 1450 },
        { instanceId: 'p2', catalogId: 'coffee-table', name: 'Marble Oval Coffee Table', x: 4.5, y: 6.8, widthFt: 4, depthFt: 2.2, heightFt: 1.5, rotationDeg: 0, color: '#e2e8f0', priceUsd: 380 },
        { instanceId: 'p3', catalogId: 'tv-console', name: '75" OLED TV & Media Console', x: 3.5, y: 13, widthFt: 6, depthFt: 1.5, heightFt: 4.5, rotationDeg: 0, color: '#0f172a', priceUsd: 1200 },
        { instanceId: 'p4', catalogId: 'area-rug', name: 'Scandinavian Wool Area Rug', x: 2.5, y: 4.5, widthFt: 9, depthFt: 7, heightFt: 0.1, rotationDeg: 0, color: '#cbd5e1', priceUsd: 420 },
        { instanceId: 'p5', catalogId: 'plant-fig', name: 'Potted Fiddle Leaf Fig Plant', x: 1.5, y: 13, widthFt: 1.8, depthFt: 1.8, heightFt: 5.5, rotationDeg: 0, color: '#16a34a', priceUsd: 120 },
      ]);
      toast.success('Applied Scandinavian Living Room layout!');
    } else if (preset === 'techOffice') {
      setRoomWidthFt(16);
      setRoomLengthFt(14);
      setSelectedFloor('walnut');
      setSelectedWallColor('#1e293b');
      setItems([
        { instanceId: 'o1', catalogId: 'standing-desk', name: 'Smart Motorized Standing Desk', x: 5, y: 4, widthFt: 5, depthFt: 2.5, heightFt: 2.8, rotationDeg: 0, color: '#0f172a', priceUsd: 650 },
        { instanceId: 'o2', catalogId: 'office-chair', name: 'Ergonomic High-Back Mesh Chair', x: 6.2, y: 7, widthFt: 2.2, depthFt: 2.2, heightFt: 3.5, rotationDeg: 0, color: '#2563eb', priceUsd: 380 },
        { instanceId: 'o3', catalogId: 'bookshelf', name: 'Tall Wall Bookshelf', x: 1, y: 2, widthFt: 3.5, depthFt: 1.2, heightFt: 7, rotationDeg: 90, color: '#78350f', priceUsd: 320 },
        { instanceId: 'o4', catalogId: 'plant-fig', name: 'Potted Fiddle Leaf Fig Plant', x: 13, y: 2, widthFt: 1.8, depthFt: 1.8, heightFt: 5.5, rotationDeg: 0, color: '#16a34a', priceUsd: 120 },
      ]);
      toast.success('Applied Developer Home Studio layout!');
    } else if (preset === 'masterSuite') {
      setRoomWidthFt(18);
      setRoomLengthFt(16);
      setSelectedFloor('carpet');
      setSelectedWallColor('#d6c8b4');
      setItems([
        { instanceId: 'b1', catalogId: 'bed-king', name: 'King Size Platform Bed', x: 5.5, y: 2, widthFt: 6.8, depthFt: 7.2, heightFt: 3.8, rotationDeg: 0, color: '#1e293b', priceUsd: 1350 },
        { instanceId: 'b2', catalogId: 'nightstand', name: 'Floating Bedside Nightstand', x: 2.8, y: 2.5, widthFt: 2, depthFt: 1.6, heightFt: 1.8, rotationDeg: 0, color: '#94a3b8', priceUsd: 160 },
        { instanceId: 'b3', catalogId: 'nightstand', name: 'Floating Bedside Nightstand', x: 13, y: 2.5, widthFt: 2, depthFt: 1.6, heightFt: 1.8, rotationDeg: 0, color: '#94a3b8', priceUsd: 160 },
        { instanceId: 'b4', catalogId: 'wardrobe', name: 'Triple-Door Wardrobe Closet', x: 1, y: 12, widthFt: 6, depthFt: 2.2, heightFt: 7.5, rotationDeg: 0, color: '#334155', priceUsd: 890 },
      ]);
      toast.success('Applied Luxury Master Suite layout!');
    }
  };

  // Main Canvas Render (2D Blueprint or 3D Isometric View)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (viewMode === '2d') {
      // ================= 2D BLUEPRINT VIEW =================
      const scale = Math.min((width - 120) / roomWidthFt, (height - 120) / roomLengthFt) * zoom;
      const originX = (width - roomWidthFt * scale) / 2;
      const originY = (height - roomLengthFt * scale) / 2;

      // 1. Draw Architectural Grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridStep = scale; // 1 ft per grid square

      for (let x = 0; x <= roomWidthFt; x++) {
        ctx.beginPath();
        ctx.moveTo(originX + x * scale, originY);
        ctx.lineTo(originX + x * scale, originY + roomLengthFt * scale);
        ctx.stroke();
      }
      for (let y = 0; y <= roomLengthFt; y++) {
        ctx.beginPath();
        ctx.moveTo(originX, originY + y * scale);
        ctx.lineTo(originX + roomWidthFt * scale, originY + y * scale);
        ctx.stroke();
      }

      // 2. Room Floor
      ctx.fillStyle = floorConfig.color;
      ctx.fillRect(originX, originY, roomWidthFt * scale, roomLengthFt * scale);

      // Floor Planks / Tiles Pattern
      ctx.strokeStyle = floorConfig.patternColor;
      ctx.lineWidth = 0.5;
      for (let y = 0; y < roomLengthFt; y += 0.8) {
        ctx.beginPath();
        ctx.moveTo(originX, originY + y * scale);
        ctx.lineTo(originX + roomWidthFt * scale, originY + y * scale);
        ctx.stroke();
      }

      // 3. Walls
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 10;
      ctx.strokeRect(originX, originY, roomWidthFt * scale, roomLengthFt * scale);

      // 4. Dimension Labels (Architectural style)
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${roomWidthFt} ft (${(roomWidthFt * 0.3048).toFixed(1)}m)`, originX + (roomWidthFt * scale) / 2, originY - 18);

      ctx.save();
      ctx.translate(originX - 18, originY + (roomLengthFt * scale) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${roomLengthFt} ft (${(roomLengthFt * 0.3048).toFixed(1)}m)`, 0, 0);
      ctx.restore();

      // 5. Placed Furniture Items
      items.forEach((item) => {
        const isSelected = item.instanceId === selectedId;
        const ix = originX + item.x * scale;
        const iy = originY + item.y * scale;
        const iw = item.widthFt * scale;
        const id = item.depthFt * scale;

        ctx.save();
        ctx.translate(ix + iw / 2, iy + id / 2);
        ctx.rotate((item.rotationDeg * Math.PI) / 180);

        // Drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;

        // Furniture Body
        ctx.fillStyle = item.color;
        ctx.fillRect(-iw / 2, -id / 2, iw, id);

        // Highlight Border if selected
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.strokeStyle = isSelected ? '#38bdf8' : '#0f172a';
        ctx.strokeRect(-iw / 2, -id / 2, iw, id);

        // Label
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.name.slice(0, 14), 0, 0);

        ctx.restore();
      });
    } else {
      // ================= 3D ISOMETRIC / PERSPECTIVE VIEW =================
      const rad = (orbitAngle * Math.PI) / 180;
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);
      const tilt = Math.sin((orbitElevation * Math.PI) / 180);

      const centerX = width / 2;
      const centerY = height / 2 + 30;
      const isoScale = 22 * zoom;

      // Lighting mood setup
      let ambientColor = '#090d16';
      let floorLit = floorConfig.color;
      let wallLit = selectedWallColor;

      if (lightingMood === 'golden') {
        ambientColor = '#1c130d';
        floorLit = '#d97706';
      } else if (lightingMood === 'night') {
        ambientColor = '#030712';
        floorLit = '#1e293b';
        wallLit = '#0f172a';
      }

      // Background Ambiance
      ctx.fillStyle = ambientColor;
      ctx.fillRect(0, 0, width, height);

      // Helper function for 3D coordinate projection
      const project = (x: number, y: number, z: number = 0) => {
        const cx = x - roomWidthFt / 2;
        const cy = y - roomLengthFt / 2;
        const rx = cx * cosA - cy * sinA;
        const ry = (cx * sinA + cy * cosA) * tilt - z * isoScale * 0.9;
        return {
          px: centerX + rx * isoScale,
          py: centerY + ry * isoScale,
        };
      };

      // 1. Draw 3D Room Floor Polygon
      const f0 = project(0, 0, 0);
      const f1 = project(roomWidthFt, 0, 0);
      const f2 = project(roomWidthFt, roomLengthFt, 0);
      const f3 = project(0, roomLengthFt, 0);

      ctx.fillStyle = floorLit;
      ctx.beginPath();
      ctx.moveTo(f0.px, f0.py);
      ctx.lineTo(f1.px, f1.py);
      ctx.lineTo(f2.px, f2.py);
      ctx.lineTo(f3.px, f3.py);
      ctx.closePath();
      ctx.fill();

      // Floor edge outline
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 2. Extrude Back Walls (North & West walls)
      const wallH = ceilingHeightFt;
      const w0 = project(0, 0, wallH);
      const w1 = project(roomWidthFt, 0, wallH);
      const w3 = project(0, roomLengthFt, wallH);

      // Back North Wall
      ctx.fillStyle = wallLit;
      ctx.beginPath();
      ctx.moveTo(f0.px, f0.py);
      ctx.lineTo(f1.px, f1.py);
      ctx.lineTo(w1.px, w1.py);
      ctx.lineTo(w0.px, w0.py);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.stroke();

      // Back West Wall
      ctx.fillStyle = wallLit;
      ctx.beginPath();
      ctx.moveTo(f0.px, f0.py);
      ctx.lineTo(f3.px, f3.py);
      ctx.lineTo(w3.px, w3.py);
      ctx.lineTo(w0.px, w0.py);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.stroke();

      // 3. Render 3D Furniture Blocks (Sorted back-to-front by projected Y)
      const sortedItems = [...items].sort((a, b) => {
        const pa = project(a.x, a.y);
        const pb = project(b.x, b.y);
        return pa.py - pb.py;
      });

      sortedItems.forEach((it) => {
        const isSelected = it.instanceId === selectedId;
        const x = it.x;
        const y = it.y;
        const w = it.widthFt;
        const d = it.depthFt;
        const h = it.heightFt;

        // 8 cube vertices
        const b0 = project(x, y, 0);
        const b1 = project(x + w, y, 0);
        const b2 = project(x + w, y + d, 0);
        const b3 = project(x, y + d, 0);

        const t0 = project(x, y, h);
        const t1 = project(x + w, y, h);
        const t2 = project(x + w, y + d, h);
        const t3 = project(x, y + d, h);

        // Ground drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.moveTo(b0.px, b0.py);
        ctx.lineTo(b1.px, b1.py);
        ctx.lineTo(b2.px, b2.py);
        ctx.lineTo(b3.px, b3.py);
        ctx.closePath();
        ctx.fill();

        // Front face
        ctx.fillStyle = it.color;
        ctx.beginPath();
        ctx.moveTo(b3.px, b3.py);
        ctx.lineTo(b2.px, b2.py);
        ctx.lineTo(t2.px, t2.py);
        ctx.lineTo(t3.px, t3.py);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#38bdf8' : 'rgba(0,0,0,0.3)';
        ctx.stroke();

        // Top face
        ctx.fillStyle = isSelected ? '#38bdf8' : '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(t0.px, t0.py);
        ctx.lineTo(t1.px, t1.py);
        ctx.lineTo(t2.px, t2.py);
        ctx.lineTo(t3.px, t3.py);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Label on top face
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(it.name.slice(0, 12), (t0.px + t2.px) / 2, (t0.py + t2.py) / 2);
      });
    }
  }, [viewMode, roomWidthFt, roomLengthFt, ceilingHeightFt, items, selectedId, selectedFloor, selectedWallColor, orbitAngle, orbitElevation, zoom, lightingMood]);

  // Handle Click / Drag on 2D Canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (viewMode !== '2d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scale = Math.min((canvas.width - 120) / roomWidthFt, (canvas.height - 120) / roomLengthFt) * zoom;
    const originX = (canvas.width - roomWidthFt * scale) / 2;
    const originY = (canvas.height - roomLengthFt * scale) / 2;

    // Check hit on any furniture item
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      const ix = originX + it.x * scale;
      const iy = originY + it.y * scale;
      const iw = it.widthFt * scale;
      const id = it.depthFt * scale;

      if (mouseX >= ix && mouseX <= ix + iw && mouseY >= iy && mouseY <= iy + id) {
        setSelectedId(it.instanceId);
        setIsDragging(true);
        dragStartRef.current = { mouseX, mouseY, origX: it.x, origY: it.y };
        return;
      }
    }

    setSelectedId(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragStartRef.current || !selectedId || viewMode !== '2d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const currentMouseX = e.clientX - rect.left;
    const currentMouseY = e.clientY - rect.top;

    const scale = Math.min((canvas.width - 120) / roomWidthFt, (canvas.height - 120) / roomLengthFt) * zoom;
    const deltaXFt = (currentMouseX - dragStartRef.current.mouseX) / scale;
    const deltaYFt = (currentMouseY - dragStartRef.current.mouseY) / scale;

    const newX = Math.max(0.5, Math.min(roomWidthFt - 1, dragStartRef.current.origX + deltaXFt));
    const newY = Math.max(0.5, Math.min(roomLengthFt - 1, dragStartRef.current.origY + deltaYFt));

    setItems(prev =>
      prev.map(it => it.instanceId === selectedId ? { ...it, x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 } : it)
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // Export 2D / 3D Canvas Image
  const exportDesignImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png', 1.0);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interior-plan-${viewMode.toUpperCase()}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    confetti({ particleCount: 35, spread: 60 });
    toast.success(`Exported ${viewMode.toUpperCase()} plan image!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Planner 5D Virtual Interior & 3D Floor Planner</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                3D Studio
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Interactive 2D blueprint • Realistic 3D isometric view • Material customizer • Smart suggestions
            </p>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* 2D / 3D Toggle */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 font-bold">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === '2d' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>2D Blueprint</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === '3d' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Isometric</span>
            </button>
          </div>

          {/* Lighting Mode (for 3D) */}
          {viewMode === '3d' && (
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                onClick={() => setLightingMood('day')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  lightingMood === 'day' ? 'bg-amber-600 text-white' : 'text-slate-400'
                }`}
                title="Bright Day"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLightingMood('golden')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  lightingMood === 'golden' ? 'bg-amber-600 text-white' : 'text-slate-400'
                }`}
                title="Golden Sunset"
              >
                <Sunset className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLightingMood('night')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  lightingMood === 'night' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                }`}
                title="Cozy Night"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={exportDesignImage}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export {viewMode.toUpperCase()} Snapshot</span>
          </button>
        </div>
      </div>

      {/* Smart Designer Templates Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart Room Layouts:</span>
          </span>
          <button
            onClick={() => applyPresetLayout('scandiLiving')}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
          >
            Scandinavian Living Room (20×16 ft)
          </button>
          <button
            onClick={() => applyPresetLayout('techOffice')}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
          >
            Developer Home Studio (16×14 ft)
          </button>
          <button
            onClick={() => applyPresetLayout('masterSuite')}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 cursor-pointer"
          >
            Luxury Master Bedroom (18×16 ft)
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono text-emerald-400 font-bold">
          <DollarSign className="w-4 h-4" />
          <span>Est. Project Cost: ${totalCost.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Studio Grid: Left Catalog & Finishes (4 Cols), Center Canvas (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Control Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 p-5 rounded-2xl bg-slate-950 border border-slate-800 max-h-[850px] overflow-y-auto shadow-xl">
          {/* Room Dimensions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Room Dimensions & Area</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Width (ft)</label>
                <input
                  type="number"
                  min="10"
                  max="40"
                  value={roomWidthFt}
                  onChange={e => setRoomWidthFt(parseInt(e.target.value) || 10)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Length (ft)</label>
                <input
                  type="number"
                  min="10"
                  max="40"
                  value={roomLengthFt}
                  onChange={e => setRoomLengthFt(parseInt(e.target.value) || 10)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex justify-between font-mono">
              <span>Area: <strong className="text-white">{roomAreaSqFt} sq ft</strong> ({(roomAreaSqFt * 0.0929).toFixed(1)} m²)</span>
              <span>Ceiling: <strong className="text-white">{ceilingHeightFt} ft</strong></span>
            </div>
          </div>

          {/* Flooring Material */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Flooring Finish</span>
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {FLOOR_TEXTURES.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFloor(f.id)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    selectedFloor === f.id
                      ? 'border-emerald-500 bg-emerald-950/20 text-white font-bold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full mb-1 border border-black/30" style={{ backgroundColor: f.color }} />
                  <span className="block truncate">{f.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">${f.costPerSqFt}/sq ft</span>
                </button>
              ))}
            </div>
          </div>

          {/* Wall Paint Color */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-pink-400" />
              <span>Wall Paint Color</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {WALL_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedWallColor(c.hex)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    selectedWallColor === c.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Furniture Catalog */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-blue-400" />
              <span>Furniture & Decor Catalog</span>
            </h4>

            {/* Catalog Category Tabs */}
            <div className="flex rounded-xl bg-slate-900 p-0.5 border border-slate-800 text-[11px]">
              {(['living', 'bedroom', 'office', 'dining'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCatalogTab(cat)}
                  className={`flex-1 py-1 rounded-lg capitalize font-medium cursor-pointer ${
                    activeCatalogTab === cat ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Catalog Items Grid */}
            <div className="space-y-2">
              {CATALOG.filter(it => it.category === activeCatalogTab).map(cat => (
                <div
                  key={cat.id}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-all"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-white block">{cat.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {cat.widthFt} × {cat.depthFt} ft • ${cat.priceUsd}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddItem(cat)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Item Controls */}
          {selectedId && (
            <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-800/40 space-y-2 text-xs">
              <span className="font-bold text-sky-300 block">
                Selected: {items.find(i => i.instanceId === selectedId)?.name}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => rotateSelected(45)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer"
                  title="Rotate 45°"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Rotate 45°</span>
                </button>
                <button
                  onClick={duplicateSelected}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer"
                  title="Clone"
                >
                  <Copy className="w-3 h-3" />
                  <span>Clone</span>
                </button>
                <button
                  onClick={deleteSelected}
                  className="px-2.5 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 flex items-center gap-1 cursor-pointer ml-auto"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Canvas Workspace (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* 3D Orbit Camera Controls Bar (shown in 3D mode) */}
          {viewMode === '3d' && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3D Orbit Camera:</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Angle:</span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={orbitAngle}
                    onChange={e => setOrbitAngle(parseInt(e.target.value))}
                    className="w-24 accent-emerald-500"
                  />
                  <span className="font-mono text-white text-[11px] w-8">{orbitAngle}°</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">Tilt:</span>
                  <input
                    type="range"
                    min="20"
                    max="75"
                    value={orbitElevation}
                    onChange={e => setOrbitElevation(parseInt(e.target.value))}
                    className="w-20 accent-emerald-500"
                  />
                  <span className="font-mono text-white text-[11px] w-8">{orbitElevation}°</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-slate-500">Zoom:</span>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.05"
                  value={zoom}
                  onChange={e => setZoom(parseFloat(e.target.value))}
                  className="w-16 accent-emerald-500"
                />
                <span className="font-mono text-white text-[11px]">{Math.round(zoom * 100)}%</span>
              </div>
            </div>
          )}

          {/* Interactive Canvas */}
          <div className="relative rounded-2xl bg-slate-900 p-2 sm:p-4 border border-slate-800 flex justify-center items-center overflow-hidden shadow-2xl">
            <canvas
              ref={canvasRef}
              width={900}
              height={580}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className={`max-w-full h-auto rounded-xl shadow-inner ${
                viewMode === '2d' ? 'cursor-move' : 'cursor-default'
              }`}
            />
          </div>

          {/* Bill of Materials & Ergonomic Guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bill of Materials */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 block">Bill of Materials ({items.length} Items)</span>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {items.map(it => (
                  <div key={it.instanceId} className="flex justify-between text-slate-400">
                    <span>{it.name} ({it.widthFt}×{it.depthFt}')</span>
                    <span className="font-mono text-white">${it.priceUsd}</span>
                  </div>
                ))}
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Flooring ({roomAreaSqFt} sq ft @ ${floorConfig.costPerSqFt})</span>
                  <span className="font-mono text-white">${flooringCost}</span>
                </div>
              </div>
            </div>

            {/* Ergonomic Clearance Checker */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-400" />
                <span>Interior Clearance & Ergonomic Guidelines</span>
              </span>
              <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                <li><strong className="text-slate-300">Coffee Table to Sofa:</strong> Leave 14" to 18" for comfortable legroom.</li>
                <li><strong className="text-slate-300">Primary Walkways:</strong> Maintain 36" (3.0 ft) clear width between major furniture blocks.</li>
                <li><strong className="text-slate-300">TV Viewing Distance:</strong> Optimal distance for a 75" TV is 8.5 to 10.0 ft.</li>
                <li><strong className="text-slate-300">Bed Access:</strong> Ensure at least 30" clearance on both sides of a King bed.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

