import { getCompiledContract, getLedger } from '../contract/src/index';

export interface WalletInfo {
  address: string;
  publicKey: string;
  balance: string; // in tDUST
  network: 'Midnight Testnet' | 'Midnight Devnet' | 'Simulated Ledger';
}

export interface TransactionInfo {
  txId: string;
  type: 'deploy' | 'post' | 'takeDown';
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  payload?: string;
}

class MidnightService {
  private isConnected: boolean = false;
  private walletInfo: WalletInfo | null = null;
  private txHistory: TransactionInfo[] = [];
  private onChainHash: string | null = null;
  private isSimulatedMode: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      // Load initial state if any
      const saved = localStorage.getItem('vaultzero_midnight_session');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.isConnected = parsed.isConnected;
          this.walletInfo = parsed.walletInfo;
          this.onChainHash = parsed.onChainHash || null;
          this.txHistory = parsed.txHistory || [];
        } catch (e) {
          console.error('Failed to parse saved session', e);
        }
      }
    }
  }

  private saveSession() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'vaultzero_midnight_session',
        JSON.stringify({
          isConnected: this.isConnected,
          walletInfo: this.walletInfo,
          onChainHash: this.onChainHash,
          txHistory: this.txHistory,
        })
      );
    }
  }

  async isWalletAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const w = window as any;
    return !!(w.midnight || w.oneAm || w.lace);
  }

  async connectWallet(forceSimulate: boolean = false): Promise<WalletInfo> {
    if (!forceSimulate && typeof window !== 'undefined') {
      const w = window as any;
      
      const injectedWalletKeys = Object.keys(w).filter(k => 
        /midnight|oneam|1am|lace|cardano|wallet/i.test(k)
      );
      console.log('[VaultZero] Wallet keys found on window:', injectedWalletKeys);
      console.log('[VaultZero] window.midnight:', w.midnight);
      console.log('[VaultZero] window.cardano:', w.cardano);
      console.log('[VaultZero] window.oneAm:', w.oneAm || w.oneam);

      // Search for active injected provider
      let provider: any = null;
      if (w.midnight) {
        // First check for 1am wallet or other sub-keys in window.midnight (e.g. window.midnight['1am'])
        const midnightKeys = Object.keys(w.midnight);
        for (const k of midnightKeys) {
          const item = w.midnight[k];
          if (item && (typeof item.connect === 'function' || typeof item.enable === 'function')) {
            provider = item;
            console.log(`[VaultZero] Found provider under window.midnight['${k}']`);
            break;
          }
        }
        if (!provider && (typeof w.midnight.connect === 'function' || typeof w.midnight.enable === 'function')) {
          provider = w.midnight;
        }
      } else if (w.cardano && w.cardano['1am']) {
        provider = w.cardano['1am'];
      } else if (w.oneAm) {
        provider = w.oneAm;
      }

      if (provider) {
        try {
          console.log('[VaultZero] Connecting to 1am / Midnight extension provider:', provider);
          const connectFn = provider.connect || provider.enable;
          const api = await connectFn.call(provider);
          console.log('[VaultZero] Connected API object:', api);
          
          let address = '';
          const target = api || provider;

          if (typeof target.getChangeAddress === 'function') {
            address = await target.getChangeAddress();
          } else if (typeof target.getAddresses === 'function') {
            const addrs = await target.getAddresses();
            address = Array.isArray(addrs) ? addrs[0] : addrs;
          } else if (typeof target.getAddress === 'function') {
            address = await target.getAddress();
          } else if (target.address) {
            address = target.address;
          } else if (typeof target.state?.address === 'string') {
            address = target.state.address;
          }

          let publicKey = '';
          if (typeof target.getPublicKey === 'function') {
            publicKey = await target.getPublicKey();
          }

          let formattedBalance = '0.00 tDUST';
          if (typeof target.getBalance === 'function') {
            const rawBalance = await target.getBalance();
            if (typeof rawBalance === 'number' || typeof rawBalance === 'string') {
              const num = Number(rawBalance);
              formattedBalance = isNaN(num) ? String(rawBalance) : (num / 1_000_000).toFixed(2) + ' tDUST';
            } else if (rawBalance && (rawBalance.dust || rawBalance.tDUST)) {
              const val = rawBalance.dust || rawBalance.tDUST;
              formattedBalance = (Number(val) / 1_000_000).toFixed(2) + ' tDUST';
            }
          }

          this.isSimulatedMode = false;
          this.isConnected = true;
          this.walletInfo = {
            address: address || '1am_Midnight_Wallet',
            publicKey: publicKey || '',
            balance: formattedBalance,
            network: 'Midnight Testnet',
          };
          this.saveSession();
          return this.walletInfo;
        } catch (err) {
          console.error('[VaultZero] Failed to connect to 1am wallet extension, falling back to simulation:', err);
        }
      } else {
        console.warn('[VaultZero] No active provider with connect/enable found.');
      }
    }

    // Simulated Ledger connection (default & fallback)
    this.isSimulatedMode = true;
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network latency

    this.isConnected = true;
    this.walletInfo = {
      address: 'nc1q2szu9j4yygqg4z3fepq4wpxsnvy2x549z3u9s2a49szm9qqq7ssp0xpq3x',
      publicKey: '04f46c646399f92e54148b3be5d1222485e92be9df7ff7a53cbbec2701df170e5b',
      balance: '1420.50',
      network: 'Simulated Ledger',
    };
    this.saveSession();
    return this.walletInfo;
  }

  async disconnectWallet(): Promise<void> {
    this.isConnected = false;
    this.walletInfo = null;
    this.onChainHash = null;
    this.txHistory = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vaultzero_midnight_session');
    }
  }

  getWalletInfo(): WalletInfo | null {
    return this.walletInfo;
  }

  isWalletConnected(): boolean {
    return this.isConnected;
  }

  async signMessage(message: string): Promise<string> {
    if (!this.isConnected || !this.walletInfo) {
      throw new Error('Wallet is not connected');
    }

    // Simulate ZK-proving signature latency (a signature in Midnight is a ZK-proof)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Generate a simulated signature (deterministic based on address + message)
    const dummySignature = `zk_sig_${Buffer.from(this.walletInfo.address + message).toString('hex').slice(0, 64)}`;
    return dummySignature;
  }

  /**
   * Logs a ZK transaction that anchors the Vault state hash on the Midnight ledger.
   * This calls the board.compact contract's "post" circuit in mock/real form.
   */
  async postVaultStateHash(hash: string): Promise<TransactionInfo> {
    if (!this.isConnected || !this.walletInfo) {
      throw new Error('Wallet is not connected');
    }

    const txId = 'tx_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newTx: TransactionInfo = {
      txId,
      type: 'post',
      status: 'pending',
      timestamp: Date.now(),
      payload: hash,
    };

    this.txHistory.unshift(newTx);
    this.saveSession();

    // In a real Midnight contract interaction:
    // 1. We load the compiled board contract using getCompiledContract()
    // 2. We compile circuit arguments and run a ZK-proof client-side
    // 3. We submit the proof and transaction to the ledger
    // Here we simulate the ZK proof generation and block confirmation:
    
    // Step 1: Prove (ZK proof generation) - ~1.5s
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Step 2: Submit & Mine - ~1s
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update TX status to success
    const txIndex = this.txHistory.findIndex((t) => t.txId === txId);
    if (txIndex !== -1) {
      this.txHistory[txIndex].status = 'success';
    }

    this.onChainHash = hash;
    
    // Deduct transaction fee (simulated tDUST)
    if (this.walletInfo && this.isSimulatedMode) {
      const currentBalance = parseFloat(this.walletInfo.balance);
      this.walletInfo.balance = (currentBalance - 0.15).toFixed(2); // 0.15 tDUST fee
    }

    this.saveSession();
    return this.txHistory[txIndex];
  }

  async getOnChainHash(): Promise<string | null> {
    return this.onChainHash;
  }

  getTransactionHistory(): TransactionInfo[] {
    return this.txHistory;
  }

  async clearTransactionHistory(): Promise<void> {
    this.txHistory = [];
    this.saveSession();
  }
}

// Export a singleton instance
export const midnightService = new MidnightService();
