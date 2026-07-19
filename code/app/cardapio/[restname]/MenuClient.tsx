'use client';
import React, { useState, useEffect } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  photoUrl: string;
  category: { name: string };
}

export default function MenuClient({ items, restData, restname }: { items: Item[], restData: any, restname: string }) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  const [cart, setCart] = useState<Record<string, number>>({});
  
  const updateQty = (id: string, qty: number) => setCart(prev => ({ ...prev, [id]: Math.max(0, qty) }));
  
  const total = items.reduce((sum, item) => sum + (cart[item.id] || 0) * item.price, 0);
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  useEffect(() => {
    fetch(`${backendUrl}/restaurants/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantName: restname,
        clickType: 'view'
      })
    }).catch(console.error);
  }, [restname, backendUrl]);

  const grouped = items.reduce((acc, item) => {
    (acc[item.category?.name || 'Outros'] ||= []).push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  const sendOrder = () => {
    fetch(`${backendUrl}/restaurants/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantName: restname, clickType: 'whatsapp' })
    }).catch(console.error);

    let msg = `Olá, gostaria de fazer um pedido:\n\n`;
    items.forEach(i => { if (cart[i.id]) msg += `${cart[i.id]}x ${i.name}\n` });
    msg += `\nPreço total: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}\n\nSeria possível?`;
    const phone = restData?.whatsapp?.replace(/\D/g, '') || '';
    if (!phone) return alert('Número de WhatsApp não configurado.');
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!items.length) return (
    <div className="flex flex-col items-center justify-center p-8 h-[60vh]">
      <h1 className="text-2xl font-bold mb-2">Nenhum item encontrado</h1>
      <p className="text-center text-zinc-500">Este cardápio ainda está vazio ou os itens não são públicos.</p>
    </div>
  );

  return (
    <>
      <header className="pt-12 pb-8 px-6 text-center flex flex-col items-center">
        {restData?.avatarUrl && <img src={restData.avatarUrl} alt={restname} className="w-24 h-24 rounded-full mb-4 object-cover shadow-sm border border-gray-100" />}
        <h1 className="text-3xl font-bold capitalize tracking-tight mb-2">{restData?.restaurantName || restname}</h1>
        <p className="text-zinc-500 text-base max-w-md">{restData?.description || "Nosso Cardápio Digital"}</p>
      </header>

      <main className="max-w-3xl mx-auto px-5 sm:px-6 flex flex-col gap-10">
        {Object.entries(grouped).map(([cat, cats]) => (
          <section key={cat}>
            <h2 className="text-2xl font-black mb-6 pb-2 border-b-2 border-zinc-100 text-zinc-900 uppercase tracking-tight">{cat}</h2>
            <div className="flex flex-col gap-6">
              {cats.map((i, idx) => (
                <div key={i.id} className={`flex items-center gap-4 ${idx !== cats.length - 1 ? 'border-b border-zinc-100 pb-6' : ''}`}>
                  <div className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] shrink-0 rounded-xl overflow-hidden flex items-center justify-center shadow-sm bg-zinc-50 border border-zinc-100">
                    {i.photoUrl ? <img src={`${backendUrl}/items/${i.photoUrl}`} className="w-full h-full object-cover" /> : <div className="w-8 h-8 bg-zinc-200 rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[17px] font-bold text-zinc-900 mb-1 leading-tight">{i.name}</h3>
                    <p className="text-zinc-500 text-[14px] line-clamp-2 leading-snug">{i.description}</p>
                    <span className="font-bold text-zinc-900 mt-2 block">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(i.price)}</span>
                  </div>
                  <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden shrink-0 h-10 shadow-sm">
                    <button onClick={() => updateQty(i.id, (cart[i.id] || 0) - 1)} className="px-3 bg-zinc-50 hover:bg-zinc-100 font-bold text-zinc-600 transition-colors">-</button>
                    <input type="number" min="0" value={cart[i.id] || ''} placeholder="0" onChange={e => updateQty(i.id, parseInt(e.target.value) || 0)} className="w-10 text-center font-semibold text-zinc-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    <button onClick={() => updateQty(i.id, (cart[i.id] || 0) + 1)} className="px-3 bg-zinc-50 hover:bg-zinc-100 font-bold text-zinc-600 transition-colors">+</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:px-6 bg-white border-t border-zinc-100 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] flex justify-between items-center z-50">
          <div>
            <span className="text-zinc-900 font-black text-[18px]">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</span>
            <span className="text-zinc-500 font-medium text-[15px] ml-2 block sm:inline">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
          </div>
          <button onClick={sendOrder} className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors shadow-md active:scale-95">Enviar Pedido</button>
        </div>
      )}
    </>
  );
}
