'use client';

import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { 
  Download, 
  Upload, 
  Trash2, 
  Sun, 
  Moon, 
  AlertTriangle, 
  Check, 
  FileJson,
  Lock
} from 'lucide-react';
import { useVaultStore } from '../store/vaultStore';

export default function SettingsView() {
  const { exportVault, importVault, clearVault, walletInfo } = useVaultStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const handleExport = () => {
    try {
      const data = exportVault();
      if (!data) {
        toast.error('No vault data found to export');
        return;
      }

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `vaultzero_export_${walletInfo?.address?.slice(0, 8) || 'wallet'}.json`;
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Encrypted vault exported successfully', {
        description: 'Store this file securely. It can only be opened with this wallet.'
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to export vault');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        
        if (!parsed.ciphertext || !parsed.iv) {
          toast.error('Invalid vault file format. Missing ciphertext/iv.');
          return;
        }

        const success = await importVault(parsed.ciphertext, parsed.iv);
        if (success) {
          toast.success('Encrypted vault imported successfully', {
            description: 'Your credentials have been loaded and state verified on the ledger.'
          });
        } else {
          toast.error('Failed to decrypt imported vault', {
            description: 'Make sure this vault belongs to the connected wallet signature.'
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to parse vault file');
      }
    };
    reader.readAsText(file);
    // Reset file input value so same file can be selected again
    e.target.value = '';
  };

  const handleClearVault = async () => {
    try {
      await clearVault();
      setIsConfirmClearOpen(false);
      toast.success('Vault cleared successfully', {
        description: 'All local and memory credentials have been wiped.'
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to clear vault');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    toast.success(`Theme switched to ${theme === 'dark' ? 'Light' : 'Dark'} Mode (Simulated)`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">Settings</h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          Manage your vault backups, import encrypted files, or wipe data.
        </p>
      </div>

      <div className="space-y-6">
        {/* Backup & Restore Block */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 sm:p-6 space-y-4">
          <h3 className="text-lg font-semibold text-zinc-200">Backup & Recovery</h3>
          <p className="text-xs text-zinc-500">
            VaultZero never stores your passwords on central servers. Back up your passwords regularly by exporting the encrypted data file.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Export */}
            <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 flex flex-col justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-semibold text-zinc-200">
                  <Download className="h-4 w-4 text-violet-400" />
                  <span>Export Vault</span>
                </div>
                <p className="text-xs text-zinc-500">
                  Download your encrypted vault as a JSON file. Highly secure backup.
                </p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 px-4.5 py-2.5 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Import */}
            <div className="rounded-xl border border-zinc-900 bg-zinc-900/10 p-5 flex flex-col justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-semibold text-zinc-200">
                  <Upload className="h-4 w-4 text-cyan-400" />
                  <span>Import Vault</span>
                </div>
                <p className="text-xs text-zinc-500">
                  Restore vault credentials from an exported encrypted JSON backup file.
                </p>
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={handleImportClick}
                  className="flex items-center gap-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 px-4.5 py-2.5 transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Import JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* General Settings Block */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-zinc-200">Preferences</h3>
          
          <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-zinc-200">Appearance Theme</span>
              <p className="text-xs text-zinc-500">Toggle between dark and light dashboards.</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-violet-400" />}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-zinc-200">Self-Lock Timer</span>
              <p className="text-xs text-zinc-500">Lock vault automatically after inactivity.</p>
            </div>
            <select
              defaultValue="15m"
              className="rounded-lg border border-zinc-850 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 focus:outline-none"
            >
              <option value="5m">5 Minutes</option>
              <option value="15m">15 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>

        {/* Danger Zone Block */}
        <div className="rounded-2xl border border-rose-900/30 bg-rose-950/5 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            <h3 className="text-lg font-semibold text-rose-500">Danger Zone</h3>
          </div>
          <p className="text-xs text-zinc-500">
            Destructive actions can result in permanent loss of access. Please make sure you have backups.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-rose-950/20 bg-rose-950/10 p-4 gap-4">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-rose-200">Wipe Secure Vault</span>
              <p className="text-xs text-rose-500/80">Permanent removal of all local and cached passwords.</p>
            </div>
            {isConfirmClearOpen ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsConfirmClearOpen(false)}
                  className="rounded-lg bg-zinc-900 border border-zinc-850 px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearVault}
                  className="rounded-lg bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 text-xs font-semibold"
                >
                  Yes, Wipe Everything
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirmClearOpen(true)}
                className="flex items-center gap-1 rounded-lg bg-rose-600/10 border border-rose-500/20 hover:bg-rose-600/20 text-rose-300 px-4.5 py-2.5 text-xs font-semibold transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear Vault</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
