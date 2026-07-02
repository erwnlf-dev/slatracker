// FILE: src/app/layout.tsx
'use client';

import { Inter } from 'next/font/google';
import { StoreProvider, useStore } from '@/lib/store';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

function Toast() {
  const { state, dispatch } = useStore();
  if (!state.toasts.length) return null;
  const t = state.toasts[0];
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-md border border-[rgba(255,255,255,0.08)] bg-[#191a1b] px-4 py-3 text-sm text-[#f7f8f8] shadow-lg">
      <span>{t.message}</span>
      <button
        onClick={() => dispatch({ type: 'DISMISS_TOAST', payload: t.id })}
        className="text-[#8a8f98] hover:text-[#f7f8f8]"
      >
        ✕
      </button>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <title>SLATracker</title>
      </head>
      <body className={`${inter.className} min-h-screen bg-[#08090a] text-[#f7f8f8] antialiased`}>
        <StoreProvider>
          {children}
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
