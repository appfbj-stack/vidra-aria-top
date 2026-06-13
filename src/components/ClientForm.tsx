/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Client } from '../types';
import { User, Phone, Mail, MapPin, Search, Plus, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClientFormProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export default function ClientForm({ clients, onAddClient, onUpdateClient, onDeleteClient }: ClientFormProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setPhone(client.phone);
    setEmail(client.email);
    setAddress(client.address);
    setShowForm(true);
  };

  const startNew = () => {
    setEditingClient(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingClient) {
      onUpdateClient({
        ...editingClient,
        name,
        phone,
        email,
        address,
      });
    } else {
      onAddClient({
        id: `client-${Date.now()}`,
        name,
        phone,
        email,
        address,
      });
    }

    // Reset
    setShowForm(false);
    setEditingClient(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="client-panel">
      {/* Sidebar: Client List */}
      <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl shadow-xs p-5 flex flex-col lg:h-[650px] h-[400px] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Clientes ({clients.length})</h2>
          <button
            onClick={startNew}
            className="flex items-center gap-1 text-xs bg-orange-600 hover:bg-orange-700 text-white font-medium py-1.5 px-3 rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
            id="btn-new-client"
          >
            <Plus size={14} /> Novo
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, fone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredClients.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Nenhum cliente cadastrado.
            </div>
          ) : (
            filteredClients.map((client) => (
              <div
                key={client.id}
                className="p-3 bg-gray-50 hover:bg-orange-50/50 rounded-lg border border-transparent hover:border-orange-200 transition-all duration-200 group flex items-start justify-between"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{client.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <Phone size={12} />
                    <span>{client.phone || 'Sem telefone'}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5 truncate">
                      <Mail size={12} />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                  <button
                    onClick={() => startEdit(client)}
                    className="p-1 hover:bg-gray-200 text-gray-500 hover:text-orange-600 rounded-md transition-colors cursor-pointer"
                    title="Editar Cliente"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir o cliente ${client.name}?`)) {
                        onDeleteClient(client.id);
                      }
                    }}
                    className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                    title="Excluir Cliente"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main content: Client Editor details */}
      <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-xs p-6 lg:h-[650px] h-auto overflow-y-auto">
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingClient ? `Editar Cadastro: ${editingClient.name}` : 'Cadastrar Novo Cliente'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md py-1 px-2.5 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nome Completo / Razão Social *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo de Oliveira"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">WhatsApp / Telefone</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Ex: (11) 98765-4321"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Ex: cliente@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Endereço de Entrega / Instalação</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ex: Av. Paulista, 1200 - Apto 34 - São Paulo - SP"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer text-sm flex items-center justify-center gap-1.5"
                  >
                    {editingClient ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
              <User size={48} className="text-gray-300 stroke-1 mb-3" />
              <h4 className="text-sm font-semibold text-gray-600 mb-1">Ficha de Cliente</h4>
              <p className="text-xs max-w-sm">
                Selecione um cliente na lista lateral para atualizar suas informações de contato ou clique em <strong>"Novo"</strong> para iniciar um cadastro do zero.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
