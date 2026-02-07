# 📡 API Documentation

## Endpoints Disponíveis

### 1. Veículos

#### GET `/api/veiculos`
Retorna lista de todos os veículos cadastrados.

**Resposta:**
```json
{
  "veiculos": [
    {
      "id": "veiculo-123",
      "marca": "Toyota",
      "modelo": "Corolla",
      "ano": 2020,
      "placa": "ABC-1234",
      "chassi": "9BW...",
      "fipe": 100000,
      "valorGarantia": 130000,
      "observacoes": "",
      "selecionado": false
    }
  ]
}
```

#### POST `/api/veiculos`
Cadastra um novo veículo.

**Body:**
```json
{
  "marca": "Toyota",
  "modelo": "Corolla",
  "ano": 2020,
  "fipe": 100000
}
```

**Resposta:**
```json
{
  "veiculo": { ... },
  "message": "Veículo cadastrado com sucesso"
}
```

#### PUT `/api/veiculos`
Atualiza um veículo existente.

**Body:**
```json
{
  "id": "veiculo-123",
  "fipe": 110000
}
```

#### DELETE `/api/veiculos?id=veiculo-123`
Remove um veículo.

---

### 2. Lotes

#### GET `/api/lotes`
Retorna lista de todos os lotes cadastrados.

#### POST `/api/lotes`
Cadastra um novo lote.

**Body:**
```json
{
  "id": "LOTE-001",
  "matricula": "13.410-1",
  "area": 300.50,
  "valorMercado": 150000,
  "valorVendaForcada": 105000
}
```

#### PUT `/api/lotes`
Atualiza um lote existente.

#### DELETE `/api/lotes?id=LOTE-001`
Remove um lote.

---

### 3. Custos

#### GET `/api/custos`
Retorna lista de todos os custos cadastrados.

#### POST `/api/custos`
Cadastra um novo custo.

**Body:**
```json
{
  "tipo": "documentacao",
  "descricao": "Documentação do veículo",
  "valor": 1500,
  "orgao": "Cartório de Registro",
  "observacoes": "Taxa de registro"
}
```

**Tipos disponíveis:**
- `documentacao`
- `registro`
- `itbi`
- `comissao`
- `outros`

#### PUT `/api/custos`
Atualiza um custo existente.

#### DELETE `/api/custos?id=custo-123`
Remove um custo.

---

## Notas de Implementação

- Atualmente usando armazenamento em memória (simulação)
- Em produção, substituir por banco de dados real (PostgreSQL, MongoDB, etc.)
- Adicionar autenticação/autorização conforme necessário
- Adicionar validação de dados com Zod
- Adicionar tratamento de erros mais robusto
