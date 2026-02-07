import { create } from 'zustand';
import { Empreendimento, Lote, EstruturaOperacao, Garantia, CalculosResultado, Cenario, Cota, CenarioGarantia, Veiculo, CotaAutomovel } from '@/types';
import { lotesPromissao, empreendimentoPromissao } from '@/data/promissao-lotes';

interface SimuladorState {
  // Dados do empreendimento
  empreendimento: Empreendimento;
  lotes: Lote[];
  veiculos: Veiculo[];
  cotasAutomoveis: CotaAutomovel[];
  
  // Estrutura da operação
  estrutura: EstruturaOperacao;
  
  // Cotas de consórcio (múltiplas)
  cotas: Cota[];
  usarMultiplasCotas: boolean; // Toggle para usar múltiplas cotas ou estrutura única
  
  
  // Garantias
  garantia: Garantia;
  cenariosGarantia: CenarioGarantia[];
  
  // Cenários
  cenarios: Cenario[];
  cenarioAtivo: 'conservador' | 'base' | 'agressivo';
  
  // Resultados calculados
  calculos: CalculosResultado | null;
  
  // Ações
  setEmpreendimento: (empreendimento: Partial<Empreendimento>) => void;
  setLotes: (lotes: Lote[]) => void;
  setVeiculos: (veiculos: Veiculo[]) => void;
  addVeiculo: (veiculo: Veiculo) => void;
  updateVeiculo: (id: string, veiculo: Partial<Veiculo>) => void;
  removeVeiculo: (id: string) => void;
  toggleVeiculoSelecionado: (veiculoId: string) => void;
  setEstrutura: (estrutura: Partial<EstruturaOperacao>) => void;
  setGarantia: (garantia: Partial<Garantia>) => void;
  setCalculos: (calculos: CalculosResultado | null) => void;
  toggleLoteSelecionado: (loteId: string) => void;
  addCenarioGarantia: (cenario: CenarioGarantia) => void;
  removeCenarioGarantia: (id: string) => void;
  aplicarCenarioGarantia: (id: string) => void;
  setCenarioAtivo: (cenario: 'conservador' | 'base' | 'agressivo') => void;
  setCotas: (cotas: Cota[]) => void;
  addCota: (cota: Cota) => void;
  updateCota: (id: string, cota: Partial<Cota>) => void;
  removeCota: (id: string) => void;
  setUsarMultiplasCotas: (usar: boolean) => void;
  setCotasAutomoveis: (cotas: CotaAutomovel[]) => void;
  addCotaAutomovel: (cota: CotaAutomovel) => void;
  updateCotaAutomovel: (id: string, cota: Partial<CotaAutomovel>) => void;
  removeCotaAutomovel: (id: string) => void;
  toggleCotaAutomovelSelecionado: (cotaId: string) => void;
  reset: () => void;
}

const empreendimentoInicial: Empreendimento = {
  nome: empreendimentoPromissao.nome,
  cidade: empreendimentoPromissao.cidade,
  uf: empreendimentoPromissao.uf,
  status: empreendimentoPromissao.status,
  matricula: empreendimentoPromissao.matricula,
  areaTotal: empreendimentoPromissao.areaTotal,
  quantidadeLotesTotal: empreendimentoPromissao.quantidadeLotesTotal,
  quantidadeLotesResidenciais: empreendimentoPromissao.quantidadeLotesResidenciais,
  quantidadeLotesResCom: empreendimentoPromissao.quantidadeLotesResCom,
};

const estruturaInicial: EstruturaOperacao = {
  credito: 0,
  entrada: 0,
  taxaAdministracao: 0,
  taxaAdministracaoTipo: 'anual',
  fundoReserva: 0,
  seguro: 0,
  prazoTotal: 0,
  parcelaMensal: 0,
  dataContemplacao: new Date(),
  dataLiberacao: new Date(),
  mesInicioPagamento: 0,
  pagamentoAposAprovado: false,
  desagio: 0,
  taxaIntermediacao: 0,
  custoDocumentacao: 0,
  custoRegistro: 0,
  custoITBI: 0,
  custoComissoes: 0,
  custoOutros: 0,
  prazoEstimado: 0,
  fluxoMensalEstimado: 0,
};

const garantiaInicial: Garantia = {
  ltvMaximo: 70,
  criterioAvaliacao: 'mercado',
  lotesSelecionados: [],
  modoJuncao: 'consolidado',
  veiculosSelecionados: [],
  usarVeiculos: false,
};

export const useSimuladorStore = create<SimuladorState>((set) => ({
  empreendimento: empreendimentoInicial,
  lotes: lotesPromissao.map(l => ({ ...l, selecionado: false })), // Carregar lotes de Promissão por padrão
  veiculos: [],
  cotasAutomoveis: [],
  estrutura: estruturaInicial,
  cotas: [],
  usarMultiplasCotas: false,
  garantia: garantiaInicial,
  cenariosGarantia: [],
  cenarios: [
    {
      id: 'conservador',
      nome: 'conservador',
      ltv: 60,
      desagio: 5,
      taxa: 1.2,
      custos: 3,
      estrutura: {},
    },
    {
      id: 'base',
      nome: 'base',
      ltv: 70,
      desagio: 3,
      taxa: 1.0,
      custos: 2.5,
      estrutura: {},
    },
    {
      id: 'agressivo',
      nome: 'agressivo',
      ltv: 80,
      desagio: 1,
      taxa: 0.8,
      custos: 2,
      estrutura: {},
    },
  ],
  cenarioAtivo: 'base',
  calculos: null,
  
  setEmpreendimento: (empreendimento) =>
    set((state) => ({
      empreendimento: { ...state.empreendimento, ...empreendimento },
    })),
  
  setLotes: (lotes) => set({ lotes }),
  
  setVeiculos: (veiculos) => set({ veiculos }),
  
  addVeiculo: (veiculo) =>
    set((state) => ({
      veiculos: [...state.veiculos, veiculo],
    })),
  
  updateVeiculo: (id, veiculo) =>
    set((state) => ({
      veiculos: state.veiculos.map((v) => (v.id === id ? { ...v, ...veiculo } : v)),
    })),
  
  removeVeiculo: (id) =>
    set((state) => ({
      veiculos: state.veiculos.filter((v) => v.id !== id),
    })),
  
  toggleVeiculoSelecionado: (veiculoId) =>
    set((state) => {
      const veiculos = state.veiculos.map((v) =>
        v.id === veiculoId ? { ...v, selecionado: !v.selecionado } : v
      );
      const garantia = { ...state.garantia };
      
      if (garantia.veiculosSelecionados.includes(veiculoId)) {
        garantia.veiculosSelecionados = garantia.veiculosSelecionados.filter((id) => id !== veiculoId);
      } else {
        garantia.veiculosSelecionados = [...garantia.veiculosSelecionados, veiculoId];
      }
      
      return { veiculos, garantia };
    }),
  
  setEstrutura: (estrutura) =>
    set((state) => ({
      estrutura: { ...state.estrutura, ...estrutura },
    })),
  
  setGarantia: (garantia) =>
    set((state) => ({
      garantia: { ...state.garantia, ...garantia },
    })),
  
  setCalculos: (calculos) => set({ calculos }),
  
  toggleLoteSelecionado: (loteId) =>
    set((state) => {
      const lotes = state.lotes.map((lote) =>
        lote.id === loteId
          ? { ...lote, selecionado: !lote.selecionado }
          : lote
      );
      return { lotes };
    }),
  
  addCenarioGarantia: (cenario) =>
    set((state) => ({
      cenariosGarantia: [...state.cenariosGarantia, cenario],
    })),
  
  removeCenarioGarantia: (id) =>
    set((state) => ({
      cenariosGarantia: state.cenariosGarantia.filter((c) => c.id !== id),
    })),
  
  aplicarCenarioGarantia: (id) =>
    set((state) => {
      const cenario = state.cenariosGarantia.find((c) => c.id === id);
      if (cenario) {
        return {
          garantia: {
            ...state.garantia,
            lotesSelecionados: cenario.lotesSelecionados,
          },
        };
      }
      return state;
    }),
  
  setCenarioAtivo: (cenario) => set({ cenarioAtivo: cenario }),
  
  setCotas: (cotas) => set({ cotas }),
  
  addCota: (cota) =>
    set((state) => ({
      cotas: [...state.cotas, cota],
    })),
  
  updateCota: (id, cota) =>
    set((state) => ({
      cotas: state.cotas.map((c) => (c.id === id ? { ...c, ...cota } : c)),
    })),
  
  removeCota: (id) =>
    set((state) => ({
      cotas: state.cotas.filter((c) => c.id !== id),
    })),
  
  setUsarMultiplasCotas: (usar) => set({ usarMultiplasCotas: usar }),
  
  setCotasAutomoveis: (cotas) => set({ cotasAutomoveis: cotas }),
  
  addCotaAutomovel: (cota) =>
    set((state) => ({
      cotasAutomoveis: [...state.cotasAutomoveis, cota],
    })),
  
  updateCotaAutomovel: (id, cota) =>
    set((state) => ({
      cotasAutomoveis: state.cotasAutomoveis.map((c) => (c.id === id ? { ...c, ...cota } : c)),
    })),
  
  removeCotaAutomovel: (id) =>
    set((state) => ({
      cotasAutomoveis: state.cotasAutomoveis.filter((c) => c.id !== id),
    })),
  
  toggleCotaAutomovelSelecionado: (cotaId) =>
    set((state) => {
      const cotas = state.cotasAutomoveis.map((c) =>
        c.id === cotaId ? { ...c, selecionado: !c.selecionado } : c
      );
      const garantia = { ...state.garantia };
      
      if (garantia.veiculosSelecionados.includes(cotaId)) {
        garantia.veiculosSelecionados = garantia.veiculosSelecionados.filter((id) => id !== cotaId);
      } else {
        garantia.veiculosSelecionados = [...garantia.veiculosSelecionados, cotaId];
      }
      
      return { cotasAutomoveis: cotas, garantia };
    }),
  
  
  reset: () =>
    set({
      empreendimento: empreendimentoInicial,
      lotes: [],
      estrutura: estruturaInicial,
      cotas: [],
      usarMultiplasCotas: false,
      veiculos: [],
      cotasAutomoveis: [],
      garantia: garantiaInicial,
      cenariosGarantia: [],
      calculos: null,
      cenarioAtivo: 'base',
    }),
}));
