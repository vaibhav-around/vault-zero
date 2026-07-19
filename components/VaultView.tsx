'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  Star, 
  Copy, 
  Check,
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  FolderOpen,
  Calendar,
  Lock,
  Unlock,
  Command
} from 'lucide-react';
import { useVaultStore, CredentialItem } from '../store/vaultStore';
import AddPasswordModal from './AddPasswordModal';
import SignatureModal from './SignatureModal';

// Category color mappings for UI polish
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Personal: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  Work: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  Finance: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Social: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  Other: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
};

export default function VaultView() {
  const {
    decryptedItems,
    searchQuery,
    selectedCategory,
    showFavoritesOnly,
    deleteCredential,
    setSearchQuery,
    setSelectedCategory,
    setShowFavoritesOnly
  } = useVaultStore();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // For Signature ceremonies
  const [isSigOpen, setIsSigOpen] = useState(false);
  const [sigAction, setSigAction] = useState<{ type: 'reveal' | 'copy'; itemId: string } | null>(null);
  const [sigActionName, setSigActionName] = useState('');

  // Password visibility states & copied feedback states
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const categories = ['All', 'Personal', 'Work', 'Finance', 'Social', 'Other'];

  // Global Keyboard Shortcuts (Ctrl+K -> Search, Ctrl+N -> Add Password)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditItemId(null);
        setIsAddOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopyUsername = (id: string, username: string) => {
    navigator.clipboard.writeText(username);
    setCopiedKey(`user_${id}`);
    setTimeout(() => setCopiedKey(null), 1800);
    toast.success('Username copied to clipboard', {
      icon: <Check className="h-4 w-4 text-emerald-400" />
    });
  };

  // Filter logic
  const filteredItems = decryptedItems.filter((item) => {
    const matchesSearch =
      item.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesFavorite = !showFavoritesOnly || item.isFavorite;

    return matchesSearch && matchesCategory && matchesFavorite;
  });

  const triggerSignatureReq = (type: 'reveal' | 'copy', itemId: string) => {
    const item = decryptedItems.find((i) => i.id === itemId);
    if (!item) return;

    setSigAction({ type, itemId });
    setSigActionName(
      type === 'reveal'
        ? `Decrypt and reveal password for ${item.website} (${item.username})`
        : `Decrypt and copy password for ${item.website} (${item.username})`
    );
    setIsSigOpen(true);
  };

  const handleSignatureApproved = async () => {
    if (!sigAction) return;

    const { type, itemId } = sigAction;
    const item = decryptedItems.find((i) => i.id === itemId);
    if (!item || !item.password) return;

    // Simulate key matching ZK validation success
    if (type === 'reveal') {
      setVisiblePasswords((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
      toast.success('Password decrypted and revealed', {
        icon: <Unlock className="h-4 w-4 text-violet-400" />
      });
    } else if (type === 'copy') {
      navigator.clipboard.writeText(item.password);
      setCopiedKey(`pass_${itemId}`);
      setTimeout(() => setCopiedKey(null), 1800);
      toast.success('Password copied to clipboard securely', {
        icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />
      });
    }

    setSigAction(null);
  };

  const handleToggleFavorite = async (item: CredentialItem) => {
    const { updateCredential } = useVaultStore.getState();
    await updateCredential(item.id, { isFavorite: !item.isFavorite });
    toast.success(item.isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete credentials for ${name}?`)) {
      await deleteCredential(id);
      toast.success('Credential deleted successfully');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Sync Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <span>Secure Vault</span>
            <span className="text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
              {decryptedItems.length} {decryptedItems.length === 1 ? 'item' : 'items'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Client-side AES-256 encrypted passwords. Cryptographic state logs anchored on Midnight.
          </p>
        </div>

        <button
          onClick={() => {
            setEditItemId(null);
            setIsAddOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-violet-500/10 hover:from-violet-500 hover:to-cyan-500 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Add Password</span>
          <span className="text-[10px] font-mono text-white/80 bg-black/20 px-1.5 py-0.5 rounded hidden sm:inline-flex items-center gap-0.5 border border-white/10 ml-1">
            <Command className="h-2.5 w-2.5" />N
          </span>
        </button>
      </div>

      {/* Search & Filtering Area */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-2xl border border-zinc-900 bg-zinc-950/50 p-3.5 sm:p-4 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-zinc-500" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by website, username, or category..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2 sm:py-2.5 pl-9 pr-12 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <span className="absolute top-2.5 right-3 text-[10px] font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded hidden sm:inline-flex items-center gap-0.5">
            <Command className="h-2.5 w-2.5" />K
          </span>
        </div>

        {/* Favorite Filter Toggle */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto ${
            showFavoritesOnly
              ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
              : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
          }`}
        >
          <Star className={`h-4 w-4 shrink-0 ${showFavoritesOnly ? 'fill-amber-400' : ''}`} />
          <span>Favorites</span>
        </button>
      </div>

      {/* Horizontal Category Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none max-w-full">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-lg px-3.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${
              selectedCategory === cat
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-zinc-800/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vault Items Grid */}
      <AnimatePresence mode="popLayout">
        {filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-16 text-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-900 bg-zinc-900/50 text-zinc-500">
              <FolderOpen className="h-6 w-6" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-zinc-300">No passwords found</h3>
            <p className="max-w-xs text-sm text-zinc-500 mb-4">
              {decryptedItems.length === 0
                ? 'Your vault is currently empty. Add your first credential to get started.'
                : 'No credentials match your current filters or search terms.'}
            </p>
            {decryptedItems.length === 0 && (
              <button
                onClick={() => {
                  setEditItemId(null);
                  setIsAddOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-violet-600/20 px-4 py-2 text-xs font-semibold text-violet-300 border border-violet-500/20 hover:bg-violet-600/30 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add First Password</span>
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredItems.map((item) => {
              const isRevealed = !!visiblePasswords[item.id];
              const isUsernameCopied = copiedKey === `user_${item.id}`;
              const isPasswordCopied = copiedKey === `pass_${item.id}`;
              const siteInitial = item.website.charAt(0).toUpperCase();
              const catStyle = categoryColors[item.category] || categoryColors.Other;
              
              return (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-950 p-5 shadow-lg backdrop-blur-md transition-all hover:border-zinc-800"
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 font-bold text-violet-400 border border-violet-500/10">
                        {siteInitial}
                      </div>
                      <div>
                        <h4 className="font-semibold text-zinc-100 group-hover:text-violet-400 transition-colors">
                          {item.website}
                        </h4>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-300"
                        >
                          <span className="truncate max-w-[130px]">{item.url.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Favorite Button */}
                      <button
                        onClick={() => handleToggleFavorite(item)}
                        className={`rounded-lg p-1.5 border transition-colors ${
                          item.isFavorite
                            ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                            : 'border-zinc-900 bg-zinc-900/30 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                        }`}
                        title={item.isFavorite ? 'Unstar' : 'Star favorite'}
                      >
                        <Star className={`h-3.5 w-3.5 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditItemId(item.id);
                          setIsAddOpen(true);
                        }}
                        className="rounded-lg p-1.5 border border-zinc-900 bg-zinc-900/30 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 transition-colors"
                        title="Edit credential"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(item.id, item.website)}
                        className="rounded-lg p-1.5 border border-zinc-900 bg-zinc-900/30 text-zinc-500 hover:bg-zinc-900 hover:text-rose-400 transition-colors"
                        title="Delete credential"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="mt-5 space-y-3 rounded-xl border border-zinc-900/50 bg-zinc-900/10 p-3">
                    {/* Username row */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                          Username
                        </span>
                        <p className="text-sm font-medium text-zinc-300 truncate max-w-[150px]">
                          {item.username}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyUsername(item.id, item.username)}
                        className="rounded bg-zinc-900 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                        title="Copy Username"
                      >
                        {isUsernameCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Password row */}
                    <div className="flex items-center justify-between border-t border-zinc-900/50 pt-2.5">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                          Password
                        </span>
                        <p className="text-sm font-mono tracking-wide text-zinc-200">
                          {isRevealed ? item.password : '••••••••••••••••'}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            if (isRevealed) {
                              setVisiblePasswords((prev) => ({ ...prev, [item.id]: false }));
                            } else {
                              triggerSignatureReq('reveal', item.id);
                            }
                          }}
                          className="rounded bg-zinc-900 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                          title={isRevealed ? 'Hide Password' : 'Reveal Password'}
                        >
                          {isRevealed ? <EyeOff className="h-3.5 w-3.5 text-violet-400" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => triggerSignatureReq('copy', item.id)}
                          className="rounded bg-zinc-900 p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                          title="Decrypt & Copy Password"
                        >
                          {isPasswordCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                          ) : (
                            <Lock className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Footer Card Info */}
                  <div className="mt-4 flex items-center justify-between border-t border-zinc-900/30 pt-3 text-[10px] font-medium text-zinc-500">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
                      <FolderOpen className="h-3 w-3" />
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px]">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add / Edit Credential Modal */}
      <AddPasswordModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditItemId(null);
        }}
        editItemId={editItemId}
      />

      {/* Signature ceremony Modal */}
      <SignatureModal
        isOpen={isSigOpen}
        onClose={() => {
          setIsSigOpen(false);
          setSigAction(null);
        }}
        onApprove={handleSignatureApproved}
        actionName={sigActionName}
      />
    </div>
  );
}
