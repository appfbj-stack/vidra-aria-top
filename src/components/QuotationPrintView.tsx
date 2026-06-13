/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Quotation, GlassPrice, GlassColor, HardwareKit, AluminumProfile, CompanySettings } from '../types';
import { formatCurrency, formatArea } from '../utils';
import { Printer, X, Download, FileText, FileDown, CheckCircle, MessageSquare } from 'lucide-react';
import QuotationSketch from './QuotationSketch';

interface QuotationPrintViewProps {
  quotation: Quotation;
  glassPrices: GlassPrice[];
  glassColors: GlassColor[];
  hardwareKits: HardwareKit[];
  aluminumProfiles: AluminumProfile[];
  companySettings: CompanySettings;
  onClose: () => void;
}

export default function QuotationPrintView({
  quotation,
  glassPrices,
  glassColors,
  hardwareKits,
  aluminumProfiles,
  companySettings,
  onClose,
}: QuotationPrintViewProps) {
  
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [compactLayout, setCompactLayout] = useState(true);
  const [includeSketches, setIncludeSketches] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const subtotal = quotation.items.reduce((acc, i) => acc + i.itemTotal, 0);
    // Clean telephone number of non-numeric characters
    let cleanedPhone = quotation.client.phone.replace(/\D/g, '');
    if (cleanedPhone && (cleanedPhone.length === 10 || cleanedPhone.length === 11)) {
      cleanedPhone = '55' + cleanedPhone;
    }

    const itemsSummary = quotation.items
      .map((item) => {
        const gPrice = glassPrices.find(g => g.id === item.glassId);
        const gColor = glassColors.find(c => c.id === item.colorId);
        const kHardware = hardwareKits.find(h => h.id === item.hardwareKitId);
        const aProfile = aluminumProfiles.find(a => a.id === item.aluminumId);
        let details = '';
        if (kHardware) details += `\n   Ferragens: ${kHardware.name}`;
        if (aProfile) details += `\n   Alumínio: ${aProfile.name} (${item.aluminumMeters}m)`;
        details += `\n   Vidro: ${gPrice?.name || ''} | Cor: ${gColor?.name || 'Incolor'}`;
        details += `\n   Medidas: ${item.width.toFixed(2)}x${item.height.toFixed(2)}m (${formatArea(item.calculatedArea)})`;
        details += `\n   Valor: ${formatCurrency(item.itemTotal)}`;
        return `• ${item.quantity}x ${item.description}${details}`;
      })
      .join('\n\n');

    const totalStr = formatCurrency(quotation.total);
    const subtotalStr = formatCurrency(subtotal);
    const discountStr = quotation.discountAmount > 0 ? `\n   Desconto: -${formatCurrency(quotation.discountAmount)}` : '';
    const surchargeStr = quotation.surchargeAmount > 0 ? `\n   Taxas: +${formatCurrency(quotation.surchargeAmount)}` : '';

    const message = `🏢 *${companySettings.name || 'Vidraçaria'}*\n` +
      `${companySettings.slogan || ''}\n` +
      `📞 ${companySettings.phone || ''}\n` +
      `✉️ ${companySettings.email || ''}\n` +
      `📍 ${companySettings.address || ''}\n` +
      `🔖 CNPJ: ${companySettings.cnpj || ''}\n\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📄 *ORÇAMENTO Nº ${quotation.number}*\n` +
      `📌 ${quotation.status === 'pendente' ? 'Pendente' : quotation.status === 'aprovado' ? 'Aprovado' : quotation.status === 'rejeitado' ? 'Recusado' : 'Concluído'}\n` +
      `━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 *Cliente:* ${quotation.client.name}\n` +
      `📞 ${quotation.client.phone}\n` +
      `📍 ${quotation.client.address || 'Não informado'}\n\n` +
      `📅 Emissão: ${new Date(quotation.date).toLocaleDateString('pt-BR')}\n` +
      `⏳ Validade: ${new Date(quotation.validUntil).toLocaleDateString('pt-BR')}\n\n` +
      `📋 *ITENS:*\n${itemsSummary}\n\n` +
      `💰 *RESUMO:*\n` +
      `   Subtotal: ${subtotalStr}` + 
      surchargeStr +
      discountStr + `\n` +
      `   *TOTAL: ${totalStr}*\n\n` +
      (quotation.notes ? `📝 ${quotation.notes}\n\n` : '') +
      `✅ *Agradecemos a preferência!*`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Orçamento ${quotation.number}`,
          text: `Orçamento ${quotation.number} - ${quotation.client.name}`,
          url: window.location.href,
        });
      } catch (e) {
        // user cancelled
      }
    } else {
      handlePrint();
    }
  };

  const handleExtendAndExportPDF = async () => {
    const element = document.getElementById('pdf-content');
    if (!element) return;

    setIsGeneratingPDF(true);
    
    // Helper to sanitize advanced modern CSS color functions to standard HSL/HSLA or hex
    const sanitizeCSSColorFunction = (cssText: string): string => {
      if (!cssText) return '';
      
      let result = cssText;

      // Handle oklch and oklab with balanced parentheses matching
      const colorRegex = /(oklch|oklab)\(([^()]*|\([^()]*\))*\)/gi;
      result = result.replace(colorRegex, (match, type) => {
        try {
          const openParenIdx = match.indexOf('(');
          const closeParenIdx = match.lastIndexOf(')');
          if (openParenIdx === -1 || closeParenIdx === -1) return '#888888';
          
          const content = match.slice(openParenIdx + 1, closeParenIdx).trim();
          
          let mainContent = content;
          let alphaStr = '';
          const slashIdx = content.indexOf('/');
          if (slashIdx !== -1) {
            mainContent = content.slice(0, slashIdx).trim();
            alphaStr = content.slice(slashIdx + 1).trim();
          }
          
          const parts = mainContent.split(/[\s,]+/).filter(Boolean);
          if (parts.length < 3) {
            const lowerMatch = match.toLowerCase();
            if (lowerMatch.includes('orange') || lowerMatch.includes('amber')) return '#ea580c';
            if (lowerMatch.includes('slate') || lowerMatch.includes('gray')) return '#475569';
            return '#888888';
          }
          
          const [p1, p2, p3] = parts;
          
          if (p1.includes('var') || p2.includes('var') || p3.includes('var') ||
              p1.includes('calc') || p2.includes('calc') || p3.includes('calc')) {
            const lowerMatch = match.toLowerCase();
            if (lowerMatch.includes('orange') || lowerMatch.includes('amber')) return '#ea580c';
            if (lowerMatch.includes('slate') || lowerMatch.includes('gray') || lowerMatch.includes('zinc')) return '#475569';
            return '#888888';
          }
          
          const lVal = p1;
          const lightnessVal = lVal.endsWith('%') ? parseFloat(lVal) : parseFloat(lVal) * 100;
          
          let hue = 0;
          let saturation = 0;
          
          if (type.toLowerCase() === 'oklch') {
            const chroma = parseFloat(p2);
            hue = parseFloat(p3);
            saturation = Math.min(100, Math.max(0, chroma * 250));
          } else {
            const aVal = parseFloat(p2);
            const bVal = parseFloat(p3);
            const chroma = Math.sqrt(aVal * aVal + bVal * bVal);
            const hueRad = Math.atan2(bVal, aVal);
            hue = (hueRad * 180) / Math.PI;
            if (hue < 0) hue += 360;
            saturation = Math.min(100, Math.max(0, chroma * 250));
          }
          
          if (isNaN(lightnessVal) || isNaN(hue) || isNaN(saturation)) {
            return '#888888';
          }
          
          if (alphaStr) {
            if (alphaStr.includes('var') || alphaStr.includes('calc')) {
              return `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightnessVal)}%)`;
            }
            const alphaVal = alphaStr.endsWith('%') ? parseFloat(alphaStr) / 100 : parseFloat(alphaStr);
            if (isNaN(alphaVal)) {
              return `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightnessVal)}%)`;
            }
            return `hsla(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightnessVal)}%, ${alphaVal})`;
          } else {
            return `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightnessVal)}%)`;
          }
        } catch (e) {
          console.warn("Could not process color rule:", e);
          return '#888888';
        }
      });

      const colorMixRegex = /color-mix\(([^()]*|\([^()]*\))*\)/gi;
      result = result.replace(colorMixRegex, (match) => {
        const lower = match.toLowerCase();
        if (lower.includes('orange') || lower.includes('amber')) return '#ea580c';
        if (lower.includes('slate') || lower.includes('gray')) return '#475569';
        return '#888888';
      });

      const lightDarkRegex = /light-dark\(([^()]*|\([^()]*\))*\)/gi;
      result = result.replace(lightDarkRegex, (match) => {
        try {
          const content = match.slice(11, match.length - 1).trim();
          const commaIdx = content.indexOf(',');
          if (commaIdx !== -1) {
            return content.slice(0, commaIdx).trim();
          }
        } catch {}
        return '#333333';
      });

      return result;
    };

    const generatePdfFromCanvas = (canvasObj: HTMLCanvasElement) => {
      const imgData = canvasObj.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297
      
      // Calculate single-page bounding boxes to completely avoid multi-page overflow
      let printWidth = pdfWidth;
      let printHeight = (canvasObj.height * pdfWidth) / canvasObj.width;
      
      if (printHeight > pdfHeight) {
        printHeight = pdfHeight;
        printWidth = (canvasObj.width * pdfHeight) / canvasObj.height;
      }
      
      const xOffset = (pdfWidth - printWidth) / 2;
      
      pdf.addImage(imgData, 'JPEG', xOffset, 0, printWidth, printHeight, undefined, 'FAST');
      
      const clientNameClean = quotation.client.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      
      const fileName = `orcamento_${quotation.number}_${clientNameClean}.pdf`;
      pdf.save(fileName);
    };

    try {
      // First attempt with premium configurations (CORS enabled for high-fidelity rendering)
      const canvas = await html2canvas(element, {
        scale: 2.2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        onclone: (clonedDoc) => {
          const newStyleTag = clonedDoc.createElement('style');
          newStyleTag.textContent = `
            :root, [data-theme] {
              --color-orange-50: #fff7ed !important;
              --color-orange-100: #ffedd5 !important;
              --color-orange-200: #fed7aa !important;
              --color-orange-300: #fdba74 !important;
              --color-orange-400: #fb923c !important;
              --color-orange-500: #f97316 !important;
              --color-orange-600: #ea580c !important;
              --color-orange-650: #ea580c !important;
              --color-orange-700: #c2410c !important;
              --color-orange-850: #7c2d12 !important;
              --color-orange-900: #7c2d12 !important;
              --color-orange-950: #431407 !important;

              --color-gray-50: #f9fafb !important;
              --color-gray-100: #f3f4f6 !important;
              --color-gray-150: #e5e7eb !important;
              --color-gray-200: #e5e7eb !important;
              --color-gray-300: #d1d5db !important;
              --color-gray-400: #9ca3af !important;
              --color-gray-500: #6b7280 !important;
              --color-gray-600: #4b5563 !important;
              --color-gray-700: #374151 !important;
              --color-gray-800: #1f2937 !important;
              --color-gray-900: #111827 !important;
              --color-gray-950: #030712 !important;

              --background: #ffffff !important;
              --foreground: #111827 !important;
            }
            body, html {
              background-color: #ffffff !important;
              color: #111827 !important;
              font-family: Arial, sans-serif !important;
            }
          `;
          clonedDoc.head.appendChild(newStyleTag);

          const inlineStyleEls = clonedDoc.querySelectorAll('[style*="oklch"], [style*="oklab"], [style*="color-mix"], [style*="light-dark"]');
          inlineStyleEls.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style && htmlEl.style.cssText) {
              htmlEl.style.cssText = sanitizeCSSColorFunction(htmlEl.style.cssText);
            }
          });
        }
      });

      generatePdfFromCanvas(canvas);
    } catch (error) {
      console.warn('First premium PDF export attempt blocked or failed, retrying with fail-safe fallback...', error);
      
      // Secondary fallback attempt: disables CORS and strips external image headers entirely to prevent tainted canvas blockages
      try {
        const canvasFallback = await html2canvas(element, {
          scale: 2.0,
          useCORS: false,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 800,
          onclone: (clonedDoc) => {
            // Hide any external images that contaminate canvas security headers
            const images = clonedDoc.querySelectorAll('img');
            images.forEach(img => {
              img.style.display = 'none';
            });

            const newStyleTag = clonedDoc.createElement('style');
            newStyleTag.textContent = `
              :root, [data-theme] {
                --color-orange-500: #f97316 !important;
                --color-orange-600: #ea580c !important;
                --color-gray-100: #f3f4f6 !important;
                --color-gray-800: #1f2937 !important;
                --background: #ffffff !important;
                --foreground: #111827 !important;
              }
              body, html {
                background-color: #ffffff !important;
                color: #111827 !important;
                font-family: Arial, sans-serif !important;
              }
            `;
            clonedDoc.head.appendChild(newStyleTag);
          }
        });

        generatePdfFromCanvas(canvasFallback);
      } catch (fallbackError) {
        console.error('Second fail-safe PDF export also failed:', fallbackError);
        alert('Não foi possível fazer o download direto devido a restrições do seu navegador. Por favor, clique na opção "Imprimir / Salvar Manual" e selecione "Salvar como PDF" no destino da impressão.');
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" id="print-preview-modal">
      
      {/* Inject custom responsive printing control rules based on selections */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: ${compactLayout ? '5mm 6mm' : '15mm 15mm'} !important;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #print-preview-modal {
            background: white !important;
            padding: 0 !important;
          }
          #print-sheet {
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
          }
          #pdf-content {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            background: white !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }
          ${compactLayout ? `
            * {
              font-size: 11px !important;
              line-height: 1.15 !important;
            }
            h1 { font-size: 16px !important; }
            h2 { font-size: 14px !important; }
            h3 { font-size: 11px !important; }
            h4 { font-size: 11px !important; }
            .badge-status { font-size: 9px !important; padding: 1px 4px !important; }
            tr, td, th {
              padding-top: 3px !important;
              padding-bottom: 3px !important;
              padding-left: 6px !important;
              padding-right: 6px !important;
            }
            .sketch-item-box {
              padding: 4px !important;
            }
            .sketch-svg-wrapper svg {
              transform: scale(0.85);
              transform-origin: center;
            }
          ` : ''}
        }
      `}</style>

      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Modal Controls - Hidden during Printing */}
        <div className="flex flex-row items-center justify-end px-6 py-3 border-b border-gray-100 bg-gray-50 print:hidden gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Printer size={14} /> PDF
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all cursor-pointer md:hidden"
          >
            <FileDown size={14} /> Compartilhar
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-xl transition-all cursor-pointer"
          >
            <X size={14} /> Fechar
          </button>
        </div>
        




        {/* Printable area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 print:overflow-visible print:p-0 print:bg-white" id="print-sheet">
          <div id="pdf-content" className={`max-w-[780px] mx-auto text-gray-800 font-sans bg-white border border-gray-100 rounded-lg shadow-2xs print:border-none print:shadow-none ${
            compactLayout ? 'space-y-3.5 p-5 pb-3.5' : 'space-y-6 p-6 pb-6'
          }`}>
            
            {/* Top decorative bar */}
            <div className={`bg-gradient-to-r from-orange-500 to-amber-600 rounded-t-md -mx-5 mb-3.5 ${
              compactLayout ? 'h-1.5 -mt-5' : 'h-2.5 -mt-6'
            }`}></div>

            {/* 1. Letterhead Header */}
            <div className={`flex justify-between items-start border-b border-gray-200 ${
              compactLayout ? 'pb-2.5' : 'pb-5'
            }`}>
              <div className="flex items-start gap-3">
                {companySettings.logoUrl && (
                  <img
                    src={companySettings.logoUrl}
                    alt="Logo"
                    className={`object-contain rounded-lg border border-gray-200 p-0.5 bg-white ${
                      compactLayout ? 'max-h-11 max-w-[110px]' : 'max-h-16 max-w-[140px]'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="border-l-2 border-orange-500 pl-2.5">
                  <h1 className={`font-extrabold text-slate-900 tracking-tight uppercase leading-none mb-1 ${
                    compactLayout ? 'text-base' : 'text-xl'
                  }`}>
                    {companySettings.name || 'Vidraçaria & Cia'}
                  </h1>
                  <p className="text-[9px] uppercase font-bold text-orange-600 tracking-wider">
                    {companySettings.slogan || 'Serralheria & Vidros sob Medida'}
                  </p>
                  <div className="text-[9px] text-slate-500 mt-2 space-y-0.5">
                    <p>WhatsApp: <strong className="text-slate-800">{companySettings.phone || '(11) 99999-8888'}</strong></p>
                    <p>E-mail: <strong className="text-slate-800">{companySettings.email || 'contato@vidracariacia.com.br'}</strong></p>
                    {companySettings.cnpj && <p>CNPJ: <strong className="text-slate-800">{companySettings.cnpj}</strong></p>}
                  </div>
                </div>
              </div>
              
              <div className="text-right space-y-1">
                <div>
                  <span className={`inline-block text-[8px] font-bold px-2 py-0.5 rounded-sm uppercase badge-status ${
                    quotation.status === 'aprovado' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    quotation.status === 'pendente' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    quotation.status === 'rejeitado' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 
                    'bg-slate-50 text-slate-800 border border-slate-200'
                  }`}>
                    {quotation.status === 'pendente' ? 'Orçamento Pendente' : 
                     quotation.status === 'aprovado' ? 'Orçamento Aprovado' : 
                     quotation.status === 'rejeitado' ? 'Orçamento Recusado' : 'Serviço Concluído'}
                  </span>
                </div>
                <h2 className="text-base font-black text-orange-600 tracking-tight leading-none">{quotation.number}</h2>
                <div className="text-[9px] text-slate-500 space-y-0.5">
                  <p>Emissão: <strong className="text-slate-800">{new Date(quotation.date).toLocaleDateString('pt-BR')}</strong></p>
                  <p>Validade: <strong className="text-slate-800">{new Date(quotation.validUntil).toLocaleDateString('pt-BR')}</strong></p>
                </div>
              </div>
            </div>

            {/* 2. Client and Location Info */}
            <div className={`bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-2 gap-4 text-[11px] ${
              compactLayout ? 'p-2.5' : 'p-4'
            }`}>
              <div className="border-r border-slate-200 pr-4">
                <h3 className="font-bold text-slate-500 mb-0.5 uppercase tracking-wider text-[8px]">Cliente / Destinatário</h3>
                <p className="font-bold text-slate-900 text-xs">{quotation.client.name}</p>
                <p className="text-slate-500 mt-0.5">Telefone: <span className="text-slate-900 font-medium">{quotation.client.phone}</span></p>
                {quotation.client.email && <p className="text-slate-500">Email: <span className="text-slate-900 font-medium">{quotation.client.email}</span></p>}
              </div>
              <div className="pl-1">
                <h3 className="font-bold text-slate-500 mb-0.5 uppercase tracking-wider text-[8px]">Endereço de Instalação</h3>
                <p className="text-slate-900 font-semibold leading-normal">
                  {quotation.client.address || 'Não especificado (Retirada em Loja)'}
                </p>
              </div>
            </div>

            {/* 3. Items and Services Table & Sketches */}
            <div className={compactLayout ? 'space-y-1.5' : 'space-y-3'}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h3 className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Especificações dos Itens</h3>
                <span className="text-[9px] font-semibold text-slate-400">Total de {quotation.items.length} {quotation.items.length === 1 ? 'item' : 'itens'}</span>
              </div>
              
              <table className="w-full text-left border-collapse text-[11px] border border-slate-150 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold border-b border-slate-800">
                    <th className={`w-10 text-center ${compactLayout ? 'py-1.5 px-2' : 'py-2.5 px-3'}`}>Qtd</th>
                    <th className={compactLayout ? 'py-1.5 px-2' : 'py-2.5 px-3'}>Local / Descrição do Item</th>
                    <th className={compactLayout ? 'py-1.5 px-2' : 'py-2.5 px-3'}>Vidro & Acabamentos</th>
                    <th className={`text-center ${compactLayout ? 'py-1.5 px-2' : 'py-2.5 px-3'}`}>Medidas (m)</th>
                    <th className={`text-right ${compactLayout ? 'py-1.5 px-2' : 'py-2.5 px-3'}`}>Valor Un.</th>
                    <th className={`text-right ${compactLayout ? 'py-1.5 px-2' : 'py-2.5 px-3'}`}>Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-700 bg-white">
                  {quotation.items.map((item, index) => {
                    const gPrice = glassPrices.find(g => g.id === item.glassId);
                    const gColor = glassColors.find(c => c.id === item.colorId);
                    const kHardware = hardwareKits.find(h => h.id === item.hardwareKitId);
                    const aProfile = aluminumProfiles.find(a => a.id === item.aluminumId);

                    return (
                      <tr key={item.id} className="align-top hover:bg-slate-50/20 even:bg-slate-50/10">
                        <td className={`font-bold text-center text-slate-900 ${compactLayout ? 'py-1 px-2' : 'py-3 px-3'}`}>{item.quantity}</td>
                        <td className={`space-y-0.5 ${compactLayout ? 'py-1 px-2' : 'py-3 px-3'}`}>
                          <p className="font-extrabold text-slate-900">{item.description}</p>
                          <div className="text-[9px] text-slate-500 pl-1 space-y-0.5">
                            {kHardware && <p>• Ferragens: <span className="font-medium text-slate-700">{kHardware.name}</span></p>}
                            {aProfile && <p>• Alumínio: <span className="font-medium text-slate-700">{aProfile.name} ({item.aluminumMeters}m)</span></p>}
                          </div>
                        </td>
                        <td className={compactLayout ? 'py-1 px-2' : 'py-3 px-3'}>
                          <div className="font-semibold text-slate-800 leading-tight">
                            {gPrice?.name} 
                          </div>
                          <div className="text-[9px] text-slate-500">Cor: {gColor?.name || 'Incolor'}</div>
                          {item.useRoundedArea && (
                            <span className="inline-block mt-0.5 text-[8px] bg-amber-50 text-amber-800 font-bold px-1 rounded-sm border border-amber-200/50">
                              M² Arredondado
                            </span>
                          )}
                        </td>
                        <td className={`text-center space-y-0.5 ${compactLayout ? 'py-1 px-2' : 'py-3 px-3'}`}>
                          <p className="font-bold text-slate-800">{item.width.toFixed(2)} x {item.height.toFixed(2)} m</p>
                          <p className="text-[9px] text-slate-500">({formatArea(item.calculatedArea)})</p>
                        </td>
                        <td className={`text-right font-medium text-slate-600 ${compactLayout ? 'py-1 px-2' : 'py-3 px-3'}`}>
                          {formatCurrency(item.itemTotal / item.quantity)}
                        </td>
                        <td className={`text-right font-extrabold text-slate-900 ${compactLayout ? 'py-1 px-2' : 'py-3 px-3'}`}>
                          {formatCurrency(item.itemTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 3.5 Detailed Technical Sketches */}
            {includeSketches && (
              <div className={`border-t border-slate-200 ${compactLayout ? 'pt-2.5' : 'pt-5'}`}>
                <h4 className="text-[9px] font-black text-slate-700 uppercase tracking-widest mb-1.5">Desenhos Técnicos e Projetos</h4>
                <div className={`grid gap-2.5 ${compactLayout ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
                  {quotation.items.map((item, index) => {
                    const gColor = glassColors.find(c => c.id === item.colorId);
                    return (
                      <div key={item.id} className="border border-slate-200 rounded-lg p-2 bg-slate-50/50 sketch-item-box" style={{ pageBreakInside: 'avoid' }}>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider mb-0.5">Item {index + 1}</p>
                        <div className="sketch-svg-wrapper flex items-center justify-center">
                          <QuotationSketch
                            description={item.description}
                            width={item.width}
                            height={item.height}
                            glassColorName={gColor?.name || 'Incolor'}
                            templateStyle={item.sketchTemplate || 'auto'}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Financial Calculations Summary */}
            <div className="flex justify-between items-start border-t border-slate-200 gap-8" style={{ pageBreakInside: 'avoid' }}>
              <div className="flex-1 max-w-[420px]">
                {quotation.notes ? (
                  <div className={`bg-slate-50 rounded-lg border border-slate-200 ${compactLayout ? 'p-2.5' : 'p-3.5'}`}>
                    <h4 className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Observações Adicionais</h4>
                    <p className="text-[10px] text-slate-600 leading-relaxed italic">
                      "{quotation.notes}"
                    </p>
                  </div>
                ) : (
                  <div className="text-[9px] text-slate-400 max-w-[300px] mt-2">
                    <p>Este orçamento é um documento comercial provisório. Caso aprovado, nossa equipe técnica confirmará todas as medidas in loco.</p>
                  </div>
                )}
              </div>
              
              <div className={`w-[250px] bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-right space-y-1 ${
                compactLayout ? 'p-2.5' : 'p-3.5'
              }`}>
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal do Pedido:</span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(
                      quotation.items.reduce((acc, i) => acc + i.itemTotal, 0)
                    )}
                  </span>
                </div>

                {quotation.surchargeAmount > 0 && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>Taxas / Adicionais:</span>
                    <span>+{formatCurrency(quotation.surchargeAmount)}</span>
                  </div>
                )}

                {quotation.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Desconto Aplicado:</span>
                    <span>-{formatCurrency(quotation.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-1 border-t border-slate-200 text-xs items-center">
                  <span className="font-bold text-slate-900">VALOR TOTAL LÍQUIDO:</span>
                  <span className="font-black text-orange-600 text-sm">
                    {formatCurrency(quotation.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Terms / Signatures */}
            <div className="text-[9px] text-slate-500 border-t border-slate-200 space-y-3.5" style={{ pageBreakInside: 'avoid' }}>
              <div className="leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                <p className="font-bold text-slate-700 mb-0.5">Termos Comerciais e Garantias:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                  <li>Nossos vidros temperados seguem a norma <strong className="text-slate-700">ABNT NBR 14698</strong> de segurança.</li>
                  <li>Garantia comercial de estanqueidade de 90 dias. Ferragens têm garantia de 6 meses.</li>
                  <li>Prazo de entrega médio: 10 a 15 dias úteis a contar da medição definitiva na obra.</li>
                </ul>
              </div>

              {/* Signatures Columns */}
              <div className={`grid grid-cols-2 gap-8 ${
                compactLayout ? 'pt-2' : 'pt-5'
              }`}>
                <div className="text-center">
                  <div className={`border-b border-slate-300 w-4/5 mx-auto ${compactLayout ? 'h-5' : 'h-8'}`}></div>
                  <p className="mt-1 font-bold text-slate-800 text-[9px]">{quotation.client.name}</p>
                  <p className="text-[8px] text-slate-400">Assinatura de Aceite (Cliente)</p>
                </div>
                <div className="text-center">
                  <div className={`border-b border-slate-300 w-4/5 mx-auto ${compactLayout ? 'h-5' : 'h-8'}`}></div>
                  <p className="mt-1 font-bold text-slate-800 text-[9px]">{companySettings.name || 'Vidraçaria & Cia'}</p>
                  <p className="text-[8px] text-slate-400">Responsável por Vidraçaria</p>
                </div>
              </div>
            </div>

            {/* Footer metadata system code */}
            <div className={`text-center text-[7.5px] text-slate-400 border-t border-slate-100 ${
              compactLayout ? 'pt-2.5' : 'pt-4'
            }`}>
              Sistema de Orçamentos Vidraçaria • Proposta técnica oficial gerada digitalmente em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
