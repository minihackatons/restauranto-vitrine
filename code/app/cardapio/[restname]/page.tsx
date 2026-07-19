import React from 'react';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import MenuClient from './MenuClient';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata({ params }: { params: Promise<{ restname: string }> }): Promise<Metadata> {
  const { restname } = await params;
  return {
    title: restname.charAt(0).toUpperCase() + restname.slice(1),
    description: `Cardápio digital de ${restname}`,
  };
}

export default async function CardapioPage({
  params,
}: {
  params: Promise<{ restname: string }>;
}) {
  const { restname } = await params;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  let items: any[] = [];
  let restaurantData: any = null;
  let fetchError = false;

  try {
    const [itemsRes, restRes] = await Promise.all([
      fetch(`${backendUrl}/items/public?restaurantName=${restname}`, { cache: 'no-store' }),
      fetch(`${backendUrl}/restaurants/links/public/${restname}`, { cache: 'no-store' })
    ]);

    if (itemsRes.ok) items = (await itemsRes.json()).data || [];
    else fetchError = true;

    if (restRes.ok) restaurantData = (await restRes.json()).data || null;
  } catch (err) {
    console.error("Failed to fetch menu items:", err);
    fetchError = true;
  }

  return (
    <div className={`min-h-screen bg-white text-zinc-900 pb-24 ${inter.className}`}>
      {fetchError && (
        <div className="max-w-3xl mx-auto mt-4 px-6">
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm text-center">
            Aviso: Erro ao conectar ao servidor. Mostrando cardápio de exemplo.
          </div>
        </div>
      )}

      <MenuClient
        items={items}
        restData={restaurantData}
        restname={restname}
      />

      <footer className="mt-16 mb-8 text-center opacity-50 flex flex-col items-center">
        <img src="/logo.svg" alt="Restauranto Logo" className="w-7 h-7 mb-2 opacity-80" />
        <p className="text-[13px] text-zinc-600 font-medium tracking-wide">
          Powered by Restauranto
        </p>
      </footer>
    </div>
  );
}
