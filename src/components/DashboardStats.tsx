/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Quotation } from '../types';
import { TrendingUp, CheckCircle, Clock, Percent, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils';

interface DashboardStatsProps {
  quotations: Quotation[];
}

export default function DashboardStats({ quotations }: DashboardStatsProps) {
  // Statistics calculations
  const totalCount = quotations.length;
  
  const totalValue = quotations.reduce((acc, q) => acc + q.total, 0);

  const approvedQuotations = quotations.filter(q => q.status === 'aprovado' || q.status === 'concluido');
  const totalApprovedValue = approvedQuotations.reduce((acc, q) => acc + q.total, 0);

  const pendingQuotations = quotations.filter(q => q.status === 'pendente');
  const totalPendingValue = pendingQuotations.reduce((acc, q) => acc + q.total, 0);

  const conversionRate = totalCount > 0 ? (approvedQuotations.length / totalCount) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6" id="dashboard-stats">
      {/* Metric 1 */}
      <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Total Orçado</span>
          <span className="text-xl font-bold text-gray-900 tracking-tight mt-1 block">
            {formatCurrency(totalValue)}
          </span>
          <span className="text-xs text-gray-500 mt-1 block">
            {totalCount} {totalCount === 1 ? 'orçamento emitido' : 'orçamentos emitidos'}
          </span>
        </div>
        <div className="bg-orange-600 p-2.5 rounded-lg text-white">
          <DollarSign size={20} />
        </div>
      </div>

      {/* Metric 2 */}
      <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Faturamento Aprovado</span>
          <span className="text-xl font-bold text-green-600 tracking-tight mt-1 block">
            {formatCurrency(totalApprovedValue)}
          </span>
          <span className="text-xs text-green-700 font-medium mt-1 block">
            {approvedQuotations.length} {approvedQuotations.length === 1 ? 'fechado' : 'fechados'} com sucesso
          </span>
        </div>
        <div className="bg-green-50 p-2.5 rounded-lg text-green-600">
          <CheckCircle size={20} />
        </div>
      </div>

      {/* Metric 3 */}
      <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Em Negociação</span>
          <span className="text-xl font-bold text-amber-600 tracking-tight mt-1 block">
            {formatCurrency(totalPendingValue)}
          </span>
          <span className="text-xs text-gray-500 mt-1 block">
            {pendingQuotations.length} {pendingQuotations.length === 1 ? 'orçamento pendente' : 'orçamentos pendentes'}
          </span>
        </div>
        <div className="bg-amber-50 p-2.5 rounded-lg text-amber-600">
          <Clock size={20} />
        </div>
      </div>

      {/* Metric 4 */}
      <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Conversão</span>
          <span className="text-xl font-bold text-gray-900 tracking-tight mt-1 block">
            {conversionRate.toFixed(1)}%
          </span>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={12} className="text-green-500" />
            <span className="text-xs text-gray-500">
              Taxa de fechamento
            </span>
          </div>
        </div>
        <div className="bg-orange-50 p-2.5 rounded-lg text-orange-600">
          <Percent size={20} />
        </div>
      </div>
    </div>
  );
}
