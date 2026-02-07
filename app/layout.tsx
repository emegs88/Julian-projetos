import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Captação – Consórcio Contemplado (LTV & Garantias)",
  description: "Levantamento de capital para empreendimentos imobiliários usando cotas contempladas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
