# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
pnpm dev          # Start Next.js development server at http://localhost:3000
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Testing Swap Integration
```bash
pnpm test:swap                                # Test swap with default address
pnpm test:swap <address> <amount> <slippage>  # Test swap with custom params
pnpm test:swap:passkey                        # Test swap using passkey authentication
```

## Architecture Overview

### Core Technology
- **Next.js 16** with App Router and React 19
- **Sui Network** blockchain integration (mainnet/testnet)
- **Passkey Authentication** via WebAuthn for passwordless login
- **TypeScript** with strict mode enabled

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (protect)/         # Protected routes (dashboard, swap, lending)
│   ├── login/             # Public authentication routes
│   └── register/
├── features/              # Feature modules (auth, wallet, swap, lending, dashboard)
├── integrations/          # External service integrations (sui, dex, lending)
├── shared/                # Shared UI components, hooks, utilities
├── config/                # Application configuration (defi-pools.ts)
└── types/                 # Global TypeScript definitions
```

### Path Aliases
- `@/features/*` → `src/features/*`
- `@/shared/*` → `src/shared/*`
- `@/integrations/*` → `src/integrations/*`
- `@/config/*` → `src/config/*`
- `@/*` → `src/*`

## Key Architectural Patterns

### Feature-Based Organization
Each feature module (`src/features/`) is self-contained with its own:
- `components/` - Feature-specific UI components
- `hooks/` - Feature-specific React hooks
- `types.ts` - Feature-specific TypeScript types
- `index.ts` - Public API exports

Features include: `auth`, `wallet`, `swap`, `lending`, `dashboard`

### Passkey Authentication Flow
The app uses WebAuthn passkeys instead of traditional passwords:

1. **Registration** (`src/integrations/sui/passkey.ts:createPasskeyWallet`):
   - Creates a `PasskeyKeypair` using WebAuthn
   - Caches keypair in memory and stores public key in localStorage
   - Public keys are NOT secret per WebAuthn standards

2. **Recovery** (`src/integrations/sui/passkey.ts:recoverPasskeyWallet`):
   - First tries in-memory cache
   - Then tries stored public key with single signature
   - Falls back to double-signature recovery if needed
   - Uses `signAndRecover` to derive public key from signatures

3. **Caching Strategy**:
   - In-memory cache (`keypair-cache.ts`) for active session
   - sessionStorage for wallet info (cleared on logout)
   - localStorage for public key persistence (survives page reload)

### Sui Network Integration

**Client Initialization** (`src/integrations/sui/client.ts`):
- Uses `NEXT_PUBLIC_SUI_NETWORK` env var (defaults to "testnet")
- Single `SuiClient` instance via `getSuiClient()`
- Balance queries convert MIST to SUI (1 SUI = 1_000_000_000 MIST)

**Transaction Signing** (`src/integrations/sui/signing.ts`):
- Uses cached `PasskeyKeypair` from memory
- Signs transaction bytes and returns signature for broadcast

### DEX Swap Aggregation

**Multi-DEX Quote System** (`src/integrations/dex/suilend/`):
The swap system aggregates quotes from three DEXs:
- **Aftermath** - Initialized async with `await aftermathSdk.init()`
- **Cetus** - Uses `@cetusprotocol/aggregator-sdk`
- **FlowX** - Uses `@flowx-finance/sdk`

**Quote Fetching** (`quote.ts:getSwapQuotes`):
1. Initializes all three DEX SDKs (cached after first call)
2. Calls `getAggSortedQuotesAll` from `@suilend/sdk` with all providers
3. If any provider fails (e.g., timeout), retries with fallback providers (Cetus + FlowX)
4. Filters quotes to only include valid ones with `amountOut > 0`
5. Returns sorted quotes (best rate first)

**Amount Extraction** (`quote.ts:extractRawAmountOut`):
Different DEXs return amounts in different formats:
- Aftermath: `quote.coinOut.amount` (bigint)
- FlowX: `quote.rawQuote.amountOut` (string/number)
- Cetus: `quote.amountOut` (BN object with `.toNumber()`)

**Transaction Building** (`transaction.ts`):
1. Gets best quote from sorted quotes
2. Creates transaction using provider-specific builder (cetus, aftermath, flowx)
3. Each builder in `builders/` creates the appropriate transaction structure
4. Returns transaction + quote details + slippage info

### Lending Integration

**Scallop Protocol** (`src/integrations/lending/scallop/`):
- Single SDK instance cached in `sdk.ts:getScallopSdk()`
- Initializes with `await scallopInstance.init()` before use
- Always uses mainnet (`networkType: 'mainnet'`)
- Supply/withdraw operations in respective files

### Protected Routes

The `(protect)` route group (`src/app/(protect)/layout.tsx`):
- Wraps all authenticated pages (dashboard, swap, lending)
- Uses `<ProtectedRoute>` component to check authentication
- Shows `DashboardSidebar` + `TopBar` layout
- Retrieves user email from cached wallet info

### Context Providers

**App-Level Contexts** (`src/shared/contexts/`):
- `AppProvider` - Top-level provider wrapping app
- `NetworkProvider` - Manages Sui network state (mainnet/testnet)
- `ToastContainer` - Global toast notifications
- `Agentation` - Development tools (only in dev mode)

## Important Implementation Notes

### Token Amounts
- SUI uses 9 decimals (1 SUI = 1e9 MIST)
- USDC uses 6 decimals (1 USDC = 1e6 base units)
- Always convert display amounts to base units before transactions
- Quote amounts are in base units, divide by token decimals for display

### Network Configuration
- Default network is "testnet" unless `NEXT_PUBLIC_SUI_NETWORK` is set
- Both DEX integration (`suilend`) and lending (`scallop`) use hardcoded "mainnet"
- Explorer URLs use `suiscan.xyz` for all networks

### Passkey Environment Variables
- `NEXT_PUBLIC_RP_NAME` - Relying Party name (default: "Passkey Sui Wallet")
- `NEXT_PUBLIC_RP_ID` - Relying Party ID (default: "localhost")
- These should match between registration and recovery

### Swap Testing
The test scripts demonstrate integration usage:
- `scripts/test-swap.ts` - Tests swap without authentication (uses dummy address)
- `scripts/test-swap-passkey.ts` - Full passkey flow with real signing

## Development Patterns

### Adding New DEX Provider
1. Add provider enum to `@suilend/sdk` types
2. Create builder in `src/integrations/dex/suilend/builders/<provider>.ts`
3. Update `quote.ts:initializeDexSdks` to include new SDK
4. Add to `activeProviders` array in `getSwapQuotes`

### Adding New Feature
1. Create directory in `src/features/<feature-name>/`
2. Add subdirectories: `components/`, `hooks/`, (optional: `types.ts`)
3. Export public API via `index.ts`
4. Update `src/features/index.ts` to re-export

### Working with Sui Transactions
1. Get user address from wallet context
2. Build transaction using appropriate integration
3. Get cached keypair via `getCachedKeypairFromMemory()`
4. Sign transaction bytes with keypair
5. Broadcast signed transaction to network
