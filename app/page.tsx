'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { useVaultStore } from '../store/vaultStore';
import LandingPage from '../components/LandingPage';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const { isConnected } = useVaultStore();

  return (
    <>
      <div className="flex-1 flex flex-col min-h-screen">
        {isConnected ? <Dashboard /> : <LandingPage />}
      </div>
      <Toaster 
        theme="dark" 
        position="bottom-right" 
        richColors 
        closeButton 
        toastOptions={{
          style: {
            background: '#09090b',
            border: '1px solid #18181b',
            color: '#f4f4f5'
          }
        }}
      />
    </>
  );
}
