/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Quotation, GlassPrice, GlassColor, HardwareKit, AluminumProfile } from '../types';
import { formatCurrency, formatArea } from '../utils';
import { Printer, X, Download, FileText } from 'lucide-react';
import QuotationSketch from './QuotationSketch';

interface QuotationPrintViewProps {
  quotation: Quotation;
  glassPrices: GlassPrice[];
  glassColors: GlassColor[];
  hardwareKits: HardwareKit[];
  aluminumProfiles: AluminumProfile[];
  onClose: () => void;
}

export default function QuotationPrintView({
  quotation,
  glassPrices,
  glassColors,
  hardwareKits,
  aluminumProfiles,
  onClose,
}: QuotationPrintViewProps) {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" id="print-preview-modal">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Modal Controls - Hidden during Printing */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-600" size={20} />
            <span className="font-semibold text-gray-800">Visualização de Impressão</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-lg shadow-xs transition-all cursor-pointer"
            >
              <Printer size={14} /> Imprimir Orçamento
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1.5 px-3 rounded-xl transition-all cursor-pointer"
            >
              <X size={14} /> Fechar
            </button>
          </div>
        </div>

        {/* Printable area */}
        <div className="flex-1 overflow-y-auto p-10 bg-white print:overflow-visible print:p-0" id="print-sheet">
          <div className="max-w-[800px] mx-auto text-gray-800 space-y-8 font-sans">
            
            {/* 1. Letterhead Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-100 pb-6">
              <div>
                <h1 className="text-2xl font-black text-gray-950 tracking-tight uppercase">Vidraçaria & Cia</h1>
                <p className="text-xs text-gray-500 mt-1 max-w-[280px]">
                  Soluções sob medida em vidros temperados, laminados, espelhos e esquadrias de alumínio.
                </p>
                <div className="text-xs text-gray-500 mt-3 space-y-0.5">
                  <p>WhatsApp: (11) 99999-8888</p>
                  <p>Email: contato@vidracariacia.com.br</p>
                  <p>Instalação profissional e garantia regulamentar.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block bg-teal-50 text-teal-800 text-xs font-bold px-2.5 py-1 rounded-sm uppercase mb-3 print:border print:border-teal-500">
                  {quotation.status === 'pendente' ? 'Orçamento Pendente' : 
                   quotation.status === 'aprovado' ? 'Orçamento Aprovado' : 
                   quotation.status === 'rejeitado' ? 'Orçamento Recusado' : 'Serviço Concluído'}
                </span>
                <h2 className="text-lg font-black text-blue-600 tracking-tight">{quotation.number}</h2>
                <div className="text-xs text-gray-500 mt-2 space-y-0.5">
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
                  <span className="font-black text-blue-600 text-base">
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
                  <p className="mt-2 font-medium text-gray-700">Responsável Vidraçaria & Cia</p>
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
