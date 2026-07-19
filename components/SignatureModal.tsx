'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, KeyRound } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => Promise<void>;
  actionName: string;
}

export default function SignatureModal({
  isOpen,
  onClose,
  onApprove,
  actionName,
}: SignatureModalProps) {
  const [isProving, setIsProving] = useState(false);
  const [provingStep, setProvingStep] = useState(0);

  const steps = [
    'Generating zero-knowledge witness...',
    'Proving circuit: board_post_proof...',
    'Signing state hash with local secret key...',
    'Publishing proof transaction to Midnight ledger...',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProving) {
      interval = setInterval(() => {
        setProvingStep((prev) => {
          if (prev >= 3) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isProving]);

  const handleApprove = async () => {
    setProvingStep(0);
    setIsProving(true);
    try {
      await onApprove();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProving(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={!isProving ? onClose : undefined}
            className="absolute inset-0 bg-black backdrop-blur-sm"
          />

          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          >
            {/* Header background glow */}
            <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-violet-600/10 blur-2xl" />
            <div className="absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-cyan-600/10 blur-2xl" />

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-400">
                {isProving ? (
                  <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
                ) : (
                  <KeyRound className="h-7 w-7" />
                )}
              </div>

              <h3 className="mb-2 text-xl font-semibold text-zinc-100">
                {isProving ? 'Generating ZK Proof' : 'Midnight Signature Request'}
              </h3>
              
              <p className="mb-6 text-sm text-zinc-400">
                {isProving
                  ? 'Computing cryptographic proofs locally in your browser. Plaintext values are never transmitted.'
                  : `Please approve the signature request in your wallet to authorize the following action: ${actionName}`}
              </p>

              {isProving ? (
                <div className="w-full space-y-3 rounded-lg border border-zinc-900 bg-zinc-900/50 p-4 text-left">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                      ZK Compiler Status
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                      initial={{ width: '5%' }}
                      animate={{ 
                        width: provingStep === 0 ? '25%' : provingStep === 1 ? '50%' : provingStep === 2 ? '75%' : '100%' 
                      }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                    />
                  </div>
                  <p className="text-xs text-zinc-300 animate-pulse">
                    {steps[provingStep]}
                  </p>
                </div>
              ) : (
                <div className="w-full space-y-3 rounded-lg border border-zinc-900 bg-zinc-950 p-4 text-left text-xs font-mono text-zinc-500">
                  <div className="flex justify-between">
                    <span>Protocol:</span>
                    <span className="text-zinc-300">Midnight Compact 0.16</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span className="text-zinc-300">disclose_witness</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Circuit:</span>
                    <span className="text-zinc-300">board::publicKey</span>
                  </div>
                  <div className="break-all border-t border-zinc-900 pt-2 text-zinc-400">
                    {Buffer.from(actionName).toString('hex')}
                  </div>
                </div>
              )}

              {!isProving && (
                <div className="mt-6 flex w-full gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/10 hover:from-violet-500 hover:to-cyan-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Sign & Verify
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
