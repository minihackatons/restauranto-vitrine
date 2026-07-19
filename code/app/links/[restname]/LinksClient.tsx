'use client';
import React, { useEffect } from 'react';

// Icons Components (Minimalist SVG)
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);

const SiteIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

export default function LinksClient({
  data
}: {
  data: any;
}) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  useEffect(() => {
    fetch(`${backendUrl}/restaurants/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantName: data.restaurantName,
        clickType: 'view'
      })
    }).catch(console.error);
  }, [data.restaurantName, backendUrl]);

  const trackClick = (type: string) => {
    fetch(`${backendUrl}/restaurants/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantName: data.restaurantName,
        clickType: type
      })
    }).catch(console.error);
  };

  return (
    <main className="w-full flex flex-col gap-4">
      {data.links.map((link: any) => {
        if (link.isActive === false) return null;
        
        return (
          <a 
            key={link.id} 
            href={link.url} 
            target={link.url.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            onClick={() => trackClick(link.iconType)}
            className="group relative flex items-center p-[18px] bg-white rounded-2xl hover:bg-gray-50 transition-colors duration-200 w-full overflow-hidden border border-gray-200 shadow-sm"
          >
            {/* Icon Container on the Left */}
            <div className="flex items-center justify-center w-8 h-8 text-black shrink-0">
              {link.iconType === 'whatsapp' && <WhatsAppIcon />}
              {link.iconType === 'menu' && <MenuIcon />}
              {link.iconType === 'site' && <SiteIcon />}
            </div>
            
            {/* Perfectly Centered Title */}
            <span className="absolute left-0 right-0 text-center text-[16px] font-medium text-black pointer-events-none px-12">
              {link.title}
            </span>
          </a>
        );
      })}
    </main>
  );
}
