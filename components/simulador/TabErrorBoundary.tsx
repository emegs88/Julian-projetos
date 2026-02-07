'use client';

import React from 'react';
import { Alert } from '@/components/ui/Alert';

interface TabErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class TabErrorBoundary extends React.Component<
  { children: React.ReactNode; tabName: string },
  TabErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; tabName: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TabErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Erro na aba ${this.props.tabName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <Alert variant="error">
            <p className="font-semibold">Erro ao carregar a aba "{this.props.tabName}"</p>
            <p className="text-sm mt-2">
              {this.state.error?.message || 'Erro desconhecido'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
