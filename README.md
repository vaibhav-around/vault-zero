# 🛡️ VaultZero — Decentralized Zero-Knowledge Password Manager

> **Built for the Midnight Network Hackathon**  
> _Own your passwords with client-side AES-GCM-256 encryption and Midnight Zero-Knowledge proof state anchoring._

---

## 🌟 Overview

**VaultZero** is a next-generation, privacy-first password manager leveraging the **Midnight Blockchain** and **Compact Smart Contracts**.

Unlike legacy password managers that rely on centralized cloud storage (vulnerable to data breaches), VaultZero guarantees that **your master credentials never leave your browser unencrypted**. By combining local **AES-GCM-256** encryption with **Wallet-derived signatures** and **Midnight Zero-Knowledge (ZK)** on-chain state hash anchoring, VaultZero provides client-side zero-leakage privacy and tamper-evident vault integrity.

---

## ✨ Key Features

- **🔐 Wallet-Derived Cryptographic Master Key**: Encryption keys are generated on-the-fly from cryptographic signatures requested through your Midnight wallet (PBKDF2 + SHA-256, 100,000 iterations). Master keys exist only in temporary React state memory and are wiped when locked.
- **🛡️ Client-Side AES-GCM 256-bit Encryption**: All credential records (websites, usernames, passwords, notes) are encrypted inside your browser before saving to local storage.
- **⛓️ Midnight ZK State Anchoring**: State modifications (add, update, delete) compute SHA-256 ciphertext hashes and commit them to the Midnight ledger via Compact ZK contract circuits (`contract/src/board.compact`).
- **💼 Dual Wallet Mode (Live + Simulated)**:
  - **1am Wallet Extension**: Direct connection to native Midnight browser extensions (`window.midnight['1am']`).
  - **Simulated Ledger Mode**: Built-in interactive sandbox allowing auditors and judges to instantly test full ZK flows without requiring testnet faucet tokens or extension setup.
- **⚡ Full Vault Management**: Password generator, category filters (Personal, Work, Finance, Social), favorite bookmarks, vault export/import, and activity audit logging.

---

## 🏗️ Architecture & Technology Stack

| Layer                    | Technology                                                                   |
| :----------------------- | :--------------------------------------------------------------------------- |
| **Frontend Framework**   | Next.js 16 (App Router), React 19, TypeScript                                |
| **Styling & Motion**     | Tailwind CSS v4, Framer Motion, Lucide Icons                                 |
| **State Management**     | Zustand                                                                      |
| **Blockchain / Privacy** | Midnight Network (`@midnight-ntwrk/compact-js`, `@midnight-ntwrk/ledger-v8`) |
| **Smart Contract**       | Compact Language (`contract/src/board.compact`)                              |
| **Cryptography**         | Web Crypto API (AES-GCM-256, PBKDF2), SHA-256                                |

---

## 📐 Architecture Diagram

```
                 User Browser
                      │
                      ▼
            Connect Midnight Wallet
                      │
                      ▼
          Sign Challenge Request
                      │
                      ▼
      Derive AES-256 Key (PBKDF2 100k)
                      │
                      ▼
          Encrypt Vault (AES-GCM-256)
                      │
                      ▼
            Generate SHA-256 Hash
             │                  │
             ▼                  ▼
     Encrypted Vault     Midnight ZK Contract
     (Local Storage)    (Integrity Anchor)
```

## 🚀 Quick Start Guide for Auditors & Judges

Follow these simple steps to run VaultZero locally on your machine.

### Prerequisites

- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **Docker** _(Optional, if running local Midnight ZK Proof Server)_
- **1am Wallet** Chrome Extension _(Optional, for live testnet testing)_

---

### Step 1: Clone & Install Dependencies

```bash
git clone https://github.com/vaibhav-around/vault-zero.git
cd password-manager
npm install
```

---

### Step 2: (Optional) Run Midnight ZK Proof Server via Docker

For full local ZK prover generation when interacting with local testnet nodes, you can start the official Midnight Proof Server container on port `6300`:

```bash
docker run -p 6300:6300 midnightntwrk/proof-server:3.0.0
```

> _Note: If Docker or the proof server is not running, VaultZero automatically uses browser-based ZK proving and simulated fallback mode so auditors can evaluate the application seamlessly._

---

### Step 3: Launch Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Step 4: Auditor Testing Instructions

#### Option A: Instant Evaluation (Simulated Mode - Recommended for Quick Review)

1. On the landing page, click **Connect Midnight Wallet**.
2. Click **Unlock Vault** — the app will simulate ZK signature proof generation and grant access to the vault dashboard.
3. Test adding a credential, editing, or generating passwords.
4. Observe the **Midnight Ledger Activity Log** updating with live simulated ZK transaction proofs.

#### Option B: Live 1am Wallet Testing (Testnet Review)

1. Ensure your **1am Wallet** browser extension is unlocked.
2. Ensure extension permissions allow access to `http://localhost:3000` (click puzzle icon 🧩 -> 1am Wallet -> _This Can Read and Change Site Data_ -> _On All Sites_).
3. Click **Connect Midnight Wallet** on VaultZero.
4. Approve the connection popup in your 1am Wallet extension.
5. Your real Midnight testnet address (`nc1q...`) and tDUST balance will load into the application!

---

## 📄 Compact Smart Contract (`board.compact`)

The underlying Midnight Compact contract manages state proofs on the ledger:

```compact
pragma language_version >= 0.22;

import CompactStandardLibrary;

export enum State { VACANT, OCCUPIED }

export ledger state: State;
export ledger message: Maybe<Opaque<"string">>;
export ledger sequence: Counter;
export ledger owner: Bytes<32>;

witness localSecretKey(): Bytes<32>;

// ZK Circuit: Anchor encrypted vault hash
export circuit post(newMessage: Opaque<"string">): [] {
  assert(state == State.VACANT, "Board is occupied");
  const currentSeq = sequence as Field as Bytes<32>;
  owner = disclose(publicKey(localSecretKey(), currentSeq));
  message = disclose(some<Opaque<"string">>(newMessage));
  state = State.OCCUPIED;
}

// ZK Circuit: Verify owner secret key & reset state
export circuit takeDown(): Opaque<"string"> {
  assert(state == State.OCCUPIED, "Board is already vacant");
  const currentSeq = sequence as Field as Bytes<32>;
  assert(owner == publicKey(localSecretKey(), currentSeq), "Not the owner");
  state = State.VACANT;
  sequence.increment(1);
  message = none<Opaque<"string">>();
  return message.value;
}
```

---

## 🔮 Future Roadmap & Updates

- [ ] **Multi-Device State Sync via Indexers**: Enable seamless multi-device vault synchronization using Midnight indexer query services.
- [ ] **Organization & Team Vault Sharing**: Utilize Midnight private circuits to share encrypted credentials across teams without exposing underlying private keys.
- [ ] **Biometric WebAuthn Integration**: Support hardware security keys (YubiKey / TouchID / FaceID) as entropy sources for ZK key derivation.
- [ ] **Mobile Companion Application**: React Native mobile app with offline vault storage and native biometrics.
- [ ] **Automated Compromised Password Auditing**: Zero-Knowledge query service against HaveIBeenPwned database without revealing password hashes.

---

## 📜 License & Hackathon Submission

Created for the **Midnight Network Hackathon**.  
Designed & Developed by Vaibhav. Distributed under the MIT License.
