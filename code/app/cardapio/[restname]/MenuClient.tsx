'use client';
import React, { useState, useEffect, useCallback } from 'react';

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  photoUrl: string;
  category: { name: string };
}

export default function MenuClient({ items, restData, restname }: { items: Item[]; restData: any; restname: string }) {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  const [cart, setCart] = useState<Record<string, number>>({});

  const add = useCallback((id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, []);

  const sub = useCallback((id: string) => {
    setCart(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  }, []);

  const total = items.reduce((sum, item) => sum + (cart[item.id] || 0) * item.price, 0);
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  useEffect(() => {
    fetch(`${backendUrl}/restaurants/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantName: restname, clickType: 'view' })
    }).catch(() => {});
  }, [restname, backendUrl]);

  const grouped = items.reduce((acc, item) => {
    const catName = item.category?.name || 'Outros';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  const formatPrice = (value: number) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`;

  const sendOrder = () => {
    fetch(`${backendUrl}/restaurants/access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantName: restname, clickType: 'whatsapp' })
    }).catch(() => {});

    let msg = `Olá, gostaria de fazer um pedido:\n\n`;
    items.forEach(i => { if (cart[i.id]) msg += `${cart[i.id]}x ${i.name}\n`; });
    msg += `\nPreço total: ${formatPrice(total)}\n\nSeria possível?`;
    const phone = restData?.whatsapp?.replace(/\D/g, '') || '';
    if (!phone) return alert('Número de WhatsApp não configurado.');
    window.location.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
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
        {Object.entries(grouped).map(([cat, catItems]) => (
          <section key={cat}>
            <h2 className="text-2xl font-black mb-6 pb-2 border-b-2 border-zinc-100 text-zinc-900 uppercase tracking-tight">{cat}</h2>
            <div className="flex flex-col gap-6">
              {catItems.map((item, idx) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  qty={cart[item.id] || 0}
                  onAdd={() => add(item.id)}
                  onSub={() => sub(item.id)}
                  formatPrice={formatPrice}
                  isLast={idx === catItems.length - 1}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {totalItems > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4 sm:px-6 bg-white border-t border-zinc-100 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] flex justify-between items-center z-50"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 20px))' }}
        >
          <div>
            <span className="text-zinc-900 font-black text-[18px]">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</span>
            <span className="text-zinc-500 font-medium text-[15px] ml-2 block sm:inline">{formatPrice(total)}</span>
          </div>
          <button
            onClick={sendOrder}
            className="text-white px-6 py-3 rounded-xl font-bold shadow-md active:scale-95 transition-transform"
            style={{ backgroundColor: '#aa3bff', touchAction: 'manipulation' }}
          >
            Enviar Pedido
          </button>
        </div>
      )}
    </>
  );
}

/* Extracted as a separate component so each row manages its own touch handling cleanly */
function MenuItemRow({ item, qty, onAdd, onSub, formatPrice, isLast }: {
  item: Item;
  qty: number;
  onAdd: () => void;
  onSub: () => void;
  formatPrice: (v: number) => string;
  isLast: boolean;
}) {
  return (
    <div style={{
      display: 'flex', gap: '12px', paddingBottom: '20px',
      borderBottom: !isLast ? '1px solid #f4f4f5' : 'none', width: '100%'
    }}>
      {/* Image */}
      <div style={{
        width: '80px', height: '80px', minWidth: '80px', minHeight: '80px',
        borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f4f4f5', flexShrink: 0
      }}>
        {item.photoUrl ? (
          <img src={item.photoUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e4e4e7' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#d4d4d8', borderRadius: '50%' }} />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: '2px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#18181b', lineHeight: '1.2' }}>
            {item.name}
          </h3>
          <p style={{ fontSize: '13px', color: '#71717a', margin: 0, overflow: 'hidden', lineHeight: '1.4', maxHeight: '2.8em' }}>
            {item.description}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
          <span style={{ fontWeight: 900, color: '#18181b', fontSize: '15px' }}>{formatPrice(item.price)}</span>

          <QtyControl qty={qty} onAdd={onAdd} onSub={onSub} />
        </div>
      </div>
    </div>
  );
}

/* Fully isolated quantity control — no external CSS dependencies */
function QtyControl({ qty, onAdd, onSub }: { qty: number; onAdd: () => void; onSub: () => void }) {
  const btnStyle: React.CSSProperties = {
    width: '44px',
    height: '38px',
    border: 'none',
    backgroundColor: '#fafafa',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#3f3f46',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'manipulation',
    WebkitAppearance: 'none',
    userSelect: 'none',
    outline: 'none',
    padding: 0,
    margin: 0,
    lineHeight: 1,
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: '1px solid #e4e4e7', borderRadius: '8px',
      overflow: 'hidden', backgroundColor: '#fafafa',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }}>
      <button type="button" onClick={onSub} style={btnStyle}>−</button>
      <span style={{ width: '32px', textAlign: 'center', fontSize: '15px', fontWeight: 'bold', color: '#18181b', userSelect: 'none' }}>
        {qty}
      </span>
      <button type="button" onClick={onAdd} style={btnStyle}>+</button>
    </div>
  );
}
