'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  KeyRound, 
  Settings, 
  User, 
  LogOut, 
  Lock, 
  Unlock,
  Layers,
  Network,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import { useVaultStore } from '../store/vaultStore';
import VaultView from './VaultView';
import PasswordGenerator from './PasswordGenerator';
import SettingsView from './SettingsView';
import ProfileView from './ProfileView';

export default function Dashboard() {
  const {
    walletInfo,
    activeTab,
    isLocked,
    isConnecting,
    setActiveTab,
    disconnectWallet,
    unlockVaultWithSignature
  } = useVaultStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleUnlock = async () => {
    try {
      await unlockVaultWithSignature();
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { id: 'vault', name: 'Vault', icon: Shield },
    { id: 'generator', name: 'Generator', icon: KeyRound },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'profile', name: 'Profile & Ledger', icon: User },
  ] as const;

  const renderActiveView = () => {
    switch (activeTab) {
      case 'vault':
        return <VaultView />;
      case 'generator':
        return <PasswordGenerator />;
      case 'settings':
        return <SettingsView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <VaultView />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-black text-zinc-100 font-sans relative">
      
      {/* Background radial highlights */}
      <div className="absolute top-0 right-0 h-[30rem] w-[30rem] rounded-full bg-violet-900/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-[30rem] w-[30rem] rounded-full bg-cyan-900/5 blur-[100px] pointer-events-none" />

      {/* Mobile Top Header */}
      <header className="md:hidden flex h-14 w-full items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-4 backdrop-blur-md relative z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-cyan-600 shadow-md">
              <Lock className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Vault<span className="text-violet-400">Zero</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${
            isLocked 
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            {isLocked ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
            {isLocked ? 'Locked' : 'Unlocked'}
          </span>
          <span className="text-[11px] text-zinc-400 font-medium hidden xs:inline">
            {walletInfo?.balance} tDUST
          </span>
        </div>
      </header>

      {/* Mobile Navigation Drawer & Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-72 bg-zinc-950 border-r border-zinc-900 p-5 flex flex-col justify-between shadow-2xl md:hidden"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 shadow-md">
                      <Lock className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                      Vault<span className="text-violet-400">Zero</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        disabled={isLocked && item.id !== 'profile'}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide transition-all border ${
                          isActive
                            ? 'bg-gradient-to-r from-violet-600/10 to-cyan-600/10 border-violet-500/20 text-violet-300'
                            : 'border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none'
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5 shrink-0" />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-4 border-t border-zinc-900 pt-4">
                <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                    <Network className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{walletInfo?.network}</span>
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] text-zinc-500 truncate select-all">
                    {walletInfo?.address}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    disconnectWallet();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-400 hover:bg-rose-950/20 hover:border-rose-900/20 hover:text-rose-400 transition-all active:scale-[0.98]"
                >
                  <LogOut className="h-4.5 w-4.5 shrink-0" />
                  <span>Disconnect Wallet</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex relative z-20 h-full w-64 flex-col justify-between border-r border-zinc-900 bg-zinc-950/70 p-5 backdrop-blur-xl shrink-0">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 shadow-md">
              <Lock className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Vault<span className="text-violet-400">Zero</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  disabled={isLocked && item.id !== 'profile'}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold tracking-wide transition-all border ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/10 to-cyan-600/10 border-violet-500/20 text-violet-300'
                      : 'border-transparent text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200 disabled:opacity-30 disabled:pointer-events-none'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4 border-t border-zinc-900 pt-4">
          {/* Connected Wallet details */}
          <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <Network className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="truncate max-w-[130px]">{walletInfo?.network}</span>
            </div>
            <div className="mt-1.5 font-mono text-[10px] text-zinc-500 truncate select-all">
              {walletInfo?.address}
            </div>
          </div>

          {/* Disconnect Button */}
          <button
            onClick={disconnectWallet}
            className="flex w-full items-center gap-3 rounded-xl border border-zinc-900 bg-zinc-950 px-4 py-3 text-sm font-semibold text-zinc-400 hover:bg-rose-950/20 hover:border-rose-900/20 hover:text-rose-400 transition-all active:scale-[0.98]"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span>Disconnect Wallet</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="relative z-10 flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-black/40">
        
        {/* Top Header (Desktop) */}
        <header className="hidden md:flex h-16 w-full items-center justify-between border-b border-zinc-900 bg-zinc-950/30 px-8 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Session Status:
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
              isLocked 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              {isLocked ? <Lock className="h-2.5 w-2.5" /> : <Unlock className="h-2.5 w-2.5" />}
              {isLocked ? 'Locked' : 'Unlocked'}
            </span>
          </div>

          <div className="text-xs text-zinc-500 font-medium">
            Balance: <span className="font-bold text-zinc-300">{walletInfo?.balance} tDUST</span>
          </div>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative">
          <AnimatePresence mode="wait">
            {isLocked ? (
              // Locked Wall
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 text-center"
              >
                <div className="mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border border-rose-500/20 bg-rose-500/5 text-rose-400">
                  <Lock className="h-7 w-7 sm:h-8 sm:w-8 animate-pulse" />
                </div>
                <h3 className="mb-2 text-lg sm:text-xl font-bold text-zinc-200">Vault is Cryptographically Locked</h3>
                <p className="max-w-md text-xs text-zinc-400 leading-relaxed mb-6 px-2 sm:px-0">
                  To decrypt your credentials, please authorize VaultZero key derivation by signing the challenge request with your connected Midnight wallet.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={disconnectWallet}
                    className="w-full sm:w-auto rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-3 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                  >
                    Disconnect
                  </button>
                  <button
                    onClick={handleUnlock}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3 text-xs font-semibold text-white shadow-lg hover:from-violet-500 hover:to-cyan-500 transition-all hover:scale-[1.02]"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                        <span>Signing challenge...</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4" />
                        <span>Approve Wallet Signature</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              // Unlocked Active View
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderActiveView()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
