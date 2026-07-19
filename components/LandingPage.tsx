"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  ChevronRight,
  Info,
  Key,
  Cpu,
  Database,
  ArrowRight,
  Globe,
} from "lucide-react";
import { useVaultStore } from "../store/vaultStore";

export default function LandingPage() {
  const { connectWallet, isConnecting } = useVaultStore();
  const [showLearnMore, setShowLearnMore] = useState(false);

  const handleConnect = async () => {
    try {
      await connectWallet(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-black text-zinc-100 selection:bg-violet-600/30 selection:text-violet-200">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 h-[20rem] w-[20rem] sm:h-[40rem] sm:w-[40rem] rounded-full bg-violet-900/10 blur-[100px] sm:blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 h-[22rem] w-[22rem] sm:h-[45rem] sm:w-[45rem] rounded-full bg-cyan-900/10 blur-[110px] sm:blur-[140px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0c_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-600 shadow-md shrink-0">
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Vault<span className="text-violet-400">Zero</span>
          </span>
        </div>

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 sm:px-4.5 py-2 text-xs font-semibold hover:bg-zinc-900 hover:border-zinc-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <div className="h-3 w-3 animate-spin rounded-full border border-zinc-500 border-t-zinc-200" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <WalletIcon className="h-4 w-4 text-violet-400 shrink-0" />
              <span>Connect Wallet</span>
            </>
          )}
        </button>
      </header>

      {/* Hero section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-4xl mx-auto py-8 sm:py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-violet-500/30 bg-violet-950/20 px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-medium text-violet-300 backdrop-blur-md max-w-full truncate">
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">
              Powered by Midnight Smart Contracts
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.15] sm:leading-[1.1] bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-500 bg-clip-text text-transparent">
            Own Your Passwords.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-violet-500 bg-clip-text">
              Zero-Knowledge Security.
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-xl mx-auto text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed px-2 sm:px-0">
            VaultZero is a decentralized, privacy-first password manager. Your
            credentials are encrypted locally using AES-GCM and verified using
            Midnight Zero-Knowledge proofs. Your vault is truly yours.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 w-full sm:w-auto">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-violet-500/10 hover:from-violet-500 hover:to-cyan-500 transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              <span>Connect Midnight Wallet</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowLearnMore(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-6 sm:px-7 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold hover:bg-zinc-900 hover:border-zinc-700 hover:scale-[1.03] active:scale-[0.97] transition-all"
            >
              <Info className="h-4 w-4 text-zinc-400" />
              <span>Learn More</span>
            </button>
          </div>
        </motion.div>

        {/* Feature Highlights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 md:mt-20 text-left w-full"
        >
          {/* Card 1 */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-4 sm:p-5 backdrop-blur-md">
            <div className="mb-3 sm:mb-4 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400 border border-violet-500/10">
              <Key className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>
            <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-base font-bold text-zinc-200">
              Local Encryption
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Passwords are encrypted client-side using military-grade AES-GCM
              before writing to storage. Plaintext keys never leave your device.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-4 sm:p-5 backdrop-blur-md">
            <div className="mb-3 sm:mb-4 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-cyan-600/10 text-cyan-400 border border-cyan-500/10">
              <Cpu className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>
            <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-base font-bold text-zinc-200">
              ZK Signature Verification
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Decryption keys are generated dynamically from your secure wallet
              signature. Decrypt credentials on-demand with zero permanent keys
              saved.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-4 sm:p-5 backdrop-blur-md">
            <div className="mb-3 sm:mb-4 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/10">
              <Database className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>
            <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-base font-bold text-zinc-200">
              Midnight Ledger Sync
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Vault state changes write cryptographic proof hashes to Midnight
              blockchain. Provable vault integrity logs without disclosing
              database items.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-3 sm:gap-4 text-center sm:text-left">
        <div>
          © {new Date().getFullYear()} VaultZero. Created for Midnight
          Hackathon.
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://docs.midnight.network"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-400 transition-colors"
          >
            Midnight Docs
          </a>
          <a
            href="https://midnight.network/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-400 transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="https://github.com/vaibhav-around/vault-zero"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-400 transition-colors"
          >
            Github
          </a>
        </div>
      </footer>

      {/* Learn More slide-over panel */}
      <AnimatePresence>
        {showLearnMore && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLearnMore(false)}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-full sm:max-w-md h-full bg-zinc-950 border-l border-zinc-900 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <h3 className="text-lg font-bold text-zinc-200">
                    How VaultZero Works
                  </h3>
                  <button
                    onClick={() => setShowLearnMore(false)}
                    className="rounded-lg p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs text-zinc-400 leading-relaxed">
                  <h4 className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px]">
                    1. Identity & Keys
                  </h4>
                  <p>
                    Connecting your Midnight wallet requests a signature of a
                    verification challenge. We use the resulting signature bytes
                    as a high-entropy seed to derive a unique AES-GCM 256-bit
                    encryption key using PBKDF2.
                  </p>

                  <h4 className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px]">
                    2. Local Zero-Knowledge Encryption
                  </h4>
                  <p>
                    When you save password items, they are encrypted locally
                    inside your browser sandbox. The derived encryption key is
                    kept only in temporary React state memory and is cleared
                    immediately when you lock the vault or disconnect.
                  </p>

                  <h4 className="font-semibold text-zinc-300 uppercase tracking-wider text-[10px]">
                    3. On-chain Integrity Anchoring
                  </h4>
                  <p>
                    When database modifications happen (add/edit/delete), we
                    generate a SHA-256 hash of the encrypted string. Using the
                    Midnight Compact contract, we post this hash to the ledger
                    in a Zero-Knowledge transaction.
                  </p>
                  <p>
                    This transaction proves ownership of the vault and registers
                    an immutable cryptographic timestamp of your vault state,
                    without revealing any private details.
                  </p>
                </div>
              </div>

              <div className="border-t border-zinc-900 pt-6 mt-6">
                <button
                  onClick={() => {
                    setShowLearnMore(false);
                    handleConnect();
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/10 hover:from-violet-500 hover:to-cyan-500 transition-all text-center block"
                >
                  Connect & Try Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WalletIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1" />
      <path d="M19 11v4" />
      <path d="M15 15h.01" />
    </svg>
  );
}
