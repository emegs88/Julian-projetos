# 🏗️ Portal Captação – Consórcio Contemplado (LTV & Garantias)

Sistema completo para levantamento de capital para empreendimentos imobiliários usando cotas contempladas de consórcio, com controle de LTV e cálculo de custo efetivo real (NPV=0).

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Recharts** (Gráficos)
- **Zustand** (State Management)
- **Zod** (Validação)
- **jsPDF & html2canvas** (Exportação PDF)

## 📋 Funcionalidades

### Abas Principais

1. **Empreendimento** - Dados do empreendimento e lotes
2. **Cotas** - Múltiplas cotas de consórcio
3. **Veículos** - Garantia por veículos (130% FIPE)
4. **Cotas Automóveis** - Cotas contempladas de automóveis como garantia
5. **Estrutura** - Configuração da operação (crédito, taxas, prazos)
6. **Garantias** - Seleção de lotes e cálculo de LTV
7. **Custo Efetivo** - CET calculado por NPV=0 (Newton-Raphson)
8. **Gráficos** - Visualizações de fluxo de caixa e comparações

## 🎯 Características Principais

- ✅ Cálculo de LTV (Loan-to-Value) em tempo real
- ✅ Pool de garantias consolidadas (lotes + veículos + cotas automóveis)
- ✅ Solver robusto de CET usando Newton-Raphson com fallback Bisseção
- ✅ Gráficos interativos com Recharts
- ✅ Exportação de relatórios em PDF e CSV
- ✅ Dados pré-carregados de "Cidade Jardim - Promissão/SP"
- ✅ Interface inspirada em Prospere.com.br

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start
```

## 🌐 Acessar

- **Landing Page:** http://localhost:3000
- **Simulador:** http://localhost:3000/simulador
- **Apresentação:** http://localhost:3000/apresentacao

## 📊 Cálculos Financeiros

### Valor Líquido
```
Valor Líquido = Crédito - Entrada - Custos - Deságio - Intermediação
```

### LTV (Loan-to-Value)
```
LTV = (Saldo Devedor / Valor da Garantia) × 100
Limite Permitido = Valor da Garantia × (LTV Máximo / 100)
```

### CET (Custo Efetivo Total)
Calculado usando solver Newton-Raphson para encontrar a taxa onde NPV = 0.

## 🗂️ Estrutura do Projeto

```
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── simulador/          # Página do simulador
│   └── apresentacao/        # Página de apresentação
├── components/              # Componentes React
│   ├── simulador/           # Componentes do simulador
│   └── ui/                  # Componentes de UI reutilizáveis
├── lib/                     # Utilitários e cálculos
│   ├── calculos.ts         # Funções de cálculo financeiro
│   ├── irr.ts              # Solver de IRR/NPV
│   └── utils.ts            # Funções utilitárias
├── store/                   # Zustand store
│   └── useSimuladorStore.ts # Estado global
├── types/                   # TypeScript types
│   └── index.ts            # Definições de tipos
└── data/                    # Dados pré-carregados
    └── promissao-lotes.ts   # Dados de Promissão/SP
```

## 📝 Licença

Este projeto é privado e proprietário.

## 👥 Desenvolvido para

Grupo Prospere - Levantamento de Capital Imobiliário
