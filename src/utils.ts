/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuotationItem, GlassPrice, GlassColor, HardwareKit, AluminumProfile } from './types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatArea(areaM2: number): string {
  return `${areaM2.toFixed(3)} m²`;
}

// Round dimension to nearest higher 5cm (0.05)
export function roundToNearest5cm(val: number): number {
  return Math.ceil(val * 20) / 20;
}

export function calculateItemTotals(
  width: number,
  height: number,
  quantity: number,
  useRoundedArea: boolean,
  glassId: string,
  colorId: string,
  hardwareKitId: string,
  aluminumId: string,
  aluminumMeters: number,
  laborPrice: number,
  glassPrices: GlassPrice[],
  glassColors: GlassColor[],
  hardwareKits: HardwareKit[],
  aluminumProfiles: AluminumProfile[]
): Omit<QuotationItem, 'id' | 'description' | 'glassId' | 'colorId' | 'width' | 'height' | 'quantity' | 'useRoundedArea' | 'hardwareKitId' | 'aluminumId' | 'aluminumMeters' | 'laborPrice'> {
  
  const calcWidth = useRoundedArea ? roundToNearest5cm(width) : width;
  const calcHeight = useRoundedArea ? roundToNearest5cm(height) : height;
  const calculatedArea = calcWidth * calcHeight * quantity;

  // Glass pricing
  const baseGlass = glassPrices.find(g => g.id === glassId);
  const colorObj = glassColors.find(c => c.id === colorId);
  
  const glassPricePerM2 = (baseGlass?.pricePerM2 || 0) * (colorObj?.multiplier || 1.0);
  const glassPriceTotal = calculatedArea * glassPricePerM2;

  // Hardware pricing
  const kit = hardwareKits.find(k => k.id === hardwareKitId);
  const hardwarePriceTotal = (kit?.price || 0) * quantity;

  // Aluminum profile pricing
  const alum = aluminumProfiles.find(a => a.id === aluminumId);
  const aluminumPriceTotal = (alum?.pricePerMeter || 0) * aluminumMeters * quantity;

  // Grand total for this line item
  const itemTotal = glassPriceTotal + hardwarePriceTotal + aluminumPriceTotal + (laborPrice * quantity);

  return {
    calculatedArea,
    glassPriceTotal,
    hardwarePriceTotal,
    aluminumPriceTotal,
    itemTotal
  };
}

export function generateNextQuotationNumber(existingQuotations: { number: string }[]): string {
  if (existingQuotations.length === 0) return 'ORC-1001';
  
  const numbers = existingQuotations
    .map(q => {
      const match = q.number.match(/ORC-(\d+)/);
      return match ? parseInt(match[1], 10) : 1000;
    })
    .filter(n => !isNaN(n));
    
  const maxNum = numbers.length > 0 ? Math.max(...numbers) : 1000;
  return `ORC-${maxNum + 1}`;
}
