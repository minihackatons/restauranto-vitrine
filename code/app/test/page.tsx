'use client';
import { useState } from 'react';

export default function TestPage() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Mobile Test</h1>
      <p style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>{count}</p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => setCount(c => c - 1)}
          style={{ width: '60px', height: '60px', fontSize: '28px', fontWeight: 'bold', border: '2px solid #ccc', borderRadius: '12px', background: 'white', cursor: 'pointer' }}
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setCount(c => c + 1)}
          style={{ width: '60px', height: '60px', fontSize: '28px', fontWeight: 'bold', border: '2px solid #ccc', borderRadius: '12px', background: 'white', cursor: 'pointer' }}
        >
          +
        </button>
      </div>
      <p style={{ marginTop: '20px', color: '#888' }}>If the counter changes, React is working.</p>
    </div>
  );
}
