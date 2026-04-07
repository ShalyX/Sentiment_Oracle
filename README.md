# 🔮 From Zero to GenLayer: Build an AI Sentiment Oracle
A step-by-step tutorial showing you how to build a full-stack decentralised application on GenLayer — the world's first blockchain with native AI capabilities.

By the end of this tutorial, you will have deployed a Sentiment Oracle — an intelligent contract that uses multiple AI validators to reach consensus on the emotional sentiment of any text, with a live frontend anyone can use.

Sentiment Oracle DApp

## 🧠 What You'll Learn
- What makes GenLayer different from traditional blockchains
- How Optimistic Democracy achieves consensus with AI
- How the Equivalence Principle enables non-deterministic computation on-chain
- How to write a Python Intelligent Contract using the genlayer SDK
- How to build a frontend that talks to your contract using genlayer-js
- How to deploy your frontend to Vercel for the world to use

## 📖 Table of Contents
1. Understanding GenLayer — The Big Picture
2. The Equivalence Principle — GenLayer's Secret Weapon
3. Setting Up Your Environment
4. Writing the Intelligent Contract
5. Deploying the Contract in GenLayer Studio
6. Building the Frontend
7. Running Locally
8. Deploying to Vercel
9. How It All Works Together

## Part 1: Understanding GenLayer
Traditional smart contracts (Ethereum, Solana, etc.) have one hard rule: every node must produce the exact same output for the exact same input. This works perfectly for arithmetic — 2 + 2 is always 4. But it completely blocks any real-world intelligence: you cannot call an API, you cannot run an LLM, you cannot resolve a subjective question.

GenLayer breaks this constraint by introducing a new consensus mechanism called Optimistic Democracy.

### How Optimistic Democracy Works
Instead of a single node computing a result, GenLayer selects a committee of AI-powered validators. Each validator:
1. Independently runs the same intelligent contract
2. Makes its own AI-powered decision (e.g. calling an LLM)
3. Submits its result to the network

The network then uses the Equivalence Principle to decide if the results are "close enough" to agree upon, without requiring byte-for-byte equality.

```text
User submits tx
      │
      ▼
┌─────────────────────────────────────────────────┐
│              GenLayer Validator Network          │
│                                                 │
│  Validator A 🤖  Validator B 🤖  Validator C 🤖 │
│  "NEGATIVE"      "NEGATIVE"      "NEGATIVE"     │
│                                                 │
│          ✅ Equivalence check passed!           │
│          → Result committed to chain            │
└─────────────────────────────────────────────────┘
```

This is why GenLayer can run LLMs, call web APIs, and resolve subjective questions — all on-chain, with trustless consensus.

## Part 2: The Equivalence Principle
The Equivalence Principle is the core innovation that makes non-deterministic computation trustworthy.

In a traditional contract, validators check: `result_A === result_B` (exact byte equality).

In GenLayer, validators check: `is_equivalent(result_A, result_B)` — a flexible, developer-defined rule.

There are two main modes:

| Mode | How it works | When to use |
| :--- | :--- | :--- |
| `gl.eq_principle.strict_eq` | Validators must agree on the semantic meaning, not just bytes. A deterministic check verifies equivalence. | Categorical outputs like sentiment labels |
| `gl.eq_principle.get_principle` | You write custom Python logic to define what "equivalent" means | Complex custom rules |

In our Sentiment Oracle, we use `strict_eq` so that validators must agree the sentiment label is the same (e.g. all say NEGATIVE) before the result is committed to the chain.

## Part 3: Setting Up Your Environment
### Prerequisites
- MetaMask browser extension — [install here](https://metamask.io/)
- A GenLayer Studio account — [sign up here](https://studio.genlayer.com/)
- Basic knowledge of Python and JavaScript (no blockchain experience needed!)

### Add GenLayer Studionet to MetaMask
You'll need to add the Studionet network manually. In MetaMask, go to Settings → Networks → Add Network and fill in:

| Field | Value |
| :--- | :--- |
| Network Name | GenLayer Studionet |
| RPC URL | https://studio.genlayer.com/api |
| Chain ID | 61999 |
| Currency Symbol | GEN |
| Block Explorer | https://studio.genlayer.com |

**Tip:** Your DApp frontend will do this automatically via MetaMask's `wallet_addEthereumChain` RPC call — but it's good to know the values.

### Get Testnet GEN Tokens
In GenLayer Studio, connect your wallet and use the built-in faucet to get free GEN tokens for deploying and calling contracts.

## Part 4: Writing the Intelligent Contract
Create a file called `SentimentOracle.py`. This is your Intelligent Contract — written in Python, deployed on GenLayer.

```python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class SentimentOracle(gl.Contract):
    # Persistent on-chain storage: maps text → sentiment label
    results: TreeMap[str, str]

    def __init__(self):
        self.results = TreeMap[str, str]()

    def _perform_sentiment_analysis(self, text: str) -> str:
        """
        ⚠️ Non-deterministic: this calls an LLM.
        Each validator runs this independently.
        """
        prompt = f"""
        Analyze the sentiment of this text: 
        '{text}'
        
        Respond with exactly ONE of these words: POSITIVE, NEGATIVE, or NEUTRAL.
        """
        return gl.nondet.exec_prompt(prompt)

    @gl.public.write
    def analyze_text(self, text: str):
        """
        Write method — costs GEN gas, modifies state.
        Validators reach consensus using the Equivalence Principle.
        """
        # gl.eq_principle.strict_eq wraps the non-deterministic call.
        # Validators must semantically agree before the result is stored.
        sentiment = gl.eq_principle.strict_eq(
            lambda: self._perform_sentiment_analysis(text)
        )
        self.results[text] = sentiment

    @gl.public.view
    def get_sentiment(self, text: str) -> str:
        """
        View method — free to call, reads from state only.
        """
        if text in self.results:
            return self.results[text]
        return "NOT_FOUND"

    @gl.public.view
    def get_all_results(self) -> dict[str, str]:
        """Returns all analyzed texts and their consensus sentiments."""
        return dict(self.results)
```

### Key Concepts in This Contract
- `gl.Contract` — All intelligent contracts inherit from this base class. It handles serialisation/deserialisation of your on-chain state automatically.
- `TreeMap[str, str]` — GenLayer's persistent key-value store. Think of it as a Python dict that lives on-chain between transactions.
- `gl.nondet.exec_prompt(prompt)` — This is the magic. It sends your prompt to an LLM. Each validator runs this independently, so results may differ — that's expected and handled by the Equivalence Principle.
- `gl.eq_principle.strict_eq(lambda: ...)` — Wraps any non-deterministic call. Validators compare their outputs semantically. Only if they agree does the transaction succeed and state get written.
- `@gl.public.write` — Marks a method as a state-modifying transaction. Callers pay GEN gas.
- `@gl.public.view` — Marks a method as read-only. Callers pay nothing.

## Part 5: Deploying the Contract
1. Go to [studio.genlayer.com](https://studio.genlayer.com/) and log in
2. Click **New Contract** or open the code editor
3. Paste your `SentimentOracle.py` code
4. Click **Deploy** and confirm the MetaMask transaction
5. **Copy your contract address** — you'll need it in the next step!

Your contract is now live on Studionet. Every call to `analyze_text` will trigger the full Optimistic Democracy consensus process across the validator network.

## Part 6: Building the Frontend
Unlike a basic HTML/JS setup, our Sentiment Oracle uses a modern, production-ready stack built on **Next.js 15**. This provides server-side rendering, type safety with TypeScript, and a highly polished UI using Tailwind CSS 4.0.

### Project Structure
The frontend is located in the `/frontend` directory:
```text
frontend/
├── app/                # Next.js App Router (Pages & Layouts)
│   ├── layout.tsx      # Root layout & Google Fonts
│   ├── page.tsx        # Main dashboard UI
│   └── providers.tsx   # React Query & Wallet providers
├── components/         # Reusable UI components (AnalyzeForm, ResultsList)
├── lib/
│   ├── hooks/          # Custom React hooks (useSentimentOracle)
│   ├── contracts/      # TypeScript wrapper for the Intelligent Contract
│   └── genlayer/       # Wallet & Connection logic
├── public/             # Static assets
└── tailwind.config.ts  # Modern styling configuration
```

### 🧠 Core Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4.0 with Modern Liquid Aesthetics
- **State Management**: TanStack Query (React Query) for real-time contract synchronization
- **Integration**: `genlayer-js` SDK for interacting with the blockchain

### Custom Hooks: `useSentimentOracle`
We don't call the contract directly from the UI. Instead, we use custom hooks that handle the GenLayer client initialization, transaction submission, and polling for results.

```typescript
export function useAnalyzeText() {
  const { client, address } = useWallet();
  const contract = useMemo(() => new SentimentOracle(CONTRACT_ADDRESS, address), [address]);

  return useMutation({
    mutationFn: async (text: string) => {
      const receipt = await contract.analyzeText(text);
      return receipt;
    },
    // ... refresh logic
  });
}
```

### UI Components
The UI is divided into focused components:
- **AnalyzeForm**: Handles text input and triggers the `analyze_text` write method.
- **ResultsList**: Fetches and displays all previous analysis results using the `get_all_results` view method.
- **StatsLeaderboard**: Summarizes the sentiment metrics across the network.

## Part 7: Running Locally
Since this is a Next.js application, you'll need Node.js installed.

```shell
cd frontend
npm install
npm run dev
```
Then open `http://localhost:3000` in your browser.

## Part 8: Deploying to Vercel
Deploying to Vercel is highly recommended for Next.js projects.

1. Push your code to GitHub.
2. Import the project into the [Vercel Dashboard](https://vercel.com/new).
3. Set your environment variables (from `.env.example`) in the Vercel project settings:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`: Your deployed contract address.
   - `NEXT_PUBLIC_GENLAYER_RPC_URL`: `https://studio.genlayer.com/api`
4. Click **Deploy**.

## How It All Works Together
```text
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                           │
│                                                                 │
│  index.html + style.css + main.js (ES Module)                  │
│       │                                                         │
│       │  import { createClient } from 'genlayer-js'            │
│       │  client.writeContract({ functionName: "analyze_text" })│
└───────┼─────────────────────────────────────────────────────────┘
        │  JSON-RPC over HTTPS
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GenLayer Studionet RPC                        │
│                 https://studio.genlayer.com/api                 │
└───────┬─────────────────────────────────────────────────────────┘
        │
        ▼  Optimistic Democracy begins
┌───────────────────────────────────────────────┐
│           AI Validator Network                 │
│                                               │
│  🤖 Validator 1          🤖 Validator 2       │
│  runs SentimentOracle.py  runs SentimentOracle.py │
│  calls LLM → "NEGATIVE"  calls LLM → "NEGATIVE"  │
│                                               │
│  Equivalence Principle check: ✅ AGREE        │
│  → Result written to on-chain TreeMap         │
└───────────────────────────────────────────────┘
        │
        ▼  client.readContract({ functionName: "get_sentiment" })
┌─────────────────────────────────────────────────┐
│  Frontend displays: NEGATIVE ✅                 │
└─────────────────────────────────────────────────┘
```

## 🚀 What to Build Next
You've just scratched the surface of what GenLayer enables. Here are some ideas using the same patterns you've learned:

| Project | What it does |
| :--- | :--- |
| P2P Betting Oracle | Two friends bet on an outcome; GenLayer resolves it by checking a website |
| Dispute Resolution Module | A trustless arbitrator that reads both parties' claims and rules fairly |
| On-Chain Content Moderator | Flag submitted content as safe/unsafe via LLM consensus |
| Performance Reviewer | Rate the quality of completed freelance work automatically |
| Real-World Event Oracle | Settle prediction markets by verifying real-world events on-chain |

All of these use the same building blocks you've just mastered:
- `gl.nondet.exec_prompt()` for AI reasoning
- `gl.eq_principle` for trustless consensus
- `client.writeContract` / `client.readContract` for frontend interaction

## 📚 Resources
- [GenLayer Documentation](https://docs.genlayer.com/)
- [GenLayer Studio](https://studio.genlayer.com/)
- [genlayer-js SDK on npm](https://www.npmjs.com/package/genlayer-js)
- [GenLayer GitHub](https://github.com/genlayerlabs)
- [GenLayer Discord](https://discord.gg/8Jm4v89VAu)

## Part 9: Pushing to GitHub
Now that your project is ready, let's share it with the world by pushing it to GitHub.

### 1. Initialize Git
Open your terminal in the root of your project and run:
```bash
git init
git add .
git commit -m "Initial commit: Sentiment Oracle DApp"
```

### 2. Create a Remote Repository
1. Go to [github.com/new](https://github.com/new) and create a new repository.
2. **Do not** initialize with a README, license, or gitignore (we already have those).
3. Copy the repository URL (e.g. `https://github.com/your-username/your-repo-name.git`).

### 3. Link and Push
```bash
git remote add origin YOUR_REPOSITORY_URL
git branch -M main
git push -u origin main
```

Built with ❤️ as part of the GenLayer "From Zero to GenLayer" tutorial mission.
