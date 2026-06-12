/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Quotation, GlassPrice, GlassColor, HardwareKit, AluminumProfile, CompanySettings } from '../types';
import { formatCurrency, formatArea } from '../utils';
import { Printer, X, Download, FileText, FileDown, CheckCircle } from 'lucide-react';
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

  const handlePrint = () => {
    window.print();
  };

  const handleExtendAndExportPDF = async () => {
    const element = document.getElementById('pdf-content');
    if (!element) return;

    setIsGeneratingPDF(true);
    
    // Helper to sanitize advanced modern CSS color functions to standard HSL/HSLA or hex
    const sanitizeCSSColorFunction = (cssText: string): string => {
      if (!cssText) return '';
      
      // 1. First pre-emptively rewrite common modern Tailwind color variables to safe fallbacks
      // This ensures we don't have to parse too complex nested variable scenarios.
      let result = cssText;

      // 2. Handle oklch and oklab with balanced parentheses matching (up to 1 level of nested parentheses)
      const colorRegex = /(oklch|oklab)\(([^()]*|\([^()]*\))*\)/gi;
      result = result.replace(colorRegex, (match, type) => {
        try {
          const openParenIdx = match.indexOf('(');
          const closeParenIdx = match.lastIndexOf(')');
          if (openParenIdx === -1 || closeParenIdx === -1) return '#888888';
          
          const content = match.slice(openParenIdx + 1, closeParenIdx).trim();
          
          // Separate primary values and alpha opacity parts on the '/' separator
          let mainContent = content;
          let alphaStr = '';
          const slashIdx = content.indexOf('/');
          if (slashIdx !== -1) {
            mainContent = content.slice(0, slashIdx).trim();
            alphaStr = content.slice(slashIdx + 1).trim();
          }
          
          const parts = mainContent.split(/[\s,]+/).filter(Boolean);
          if (parts.length < 3) {
            // Safe general color fallback depending on context keywords
            const lowerMatch = match.toLowerCase();
            if (lowerMatch.includes('orange') || lowerMatch.includes('amber')) return '#ea580c';
            if (lowerMatch.includes('slate') || lowerMatch.includes('gray')) return '#475569';
            return '#888888';
          }
          
          const [p1, p2, p3] = parts;
          
          // Strict fallback check: if any value relies on modern CSS variables/calc, supply high-quality visual fallbacks
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
            // Translate chroma to HSL saturation approximation
            saturation = Math.min(100, Math.max(0, chroma * 250));
          } else {
            // oklab
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
              // Ignore complex alpha variables and just render opaque
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
          console.warn("Could not process oklch/oklab color rule direct fallback applied:", e);
          return '#888888';
        }
      });

      // 3. Handle color-mix function calls safely
      const colorMixRegex = /color-mix\(([^()]*|\([^()]*\))*\)/gi;
      result = result.replace(colorMixRegex, (match) => {
        const lower = match.toLowerCase();
        if (lower.includes('orange') || lower.includes('amber')) return '#ea580c';
        if (lower.includes('slate') || lower.includes('gray')) return '#475569';
        return '#888888';
      });

      // 4. Handle light-dark function calls safely (always prefer the first/light color)
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

    try {
      // Capture the element in canvas format with higher scale for HD clarity
      const canvas = await html2canvas(element, {
        scale: 2.2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
        onclone: (clonedDoc) => {
          // html2canvas fails with "Attempting to parse an unsupported color function oklch" or "oklab"
          // We solve this by compiling all Document's stylesheets into style tags and replacing them with hsl
          const styleSheetsContents: string[] = [];
          
          try {
            for (let i = 0; i < document.styleSheets.length; i++) {
              const sheet = document.styleSheets[i];
              try {
                if (sheet.cssRules) {
                  const rList: string[] = [];
                  for (let j = 0; j < sheet.cssRules.length; j++) {
                    rList.push(sheet.cssRules[j].cssText);
                  }
                  styleSheetsContents.push(rList.join('\n'));
                }
              } catch (e) {
                // Cross-origin issues can occur, fall back safely
                console.warn("Could not read stylesheet rule programmatically", e);
              }
            }
          } catch (err) {
            console.error("Error reading style sheets", err);
          }

          if (styleSheetsContents.length > 0) {
            // Process and sanitize css rules
            const cleanedStyles = styleSheetsContents.map(css => sanitizeCSSColorFunction(css));
            
            // Remove existing stylesheets from the cloned document to avoid crashes
            const originalStylesAndLinks = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
            originalStylesAndLinks.forEach(el => el.remove());
            
            // Inject the cleaned and compiled stylesheets in cloned document head
            const newStyleTag = clonedDoc.createElement('style');
            newStyleTag.textContent = cleanedStyles.join('\n');
            clonedDoc.head.appendChild(newStyleTag);
          } else {
            // Fallback: search and replace in cloned <style> tags
            const styles = clonedDoc.querySelectorAll('style');
            styles.forEach(style => {
              if (style.textContent) {
                style.textContent = sanitizeCSSColorFunction(style.textContent);
              }
            });
          }

          // Check all inline style declarations for oklch, oklab, color-mix, or light-dark
          const inlineStyleEls = clonedDoc.querySelectorAll('[style*="oklch"], [style*="oklab"], [style*="color-mix"], [style*="light-dark"]');
          inlineStyleEls.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (htmlEl.style && htmlEl.style.cssText) {
              htmlEl.style.cssText = sanitizeCSSColorFunction(htmlEl.style.cssText);
            }
          });
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Handle multi-page content cleanly by splitting page height bounds
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
      
      const clientNameClean = quotation.client.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      
      const fileName = `orcamento_${quotation.number}_${clientNameClean}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating direct PDF:', error);
      alert('Não foi possível gerar o PDF direto. Siga as instruções abaixo para salvar usando a opção de Imprimir.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" id="print-preview-modal">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Modal Controls - Hidden during Printing */}
        <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 print:hidden gap-3">
          <div className="flex items-center gap-2">
            <FileText className="text-orange-600" size={20} />
            <span className="font-semibold text-gray-800 text-xs md:text-sm">Visualização de Impressão & Exportação PDF</span>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExtendAndExportPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-1.5 text-xs bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold py-2 px-3 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <FileDown size={14} className={isGeneratingPDF ? 'animate-bounce' : ''} />
              {isGeneratingPDF ? 'Baixando...' : 'Salvar como PDF'}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-3 rounded-lg border border-gray-200 shadow-2xs transition-all cursor-pointer"
            >
              <Printer size={14} /> Imprimir / PDF Manual
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-xl transition-all cursor-pointer"
            >
              <X size={14} /> Fechar
            </button>
          </div>
        </div>

        {/* Dynamic PDF Helper Banner */}
        <div className="bg-orange-50 border-b border-orange-100/50 px-6 py-3.5 print:hidden">
          <div className="flex items-start gap-2.5 max-w-4xl">
            <span className="text-base select-none">💡</span>
            <div>
              <p className="text-[11px] font-bold text-orange-900 leading-tight">Como salvar em formato PDF:</p>
              <p className="text-[10px] text-orange-700 leading-relaxed mt-0.5">
                Ao clicar no botão acima, na caixa de diálogo de impressão que aparecer, altere o destino de sua impressora para <strong className="text-orange-950 font-bold">"Salvar como PDF"</strong> ou <strong className="text-orange-950 font-bold">"Microsoft Print to PDF"</strong>. Habilite a caixa de seleção <strong className="text-orange-950 font-bold">"Gráficos de segundo plano"</strong> no menu de configurações para incluir as cores dos vidros e os croquis técnicos!
              </p>
            </div>
          </div>
        </div>

        {/* Printable area */}
        <div className="flex-1 overflow-y-auto p-10 bg-white print:overflow-visible print:p-0" id="print-sheet">
          <div id="pdf-content" className="max-w-[800px] mx-auto text-gray-800 space-y-8 font-sans p-6 bg-white">
            
            {/* 1. Letterhead Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-100 pb-6">
              <div className="flex items-start gap-4">
                {companySettings.logoUrl && (
                  <img
                    src={companySettings.logoUrl}
                    alt="Logo"
                    className="max-h-16 max-w-[150px] object-contain rounded-lg border border-gray-150 p-1 bg-white print:border-none"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <h1 className="text-xl font-black text-gray-950 tracking-tight uppercase">
                    {companySettings.name || 'Vidraçaria & Cia'}
                  </h1>
                  <p className="text-[10.5px] text-gray-500 mt-1 max-w-[320px]">
                    {companySettings.slogan || 'Soluções sob medida em vidros temperados, esquadrias e ferragens.'}
                  </p>
                  <div className="text-[10.5px] text-gray-500 mt-2 space-y-0.5">
                    <p>WhatsApp: <strong className="text-gray-700">{companySettings.phone || '(11) 99999-8888'}</strong></p>
                    <p>Email: <strong className="text-gray-700">{companySettings.email || 'contato@vidracariacia.com.br'}</strong></p>
                    {companySettings.cnpj && <p>CNPJ: <strong className="text-gray-700">{companySettings.cnpj}</strong></p>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block bg-orange-50 text-orange-850 text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase mb-3 print:border print:border-orange-500">
                  {quotation.status === 'pendente' ? 'Orçamento Pendente' : 
                   quotation.status === 'aprovado' ? 'Orçamento Aprovado' : 
                   quotation.status === 'rejeitado' ? 'Orçamento Recusado' : 'Serviço Concluído'}
                </span>
                <h2 className="text-lg font-black text-orange-650 tracking-tight">{quotation.number}</h2>
                <div className="text-[10.5px] text-gray-500 mt-2 space-y-0.5">
                  <p>Data de Emissão: <strong className="text-gray-700">{new Date(quotation.date).toLocaleDateString('pt-BR')}</strong></p>
                  <p>Validade até: <strong className="text-gray-700">{new Date(quotation.validUntil).toLocaleDateString('pt-BR')}</strong></p>
                </div>
              </div>
            </div>

            {/* 2. Client and Location Info */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 grid grid-cols-2 gap-4 text-xs">
              <div>
                <h3 className="font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Cliente / Destinatário</h3>
                <p className="font-semibold text-gray-900 text-sm">{quotation.client.name}</p>
                <p className="text-gray-500 mt-1">Contato: {quotation.client.phone}</p>
                {quotation.client.email && <p className="text-gray-500">Email: {quotation.client.email}</p>}
              </div>
              <div>
                <h3 className="font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Endereço de Instalação</h3>
                <p className="text-gray-900 font-medium leading-relaxed">
                  {quotation.client.address || 'Não especificado (Retirada na loja)'}
                </p>
              </div>
            </div>

            {/* 3. Items and Services Table */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Especificações dos Itens e Serviços</h3>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-gray-600 font-semibold bg-gray-50">
                    <th className="py-2.5 px-3 w-10 text-center">Qtd</th>
                    <th className="py-2.5 px-3">Ambiente / Descrição</th>
                    <th className="py-2.5 px-3">Vidro & Acabamento</th>
                    <th className="py-2.5 px-3 text-center">Medidas (m)</th>
                    <th className="py-2.5 px-3 text-right">Preço Un.</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {quotation.items.map((item, index) => {
                    const gPrice = glassPrices.find(g => g.id === item.glassId);
                    const gColor = glassColors.find(c => c.id === item.colorId);
                    const kHardware = hardwareKits.find(h => h.id === item.hardwareKitId);
                    const aProfile = aluminumProfiles.find(a => a.id === item.aluminumId);

                    return (
                      <tr key={item.id} className="align-top hover:bg-gray-50/20">
                        <td className="py-3 px-3 font-semibold text-center">{item.quantity}</td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-gray-900">{item.description}</p>
                          <div className="text-[10px] text-gray-400 mt-1 space-y-0.5">
                            {kHardware && <p>• Ferragem: {kHardware.name}</p>}
                            {aProfile && <p>• Alumínio: {aProfile.name} ({item.aluminumMeters}m)</p>}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-gray-800">
                            {gPrice?.name} ({gColor?.name})
                          </div>
                          {item.useRoundedArea && (
                            <span className="text-[9px] bg-amber-50 text-amber-800 font-semibold px-1 rounded-sm border border-amber-200/50">
                              Área arredondada (passo 5cm)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <p className="font-medium">{item.width.toFixed(2)} x {item.height.toFixed(2)} m</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">({formatArea(item.calculatedArea)})</p>
                        </td>
                        <td className="py-3 px-3 text-right font-medium">
                          {formatCurrency(item.itemTotal / item.quantity)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-gray-900">
                          {formatCurrency(item.itemTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 3.5 Detailed Technical Sketches */}
            <div className="pt-6 border-t border-gray-150">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Desenhos Técnicos e Croquis de Vidros</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {quotation.items.map((item, index) => {
                  const gColor = glassColors.find(c => c.id === item.colorId);
                  return (
                    <div key={item.id} className="print:break-inside-avoid">
                      <QuotationSketch
                        description={`Item ${index + 1}: ${item.description}`}
                        width={item.width}
                        height={item.height}
                        glassColorName={gColor?.name || 'Incolor'}
                        templateStyle={item.sketchTemplate || 'auto'}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Financial Calculations Summary */}
            <div className="flex justify-between items-start pt-4 border-t border-gray-100">
              <div className="max-w-[400px]">
                {quotation.notes && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-600 mb-1.5 uppercase">Observações do Contrato</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                      "{quotation.notes}"
                    </p>
                  </div>
                )}
              </div>
              
              <div className="w-[280px] bg-gray-50 rounded-xl p-4 border border-gray-100 text-xs text-right space-y-2">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal Bruto:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      quotation.items.reduce((acc, i) => acc + i.itemTotal, 0)
                    )}
                  </span>
                </div>

                {quotation.surchargeAmount > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Taxas / Adicionais:</span>
                    <span className="font-semibold">+{formatCurrency(quotation.surchargeAmount)}</span>
                  </div>
                )}

                {quotation.discountAmount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Desconto Concedido:</span>
                    <span className="font-semibold">-{formatCurrency(quotation.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t border-gray-200 text-sm">
                  <span className="font-bold text-gray-900">Valor Líquido:</span>
                  <span className="font-black text-orange-600 text-base">
                    {formatCurrency(quotation.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Terms / Signatures */}
            <div className="pt-10 space-y-8 text-[11px] text-gray-500 border-t border-gray-100">
              <div className="leading-relaxed">
                <p className="font-semibold text-gray-600 mb-1">Termos e Condições para Execução:</p>
                <ol className="list-decimal pl-4.5 space-y-1">
                  <li>Após aceitação do orçamento, será realizada a medição técnica de precisão no local pelo nosso consultor.</li>
                  <li>O prazo estimado de entrega começa a contar a partir da medição confirmada e aprovação do projeto executivo.</li>
                  <li>Garantia regulamentar de 1 ano para defeitos de instalação nos acessórios e perfis de vedação.</li>
                  <li>Peças de vidro temperado não admitem novos cortes, furos ou ajustes após o processo de têmpera.</li>
                </ol>
              </div>

              {/* Signatures Columns */}
              <div className="grid grid-cols-2 gap-10 pt-10">
                <div className="text-center">
                  <div className="border-b border-gray-300 h-10 w-4/5 mx-auto"></div>
                  <p className="mt-2 font-medium text-gray-700">{quotation.client.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Assinatura do Cliente (Aceite)</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-300 h-10 w-4/5 mx-auto"></div>
                  <p className="mt-2 font-medium text-gray-700">Responsável {companySettings.name || 'Vidraçaria & Cia'}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Autorizado Técnico</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
