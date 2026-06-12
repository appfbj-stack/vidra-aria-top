/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Client, GlassPrice, GlassColor, HardwareKit, AluminumProfile, Quotation } from '../types';

export const DEFAULT_GLASS_PRICES: GlassPrice[] = [
  { id: 'glass-temp-8', name: 'Temperado 8mm', pricePerM2: 320.00 },
  { id: 'glass-temp-10', name: 'Temperado 10mm', pricePerM2: 380.00 },
  { id: 'glass-lam-8', name: 'Laminado 8mm', pricePerM2: 460.00 },
  { id: 'glass-com-4', name: 'Comum 4mm', pricePerM2: 160.00 },
  { id: 'glass-com-6', name: 'Comum 6mm', pricePerM2: 210.00 },
];

export const DEFAULT_GLASS_COLORS: GlassColor[] = [
  { id: 'color-incolor', name: 'Incolor', multiplier: 1.0 },
  { id: 'color-verde', name: 'Verde', multiplier: 1.15 },
  { id: 'color-fume', name: 'Fumê', multiplier: 1.20 },
  { id: 'color-bronze', name: 'Bronze', multiplier: 1.25 },
  { id: 'color-acidato', name: 'Acidato/Jateado', multiplier: 1.45 },
];

export const DEFAULT_HARDWARE_KITS: HardwareKit[] = [
  { id: 'kit-box-padrao', name: 'Kit Box de Correr Standard (Alum)', price: 190.00 },
  { id: 'kit-dobradica-fechadura', name: 'Kit Porta Pivotante (Dobradiças + Fechadura)', price: 280.00 },
  { id: 'kit-fecho-janela', name: 'Fecho de Segurança e Batentes (Janela de Correr)', price: 45.00 },
  { id: 'kit-roldanas-silenciosas', name: 'Par de Roldanas Excêntricas de Latão', price: 60.00 },
];

export const DEFAULT_ALUMINUM_PROFILES: AluminumProfile[] = [
  { id: 'alum-trilho-superior', name: 'Trilho Superior Porta de Correr (p/ m)', pricePerMeter: 65.00 },
  { id: 'alum-perfil-u8', name: 'Perfil Canaleta U 8mm (p/ m)', pricePerMeter: 24.00 },
  { id: 'alum-perfil-u10', name: 'Perfil Canaleta U 10mm (p/ m)', pricePerMeter: 29.00 },
  { id: 'alum-perfil-click', name: 'Perfil de Acabamento Click (p/ m)', pricePerMeter: 32.00 },
];

export const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'client-1',
    name: 'Carlos Eduardo Oliveira',
    phone: '(11) 98765-4321',
    email: 'carlos.edu@gmail.com',
    address: 'Av. Paulista, 1200 - Bela Vista, São Paulo - SP',
  },
  {
    id: 'client-2',
    name: 'Mariana Souza Santos',
    phone: '(21) 99123-4567',
    email: 'mari.souza@gmail.com',
    address: 'Rua Barata Ribeiro, 450 - Copacabana, Rio de Janeiro - RJ',
  },
  {
    id: 'client-3',
    name: 'Construtora Horizonte Ltda',
    phone: '(31) 3456-7890',
    email: 'compras@horizonteconstrucoes.com.br',
    address: 'Av. do Contorno, 5600 - Funcionários, Belo Horizonte - MG',
  }
];

export const DEFAULT_QUOTATIONS: Quotation[] = [
  {
    id: 'quot-1',
    number: 'ORC-1001',
    client: DEFAULT_CLIENTS[0],
    date: '2026-06-10',
    validUntil: '2026-06-25',
    items: [
      {
        id: 'item-1',
        description: 'Box de Banheiro de Canto',
        glassId: 'glass-temp-8',
        colorId: 'color-incolor',
        width: 1.40,
        height: 1.90,
        quantity: 1,
        useRoundedArea: true,
        hardwareKitId: 'kit-box-padrao',
        aluminumId: 'alum-perfil-u8',
        aluminumMeters: 3.8,
        laborPrice: 150.00,
        calculatedArea: 2.66,
        glassPriceTotal: 851.20, // 2.66m2 * R$320
        hardwarePriceTotal: 190.00,
        aluminumPriceTotal: 91.20, // 3.8m * R$24
        itemTotal: 1282.40, // Sum + 150 labor
      },
      {
        id: 'item-2',
        description: 'Espelho Lapidado s/ Bisote',
        glassId: 'glass-com-4',
        colorId: 'color-incolor',
        width: 1.20,
        height: 0.80,
        quantity: 1,
        useRoundedArea: false,
        hardwareKitId: 'none',
        aluminumId: 'alum-perfil-click',
        aluminumMeters: 4.0,
        laborPrice: 80.00,
        calculatedArea: 0.96,
        glassPriceTotal: 153.60, // 0.96m2 * R$160
        hardwarePriceTotal: 0.00,
        aluminumPriceTotal: 128.00, // 4m * R$32
        itemTotal: 361.60,
      }
    ],
    discountAmount: 100.00,
    surchargeAmount: 0.00,
    notes: 'Incluso frete e instalação. Prazo de entrega: 10 dias úteis após medição fina.',
    status: 'pendente',
    total: 1544.00, // (1282.40 + 361.60) - 100.00
  },
  {
    id: 'quot-2',
    number: 'ORC-1002',
    client: DEFAULT_CLIENTS[1],
    date: '2026-06-08',
    validUntil: '2026-06-23',
    items: [
      {
        id: 'item-3',
        description: 'Porta de Correr 2 Folhas (1 fixa + 1 móvel)',
        glassId: 'glass-temp-10',
        colorId: 'color-fume',
        width: 1.80,
        height: 2.10,
        quantity: 1,
        useRoundedArea: true,
        hardwareKitId: 'kit-dobradica-fechadura',
        aluminumId: 'alum-trilho-superior',
        aluminumMeters: 1.8,
        laborPrice: 200.00,
        calculatedArea: 3.78,
        glassPriceTotal: 1723.68, // 3.78m2 * R$380 * 1.2(Fumê)
        hardwarePriceTotal: 280.00,
        aluminumPriceTotal: 117.00, // 1.8 * R$65
        itemTotal: 2320.68,
      }
    ],
    discountAmount: 0.00,
    surchargeAmount: 50.00, // Taxa de entrega flexível
    notes: 'Vidro temperado Blindex fumê de segurança.',
    status: 'aprovado',
    total: 2370.68,
  }
];
