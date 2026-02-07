import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed VehicleFipe (tabela antiga - manter para compatibilidade)
  const veiculos = [
    { marca: 'VW', modelo: 'Polo', ano: 2020, fipe: 75000, categoria: 'Passeio' },
    { marca: 'VW', modelo: 'Gol', ano: 2022, fipe: 52000, categoria: 'Passeio' },
    { marca: 'VW', modelo: 'Saveiro', ano: 2012, fipe: 44000, categoria: 'Utilitário' },
    { marca: 'Jaguar', modelo: 'F-Pace', ano: 2021, fipe: 529000, categoria: 'SUV' },
    { marca: 'Mercedes', modelo: 'GLC43', ano: 2017, fipe: 270000, categoria: 'SUV' },
    { marca: 'Porsche', modelo: 'Cayenne', ano: 2020, fipe: 470000, categoria: 'SUV' },
    { marca: 'Mercedes', modelo: 'Atego 2425', ano: 2012, fipe: 267000, categoria: 'Caminhão' },
    { marca: 'Peugeot', modelo: 'Expert', ano: 2022, fipe: 129000, categoria: 'Van' },
    { marca: 'VW', modelo: '18.310', ano: 2003, fipe: 80000, categoria: 'Caminhão' },
    { marca: 'Clark', modelo: 'Empilhadeira', ano: 2022, fipe: 156000, categoria: 'Equipamento' },
  ];

  for (const veiculo of veiculos) {
    await prisma.vehicleFipe.upsert({
      where: {
        id: `${veiculo.marca}-${veiculo.modelo}-${veiculo.ano}`,
      },
      update: {
        fipe: veiculo.fipe,
        categoria: veiculo.categoria,
      },
      create: {
        id: `${veiculo.marca}-${veiculo.modelo}-${veiculo.ano}`,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
        fipe: veiculo.fipe,
        categoria: veiculo.categoria,
      },
    });
  }

  // Seed VehicleWatchlist (exemplos - códigos FIPE precisam ser reais da BrasilAPI)
  // NOTA: Estes códigos são exemplos. Você precisa buscar os códigos reais na BrasilAPI
  const watchlist = [
    // Exemplos (substituir por códigos reais)
    // { categoria: 'carros', marca: 'VW', modelo: 'Polo', anoModelo: 2020, codigoFipe: '001234-5', apelido: null },
  ];

  for (const veiculo of watchlist) {
    await prisma.vehicleWatchlist.upsert({
      where: {
        id: `${veiculo.categoria}-${veiculo.marca}-${veiculo.modelo}-${veiculo.anoModelo}`,
      },
      update: {
        codigoFipe: veiculo.codigoFipe,
        ativo: true,
      },
      create: {
        id: `${veiculo.categoria}-${veiculo.marca}-${veiculo.modelo}-${veiculo.anoModelo}`,
        categoria: veiculo.categoria,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        anoModelo: veiculo.anoModelo,
        codigoFipe: veiculo.codigoFipe,
        apelido: veiculo.apelido || null,
        ativo: true,
      },
    });
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
