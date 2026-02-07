import { redirect } from 'next/navigation';

export default function Home() {
  // Redirecionar automaticamente para simulador (painel interno)
  redirect('/simulador');
}
