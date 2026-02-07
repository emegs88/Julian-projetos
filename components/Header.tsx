'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/Button';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/simulador', label: 'Simulador' },
    { href: '/apresentacao', label: 'Apresentação' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-dark">
              Portal Captação
            </Link>
          </div>
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/simulador">
              <Button size="sm">Simular Operação</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
