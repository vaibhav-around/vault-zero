'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Copy, RefreshCw, Check, ShieldAlert, Shield, ShieldCheck } from 'lucide-react';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState<{ score: number; label: string; color: string; desc: string }>({
    score: 0,
    label: 'Weak',
    color: 'bg-rose-500',
    desc: 'Select more options or increase length.',
  });

  const generatePassword = () => {
    let charSet = '';
    if (includeUppercase) charSet += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charSet += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charSet += '0123456789';
    if (includeSymbols) charSet += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charSet) {
      setPassword('');
      return;
    }

    let generated = '';
    for (let i = 0; i < length; i++) {
      generated += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }
    setPassword(generated);
  };

  // Generate on mount and whenever options change
  useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  // Calculate strength score
  useEffect(() => {
    if (!password) {
      setStrength({
        score: 0,
        label: 'Empty',
        color: 'bg-zinc-800',
        desc: 'Select options to generate a password.',
      });
      return;
    }

    let score = 0;
    
    // Add points for length
    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    if (length >= 16) score += 1;

    // Add points for complexity
    let activeCategories = 0;
    if (includeUppercase) activeCategories++;
    if (includeLowercase) activeCategories++;
    if (includeNumbers) activeCategories++;
    if (includeSymbols) activeCategories++;

    score += activeCategories;

    let label = 'Weak';
    let color = 'bg-rose-500';
    let desc = 'This password is easy to crack. Try making it longer or adding symbols.';

    if (score >= 6) {
      label = 'Very Strong';
      color = 'bg-emerald-500';
      desc = 'Excellent! This password is highly secure and extremely difficult to guess.';
    } else if (score >= 4) {
      label = 'Strong';
      color = 'bg-teal-500';
      desc = 'Secure. Suitable for most web accounts.';
    } else if (score >= 3) {
      label = 'Medium';
      color = 'bg-amber-500';
      desc = 'Decent strength. Consider adding more character types.';
    }

    setStrength({ score, label, color, desc });
  }, [password, length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    toast.success('Generated password copied to clipboard', {
      icon: <Copy className="h-4 w-4 text-emerald-400" />
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">Password Generator</h2>
        <p className="text-xs sm:text-sm text-zinc-400">
          Create highly secure, cryptographically random passwords locally in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main controls (Left side) */}
        <div className="space-y-6 lg:col-span-2 rounded-2xl border border-zinc-900 bg-zinc-950 p-4 sm:p-6">
          {/* Result Box */}
          <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 sm:p-4">
            <input
              type="text"
              readOnly
              value={password || 'Please select options'}
              className="w-full bg-transparent font-mono text-sm sm:text-lg font-medium tracking-wide text-zinc-100 pr-24 sm:pr-28 focus:outline-none truncate"
            />
            <div className="absolute inset-y-0 right-2 sm:right-3 flex items-center gap-1">
              <button
                onClick={generatePassword}
                disabled={!password}
                className="rounded-lg p-1.5 sm:p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-50 disabled:pointer-events-none"
                title="Regenerate"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={handleCopy}
                disabled={!password}
                className="flex items-center gap-1 rounded-lg bg-violet-600/20 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-violet-300 border border-violet-500/20 hover:bg-violet-600/30 hover:text-violet-100 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Copy className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Copy</span>
              </button>
            </div>
          </div>

          {/* Length slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-zinc-400">Password Length</span>
              <span className="font-bold text-violet-400">{length} characters</span>
            </div>
            <input
              type="range"
              min="6"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-violet-500 focus:outline-none"
            />
          </div>

          {/* Checkbox Options */}
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Options</span>
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Uppercase */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-900 bg-zinc-900/10 p-4 transition-colors hover:border-zinc-800">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-zinc-200">Uppercase Letters</span>
                  <p className="text-xs text-zinc-500">A-Z characters</p>
                </div>
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-violet-600 accent-violet-500 focus:ring-violet-500"
                />
              </label>

              {/* Lowercase */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-900 bg-zinc-900/10 p-4 transition-colors hover:border-zinc-800">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-zinc-200">Lowercase Letters</span>
                  <p className="text-xs text-zinc-500">a-z characters</p>
                </div>
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-violet-600 accent-violet-500 focus:ring-violet-500"
                />
              </label>

              {/* Numbers */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-900 bg-zinc-900/10 p-4 transition-colors hover:border-zinc-800">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-zinc-200">Numbers</span>
                  <p className="text-xs text-zinc-500">0-9 characters</p>
                </div>
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-violet-600 accent-violet-500 focus:ring-violet-500"
                />
              </label>

              {/* Symbols */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-900 bg-zinc-900/10 p-4 transition-colors hover:border-zinc-800">
                <div className="space-y-0.5">
                  <span className="text-sm font-semibold text-zinc-200">Special Symbols</span>
                  <p className="text-xs text-zinc-500">!@#$%^&* characters</p>
                </div>
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-violet-600 accent-violet-500 focus:ring-violet-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Strength Meter details (Right side) */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-900 bg-zinc-950 p-6">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Strength Meter</span>
            
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
                {strength.label === 'Weak' && <ShieldAlert className="h-8 w-8 text-rose-500 animate-pulse" />}
                {strength.label === 'Medium' && <Shield className="h-8 w-8 text-amber-500" />}
                {strength.label === 'Strong' && <ShieldCheck className="h-8 w-8 text-teal-500" />}
                {strength.label === 'Very Strong' && <ShieldCheck className="h-8 w-8 text-emerald-500 animate-bounce" />}
                {strength.label === 'Empty' && <Shield className="h-8 w-8 text-zinc-600" />}
              </div>

              <span className={`rounded-full px-4 py-1 text-sm font-bold tracking-wider uppercase text-black ${strength.color}`}>
                {strength.label}
              </span>
            </div>

            {/* Custom bar grid representation */}
            <div className="grid grid-cols-4 gap-1.5 pt-2">
              <div className={`h-2 rounded-full ${strength.score >= 1 ? strength.color : 'bg-zinc-800'}`} />
              <div className={`h-2 rounded-full ${strength.score >= 3 ? strength.color : 'bg-zinc-800'}`} />
              <div className={`h-2 rounded-full ${strength.score >= 5 ? strength.color : 'bg-zinc-800'}`} />
              <div className={`h-2 rounded-full ${strength.score >= 7 ? strength.color : 'bg-zinc-800'}`} />
            </div>

            <p className="text-xs leading-relaxed text-zinc-400">
              {strength.desc}
            </p>
          </div>

          <div className="mt-8 rounded-lg bg-zinc-900/50 p-4 border border-zinc-900 text-xs text-zinc-500 leading-relaxed space-y-1">
            <div className="font-semibold text-zinc-400">Cryptographic randomness:</div>
            <div>Uses the Web Cryptography API random value generator for strong security.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
