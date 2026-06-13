/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Client, GlassPrice, GlassColor, HardwareKit, AluminumProfile, Quotation, QuotationStatus, CompanySettings } from './types';
import {
  DEFAULT_GLASS_PRICES,
  DEFAULT_GLASS_COLORS,
  DEFAULT_HARDWARE_KITS,
  DEFAULT_ALUMINUM_PROFILES,
  DEFAULT_CLIENTS,
  DEFAULT_QUOTATIONS,
} from './data/defaultData';
import { fetchData, saveData } from './api';

import DashboardStats from './components/DashboardStats';
import QuotationList from './components/QuotationList';
import QuotationBuilder from './components/QuotationBuilder';
import ClientForm from './components/ClientForm';
import PriceSettings from './components/PriceSettings';
import QuotationPrintView from './components/QuotationPrintView';

import { Layers, Users, Sliders, FileText, Plus, CheckCircle, Calculator, Smartphone, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // 1. Core States, initialized from localStorage or defaults
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('vidr_clients');
    return saved ? JSON.parse(saved) : DEFAULT_CLIENTS;
  });

  const [glassPrices, setGlassPrices] = useState<GlassPrice[]>(() => {
    const saved = localStorage.getItem('vidr_glass_prices');
    return saved ? JSON.parse(saved) : DEFAULT_GLASS_PRICES;
  });

  const [glassColors, setGlassColors] = useState<GlassColor[]>(() => {
    const saved = localStorage.getItem('vidr_glass_colors');
    return saved ? JSON.parse(saved) : DEFAULT_GLASS_COLORS;
  });

  const [hardwareKits, setHardwareKits] = useState<HardwareKit[]>(() => {
    const saved = localStorage.getItem('vidr_hardware_kits');
    return saved ? JSON.parse(saved) : DEFAULT_HARDWARE_KITS;
  });

  const [aluminumProfiles, setAluminumProfiles] = useState<AluminumProfile[]>(() => {
    const saved = localStorage.getItem('vidr_aluminum_profiles');
    return saved ? JSON.parse(saved) : DEFAULT_ALUMINUM_PROFILES;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('vidr_quotations');
    return saved ? JSON.parse(saved) : DEFAULT_QUOTATIONS;
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('vidr_company_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use fallback
      }
    }
    return {
      name: 'Vidraçaria & Cia',
      slogan: 'Soluções sob medida em vidros temperados, laminados, espelhos e esquadrias de alumínio.',
      phone: '(11) 99999-8888',
      email: 'contato@vidracariacia.com.br',
      address: 'Av. Principal, 1500 - Centro - São Paulo - SP',
      cnpj: '12.345.678/0001-99',
      logoUrl: '',
    };
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new_quotation' | 'clients' | 'prices'>('dashboard');
  const [printQuotation, setPrintQuotation] = useState<Quotation | null>(null);
  const [synced, setSynced] = useState(false);

  // Load data from Google Sheets on mount
  useEffect(() => {
    async function loadCloud() {
      const cloudClients = await fetchData('Clientes');
      if (cloudClients.length > 0) setClients(cloudClients as Client[]);
      const cloudPrices = await fetchData('PrecosVidros');
      if (cloudPrices.length > 0) setGlassPrices(cloudPrices as GlassPrice[]);
      const cloudColors = await fetchData('CoresVidros');
      if (cloudColors.length > 0) setGlassColors(cloudColors as GlassColor[]);
      const cloudHardware = await fetchData('KitsFerragens');
      if (cloudHardware.length > 0) setHardwareKits(cloudHardware as HardwareKit[]);
      const cloudProfiles = await fetchData('PerfisAluminio');
      if (cloudProfiles.length > 0) setAluminumProfiles(cloudProfiles as AluminumProfile[]);
      const cloudQuotations = await fetchData('Orcamentos');
      if (cloudQuotations.length > 0) setQuotations(cloudQuotations as unknown as Quotation[]);
      setSynced(true);
    }
    loadCloud();
  }, []);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent browser from automatically showing launcher banner
      e.preventDefault();
      // Save prompt event state
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If already in standalone mode, let's keep button hidden
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User installation choice: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  // 2. Save state to localStorage automatically on changes
  useEffect(() => {
    localStorage.setItem('vidr_clients', JSON.stringify(clients));
    if (synced) saveData('Clientes', clients);
  }, [clients, synced]);

  useEffect(() => {
    localStorage.setItem('vidr_glass_prices', JSON.stringify(glassPrices));
    if (synced) saveData('PrecosVidros', glassPrices);
  }, [glassPrices, synced]);

  useEffect(() => {
    localStorage.setItem('vidr_glass_colors', JSON.stringify(glassColors));
    if (synced) saveData('CoresVidros', glassColors);
  }, [glassColors, synced]);

  useEffect(() => {
    localStorage.setItem('vidr_hardware_kits', JSON.stringify(hardwareKits));
    if (synced) saveData('KitsFerragens', hardwareKits);
  }, [hardwareKits, synced]);

  useEffect(() => {
    localStorage.setItem('vidr_aluminum_profiles', JSON.stringify(aluminumProfiles));
    if (synced) saveData('PerfisAluminio', aluminumProfiles);
  }, [aluminumProfiles, synced]);

  useEffect(() => {
    localStorage.setItem('vidr_quotations', JSON.stringify(quotations));
    if (synced) saveData('Orcamentos', quotations);
  }, [quotations, synced]);

  useEffect(() => {
    localStorage.setItem('vidr_company_settings', JSON.stringify(companySettings));
    if (synced) saveData('Empresa', [companySettings]);
  }, [companySettings, synced]);

  // 3. Actions / Handlers
  const handleAddClient = (newClient: Client) => {
    setClients([newClient, ...clients]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
    // Update client references inside pending quotes
    setQuotations(quotations.map(q => q.client.id === updatedClient.id ? { ...q, client: updatedClient } : q));
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const handleSaveQuotation = (newQuot: Quotation) => {
    setQuotations([newQuot, ...quotations]);
    setActiveTab('dashboard');
  };

  const handleUpdateQuotationStatus = (id: string, status: QuotationStatus) => {
    setQuotations(quotations.map(q => q.id === id ? { ...q, status } : q));
  };

  const handleDeleteQuotation = (id: string) => {
    setQuotations(quotations.filter(q => q.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100/70 font-sans text-gray-800 flex flex-col antialiased">
      
      {/* Dynamic Print Preview Overlay */}
      <AnimatePresence>
        {printQuotation && (
          <QuotationPrintView
            quotation={printQuotation}
            glassPrices={glassPrices}
            glassColors={glassColors}
            hardwareKits={hardwareKits}
            aluminumProfiles={aluminumProfiles}
            companySettings={companySettings}
            onClose={() => setPrintQuotation(null)}
          />
        )}
      </AnimatePresence>

      {/* Main Corporate Header */}
      <header className="bg-white text-gray-900 border-b border-gray-200 px-6 py-5 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2.5 rounded-lg text-white">
              <Layers className="stroke-[2.5]" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-gray-900">VidroGestão</h1>
                <span className="bg-orange-50 text-orange-700 text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-md border border-orange-200 uppercase">
                  Gestão Pro
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Precificação rápida e emissão de contratos corporativos</p>
            </div>
          </div>

          {/* Quick Stats overview or prompt */}
          <div className="flex items-center gap-2">
            {showInstallBtn && (
              <button
                onClick={handleInstallApp}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-md"
                title="Instalar aplicativo de orçamentos no celular ou computador"
              >
                <Smartphone size={15} /> Instalar Aplicativo
              </button>
            )}
            <button
              onClick={() => setActiveTab('new_quotation')}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm"
              id="btn-quick-new"
            >
              <Plus size={15} /> Novo Orçamento
            </button>
          </div>
        </div>
      </header>

      {/* Primary Sub Tabs Selectors */}
      <nav className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-start gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 py-4 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-orange-600 text-orange-600 bg-orange-50/40'
                : 'border-transparent text-gray-500 hover:text-gray-950 hover:bg-gray-50/50'
            }`}
          >
            <FileText size={15} /> Painel de Orçamentos
          </button>

          <button
            onClick={() => setActiveTab('new_quotation')}
            className={`flex items-center gap-2 py-4 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'new_quotation'
                ? 'border-orange-600 text-orange-600 bg-orange-50/40'
                : 'border-transparent text-gray-500 hover:text-gray-950 hover:bg-gray-50/50'
            }`}
          >
            <Calculator size={15} /> Novo Orçamento (Calculadora)
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-2 py-4 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'clients'
                ? 'border-orange-600 text-orange-600 bg-orange-50/40'
                : 'border-transparent text-gray-500 hover:text-gray-950 hover:bg-gray-50/50'
            }`}
          >
            <Users size={15} /> Cadastrar Clientes
          </button>

          <button
            onClick={() => setActiveTab('prices')}
            className={`flex items-center gap-2 py-4 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'prices'
                ? 'border-orange-600 text-orange-600 bg-orange-50/40'
                : 'border-transparent text-gray-500 hover:text-gray-950 hover:bg-gray-50/50'
            }`}
          >
            <Sliders size={15} /> Configurações & Preços
          </button>
        </div>
      </nav>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {/* View 1: Dashboard Panel */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <DashboardStats quotations={quotations} />

                {/* PWA Install Promotion Banner */}
                {showInstallBtn && (
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-xs border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                        <Smartphone size={16} /> Instalar o App no seu Celular ou Computador
                      </h3>
                      <p className="text-[11px] text-emerald-100 max-w-xl leading-relaxed">
                        Acesse instantaneamente pela tela inicial, com maior desempenho offline, menus rápidos para medições na obra e sincronização de tabelas em tempo real.
                      </p>
                    </div>
                    <button
                      onClick={handleInstallApp}
                      className="bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-black px-4 py-2.5 rounded-lg shadow-xs transition-all pointer-events-auto cursor-pointer whitespace-nowrap self-start md:self-auto"
                    >
                      Instalar Agora
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Orçamentos Recentes</h2>
                </div>
                <QuotationList
                  quotations={quotations}
                  onUpdateStatus={handleUpdateQuotationStatus}
                  onDeleteQuotation={handleDeleteQuotation}
                  onSelectPrint={setPrintQuotation}
                  onSelectEdit={(quot) => {
                    // Quick view
                    setPrintQuotation(quot);
                  }}
                />
              </div>
            )}

            {/* View 2: Calculator/Builder */}
            {activeTab === 'new_quotation' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-100 gap-3">
                  <div>
                    <h2 className="text-xl font-black text-gray-800">Calculadora & Emissor de Orçamentos</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Selecione o cliente, adicione os vidros e ferragens, ajuste descontos e salve em segundos.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="text-xs text-gray-500 hover:text-gray-800 py-1.5 px-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer font-semibold whitespace-nowrap self-start sm:self-auto"
                  >
                    Voltar p/ o Painel
                  </button>
                </div>
                <QuotationBuilder
                  clients={clients}
                  glassPrices={glassPrices}
                  glassColors={glassColors}
                  hardwareKits={hardwareKits}
                  aluminumProfiles={aluminumProfiles}
                  existingQuotations={quotations}
                  onSaveQuotation={handleSaveQuotation}
                  onCancel={() => setActiveTab('dashboard')}
                />
              </div>
            )}

            {/* View 3: Clients */}
            {activeTab === 'clients' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Cadastro Geral de Clientes</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Gerencie os contatos dos clientes para utilizá-los na emitidora de orçamentos.</p>
                </div>
                <ClientForm
                  clients={clients}
                  onAddClient={handleAddClient}
                  onUpdateClient={handleUpdateClient}
                  onDeleteClient={handleDeleteClient}
                />
              </div>
            )}

            {/* View 4: Tabela de Preços */}
            {activeTab === 'prices' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 font-sans">Ajuste de Preços de Custo e Configuração do Cabeçalho</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Configure os dados empresariais da sua vidraçaria, faça upload da sua logomarca, e personalize o valor das ferragens, vidros e perfis de alumínio.</p>
                </div>
                <PriceSettings
                  glassPrices={glassPrices}
                  glassColors={glassColors}
                  hardwareKits={hardwareKits}
                  aluminumProfiles={aluminumProfiles}
                  companySettings={companySettings}
                  onUpdateGlassPrices={setGlassPrices}
                  onUpdateGlassColors={setGlassColors}
                  onUpdateHardwareKits={setHardwareKits}
                  onUpdateAluminumProfiles={setAluminumProfiles}
                  onUpdateCompanySettings={setCompanySettings}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-400 print:hidden mt-10">
        <p className="font-semibold text-gray-500">© 2026 VidroGestão Pro. Todos os direitos reservados.</p>
        <p className="text-[10px] text-gray-400 mt-1">Calculadora otimizada para vidro temperado de 8mm e 10mm e esquadrias Blindex.</p>
      </footer>
    </div>
  );
}
