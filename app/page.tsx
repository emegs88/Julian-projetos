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
  // Redirecionar para simulador (painel interno)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Portal Captação</h1>
        <p className="text-gray-600 mb-6">Carregando simulador...</p>
        <Link href="/simulador">
          <Button size="lg">Acessar Simulador</Button>
        </Link>
      </div>
    </div>
  );
}
