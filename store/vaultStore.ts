import { create } from 'zustand';
import { deriveKey, encryptData, decryptData, arrayBufferToBase64 } from '../lib/crypto';
import { midnightService, WalletInfo, TransactionInfo } from '../lib/midnight';

export interface CredentialItem {
  id: string;
  website: string;
  url: string;
  username: string;
  password?: string; // encrypted or decrypted on-the-fly, or kept decrypted in memory
  notes: string;
  category: 'Personal' | 'Work' | 'Finance' | 'Social' | 'Other';
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

interface VaultState {
  // Wallet state
  isConnected: boolean;
  walletInfo: WalletInfo | null;
  isConnecting: boolean;
  
  // Security state
  cryptoKey: CryptoKey | null;
  decryptedItems: CredentialItem[];
  isLocked: boolean;
  
  // Ledger / Sync state
  txHistory: TransactionInfo[];
  isSyncingLedger: boolean;
  
  // Navigation / UI state
  activeTab: 'vault' | 'generator' | 'settings' | 'profile';
  searchQuery: string;
  selectedCategory: string;
  showFavoritesOnly: boolean;

  // Actions
  connectWallet: (forceSimulate?: boolean) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  lockVault: () => void;
  unlockVaultWithSignature: () => Promise<void>;
  addCredential: (item: Omit<CredentialItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCredential: (id: string, updatedFields: Partial<CredentialItem>) => Promise<void>;
  deleteCredential: (id: string) => Promise<void>;
  exportVault: () => { ciphertext: string; iv: string } | null;
  importVault: (ciphertext: string, iv: string) => Promise<boolean>;
  clearVault: () => Promise<void>;
  
  // UI setters
  setActiveTab: (tab: 'vault' | 'generator' | 'settings' | 'profile') => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setShowFavoritesOnly: (show: boolean) => void;
  syncTransactionHistory: () => void;
}

// Helper to compute SHA-256 hash of string as hex
async function computeHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const useVaultStore = create<VaultState>((set, get) => ({
  isConnected: false,
  walletInfo: null,
  isConnecting: false,
  cryptoKey: null,
  decryptedItems: [],
  isLocked: true,
  txHistory: [],
  isSyncingLedger: false,
  activeTab: 'vault',
  searchQuery: '',
  selectedCategory: 'All',
  showFavoritesOnly: false,

  connectWallet: async (forceSimulate = false) => {
    set({ isConnecting: true });
    try {
      const info = await midnightService.connectWallet(forceSimulate);
      set({ 
        isConnected: true, 
        walletInfo: info,
        txHistory: midnightService.getTransactionHistory()
      });
      
      // Auto-unlock: prompt signature and derive key
      await get().unlockVaultWithSignature();
    } catch (err) {
      console.error('Failed to connect wallet', err);
      set({ isConnecting: false });
      throw err;
    }
  },

  disconnectWallet: async () => {
    await midnightService.disconnectWallet();
    set({
      isConnected: false,
      walletInfo: null,
      cryptoKey: null,
      decryptedItems: [],
      isLocked: true,
      txHistory: [],
      isConnecting: false
    });
  },

  lockVault: () => {
    set({
      cryptoKey: null,
      decryptedItems: [],
      isLocked: true
    });
  },

  unlockVaultWithSignature: async () => {
    const { isConnected, walletInfo } = get();
    if (!isConnected || !walletInfo) {
      throw new Error('Wallet is not connected');
    }

    // Step 1: Request signature to authorize vault key derivation
    const authMessage = `Unlock VaultZero: Address: ${walletInfo.address}`;
    const signature = await midnightService.signMessage(authMessage);
    
    // Step 2: Derive AES key from signature
    const key = await deriveKey(signature);
    
    // Step 3: Check if we have encrypted vault data in localStorage
    const storedVault = localStorage.getItem(`vaultzero_vault_${walletInfo.address}`);
    let items: CredentialItem[] = [];
    
    if (storedVault) {
      try {
        const { ciphertext, iv } = JSON.parse(storedVault);
        const decryptedJson = await decryptData(ciphertext, iv, key);
        items = JSON.parse(decryptedJson);
      } catch (err) {
        console.error('Failed to decrypt vault with derived key', err);
        throw new Error('Decryption failed. Please verify your signature.');
      }
    }

    set({
      cryptoKey: key,
      decryptedItems: items,
      isLocked: false,
      isConnecting: false
    });
  },

  addCredential: async (newItem) => {
    const { decryptedItems, cryptoKey, walletInfo } = get();
    if (!cryptoKey || !walletInfo) throw new Error('Vault is locked or wallet not connected');

    const item: CredentialItem = {
      ...newItem,
      id: cryptoKey + '_' + Math.random().toString(36).substring(2, 9),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedItems = [...decryptedItems, item];
    
    // Encrypt
    const itemsJson = JSON.stringify(updatedItems);
    const encrypted = await encryptData(itemsJson, cryptoKey);
    
    // Store locally
    localStorage.setItem(`vaultzero_vault_${walletInfo.address}`, JSON.stringify(encrypted));
    
    set({ decryptedItems: updatedItems });

    // Anchor hash on Midnight ledger
    set({ isSyncingLedger: true });
    try {
      const hash = await computeHash(encrypted.ciphertext);
      await midnightService.postVaultStateHash(hash);
      set({ txHistory: midnightService.getTransactionHistory() });
    } catch (err) {
      console.error('Failed to anchor state hash on Midnight', err);
    } finally {
      set({ isSyncingLedger: false });
    }
  },

  updateCredential: async (id, updatedFields) => {
    const { decryptedItems, cryptoKey, walletInfo } = get();
    if (!cryptoKey || !walletInfo) throw new Error('Vault is locked or wallet not connected');

    const updatedItems = decryptedItems.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...updatedFields,
          updatedAt: Date.now(),
        };
      }
      return item;
    });

    // Encrypt
    const itemsJson = JSON.stringify(updatedItems);
    const encrypted = await encryptData(itemsJson, cryptoKey);
    
    // Store locally
    localStorage.setItem(`vaultzero_vault_${walletInfo.address}`, JSON.stringify(encrypted));
    
    set({ decryptedItems: updatedItems });

    // Anchor hash on Midnight ledger
    set({ isSyncingLedger: true });
    try {
      const hash = await computeHash(encrypted.ciphertext);
      await midnightService.postVaultStateHash(hash);
      set({ txHistory: midnightService.getTransactionHistory() });
    } catch (err) {
      console.error('Failed to anchor state hash on Midnight', err);
    } finally {
      set({ isSyncingLedger: false });
    }
  },

  deleteCredential: async (id) => {
    const { decryptedItems, cryptoKey, walletInfo } = get();
    if (!cryptoKey || !walletInfo) throw new Error('Vault is locked or wallet not connected');

    const updatedItems = decryptedItems.filter((item) => item.id !== id);

    // Encrypt
    const itemsJson = JSON.stringify(updatedItems);
    const encrypted = await encryptData(itemsJson, cryptoKey);
    
    // Store locally
    localStorage.setItem(`vaultzero_vault_${walletInfo.address}`, JSON.stringify(encrypted));
    
    set({ decryptedItems: updatedItems });

    // Anchor hash on Midnight ledger
    set({ isSyncingLedger: true });
    try {
      const hash = await computeHash(encrypted.ciphertext);
      await midnightService.postVaultStateHash(hash);
      set({ txHistory: midnightService.getTransactionHistory() });
    } catch (err) {
      console.error('Failed to anchor state hash on Midnight', err);
    } finally {
      set({ isSyncingLedger: false });
    }
  },

  exportVault: () => {
    const { walletInfo } = get();
    if (!walletInfo) return null;
    
    const storedVault = localStorage.getItem(`vaultzero_vault_${walletInfo.address}`);
    if (!storedVault) return null;
    
    return JSON.parse(storedVault);
  },

  importVault: async (ciphertext, iv) => {
    const { cryptoKey, walletInfo } = get();
    if (!cryptoKey || !walletInfo) throw new Error('Vault is locked or wallet not connected');

    try {
      // Validate decryption with current key
      const decryptedJson = await decryptData(ciphertext, iv, cryptoKey);
      const items = JSON.parse(decryptedJson);
      
      if (!Array.isArray(items)) {
        throw new Error('Invalid vault file format');
      }

      // Store locally
      localStorage.setItem(
        `vaultzero_vault_${walletInfo.address}`,
        JSON.stringify({ ciphertext, iv })
      );

      set({ decryptedItems: items });

      // Anchor hash on Midnight ledger
      set({ isSyncingLedger: true });
      const hash = await computeHash(ciphertext);
      await midnightService.postVaultStateHash(hash);
      set({ 
        txHistory: midnightService.getTransactionHistory(),
        isSyncingLedger: false 
      });
      
      return true;
    } catch (err) {
      console.error('Failed to import vault', err);
      return false;
    }
  },

  clearVault: async () => {
    const { cryptoKey, walletInfo } = get();
    if (!cryptoKey || !walletInfo) throw new Error('Vault is locked or wallet not connected');

    // Store empty array encrypted
    const encrypted = await encryptData(JSON.stringify([]), cryptoKey);
    localStorage.setItem(`vaultzero_vault_${walletInfo.address}`, JSON.stringify(encrypted));

    set({ decryptedItems: [] });

    // Anchor hash on Midnight ledger
    set({ isSyncingLedger: true });
    try {
      const hash = await computeHash(encrypted.ciphertext);
      await midnightService.postVaultStateHash(hash);
      set({ txHistory: midnightService.getTransactionHistory() });
    } catch (err) {
      console.error('Failed to anchor state hash on Midnight', err);
    } finally {
      set({ isSyncingLedger: false });
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),
  syncTransactionHistory: () => {
    set({ txHistory: midnightService.getTransactionHistory() });
  }
}));
