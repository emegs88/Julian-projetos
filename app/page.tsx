import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import {
  Building2,
  Shield,
  Calculator,
  BarChart3,
  FileText,
  CheckCircle,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-dark mb-6">
              Levantamento de Capital
              <br />
              com Estruturação Completa
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Levantamento de capital com consórcio contemplado + garantia por
              matrículas, com controle de LTV e custo efetivo real (NPV=0).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
              <div className="flex items-center gap-3 text-left">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                <span className="text-gray-700">Crédito líquido real</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                <span className="text-gray-700">Saldo devedor x avaliação (LTV)</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                <span className="text-gray-700">Mínimo de matrículas</span>
              </div>
              <div className="flex items-center gap-3 text-left">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0" />
                <span className="text-gray-700">CET calculado por fluxo</span>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Link href="/simulador">
                <Button size="lg">Simular Operação</Button>
              </Link>
              <Link href="/apresentacao">
                <Button size="lg" variant="primary">
                  Ver Apresentação
                </Button>
              </Link>
              <Link href="#como-funciona">
                <Button size="lg" variant="outline">
                  Como funciona
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Já sabe qual é o seu objetivo? */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Já sabe qual é o seu objetivo?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <Building2 className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Estrutura da Operação</h3>
              <p className="text-gray-600">
                Configure crédito, entrada, taxas, prazos e cronograma de
                pagamentos.
              </p>
            </Card>
            <Card>
              <Shield className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Garantias (Matrículas/Lotes)</h3>
              <p className="text-gray-600">
                Selecione lotes, calcule LTV e encontre o mínimo necessário de
                matrículas.
              </p>
            </Card>
            <Card>
              <Calculator className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Custo Efetivo (NPV=0)</h3>
              <p className="text-gray-600">
                Calcule a taxa efetiva real usando solver Newton-Raphson com
                fallback bisseção.
              </p>
            </Card>
            <Card>
              <BarChart3 className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Gráficos e Alertas</h3>
              <p className="text-gray-600">
                Visualize fluxo de caixa, saldo devedor vs limite e comparação
                com CDI.
              </p>
            </Card>
            <Card>
              <FileText className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Relatório PDF</h3>
              <p className="text-gray-600">
                Exporte relatórios completos em PDF e CSV com todos os dados e
                gráficos.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Seção: Simulador de Captação */}
      <section id="simulador" className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            Simulador de Captação
          </h2>
          <Card>
            <p className="text-gray-600 mb-6 text-center">
              Configure os parâmetros da sua operação e calcule o custo efetivo,
              LTV e garantias necessárias.
            </p>
            <div className="text-center">
              <Link href="/simulador">
                <Button size="lg">Acessar Simulador Completo</Button>
              </Link>
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">
              * Simulação ilustrativa. Consulte um especialista para análise
              detalhada.
            </p>
          </Card>
        </div>
      </section>

      {/* Seção: Nossos Serviços */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Nossos Serviços
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <h3 className="text-xl font-bold mb-2">Consultoria</h3>
              <p className="text-gray-600">
                Análise completa da estrutura de captação e otimização de
                garantias.
              </p>
            </Card>
            <Card>
              <h3 className="text-xl font-bold mb-2">Levantamento de Capital</h3>
              <p className="text-gray-600">
                Estruturação de operações com consórcios contemplados e
                controle de LTV.
              </p>
            </Card>
            <Card>
              <h3 className="text-xl font-bold mb-2">Planejamento Personalizado</h3>
              <p className="text-gray-600">
                Modelagem de fluxo de caixa e cálculo de custo efetivo para sua
                operação.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Seção: Conheça o Grupo Prospere */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Conheça o Portal Captação
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                R$ 0
              </div>
              <p className="text-gray-600">em crédito modelado</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">0</div>
              <p className="text-gray-600">operações analisadas</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">0%</div>
              <p className="text-gray-600">CET médio</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">0%</div>
              <p className="text-gray-600">operações dentro do LTV</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção: Contato */}
      <section id="contato" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Contato</h2>
          <Card>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Celular
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="text-center">
                <Button size="lg" type="submit">
                  Enviar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
