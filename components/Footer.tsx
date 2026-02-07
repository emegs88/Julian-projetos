import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Portal Captação</h3>
            <p className="text-gray-400 text-sm">
              Levantamento de capital para empreendimentos imobiliários usando
              consórcios contemplados.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Navegação</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/simulador" className="hover:text-white">
                  Simulador
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Funcionalidades</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Estrutura da Operação</li>
              <li>Garantias (LTV)</li>
              <li>Custo Efetivo (NPV=0)</li>
              <li>Gráficos & Relatórios</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <p className="text-sm text-gray-400">
              Entre em contato para mais informações sobre nossos serviços.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Portal Captação. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
