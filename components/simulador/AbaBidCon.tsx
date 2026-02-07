'use client';

import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { ShoppingBag } from 'lucide-react';

export function AbaBidCon() {
  return (
    <div className="space-y-6">
      <Card title="Cotas BidCon Marketplace">
        <Alert variant="info">
          <div className="space-y-4">
            <p className="font-semibold">Integração BidCon Marketplace</p>
            <p className="text-sm">
              Esta funcionalidade está disponível para integração futura com o Marketplace BidCon.
            </p>
            <p className="text-sm text-gray-600">
              A aba está acessível, mas a integração completa com APIs e funcionalidades avançadas
              foi removida conforme solicitado.
            </p>
          </div>
        </Alert>
      </Card>
    </div>
  );
}
