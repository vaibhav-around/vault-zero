'use client';

import React from 'react';
import { toast } from 'sonner';
import { 
  Wallet, 
  History, 
  Coins, 
  Network, 
  Layers, 
  CheckCircle2, 
  Loader2,
  Trash2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useVaultStore } from '../store/vaultStore';
import { midnightService } from '../lib/midnight';

export default function ProfileView() {
  const { walletInfo, txHistory, syncTransactionHistory, isSyncingLedger } = useVaultStore();

  const handleClearHistory = async () => {
    if (confirm('Clear transaction history log? This only removes the local logs display.')) {
      await midnightService.clearTransactionHistory();
      syncTransactionHistory();
      toast.success('Local transaction logs cleared');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'pending':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">Midnight Profile & Ledger</h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          Manage your connected private key credentials and view your on-chain proof logs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Wallet Metadata Block (Spans 2 columns) */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 sm:p-6 space-y-6">
            <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-zinc-200">
              <Wallet className="h-5 w-5 text-violet-400" />
              <span>Wallet Information</span>
            </h3>

            <div className="space-y-4">
              {/* Wallet Address */}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Wallet Address
                </span>
                <div className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-zinc-900 bg-zinc-900/30 px-3 py-2.5">
                  <span className="font-mono text-xs text-zinc-300 break-all select-all">
                    {walletInfo?.address}
                  </span>
                </div>
              </div>

              {/* Public Key */}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Zero-Knowledge Public Key
                </span>
                <div className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-zinc-900 bg-zinc-900/30 px-3 py-2.5">
                  <span className="font-mono text-xs text-zinc-400 break-all select-all">
                    {walletInfo?.publicKey}
                  </span>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5 text-yellow-500" />
                    Balance
                  </span>
                  <p className="mt-1 text-lg font-bold text-zinc-200">
                    {walletInfo?.balance} <span className="text-xs text-zinc-500">tDUST</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                    <Network className="h-3.5 w-3.5 text-cyan-500" />
                    Ledger Network
                  </span>
                  <p className="mt-1 text-sm font-semibold text-zinc-300">
                    {walletInfo?.network}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Midnight info sidebar */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-200">
              <Layers className="h-5 w-5 text-cyan-400" />
              <span>Midnight ZK Privacy</span>
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              VaultZero uses Midnight&apos;s Compact smart contract framework to publish state transitions. 
            </p>
            <p className="text-xs leading-relaxed text-zinc-500">
              Instead of placing your passwords on-chain, we calculate a zero-knowledge cryptographic signature of your locally encrypted vault. Only this proof hash is anchored on the ledger, ensuring immutable timestamp records of your vault updates while keeping credentials completely invisible to nodes.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-lg border border-violet-500/10 bg-violet-500/5 p-3.5">
            <ShieldCheck className="h-5 w-5 text-violet-400 shrink-0" />
            <div className="text-[11px] text-violet-300 leading-relaxed font-semibold">
              Midnight Compact Proofs: Active
            </div>
          </div>
        </div>
      </div>

      {/* Transaction log */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-200">
            <History className="h-5 w-5 text-violet-400" />
            <span>Midnight Ledger Transactions (ZK Logs)</span>
          </h3>

          {txHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900 text-zinc-500 hover:text-rose-400 text-xs font-semibold px-3 py-1.5 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear logs</span>
            </button>
          )}
        </div>

        {isSyncingLedger && (
          <div className="flex items-center gap-2 rounded-lg border border-violet-500/10 bg-violet-500/5 p-3.5 text-xs text-violet-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Anchoring state transition transaction to the Midnight ledger...</span>
          </div>
        )}

        {txHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-900 rounded-xl">
            <History className="h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-sm font-semibold text-zinc-400">No transactions recorded yet</p>
            <p className="text-xs text-zinc-500 max-w-xs mt-1">
              Adding, updating, or deleting vault items will register secure ZK proofs on the ledger.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-900/10">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-zinc-900 bg-zinc-950 font-semibold text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Method / Action</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Anchored Hash</th>
                  <th className="p-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {txHistory.map((tx) => (
                  <tr key={tx.txId} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="p-4 font-mono font-semibold text-violet-400">
                      <span className="flex items-center gap-1">
                        {tx.txId.slice(0, 16)}...
                        <ExternalLink className="h-3 w-3 text-zinc-500" />
                      </span>
                    </td>
                    <td className="p-4 font-semibold">
                      {tx.type === 'post' && (
                        <span className="text-zinc-200">board::post (state hash)</span>
                      )}
                      {tx.type === 'deploy' && (
                        <span className="text-cyan-400">board::deploy (contract)</span>
                      )}
                      {tx.type === 'takeDown' && (
                        <span className="text-rose-400">board::takeDown</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${getStatusColor(tx.status)}`}>
                        {tx.status === 'pending' && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                        {tx.status === 'success' && <CheckCircle2 className="h-2.5 w-2.5" />}
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-zinc-500 max-w-[200px] truncate" title={tx.payload}>
                      {tx.payload || 'n/a'}
                    </td>
                    <td className="p-4 text-right text-zinc-500 font-medium">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
