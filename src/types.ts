/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface GlassPrice {
  id: string;
  name: string;
  pricePerM2: number; // Base price for Incolor
}

export interface GlassColor {
  id: string;
  name: string;
  multiplier: number; // e.g. 1.0 for Incolor, 1.15 for Verde, 1.2 for Fumê
}

export interface HardwareKit {
  id: string;
  name: string;
  price: number;
}

export interface AluminumProfile {
  id: string;
  name: string;
  pricePerMeter: number;
}

export interface QuotationItem {
  id: string;
  description: string;
  glassId: string;        // Refers to GlassPrice id
  colorId: string;        // Refers to GlassColor id
  width: number;          // in meters (e.g. 1.20)
  height: number;         // in meters (e.g. 1.90)
  quantity: number;       // quantity of this item
  useRoundedArea: boolean; // Glass shops often round width/height to nearest 5cm or 10cm, or round area
  
  // Kit parameters
  hardwareKitId: string | 'none';
  
  // Aluminum profile parameters
  aluminumId: string | 'none';
  aluminumMeters: number;

  // Manual additional prices or labor
  laborPrice: number;
  
  // Sketch template option (e.g. 'auto', 'box', 'janela', 'porta', 'espelho', 'basculante', 'fixo')
  sketchTemplate?: 'auto' | 'box' | 'janela' | 'porta' | 'espelho' | 'basculante' | 'fixo';
  
  // Calculated totals
  calculatedArea: number;   // w * h * qty
  glassPriceTotal: number;
  hardwarePriceTotal: number;
  aluminumPriceTotal: number;
  itemTotal: number;
}

export type QuotationStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'concluido';

export interface Quotation {
  id: string;
  number: string; // Formatting e.g. ORC-1001
  client: Client;
  date: string;       // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  items: QuotationItem[];
  discountAmount: number;
  surchargeAmount: number;
  notes: string;
  status: QuotationStatus;
  total: number;
}
