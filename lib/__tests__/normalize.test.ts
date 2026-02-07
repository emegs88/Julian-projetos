/**
 * Testes para funções de normalização
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  parseBRLToNumber,
  tokenize,
  tokenOverlap,
  extractNumbers,
  jaroWinklerSimilarity,
} from '../normalize';

describe('normalizeText', () => {
  it('deve normalizar texto corretamente', () => {
    expect(normalizeText('VW Polo')).toBe('vw polo');
    expect(normalizeText('Mercedes-Benz')).toBe('mercedes benz');
    expect(normalizeText('Jaguar F-Pace')).toBe('jaguar f pace');
    expect(normalizeText('  Múltiplos   Espaços  ')).toBe('multiplos espacos');
    expect(normalizeText('Açúcar')).toBe('acucar');
  });

  it('deve lidar com strings vazias', () => {
    expect(normalizeText('')).toBe('');
    expect(normalizeText('   ')).toBe('');
  });
});

describe('parseBRLToNumber', () => {
  it('deve converter valores BRL para número', () => {
    expect(parseBRLToNumber('R$ 75.000,00')).toBe(75000);
    expect(parseBRLToNumber('R$ 123.456,78')).toBe(123456.78);
    expect(parseBRLToNumber('1.500,50')).toBe(1500.5);
    expect(parseBRLToNumber('500')).toBe(500);
  });

  it('deve retornar 0 para valores inválidos', () => {
    expect(parseBRLToNumber('')).toBe(0);
    expect(parseBRLToNumber('abc')).toBe(0);
  });
});

describe('tokenize', () => {
  it('deve tokenizar texto corretamente', () => {
    expect(tokenize('VW Polo 1.0')).toEqual(['vw', 'polo', '1', '0']);
    expect(tokenize('Mercedes GLC43 AMG')).toEqual(['mercedes', 'glc43', 'amg']);
  });

  it('deve remover stopwords', () => {
    expect(tokenize('Polo 4x2 Flex')).toEqual(['polo', 'flex']);
    expect(tokenize('Gol 1.0 Turbo')).toEqual(['gol', '1', '0']);
  });
});

describe('tokenOverlap', () => {
  it('deve calcular sobreposição de tokens', () => {
    expect(tokenOverlap('VW Polo', 'Polo VW')).toBeGreaterThan(0.5);
    expect(tokenOverlap('VW Polo', 'VW Gol')).toBeLessThan(0.5);
    expect(tokenOverlap('VW Polo', 'VW Polo')).toBe(1);
  });
});

describe('extractNumbers', () => {
  it('deve extrair números de texto', () => {
    expect(extractNumbers('MB Atego 2425')).toEqual([2425]);
    expect(extractNumbers('VW 18.310')).toEqual([18, 310]);
    expect(extractNumbers('Polo 2020')).toEqual([2020]);
  });
});

describe('jaroWinklerSimilarity', () => {
  it('deve calcular similaridade corretamente', () => {
    expect(jaroWinklerSimilarity('VW', 'VW')).toBe(1);
    expect(jaroWinklerSimilarity('Volkswagen', 'VW')).toBeGreaterThan(0);
    expect(jaroWinklerSimilarity('Polo', 'Gol')).toBeLessThan(0.5);
  });
});
