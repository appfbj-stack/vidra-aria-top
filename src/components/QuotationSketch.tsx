import React from 'react';

interface QuotationSketchProps {
  description: string;
  width: number; // in meters, e.g. 1.20
  height: number; // in meters, e.g. 1.90
  glassColorName?: string; // e.g. "Incolor", "Fumê", "Verde", "Bronze"
  templateStyle?: 'auto' | 'box' | 'janela' | 'porta' | 'espelho' | 'basculante' | 'fixo';
}

export default function QuotationSketch({
  description,
  width,
  height,
  glassColorName = '',
  templateStyle = 'auto',
}: QuotationSketchProps) {
  // 1. Detect template style from description if "auto"
  const getDetectedStyle = (): 'box' | 'janela' | 'porta' | 'espelho' | 'basculante' | 'fixo' => {
    if (templateStyle !== 'auto') return templateStyle;
    const desc = description.toLowerCase();
    if (desc.includes('box') || desc.includes('banheiro')) return 'box';
    if (desc.includes('janela') || desc.includes('correr') || desc.includes('vitrô')) return 'janela';
    if (desc.includes('porta') || desc.includes('gira') || desc.includes('pivotante') || desc.includes('giro')) return 'porta';
    if (desc.includes('espelho')) return 'espelho';
    if (desc.includes('basculante') || desc.includes('maximar') || desc.includes('maxim') || desc.includes('veneziana')) return 'basculante';
    return 'fixo'; // general flat glass pane
  };

  const style = getDetectedStyle();
  const widthMm = Math.round(width * 1000);
  const heightMm = Math.round(height * 1000);

  // 2. Determine glass fill color matching the glass color name
  const getGlassColors = () => {
    const color = glassColorName.toLowerCase();
    if (color.includes('fumê') || color.includes('fume') || color.includes('cinza') || color.includes('preto')) {
      return {
        fill: 'rgba(107, 114, 128, 0.25)', // Gray tint
        border: '#4B5563',
      };
    }
    if (color.includes('verde')) {
      return {
        fill: 'rgba(52, 211, 153, 0.25)', // Green tint
        border: '#059669',
      };
    }
    if (color.includes('bronze') || color.includes('marrom')) {
      return {
        fill: 'rgba(245, 158, 11, 0.22)', // Amber bronze tint
        border: '#D97706',
      };
    }
    // Default Incolor / Blue-ish clear glass
    return {
      fill: 'rgba(186, 230, 253, 0.25)', // Sky blue tint
      border: '#0284c7',
    };
  };

  const colors = getGlassColors();

  // 3. Scale calculation to fit inside a 200x200 canvas while preserving aspect ratio
  // Standard viewport is 220x220, leaving margin for dimension lines (40px)
  const pad = 35; // margin left, top, right, bottom for sizing lines
  const drawWidthMaxSize = 140; 
  const drawHeightMaxSize = 140;

  let dw = drawWidthMaxSize;
  let dh = drawHeightMaxSize;

  if (width > 0 && height > 0) {
    const ratio = width / height;
    if (ratio >= 1) {
      // Wider than/equal to tall
      dw = drawWidthMaxSize;
      dh = Math.max(35, drawHeightMaxSize / ratio);
    } else {
      // Taller than wide
      dh = drawHeightMaxSize;
      dw = Math.max(35, drawWidthMaxSize * ratio);
    }
  }

  // Center drawing bounds
  const x0 = pad + (drawWidthMaxSize - dw) / 2;
  const y0 = pad + (drawHeightMaxSize - dh) / 2;
  const x1 = x0 + dw;
  const y1 = y0 + dh;

  // Let's render custom SVG designs based on the detected layout template
  const renderTemplateGraphics = () => {
    switch (style) {
      case 'box':
        // A direct shower box visual: left fixed glass, right sliding glass
        return (
          <>
            {/* Left Glass Panel (Fixed) */}
            <rect
              x={x0}
              y={y0}
              width={dw / 2}
              height={dh}
              fill={colors.fill}
              stroke={colors.border}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Right Glass Panel (Sliding, overlaps slightly for bypass) */}
            <rect
              x={x0 + dw / 2}
              y={y0}
              width={dw / 2}
              height={dh}
              fill={colors.fill}
              stroke={colors.border}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            
            {/* Top aluminum track / bar */}
            <rect
              x={x0 - 4}
              y={y0 - 5}
              width={dw + 8}
              height={6}
              fill="#9CA3AF"
              stroke="#4B5563"
              strokeWidth="1"
              rx="2"
            />
            {/* Bottom wheel slider track */}
            <rect
              x={x0 - 2}
              y={y1 - 1}
              width={dw + 4}
              height={4}
              fill="#D1D5DB"
              stroke="#6B7280"
              strokeWidth="1"
            />

            {/* Sliding door arrow indicator (right leaf slides left) */}
            <path
              d={`M ${x0 + (dw * 3) / 4 + 10} ${y0 + dh / 2} L ${x0 + (dw * 3) / 4 - 10} ${y0 + dh / 2}`}
              stroke="#4B5563"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="2,2"
            />
            <path
              d={`M ${x0 + (dw * 3) / 4 - 10} ${y0 + dh / 2} L ${x0 + (dw * 3) / 4 - 5} ${y0 + dh / 2 - 4} M ${x0 + (dw * 3) / 4 - 10} ${y0 + dh / 2} L ${x0 + (dw * 3) / 4 - 5} ${y0 + dh / 2 + 4}`}
              stroke="#4B5563"
              strokeWidth="1.5"
              fill="none"
            />

            {/* Door Round Knob Pull */}
            <circle cx={x0 + dw / 2 + 10} cy={y0 + dh / 2} r="4" fill="#374151" stroke="#F3F4F6" strokeWidth="1" />
            
            {/* Glass corner reflections / gloss streaks */}
            <line x1={x0 + 8} y1={y0 + 12} x2={x0 + 18} y2={y0 + 22} stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
            <line x1={x0 + dw / 2 + 14} y1={y0 + 12} x2={x0 + dw / 2 + 24} y2={y0 + 22} stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
            <span className="sr-only">Box de Correr</span>
          </>
        );

      case 'janela':
        // Sliding window (typically 2 leaves but we draw split)
        return (
          <>
            {/* Frame border */}
            <rect
              x={x0 - 3}
              y={y0 - 3}
              width={dw + 6}
              height={dh + 6}
              fill="transparent"
              stroke="#9CA3AF"
              strokeWidth="2.5"
              rx="1"
            />
            {/* Left Leaf */}
            <rect
              x={x0}
              y={y0}
              width={dw / 2}
              height={dh}
              fill={colors.fill}
              stroke={colors.border}
              strokeWidth="1.5"
            />
            {/* Right Leaf */}
            <rect
              x={x0 + dw / 2}
              y={y0}
              width={dw / 2}
              height={dh}
              fill={colors.fill}
              stroke={colors.border}
              strokeWidth="1.5"
            />
            {/* Tiny latches */}
            <rect x={x0 + dw / 2 - 3} y={y0 + dh / 2 - 6} width={6} height={12} fill="#4B5563" rx="1" />
            {/* Movement arrows */}
            <path d={`M ${x0 + dw / 4 - 8} ${y0 + dh / 2} L ${x0 + dw / 4 + 8} ${y0 + dh / 2}`} stroke="#6B7280" strokeWidth="1" strokeDasharray="1,2" />
            <path d={`M ${x0 + (dw * 3) / 4 + 8} ${y0 + dh / 2} L ${x0 + (dw * 3) / 4 - 8} ${y0 + dh / 2}`} stroke="#6B7280" strokeWidth="1" strokeDasharray="1,2" />
            {/* Reflection lines */}
            <line x1={x0 + 8} y1={y0 + 10} x2={x0 + dw / 2 - 8} y2={y0 + dh - 10} stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="5,15" />
          </>
        );

      case 'porta':
        // A swing glass door with double handles and swing arc indicator
        return (
          <>
            {/* Main glass pane */}
            <rect
              x={x0 + 4}
              y={y0}
              width={dw - 8}
              height={dh}
              fill={colors.fill}
              stroke={colors.border}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            
            {/* Hinge brackets (Pivôs) */}
            <rect x={x0 + 2} y={y0 + 10} width={6} height={8} fill="#4B5563" rx="1" />
            <rect x={x0 + 2} y={y1 - 18} width={6} height={8} fill="#4B5563" rx="1" />

            {/* Premium Vertical Pull Handle (Puxador H) */}
            <line x1={x1 - 12} y1={y0 + dh / 4} x2={x1 - 12} y2={y0 + (dh * 3) / 4} stroke="#374151" strokeWidth="2.5" />
            <circle cx={x1 - 12} cy={y0 + dh / 4} r="2" fill="#111827" />
            <circle cx={x1 - 12} cy={y0 + (dh * 3) / 4} r="2" fill="#111827" />
            {/* Handle connector plugs */}
            <line x1={x1 - 18} y1={y0 + dh / 3} x2={x1 - 12} y2={y0 + dh / 3} stroke="#374151" strokeWidth="1.5" />
            <line x1={x1 - 18} y1={y0 + (dh * 2) / 3} x2={x1 - 12} y2={y0 + (dh * 2) / 3} stroke="#374151" strokeWidth="1.5" />

            {/* Swing dashed arc */}
            <path
              d={`M ${x0 + 4} ${y1} A ${dw - 8} ${dw - 8} 0 0 1 ${x1 - 4} ${y1 - dh/4}`}
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            
            {/* Corner glossy effect */}
            <line x1={x0 + 12} y1={y0 + 12} x2={x0 + 24} y2={y0 + 24} stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          </>
        );

      case 'espelho':
        // Elegant mirror with reflective corner glazes and double-line edge
        return (
          <>
            {/* Outer high-end bevel line */}
            <rect
              x={x0}
              y={y0}
              width={dw}
              height={dh}
              fill="transparent"
              stroke={colors.border}
              strokeWidth="1"
              strokeDasharray="1,1"
            />
            {/* Inner mirror glass plate */}
            <rect
              x={x0 + 3}
              y={y0 + 3}
              width={dw - 6}
              height={dh - 6}
              fill={colors.fill}
              stroke={colors.border}
              strokeWidth="1.5"
            />
            {/* Mirror reflection lines (longer bright glossy segments) */}
            <line x1={x0 + 12} y1={y0 + 12} x2={x0 + dw - 12} y2={y0 + dh - 12} stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeDasharray="10,25" />
            <line x1={x0 + 22} y1={y0 + 12} x2={x0 + 36} y2={y0 + 26} stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
            <line x1={x0 + 12} y1={y0 + 22} x2={x0 + 22} y2={y0 + 32} stroke="rgba(255,255,255,0.7)" strokeWidth="1" />
            <line x1={x1 - 24} y1={y1 - 16} x2={x1 - 12} y2={y1 - 4} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          </>
        );

      case 'basculante':
        // Tilt-out / awning window (Basculante / Maxim-ar) with dashed swing path lines
        return (
          <>
            {/* Aluminium Outer frame */}
            <rect
              x={x0}
              y={y0}
              width={dw}
              height={dh}
              fill={colors.fill}
              stroke="#D1D5DB"
              strokeWidth="3.5"
              rx="1"
            />
            {/* Inner frame */}
            <rect
              x={x0 + 3}
              y={y0 + 3}
              width={dw - 6}
              height={dh - 6}
              fill="transparent"
              stroke={colors.border}
              strokeWidth="1.5"
            />
            {/* Pivot lines (classic dashed triangles indicating window opens outwards) */}
            <polyline
              points={`${x0 + 4},${y0 + 4} ${x1 - 4},${y0 + dh / 2} ${x0 + 4},${y1 - 4}`}
              fill="none"
              stroke="#6B7280"
              strokeWidth="1"
              strokeDasharray="2,3"
            />
            {/* Lever handle at center bottom */}
            <line x1={x0 + dw / 2} y1={y1 - 8} x2={x0 + dw / 2} y2={y1 - 2} stroke="#374151" strokeWidth="2" />
            {/* Glossy accents */}
            <line x1={x0 + 10} y1={y0 + 10} x2={x0 + 20} y2={y0 + 20} stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          </>
        );

      case 'fixo':
      default:
        // Elegant minimal fixed vertical/horizontal glazing panel
        return (
          <>
            {/* Flat glass sheet */}
            <rect
              x={x0}
              y={y0}
              width={dw}
              height={dh}
              fill={colors.fill}
              stroke={colors.border}
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Sleek architectural clamp fittings (Botões/garras inox) */}
            <rect x={x0 - 2} y={y0 + dh / 5} width={4} height={6} fill="#9CA3AF" rx="0.5" />
            <rect x={x0 - 2} y={y1 - dh / 5 - 6} width={4} height={6} fill="#9CA3AF" rx="0.5" />
            <rect x={x1 - 2} y={y0 + dh / 5} width={4} height={6} fill="#9CA3AF" rx="0.5" />
            <rect x={x1 - 2} y={y1 - dh / 5 - 6} width={4} height={6} fill="#9CA3AF" rx="0.5" />

            {/* Glass refraction aesthetics */}
            <line x1={x0 + 15} y1={y0 + 15} x2={x0 + 35} y2={y0 + 35} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
            <line x1={x1 - 25} y1={y1 - 25} x2={x1 - 15} y2={y1 - 15} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          </>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-150 rounded-xl p-4 flex flex-col items-center justify-center select-none shadow-xs max-w-[240px] mx-auto print:break-inside-avoid">
      <div className="w-full text-center mb-1">
        <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase block">Croqui Técnico</span>
        <span className="text-xs font-semibold text-gray-700 truncate block max-w-full px-2">{description || 'Sem descrição'}</span>
      </div>

      <div className="relative w-[210px] h-[215px]">
        <svg viewBox="0 0 210 215" className="w-full h-full" style={{ overflow: 'visible' }}>
          {/* Grid lines in background */}
          <defs>
            <pattern id="lightGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#F1F5F9" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="210" height="215" fill="url(#lightGrid)" rx="6" />

          {/* 4. Glass Panel Graphics */}
          {renderTemplateGraphics()}

          {/* 5. Dimension Line: Width (L) at the bottom */}
          {/* Line */}
          <line x1={x0} y1={y1 + 12} x2={x1} y2={y1 + 12} stroke="#374151" strokeWidth="1" />
          {/* Arrow Left */}
          <polyline points={`${x0 + 4},${y1 + 9} ${x0},${y1 + 12} ${x0 + 4},${y1 + 15}`} fill="none" stroke="#374151" strokeWidth="1" />
          {/* Arrow Right */}
          <polyline points={`${x1 - 4},${y1 + 9} ${x1},${y1 + 12} ${x1 - 4},${y1 + 15}`} fill="none" stroke="#374151" strokeWidth="1" />
          {/* Dimension Label */}
          <rect x={x0 + dw / 2 - 25} y={y1 + 4} width="50" height="15" fill="#FFFFFF" rx="3" />
          <text
            x={x0 + dw / 2}
            y={y1 + 15}
            fill="#1F2937"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            L: {widthMm}mm
          </text>

          {/* 6. Dimension Line: Height (H) on the left side */}
          {/* Line */}
          <line x1={x0 - 12} y1={y0} x2={x0 - 12} y2={y1} stroke="#374151" strokeWidth="1" />
          {/* Arrow Top */}
          <polyline points={`${x0 - 15},${y0 + 4} ${x0 - 12},${y0} ${x0 - 9},${y0 + 4}`} fill="none" stroke="#374151" strokeWidth="1" />
          {/* Arrow Bottom */}
          <polyline points={`${x0 - 15},${y1 - 4} ${x0 - 12},${y1} ${x0 - 9},${y1 - 4}`} fill="none" stroke="#374151" strokeWidth="1" />
          {/* Dimension Label */}
          <g transform={`translate(${x0 - 18}, ${y0 + dh / 2}) rotate(-90)`}>
            <rect x="-25" y="-6" width="50" height="13" fill="#FFFFFF" rx="3" />
            <text
              x="0"
              y="3"
              fill="#1F2937"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
            >
              A: {heightMm}mm
            </text>
          </g>
        </svg>
      </div>

      <div className="w-full flex justify-between px-1.5 mt-2 border-t border-gray-100 pt-1 text-[9px] text-gray-500 font-medium">
        <span>Temp. {glassColorName || 'Incolor'}</span>
        <span>Área: {(width * height).toFixed(2)}m²</span>
      </div>
    </div>
  );
}
