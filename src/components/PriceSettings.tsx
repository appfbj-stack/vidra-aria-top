/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GlassPrice, GlassColor, HardwareKit, AluminumProfile } from '../types';
import { Edit2, Save, X, Plus, Trash2, Shield, Palette, Layers, Wrench } from 'lucide-react';
import { formatCurrency } from '../utils';

interface PriceSettingsProps {
  glassPrices: GlassPrice[];
  glassColors: GlassColor[];
  hardwareKits: HardwareKit[];
  aluminumProfiles: AluminumProfile[];
  
  onUpdateGlassPrices: (prices: GlassPrice[]) => void;
  onUpdateGlassColors: (colors: GlassColor[]) => void;
  onUpdateHardwareKits: (kits: HardwareKit[]) => void;
  onUpdateAluminumProfiles: (profiles: AluminumProfile[]) => void;
}

export default function PriceSettings({
  glassPrices,
  glassColors,
  hardwareKits,
  aluminumProfiles,
  onUpdateGlassPrices,
  onUpdateGlassColors,
  onUpdateHardwareKits,
  onUpdateAluminumProfiles,
}: PriceSettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'glass' | 'colors' | 'hardware' | 'aluminum'>('glass');

  // Input states for editing/adding
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPriceStr, setEditPriceStr] = useState('');
  const [editNameStr, setEditNameStr] = useState('');
  const [editMultiplierStr, setEditMultiplierStr] = useState('');

  // States for adding new items
  const [newName, setNewName] = useState('');
  const [newNum, setNewNum] = useState(''); // can be price or multiplier

  const resetEdit = () => {
    setEditingId(null);
    setEditPriceStr('');
    setEditNameStr('');
    setEditMultiplierStr('');
  };

  const saveGlassPrice = (id: string) => {
    const numeric = parseFloat(editPriceStr);
    if (isNaN(numeric) || numeric < 0) return;
    const updated = glassPrices.map(item => 
      item.id === id ? { ...item, name: editNameStr, pricePerM2: numeric } : item
    );
    onUpdateGlassPrices(updated);
    resetEdit();
  };

  const addGlassPrice = () => {
    if (!newName.trim() || isNaN(parseFloat(newNum))) return;
    const newItem: GlassPrice = {
      id: `glass-custom-${Date.now()}`,
      name: newName,
      pricePerM2: parseFloat(newNum)
    };
    onUpdateGlassPrices([...glassPrices, newItem]);
    setNewName('');
    setNewNum('');
  };

  const removeGlassPrice = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta espessura/tipo de vidro?')) {
      onUpdateGlassPrices(glassPrices.filter(item => item.id !== id));
    }
  };

  // 2. Colors
  const saveGlassColor = (id: string) => {
    const numeric = parseFloat(editMultiplierStr);
    if (isNaN(numeric) || numeric < 0) return;
    const updated = glassColors.map(item => 
      item.id === id ? { ...item, name: editNameStr, multiplier: numeric } : item
    );
    onUpdateGlassColors(updated);
    resetEdit();
  };

  const addGlassColor = () => {
    if (!newName.trim() || isNaN(parseFloat(newNum))) return;
    const newItem: GlassColor = {
      id: `color-custom-${Date.now()}`,
      name: newName,
      multiplier: parseFloat(newNum)
    };
    onUpdateGlassColors([...glassColors, newItem]);
    setNewName('');
    setNewNum('');
  };

  const removeGlassColor = (id: string) => {
    if (confirm('Deseja remover essa cor?')) {
      onUpdateGlassColors(glassColors.filter(item => item.id !== id));
    }
  };

  // 3. Hardware Kits
  const saveHardwareKit = (id: string) => {
    const numeric = parseFloat(editPriceStr);
    if (isNaN(numeric) || numeric < 0) return;
    const updated = hardwareKits.map(item => 
      item.id === id ? { ...item, name: editNameStr, price: numeric } : item
    );
    onUpdateHardwareKits(updated);
    resetEdit();
  };

  const addHardwareKit = () => {
    if (!newName.trim() || isNaN(parseFloat(newNum))) return;
    const newItem: HardwareKit = {
      id: `kit-custom-${Date.now()}`,
      name: newName,
      price: parseFloat(newNum)
    };
    onUpdateHardwareKits([...hardwareKits, newItem]);
    setNewName('');
    setNewNum('');
  };

  const removeHardwareKit = (id: string) => {
    if (confirm('Deseja remover esse kit?')) {
      onUpdateHardwareKits(hardwareKits.filter(item => item.id !== id));
    }
  };

  // 4. Aluminum Profiles
  const saveAluminumProfile = (id: string) => {
    const numeric = parseFloat(editPriceStr);
    if (isNaN(numeric) || numeric < 0) return;
    const updated = aluminumProfiles.map(item => 
      item.id === id ? { ...item, name: editNameStr, pricePerMeter: numeric } : item
    );
    onUpdateAluminumProfiles(updated);
    resetEdit();
  };

  const addAluminumProfile = () => {
    if (!newName.trim() || isNaN(parseFloat(newNum))) return;
    const newItem: AluminumProfile = {
      id: `alum-custom-${Date.now()}`,
      name: newName,
      pricePerMeter: parseFloat(newNum)
    };
    onUpdateAluminumProfiles([...aluminumProfiles, newItem]);
    setNewName('');
    setNewNum('');
  };

  const removeAluminumProfile = (id: string) => {
    if (confirm('Deseja remover esse perfil?')) {
      onUpdateAluminumProfiles(aluminumProfiles.filter(item => item.id !== id));
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-xs overflow-hidden" id="price-settings-tab">
      
      {/* Settings Sub Header tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50/50">
        <button
          onClick={() => { setActiveSubTab('glass'); resetEdit(); }}
          className={`flex items-center gap-2 py-3.5 px-5 text-sm font-medium transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'glass' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Shield size={16} /> Vidros (m²)
        </button>
        <button
          onClick={() => { setActiveSubTab('colors'); resetEdit(); }}
          className={`flex items-center gap-2 py-3.5 px-5 text-sm font-medium transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'colors' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Palette size={16} /> Cores e Multiplicadores
        </button>
        <button
          onClick={() => { setActiveSubTab('hardware'); resetEdit(); }}
          className={`flex items-center gap-2 py-3.5 px-5 text-sm font-medium transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'hardware' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers size={16} /> Ferragens / Kits
        </button>
        <button
          onClick={() => { setActiveSubTab('aluminum'); resetEdit(); }}
          className={`flex items-center gap-2 py-3.5 px-5 text-sm font-medium transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
            activeSubTab === 'aluminum' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Wrench size={16} /> Perfis de Alumínio (m)
        </button>
      </div>

      <div className="p-6">
        {/* Table list */}
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-6 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Nome / Descrição</th>
                <th className="py-3 px-4 w-40 text-right">
                  {activeSubTab === 'colors' ? 'Multiplicador' : 'Preço Base'}
                </th>
                <th className="py-3 px-4 w-32 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {/* GLASS LIST */}
              {activeSubTab === 'glass' && glassPrices.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editNameStr}
                        onChange={(e) => setEditNameStr(e.target.value)}
                        className="border border-gray-300 rounded-lg px-2.5 py-1 text-sm focus:outline-hidden focus:border-blue-600 w-full"
                      />
                    ) : (
                      <span className="font-medium text-gray-800">{item.name}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {editingId === item.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-gray-500 text-xs">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editPriceStr}
                          onChange={(e) => setEditPriceStr(e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm text-right focus:outline-hidden focus:border-blue-600 w-24"
                        />
                        <span className="text-gray-400 text-xs">/m²</span>
                      </div>
                    ) : (
                      <span className="text-gray-900">{formatCurrency(item.pricePerM2)} /m²</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {editingId === item.id ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => saveGlassPrice(item.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors cursor-pointer"
                          title="Salvar"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={resetEdit}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Cancelar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingId(item.id);
                            setEditNameStr(item.name);
                            setEditPriceStr(item.pricePerM2.toString());
                          }}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => removeGlassPrice(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {/* COLORS LIST */}
              {activeSubTab === 'colors' && glassColors.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editNameStr}
                        onChange={(e) => setEditNameStr(e.target.value)}
                        className="border border-gray-300 rounded-lg px-2.5 py-1 text-sm focus:outline-hidden focus:border-blue-600 w-full"
                      />
                    ) : (
                      <span className="font-medium text-gray-800">{item.name}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {editingId === item.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <input
                          type="number"
                          step="0.01"
                          value={editMultiplierStr}
                          onChange={(e) => setEditMultiplierStr(e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm text-right focus:outline-hidden focus:border-blue-600 w-24"
                        />
                        <span className="text-gray-400 text-xs">x</span>
                      </div>
                    ) : (
                      <span className="text-gray-900">{item.multiplier.toFixed(2)}x</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {editingId === item.id ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => saveGlassColor(item.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors cursor-pointer"
                          title="Salvar"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={resetEdit}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Cancelar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingId(item.id);
                            setEditNameStr(item.name);
                            setEditMultiplierStr(item.multiplier.toString());
                          }}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => removeGlassColor(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {/* HARDWARE LIST */}
              {activeSubTab === 'hardware' && hardwareKits.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editNameStr}
                        onChange={(e) => setEditNameStr(e.target.value)}
                        className="border border-gray-300 rounded-lg px-2.5 py-1 text-sm focus:outline-hidden focus:border-blue-600 w-full"
                      />
                    ) : (
                      <span className="font-medium text-gray-800">{item.name}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {editingId === item.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-gray-500 text-xs">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editPriceStr}
                          onChange={(e) => setEditPriceStr(e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm text-right focus:outline-hidden focus:border-blue-600 w-24"
                        />
                        <span className="text-gray-400 text-xs">/un</span>
                      </div>
                    ) : (
                      <span className="text-gray-900">{formatCurrency(item.price)}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {editingId === item.id ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => saveHardwareKit(item.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors cursor-pointer"
                          title="Salvar"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={resetEdit}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Cancelar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingId(item.id);
                            setEditNameStr(item.name);
                            setEditPriceStr(item.price.toString());
                          }}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => removeHardwareKit(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {/* ALUMINUM LIST */}
              {activeSubTab === 'aluminum' && aluminumProfiles.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        value={editNameStr}
                        onChange={(e) => setEditNameStr(e.target.value)}
                        className="border border-gray-300 rounded-lg px-2.5 py-1 text-sm focus:outline-hidden focus:border-blue-600 w-full"
                      />
                    ) : (
                      <span className="font-medium text-gray-800">{item.name}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {editingId === item.id ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-gray-500 text-xs">R$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editPriceStr}
                          onChange={(e) => setEditPriceStr(e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm text-right focus:outline-hidden focus:border-blue-600 w-24"
                        />
                        <span className="text-gray-400 text-xs">/m</span>
                      </div>
                    ) : (
                      <span className="text-gray-900">{formatCurrency(item.pricePerMeter)} /m</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {editingId === item.id ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => saveAluminumProfile(item.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors cursor-pointer"
                          title="Salvar"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={resetEdit}
                          className="p-1 text-red-200 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Cancelar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingId(item.id);
                            setEditNameStr(item.name);
                            setEditPriceStr(item.pricePerMeter.toString());
                          }}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => removeAluminumProfile(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form to add elements */}
        {editingId === null && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <Plus size={16} className="text-blue-600" /> Adicionar Novo Cadastro
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6">
                <input
                  type="text"
                  placeholder="Nome do elemento (Ex: Temperado 12mm)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-hidden focus:border-blue-600"
                />
              </div>
              <div className="md:col-span-4">
                <div className="relative">
                  {activeSubTab !== 'colors' && (
                    <span className="absolute left-3 top-2 text-xs text-gray-400">R$</span>
                  )}
                  <input
                    type="number"
                    step="0.01"
                    placeholder={activeSubTab === 'colors' ? 'Multiplicador (Ex: 1.35)' : 'Preço de custo'}
                    value={newNum}
                    onChange={(e) => setNewNum(e.target.value)}
                    className={`w-full text-xs border border-gray-200 rounded-lg py-2 focus:outline-hidden focus:border-blue-600 ${
                      activeSubTab === 'colors' ? 'px-3' : 'pl-8 pr-3'
                    }`}
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <button
                  onClick={() => {
                    if (activeSubTab === 'glass') addGlassPrice();
                    if (activeSubTab === 'colors') addGlassColor();
                    if (activeSubTab === 'hardware') addHardwareKit();
                    if (activeSubTab === 'aluminum') addAluminumProfile();
                  }}
                  disabled={!newName.trim() || !newNum.trim()}
                  className="w-full text-xs font-semibold bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 text-white rounded-lg py-2 px-3 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Incluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
