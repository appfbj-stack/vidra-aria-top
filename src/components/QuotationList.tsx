/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Quotation, QuotationStatus } from '../types';
import { Search, Eye, Filter, Trash2, Calendar, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils';

interface QuotationListProps {
  quotations: Quotation[];
  onUpdateStatus: (id: string, status: QuotationStatus) => void;
  onDeleteQuotation: (id: string) => void;
  onSelectPrint: (quotation: Quotation) => void;
  onSelectEdit: (quotation: Quotation) => void;
}

export default function QuotationList({
  quotations,
  onUpdateStatus,
  onDeleteQuotation,
  onSelectPrint,
  onSelectEdit,
}: QuotationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch =
      quotation.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: QuotationStatus) => {
    switch (status) {
      case 'pendente':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'aprovado':
        return 'bg-green-50 text-green-700 border-green-200/60';
      case 'rejeitado':
        return 'bg-red-50 text-red-700 border-red-200/60';
      case 'concluido':
        return 'bg-orange-50 text-orange-700 border-orange-200/60';
    }
  };

  const getStatusIcon = (status: QuotationStatus) => {
    switch (status) {
      case 'pendente':
        return <Clock size={12} className="text-amber-500" />;
      case 'aprovado':
        return <CheckCircle size={12} className="text-green-500" />;
      case 'rejeitado':
        return <XCircle size={12} className="text-red-500" />;
      case 'concluido':
        return <CheckCircle size={12} className="text-orange-500" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden" id="quotation-list-panel">
      {/* Filters bar */}
      <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center gap-4 justify-between">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:border-orange-600 focus:ring-1 focus:ring-orange-600 bg-white"
          />
        </div>

        {/* Filter Tab buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto self-start sm:self-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Todos ({quotations.length})
          </button>
          <button
            onClick={() => setStatusFilter('pendente')}
            className={`cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
              statusFilter === 'pendente'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Pendentes ({quotations.filter(q => q.status === 'pendente').length})
          </button>
          <button
            onClick={() => setStatusFilter('aprovado')}
            className={`cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
              statusFilter === 'aprovado'
                ? 'bg-green-600 text-white border-green-600 shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Aprovados ({quotations.filter(q => q.status === 'aprovado').length})
          </button>
          <button
            onClick={() => setStatusFilter('concluido')}
            className={`cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
              statusFilter === 'concluido'
                ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            Concluídos ({quotations.filter(q => q.status === 'concluido').length})
          </button>
        </div>
      </div>

      {/* Main Budget Items List */}
      <div className="overflow-x-auto">
        {filteredQuotations.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <AlertCircle size={40} className="stroke-1 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">Nenhum orçamento encontrado nesta pesquisa.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-5">Código</th>
                <th className="py-3 px-5">Cliente</th>
                <th className="py-3 px-5">Duração / Validade</th>
                <th className="py-3 px-5 text-center">Itens</th>
                <th className="py-3 px-5 text-right">Valor Total</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-center w-52">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
              {filteredQuotations.map((quotation) => (
                <tr key={quotation.id} className="hover:bg-gray-50/40 transition-colors">
                  <td className="py-4 px-5 font-bold text-orange-600">
                    {quotation.number}
                  </td>
                  <td className="py-4 px-5">
                    <div className="font-semibold text-gray-800">{quotation.client.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{quotation.client.phone}</div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Calendar size={12} className="text-gray-400" />
                      <span>{new Date(quotation.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">Val: {new Date(quotation.validUntil).toLocaleDateString('pt-BR')}</div>
                  </td>
                  <td className="py-4 px-5 text-center font-medium text-gray-600">
                    {quotation.items.length} {quotation.items.length === 1 ? 'item' : 'itens'}
                  </td>
                  <td className="py-4 px-5 text-right font-black text-gray-900">
                    {formatCurrency(quotation.total)}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(quotation.status)}`}>
                      {getStatusIcon(quotation.status)}
                      <span className="capitalize">{quotation.status}</span>
                    </span>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      
                      {/* Open print layout */}
                      <button
                        onClick={() => onSelectPrint(quotation)}
                        className="flex items-center gap-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-semibold px-2 py-1.5 rounded-lg transition-all cursor-pointer"
                        title="Ver e Imprimir"
                      >
                        <Eye size={13} /> Imprimir
                      </button>

                      {/* Status selectors list */}
                      <select
                        value={quotation.status}
                        onChange={(e) => onUpdateStatus(quotation.id, e.target.value as QuotationStatus)}
                        className="text-xs bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-lg px-2 py-1.5 hover:bg-white focus:outline-hidden cursor-pointer"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="rejeitado">Recusado</option>
                        <option value="concluido">Concluído</option>
                      </select>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir permanentemente o orçamento ${quotation.number}?`)) {
                            onDeleteQuotation(quotation.id);
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-100"
                        title="Excluir Orçamento"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
