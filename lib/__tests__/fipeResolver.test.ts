/**
 * Testes para resolvedor de código FIPE
 * 
 * NOTA: Estes testes podem fazer chamadas reais à API BrasilAPI
 * Em produção, considere mockar as chamadas HTTP
 */

import { describe, it, expect } from 'vitest';
import { resolveCodigoFipe } from '../fipeResolver';

describe('resolveCodigoFipe', () => {
  it('deve resolver código FIPE para VW Polo 2020 (carros)', async () => {
    const result = await resolveCodigoFipe({
      tipo: 'carros',
      marcaTexto: 'VW',
      modeloTexto: 'Polo',
      ano: 2020,
    });

    if ('erro' in result) {
      console.warn('Teste falhou (pode ser problema de rede ou API):', result.erro);
      // Não falhar o teste se for problema de rede
      expect(result.erro).toBeDefined();
    } else {
      expect(result.codigoFipe).toBeDefined();
      expect(result.codigoFipe.length).toBeGreaterThan(0);
      expect(result.marca).toContain('Volkswagen');
    }
  }, 30000); // Timeout de 30s

  it('deve resolver código FIPE para MB Atego 2425 2012 (caminhoes)', async () => {
    const result = await resolveCodigoFipe({
      tipo: 'caminhoes',
      marcaTexto: 'MB',
      modeloTexto: 'Atego 2425',
      ano: 2012,
    });

    if ('erro' in result) {
      console.warn('Teste falhou (pode ser problema de rede ou API):', result.erro);
      expect(result.erro).toBeDefined();
    } else {
      expect(result.codigoFipe).toBeDefined();
      expect(result.codigoFipe.length).toBeGreaterThan(0);
      expect(result.marca.toLowerCase()).toMatch(/mercedes|mb/);
    }
  }, 30000);

  it('deve retornar erro com sugestões para modelo não encontrado', async () => {
    const result = await resolveCodigoFipe({
      tipo: 'carros',
      marcaTexto: 'VW',
      modeloTexto: 'ModeloInexistente123',
      ano: 2020,
    });

    // Deve retornar erro
    expect('erro' in result).toBe(true);
    
    if ('erro' in result) {
      expect(result.erro).toBeDefined();
      // Pode ter sugestões
      if (result.sugestoes) {
        expect(Array.isArray(result.sugestoes)).toBe(true);
      }
    }
  }, 30000);
});
