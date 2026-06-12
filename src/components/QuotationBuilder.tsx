/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Client, GlassPrice, GlassColor, HardwareKit, AluminumProfile, Quotation, QuotationItem } from '../types';
import { calculateItemTotals, formatCurrency, generateNextQuotationNumber } from '../utils';
import { Plus, Trash2, Calculator, Save, FileText, Check, DollarSign, Percent, AlertCircle } from 'lucide-react';
import QuotationSketch from './QuotationSketch';

interface QuotationBuilderProps {
  clients: Client[];
  glassPrices: GlassPrice[];
  glassColors: GlassColor[];
  hardwareKits: HardwareKit[];
  aluminumProfiles: AluminumProfile[];
  existingQuotations: Quotation[];
  onSaveQuotation: (quotation: Quotation) => void;
  onCancel: () => void;
}

export default function QuotationBuilder({
  clients,
  glassPrices,
  glassColors,
  hardwareKits,
  aluminumProfiles,
  existingQuotations,
  onSaveQuotation,
  onCancel,
}: QuotationBuilderProps) {
  // Quotation metadata
  const [selectedClientId, setSelectedClientId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15); // Default 15 days validity
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('Incluso material, transporte e instalação final sob nível.');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [surchargeAmount, setSurchargeAmount] = useState(0);

  // Draft items in the current quote
  const [draftItems, setDraftItems] = useState<QuotationItem[]>([]);

  // Item configurator states
  const [itemDescription, setItemDescription] = useState('Box Banheiro Metálico');
  const [itemGlassId, setItemGlassId] = useState('');
  const [itemColorId, setItemColorId] = useState('');
  const [itemWidth, setItemWidth] = useState(1.20);
  const [itemHeight, setItemHeight] = useState(1.90);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemUseRounded, setItemUseRounded] = useState(true);
  const [itemHardwareId, setItemHardwareId] = useState('none');
  const [itemAluminumId, setItemAluminumId] = useState('none');
  const [itemAluminumMeters, setItemAluminumMeters] = useState(3.0);
  const [itemLaborPrice, setItemLaborPrice] = useState(120.00);
  const [itemSketchTemplate, setItemSketchTemplate] = useState<'auto' | 'box' | 'janela' | 'porta' | 'espelho' | 'basculante' | 'fixo'>('auto');

  // Live total preview for the item being configured
  const [liveTotals, setLiveTotals] = useState({
    calculatedArea: 0,
    glassPriceTotal: 0,
    hardwarePriceTotal: 0,
    aluminumPriceTotal: 0,
    itemTotal: 0,
  });

  // Set default configurations on mount
  useEffect(() => {
    if (glassPrices.length > 0 && !itemGlassId) {
      setItemGlassId(glassPrices[0].id);
    }
    if (glassColors.length > 0 && !itemColorId) {
      setItemColorId(glassColors[0].id);
    }
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [glassPrices, glassColors, clients]);

  // Recalculate live totals of the current item on configuration change
  useEffect(() => {
    if (!itemGlassId || !itemColorId) return;

    const totals = calculateItemTotals(
      itemWidth,
      itemHeight,
      itemQuantity,
      itemUseRounded,
      itemGlassId,
      itemColorId,
      itemHardwareId,
      itemAluminumId,
      itemAluminumMeters,
      itemLaborPrice,
      glassPrices,
      glassColors,
      hardwareKits,
      aluminumProfiles
    );

    setLiveTotals(totals as any);
  }, [
    itemWidth,
    itemHeight,
    itemQuantity,
    itemUseRounded,
    itemGlassId,
    itemColorId,
    itemHardwareId,
    itemAluminumId,
    itemAluminumMeters,
    itemLaborPrice,
    glassPrices,
    glassColors,
    hardwareKits,
    aluminumProfiles,
  ]);

  const handleAddItemToDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemGlassId || !itemColorId) return;

    const newItem: QuotationItem = {
      id: `item-draft-${Date.now()}`,
      description: itemDescription.trim() || 'Item Vidraçaria',
      glassId: itemGlassId,
      colorId: itemColorId,
      width: itemWidth,
      height: itemHeight,
      quantity: itemQuantity,
      useRoundedArea: itemUseRounded,
      hardwareKitId: itemHardwareId,
      aluminumId: itemAluminumId,
      aluminumMeters: itemAluminumMeters,
      laborPrice: itemLaborPrice,
      sketchTemplate: itemSketchTemplate,
      ...liveTotals,
    };

    setDraftItems([...draftItems, newItem]);
    
    // Reset configurator back to some defaults but let glass and color persist for speed
    setItemDescription('');
    setItemWidth(1.20);
    setItemHeight(1.90);
    setItemQuantity(1);
    setItemHardwareId('none');
    setItemAluminumId('none');
    setItemAluminumMeters(3.0);
    setItemLaborPrice(120.00);
    setItemSketchTemplate('auto');
  };

  const handleRemoveDraftItem = (id: string) => {
    setDraftItems(draftItems.filter(item => item.id !== id));
  };

  const calculateGrandTotal = () => {
    const itemsSum = draftItems.reduce((acc, i) => acc + i.itemTotal, 0);
    return Math.max(0, itemsSum + surchargeAmount - discountAmount);
  };

  const handleSaveQuotation = () => {
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) {
      alert('Por favor, selecione ou cadastre um cliente válido.');
      return;
    }
    if (draftItems.length === 0) {
      alert('Por favor, adicione ao menos um item configurado de vidro ao orçamento.');
      return;
    }

    const nextNumber = generateNextQuotationNumber(existingQuotations);
    const finalTotal = calculateGrandTotal();

    const newQuotation: Quotation = {
      id: `quot-${Date.now()}`,
      number: nextNumber,
      client,
      date,
      validUntil,
      items: draftItems,
      discountAmount,
      surchargeAmount,
      notes,
      status: 'pendente',
      total: finalTotal,
    };

    onSaveQuotation(newQuotation);
  };

  const activeColor = glassColors.find(c => c.id === itemColorId);
  const activeColorName = activeColor ? activeColor.name : 'Incolor';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="quotation-builder-panel">
      
      {/* LEFT COLUMN: Configuration of items (8 cols) */}
      <div className="xl:col-span-8 space-y-6">
        
        {/* Step 1: Customer metadata */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <span>Dimensões de Contrato</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Selecione o Cliente *</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-hidden focus:border-blue-600 cursor-pointer"
              >
                {clients.length === 0 ? (
                  <option value="">Nenhum cliente cadastrado. Crie um na aba de clientes.</option>
                ) : (
                  clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - Con: {c.phone}</option>
                  ))
                )}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Data Emissão</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-hidden focus:border-blue-600 bg-white"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Data Validade</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-hidden focus:border-blue-600 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Configure Item */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-5">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>Configurador de Vidros & Peças</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LHS FORM (8 cols) */}
            <form onSubmit={handleAddItemToDraft} className="lg:col-span-8 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                <div className="md:col-span-5">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Ambiente / Descrição</label>
                  <input
                    type="text"
                    placeholder="Ex: Box Suite Master, Janela Basculante"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-hidden focus:border-blue-600 bg-white"
                    required
                  />
                </div>

                <div className="md:col-span-7 grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo Vidro *</label>
                    <select
                      value={itemGlassId}
                      onChange={(e) => setItemGlassId(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-hidden focus:border-blue-600 cursor-pointer"
                    >
                      {glassPrices.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Cor Vidro *</label>
                    <select
                      value={itemColorId}
                      onChange={(e) => setItemColorId(e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-hidden focus:border-blue-600 cursor-pointer"
                    >
                      {glassColors.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.multiplier === 1.0 ? 'Base' : `+${Math.round((c.multiplier - 1) * 100)}%`})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo Croqui</label>
                    <select
                      value={itemSketchTemplate}
                      onChange={(e) => setItemSketchTemplate(e.target.value as any)}
                      className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-hidden focus:border-blue-600 cursor-pointer"
                    >
                      <option value="auto">Auto (Detectar)</option>
                      <option value="box">Box (Banheiro)</option>
                      <option value="janela">Janela Deslizante</option>
                      <option value="porta">Porta (Giro/Correr)</option>
                      <option value="basculante">Basculante</option>
                      <option value="espelho">Espelho lapidado</option>
                      <option value="fixo">Alvenaria/Fixo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sizes & Geometry */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-lg border border-gray-150">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Largura (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.10"
                    value={itemWidth}
                    onChange={(e) => setItemWidth(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Altura (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.10"
                    value={itemHeight}
                    onChange={(e) => setItemHeight(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:border-blue-600 bg-white shadow-xs"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <span className="block text-xs font-semibold text-gray-400 mb-0.5">Área de Cálculo</span>
                  <span className="text-sm font-black text-gray-700">
                    {itemUseRounded 
                      ? `${(Math.ceil(itemWidth * 20)/20 * Math.ceil(itemHeight * 20)/20 * itemQuantity).toFixed(3)} m²` 
                      : `${(itemWidth * itemHeight * itemQuantity).toFixed(3)} m²`}
                  </span>
                  <label className="flex items-center gap-1 mt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemUseRounded}
                      onChange={(e) => setItemUseRounded(e.target.checked)}
                      className="rounded-sm border-gray-300 text-blue-600 text-[10px]"
                    />
                    <span className="text-[10px] text-gray-500 select-none">Passo redondo 5cm</span>
                  </label>
                </div>
              </div>

              {/* Optional Hardware kits and Alum profiles */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                <div className="md:col-span-5">
                  <label className="block text-xs font-semibold text-gray-600 mb-0.5">Kit de Ferragens</label>
                  <select
                    value={itemHardwareId}
                    onChange={(e) => setItemHardwareId(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-hidden focus:border-blue-600 cursor-pointer"
                  >
                    <option value="none">Nenhum - (Sem Ferragem)</option>
                    {hardwareKits.map(h => (
                      <option key={h.id} value={h.id}>{h.name} (+{formatCurrency(h.price)})</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-0.5">Perfil de Alumínio</label>
                  <select
                    value={itemAluminumId}
                    onChange={(e) => setItemAluminumId(e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 bg-white focus:outline-hidden focus:border-blue-600 cursor-pointer"
                  >
                    <option value="none">Nenhum - (Sem Perfil)</option>
                    {aluminumProfiles.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (+{formatCurrency(p.pricePerMeter)}/m)</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-0.5">Comp. Alumínio (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    disabled={itemAluminumId === 'none'}
                    value={itemAluminumMeters}
                    onChange={(e) => setItemAluminumMeters(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs border border-gray-200 disabled:bg-gray-100 disabled:cursor-not-allowed rounded-lg px-2.5 py-2 focus:outline-hidden focus:border-blue-600 bg-white"
                  />
                </div>
              </div>

              {/* Labor settings & live totals */}
              <div className="pt-3 border-t border-gray-150 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 self-start md:self-auto">
                  <div className="w-40">
                    <label className="block text-xs font-semibold text-gray-600 mb-0.5">Instalação/Mão de Obra (Un.)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-gray-400">R$</span>
                      <input
                        type="number"
                        step="5"
                        min="0"
                        value={itemLaborPrice}
                        onChange={(e) => setItemLaborPrice(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs border border-gray-200 rounded-lg pl-8 pr-2.5 py-1.5 focus:outline-hidden focus:border-blue-600 bg-white text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Live breakdown readout */}
                <div className="flex flex-wrap items-center gap-3.5 text-xs text-right text-gray-500 font-medium">
                  <div>
                    <span className="block text-[10px] text-gray-400">Custo Vidro</span>
                    <span className="text-gray-700">{formatCurrency(liveTotals.glassPriceTotal)}</span>
                  </div>
                  {itemHardwareId !== 'none' && (
                    <div>
                      <span className="block text-[10px] text-gray-400">Ferragens</span>
                      <span className="text-gray-700">{formatCurrency(liveTotals.hardwarePriceTotal)}</span>
                    </div>
                  )}
                  {itemAluminumId !== 'none' && (
                    <div>
                      <span className="block text-[10px] text-gray-400">Alumínio</span>
                      <span className="text-gray-700">{formatCurrency(liveTotals.aluminumPriceTotal)}</span>
                    </div>
                  )}
                  <div>
                    <span className="block text-[10px] text-gray-400">Instalação</span>
                    <span className="text-gray-700">{formatCurrency(itemLaborPrice * itemQuantity)}</span>
                  </div>
                  <div className="bg-blue-50 py-1.5 px-3 rounded-lg border border-blue-100/30">
                    <span className="block text-[10px] text-blue-600 font-bold">Total do Item</span>
                    <strong className="text-blue-700 text-sm">{formatCurrency(liveTotals.itemTotal)}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!itemGlassId || !itemColorId}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold pb-2.5 pt-2.5 px-4 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={14} /> Adicionar Item ao Orçamento
                </button>
              </div>
            </form>

            {/* RHS LIVE TECHNICAL SKETCH (4 cols) */}
            <div className="lg:col-span-4 bg-gray-50 border border-gray-150 rounded-xl p-4 flex flex-col items-center justify-center min-h-[350px] shadow-sm">
              <div className="w-full self-start mb-2 px-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Visualizador 3D/Croqui</span>
                <p className="text-[11px] text-gray-500 leading-tight">Esboço em tempo real sob medida para o cliente</p>
              </div>
              
              <QuotationSketch
                description={itemDescription}
                width={itemWidth}
                height={itemHeight}
                glassColorName={activeColorName}
                templateStyle={itemSketchTemplate}
              />

              <div className="mt-3 text-[10px] text-gray-400 text-center leading-relaxed px-2 bg-white/70 py-1.5 rounded-lg border border-gray-100 w-full">
                Medidas em milímetros: <strong>{Math.round(itemWidth * 1000)}mm</strong> de largura por <strong>{Math.round(itemHeight * 1000)}mm</strong> de altura.
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Budget aggregates and layout list of items (4 cols) */}
      <div className="xl:col-span-4 space-y-6">
        
        {/* Draft Items table / list */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-xs p-5 flex flex-col min-h-[420px]">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b border-gray-50 pb-3 mb-3">
            Peças Selecionadas ({draftItems.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[280px]">
            {draftItems.length === 0 ? (
              <div className="text-center py-20 text-gray-400 text-xs leading-relaxed">
                <AlertCircle size={32} className="mx-auto text-gray-300 stroke-1 mb-2" />
                Nenhum item adicionado.<br />Configure um item ao lado e clique em "Adicionar".
              </div>
            ) : (
              draftItems.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 relative group">
                  <button
                    onClick={() => handleRemoveDraftItem(item.id)}
                    className="absolute right-2 top-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Remover"
                  >
                    <Trash2 size={13} />
                  </button>
                  <p className="font-bold text-xs text-gray-800 pr-5 truncate">{item.description}</p>
                  
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-500 mt-1.5 border-t border-dotted border-gray-200/60 pt-1.5">
                    <div>Med: {item.width.toFixed(2)}x{item.height.toFixed(2)} m</div>
                    <div>Qtd: {item.quantity} un</div>
                    <div>Medida: {item.calculatedArea.toFixed(3)} m²</div>
                    <div className="font-bold text-gray-700 text-right text-xs col-span-2 mt-1">
                      {formatCurrency(item.itemTotal)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing Adjustments */}
          <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Eventual Acréscimo (+) </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-[10px] text-gray-400">R$</span>
                  <input
                    type="number"
                    min="0"
                    value={surchargeAmount || ''}
                    onChange={(e) => setSurchargeAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs border border-gray-200 rounded-lg pl-7 pr-2 py-1 focus:outline-hidden focus:border-blue-600 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Conceder Desconto (-)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-[10px] text-gray-400">R$</span>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs border border-gray-200 rounded-lg pl-7 pr-2 py-1 focus:outline-hidden focus:border-blue-600 bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Observações no Orçamento</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-hidden focus:border-blue-600 bg-white"
                placeholder="Insira detalhes de pagamento ou informações pós-venda..."
              />
            </div>

            {/* Calculations total footer */}
            <div className="bg-blue-950 p-4 rounded-xl text-white">
              <div className="flex justify-between items-center text-xs text-blue-200 mb-1">
                <span>Material & Peças:</span>
                <span className="font-bold">
                  {formatCurrency(draftItems.reduce((acc, i) => acc + i.itemTotal, 0))}
                </span>
              </div>
              {surchargeAmount > 0 && (
                <div className="flex justify-between items-center text-[11px] text-emerald-300">
                  <span>Acréscimos:</span>
                  <span>+{formatCurrency(surchargeAmount)}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-[11px] text-orange-300">
                  <span>Descontos:</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-blue-900 mt-2">
                <span className="text-xs font-semibold text-blue-300 uppercase">Val. Líquido Total:</span>
                <span className="text-lg font-black text-white tracking-widest">
                  {formatCurrency(calculateGrandTotal())}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleSaveQuotation}
                disabled={draftItems.length === 0}
                className="flex-1 bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-teal-700 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                id="btn-save-quotation"
              >
                <Save size={14} /> Salvar Orçamento
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg transition-all cursor-pointer border border-gray-200/50"
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
