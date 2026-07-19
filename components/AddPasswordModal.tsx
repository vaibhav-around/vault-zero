'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { X, Eye, EyeOff, Sparkles, Star } from 'lucide-react';
import { useVaultStore, CredentialItem } from '../store/vaultStore';

interface AddPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItemId?: string | null;
}

// Zod schema for input validation
const credentialSchema = z.object({
  website: z.string().min(1, 'Website name is required'),
  url: z.string().url('Must be a valid URL (e.g. https://google.com)'),
  username: z.string().min(1, 'Username or Email is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  category: z.enum(['Personal', 'Work', 'Finance', 'Social', 'Other']),
  notes: z.string().optional(),
});

export default function AddPasswordModal({
  isOpen,
  onClose,
  editItemId,
}: AddPasswordModalProps) {
  const { decryptedItems, addCredential, updateCredential } = useVaultStore();

  const [website, setWebsite] = useState('');
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState<CredentialItem['category']>('Personal');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [prevEditId, setPrevEditId] = useState<string | null | undefined>(undefined);
  const [prevIsOpen, setPrevIsOpen] = useState(false);

  // Sync state when modal opens or edit item changes
  if (isOpen !== prevIsOpen || editItemId !== prevEditId) {
    setPrevIsOpen(isOpen);
    setPrevEditId(editItemId);
    if (isOpen) {
      if (editItemId) {
        const item = decryptedItems.find((i) => i.id === editItemId);
        if (item) {
          setWebsite(item.website);
          setUrl(item.url);
          setUsername(item.username);
          setPassword(item.password || '');
          setCategory(item.category);
          setNotes(item.notes || '');
          setIsFavorite(item.isFavorite);
        }
      } else {
        setWebsite('');
        setUrl('');
        setUsername('');
        setPassword('');
        setCategory('Personal');
        setNotes('');
        setIsFavorite(false);
      }
      setErrors({});
      setShowPassword(false);
    }
  }

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let pass = '';
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setShowPassword(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      website,
      url,
      username,
      password,
      category,
      notes,
    };

    const result = credentialSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      if (editItemId) {
        await updateCredential(editItemId, {
          website,
          url,
          username,
          password,
          category,
          notes,
          isFavorite,
        });
      } else {
        await addCredential({
          website,
          url,
          username,
          password,
          category,
          notes,
          isFavorite,
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
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
            onClick={onClose}
            className="absolute inset-0 bg-black backdrop-blur-sm"
          />

          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          >
            {/* Header background glow */}
            <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-violet-600/10 blur-2xl" />

            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-xl font-bold text-zinc-100">
                {editItemId ? 'Edit Credential' : 'Add Secure Credential'}
              </h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {/* Row 1: Website Name & Category */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Website Name
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. Google"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  {errors.website && (
                    <span className="text-xs text-rose-500">{errors.website}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CredentialItem['category'])}
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Finance">Finance</option>
                    <option value="Social">Social</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Website URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. https://accounts.google.com"
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                {errors.url && <span className="text-xs text-rose-500">{errors.url}</span>}
              </div>

              {/* Username / Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Username or Email
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. user@gmail.com"
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                {errors.username && (
                  <span className="text-xs text-rose-500">{errors.username}</span>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Password
                </label>
                <div className="relative mt-1 flex rounded-lg">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 pr-20 text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="flex items-center gap-1 rounded bg-violet-600/20 px-2 py-1 text-[10px] font-semibold text-violet-300 border border-violet-500/20 hover:bg-violet-600/30 hover:text-violet-100 transition-all"
                      title="Generate random password"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Gen</span>
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <span className="text-xs text-rose-500">{errors.password}</span>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Notes / Details
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Security questions, PINs, or secondary codes..."
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              {/* Bottom Actions: Favorite Toggle & Save Button */}
              <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    isFavorite
                      ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                      : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-900'
                  }`}
                >
                  <Star className={`h-4 w-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
                  <span>Favorite</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:from-violet-500 hover:to-cyan-500"
                  >
                    Save Encrypted
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
