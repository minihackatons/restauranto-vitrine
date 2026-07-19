import React from 'react';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import LinksClient from './LinksClient';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata({ params }: { params: Promise<{ restname: string }> }): Promise<Metadata> {
  const { restname } = await params;
  return {
    title: restname.charAt(0).toUpperCase() + restname.slice(1),
    description: `Links de ${restname}`,
  };
}

// Expected link structure from the backend
interface LinkItem {
  id: string | number;
  title: string;
  url: string;
  iconType: 'menu' | 'whatsapp' | 'site';
  isActive?: boolean;
}

interface LinktreeData {
  restaurantName: string;
  description?: string;
  avatarUrl?: string;
  links: LinkItem[];
}



export default async function LinksPage({
  params,
}: {
  params: Promise<{ restname: string }>;
}) {
  const { restname } = await params;
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  let data: LinktreeData | null = null;
  let fetchError = false;

  try {
    const res = await fetch(`${backendUrl}/restaurants/links/public/${restname}`, {
      cache: 'no-store' 
    });

    if (res.ok) {
      const responseData = await res.json();
      const record = responseData.data || {};
      
      const mappedLinks: LinkItem[] = [];
      let idCounter = 1;
      
      if (record.menu) mappedLinks.push({ id: idCounter++, title: 'Cardápio Digital', url: record.menu, iconType: 'menu' });
      
      if (record.whatsapp) {
        const cleanedNumber = record.whatsapp.replace(/\D/g, '');
        const waUrl = `https://api.whatsapp.com/send?phone=${cleanedNumber}`;
        mappedLinks.push({ id: idCounter++, title: 'WhatsApp', url: waUrl, iconType: 'whatsapp' });
      }
      
      if (record.site) mappedLinks.push({ id: idCounter++, title: 'Nosso Site', url: record.site, iconType: 'site' });

      data = {
        restaurantName: restname,
        description: "Bem-vindo ao nosso restaurante!",
        links: mappedLinks
      };
    } else {
      fetchError = true;
    }
  } catch (err) {
    console.error("Failed to fetch links:", err);
    fetchError = true;
  }

  if (!data || data.links.length === 0) {
    data = {
      restaurantName: restname,
      description: "Bem-vindo ao nosso restaurante!",
      links: [
        { id: 1, title: 'Cardápio Digital', url: `/cardapio/${restname}`, iconType: 'menu' },
        { id: 2, title: 'Falar no WhatsApp', url: '#', iconType: 'whatsapp' },
        { id: 3, title: 'Visite nosso Site', url: '#', iconType: 'site' },
      ]
    };
  }

  return (
    <div className={`flex flex-col min-h-screen items-center py-12 px-5 bg-white text-zinc-900 ${inter.className}`}>
      
      <div className="flex flex-col items-center w-full max-w-[640px]">
        
        {/* Header Section */}
        <header className="mb-10 text-center flex flex-col items-center w-full">
          {data.avatarUrl && (
            <img 
              src={data.avatarUrl} 
              alt={data.restaurantName} 
              className="w-[96px] h-[96px] rounded-full mb-4 object-cover"
            />
          )}
          
          <h1 className="text-[32px] sm:text-[40px] font-bold capitalize tracking-tight mb-2 mt-2">
            {data.restaurantName}
          </h1>
          
          <p className="text-[16px] text-zinc-500 font-normal tracking-wide">
            {data.description}
          </p>
        </header>
        
        {fetchError && (
          <div className="mb-6 px-4 py-3 bg-red-50 text-red-700 text-sm rounded-xl text-center w-full border border-red-100">
            Aviso: Erro ao conectar ao servidor. Mostrando links de exemplo.
          </div>
        )}

        {/* Links Section */}
        <LinksClient data={data} />
        
        {/* Footer */}
        <footer className="mt-16 mb-8 text-center opacity-50 flex flex-col items-center">
          <img src="/logo.svg" alt="Restauranto Logo" className="w-7 h-7 mb-2 opacity-80" />
          <p className="text-[13px] text-zinc-600 font-medium tracking-wide">
            Powered by Restauranto
          </p>
        </footer>

      </div>
    </div>
  );
}