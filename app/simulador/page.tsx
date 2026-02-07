'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AbaEmpreendimento } from '@/components/simulador/AbaEmpreendimento';
import { AbaCotas } from '@/components/simulador/AbaCotas';
import { AbaVeiculos } from '@/components/simulador/AbaVeiculos';
import { AbaCotasAutomoveis } from '@/components/simulador/AbaCotasAutomoveis';
import { AbaEstrutura } from '@/components/simulador/AbaEstrutura';
import { AbaGarantias } from '@/components/simulador/AbaGarantias';
import { AbaCET } from '@/components/simulador/AbaCET';
import { AbaGraficos } from '@/components/simulador/AbaGraficos';
import {
  Building2,
  Calculator,
  Shield,
  TrendingUp,
  BarChart3,
  Layers,
  Car,
  FileText,
} from 'lucide-react';

const tabs = [
  { id: 'empreendimento', label: 'Empreendimento', icon: Building2 },
  { id: 'cotas', label: 'Cotas', icon: Layers },
  { id: 'veiculos', label: 'Veículos', icon: Car },
  { id: 'cotas-automoveis', label: 'Cotas Automóveis', icon: FileText },
  { id: 'estrutura', label: 'Estrutura', icon: Calculator },
  { id: 'garantias', label: 'Garantias', icon: Shield },
  { id: 'cet', label: 'Custo Efetivo', icon: TrendingUp },
  { id: 'graficos', label: 'Gráficos', icon: BarChart3 },
];

export default function SimuladorPage() {
  const [activeTab, setActiveTab] = useState<string>('empreendimento');

  const handleTabChange = useCallback((tabId: string) => {
    console.log('Tab clicked:', tabId);
    setActiveTab(tabId);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">Simulador de Captação</h1>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8" style={{ position: 'relative', zIndex: 10 }}>
            <nav className="flex space-x-8 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleTabChange(tab.id);
                    }}
                    type="button"
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    style={{ position: 'relative', zIndex: 11 }}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'empreendimento' && <AbaEmpreendimento />}
            {activeTab === 'cotas' && <AbaCotas />}
            {activeTab === 'veiculos' && <AbaVeiculos />}
            {activeTab === 'cotas-automoveis' && <AbaCotasAutomoveis />}
            {activeTab === 'estrutura' && <AbaEstrutura />}
            {activeTab === 'garantias' && <AbaGarantias />}
            {activeTab === 'cet' && <AbaCET />}
            {activeTab === 'graficos' && <AbaGraficos />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
