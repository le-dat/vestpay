# VestPay Refactoring Plan: Feature-First Architecture

## Executive Summary

Transform VestPay from a library-centric organization to a **feature-first, domain-driven architecture** optimized for scalability, maintainability, and developer experience. This refactoring will improve code organization, reduce circular dependencies, and establish clear patterns for adding new DeFi features.

---

## Current Structure Assessment

### Existing Organization

```
vestpay/
├── app/                    # Next.js App Router
├── components/             # Feature-based components (auth, swap, defi, wallet, ui, common)
├── lib/                    # Mixed: blockchain, SDKs, hooks, contexts, utils, types
├── public/
└── scripts/
```

### Key Issues

1. ❌ Mixed feature-specific hooks in `components/*/hooks/` vs `lib/hooks/`
2. ❌ Scattered type definitions across `lib/types/` and SDK-specific files
3. ❌ Constants split between `lib/constants/` and SDK directories
4. ❌ UI components split between `components/ui/` and `components/common/`
5. ❌ Deep nesting in `lib/suilend/core/builders/`
6. ❌ No clear pattern for SDK integration organization

---

## Proposed Architecture

### New Directory Structure

```
vestpay/
├── src/                          # All source code under src/
│   ├── app/                      # Next.js App Router (minimal changes)
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/          # Renamed from (protect)
│   │   │   ├── dashboard/
│   │   │   ├── swap/
│   │   │   ├── lending/
│   │   │   └── layout.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── features/                 # ⭐ FEATURE-FIRST ORGANIZATION
│   │   │
│   │   ├── auth/                 # Authentication feature
│   │   │   ├── components/
│   │   │   │   ├── LoginSidebar.tsx
│   │   │   │   ├── RegisterSidebar.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   └── FloatingDots.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   └── index.ts          # Public API exports
│   │   │
│   │   ├── wallet/               # Wallet management feature
│   │   │   ├── components/
│   │   │   │   ├── NetworkCard.tsx
│   │   │   │   ├── TokenList.tsx
│   │   │   │   ├── TransactionHistory.tsx
│   │   │   │   ├── DepositModal.tsx
│   │   │   │   ├── SendModal.tsx
│   │   │   │   ├── NetworkSwitcher.tsx
│   │   │   │   ├── FaucetButton.tsx
│   │   │   │   ├── TokenInfo.tsx
│   │   │   │   └── CoinIcon.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useWallet.ts
│   │   │   │   ├── useBalance.ts
│   │   │   │   └── useTransactions.ts
│   │   │   ├── types/
│   │   │   │   └── wallet.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── swap/                 # Token swap feature
│   │   │   ├── components/
│   │   │   │   ├── SwapInterface.tsx
│   │   │   │   ├── TokenInput.tsx
│   │   │   │   ├── TokenInputCard.tsx
│   │   │   │   ├── TokenSelector.tsx
│   │   │   │   ├── DexQuoteList.tsx
│   │   │   │   ├── QuotesSection.tsx
│   │   │   │   ├── ExchangeRate.tsx
│   │   │   │   ├── SwapButton.tsx
│   │   │   │   ├── SwapModeToggle.tsx
│   │   │   │   ├── SwapActionButtons.tsx
│   │   │   │   └── ExecuteSwapButton.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useSwapQuotes.ts
│   │   │   │   ├── useSwapExecution.ts
│   │   │   │   └── useTokenSelection.ts
│   │   │   ├── lib/              # Feature-specific business logic
│   │   │   │   ├── swap-builder.ts
│   │   │   │   ├── quote-aggregator.ts
│   │   │   │   └── swap-executor.ts
│   │   │   ├── types/
│   │   │   │   └── swap.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── lending/              # DeFi lending feature
│   │   │   ├── components/
│   │   │   │   ├── LendingTabContent.tsx
│   │   │   │   ├── LendingPoolTable.tsx
│   │   │   │   ├── LendingModal.tsx
│   │   │   │   ├── SupplyModal.tsx
│   │   │   │   ├── WithdrawModal.tsx
│   │   │   │   └── LoadingSkeleton.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useLendingTransaction.ts
│   │   │   │   ├── useModalState.ts
│   │   │   │   └── useScallopMarket.ts
│   │   │   ├── types/
│   │   │   │   └── lending.types.ts
│   │   │   └── index.ts
│   │   │
│   │   └── dashboard/            # Dashboard overview feature
│   │       ├── components/
│   │       │   ├── BalanceCard.tsx
│   │       │   ├── ActivityTable.tsx
│   │       │   └── TransactionRow.tsx
│   │       └── index.ts
│   │
│   ├── shared/                   # ⭐ SHARED/REUSABLE CODE
│   │   │
│   │   ├── components/
│   │   │   ├── ui/               # Generic UI primitives
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── layout/           # Layout components
│   │   │   │   ├── DashboardSidebar.tsx
│   │   │   │   ├── TopBar.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── feedback/         # User feedback
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── branding/
│   │   │       ├── Logo.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── hooks/                # Generic reusable hooks
│   │   │   ├── useRefresh.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── contexts/             # Global React contexts
│   │   │   ├── NetworkContext.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/                # Pure utility functions
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   ├── routes.ts
│   │   │   └── index.ts
│   │   │
│   │   └── constants/            # Global constants
│   │       ├── networks.ts
│   │       ├── routes.ts
│   │       └── index.ts
│   │
│   ├── integrations/             # ⭐ THIRD-PARTY SDK INTEGRATIONS
│   │   │
│   │   ├── sui/                  # Sui blockchain core
│   │   │   ├── client.ts
│   │   │   ├── passkey.ts
│   │   │   ├── signing.ts
│   │   │   ├── transactions.ts
│   │   │   ├── keypair-cache.ts
│   │   │   ├── balance.ts
│   │   │   ├── history.ts
│   │   │   ├── utils.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── dex/                  # DEX aggregation & protocols
│   │   │   ├── suilend/
│   │   │   │   ├── sdk.ts
│   │   │   │   ├── swap.ts
│   │   │   │   ├── execute.ts
│   │   │   │   ├── quote.ts
│   │   │   │   ├── transaction.ts
│   │   │   │   ├── signing.ts
│   │   │   │   ├── validators.ts
│   │   │   │   ├── helpers.ts
│   │   │   │   ├── constants.ts
│   │   │   │   ├── types.ts
│   │   │   │   ├── tokens/
│   │   │   │   │   ├── service.ts
│   │   │   │   │   ├── types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── builders/
│   │   │   │   │   ├── cetus.ts
│   │   │   │   │   ├── aftermath.ts
│   │   │   │   │   ├── flowx.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── lending/              # Lending protocols
│   │   │   ├── scallop/
│   │   │   │   ├── sdk.ts
│   │   │   │   ├── supply.ts
│   │   │   │   ├── withdraw.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── config/                   # ⭐ CONFIGURATION FILES
│   │   ├── defi-pools.ts         # DeFi pool configurations
│   │   ├── tokens.ts             # Token configurations
│   │   └── env.ts                # Environment variable handling
│   │
│   └── types/                    # ⭐ GLOBAL TYPE DEFINITIONS
│       ├── global.d.ts
│       └── index.ts
│
├── public/                       # Static assets
├── scripts/                      # Utility scripts
└── [config files]                # Root config files
```

---

## Key Architectural Principles

### 1. Feature-First Organization (`features/`)

**Structure Pattern:**

```
features/{feature-name}/
  ├── components/       # Feature-specific UI components
  ├── hooks/           # Feature-specific React hooks
  ├── lib/             # Feature-specific business logic (optional)
  ├── types/           # Feature-specific TypeScript types
  └── index.ts         # Public API barrel exports
```

**Benefits:**

- ✅ All related code grouped by business domain
- ✅ Improves developer experience (find everything in one place)
- ✅ Natural code splitting boundaries
- ✅ Clear ownership and responsibilities
- ✅ Easy to add features without affecting others
- ✅ Reduces circular dependencies

**Example Import:**

```typescript
// From other features or app pages
import { SwapInterface, useSwapQuotes } from "@/features/swap";
```

---

### 2. Integration-Focused SDK Layer (`integrations/`)

**Purpose:** Isolate third-party SDK integrations from business logic

**Organization:**

- `sui/` - Core Sui blockchain operations
- `dex/` - DEX protocols (Suilend with Cetus, Aftermath, FlowX builders)
- `lending/` - Lending protocols (Scallop, Suilend)

**Benefits:**

- ✅ SDK upgrades contained to integration layer
- ✅ Clear boundary between external dependencies and app code
- ✅ Each integration self-contained with types/constants/utilities
- ✅ Easy to mock/test integrations

**Example:**

```typescript
// Integration layer provides clean API
import { buildSwap, getSwapQuotes } from "@/integrations/dex/suilend";
import { supplyToScallop } from "@/integrations/lending/scallop";
```

---

### 3. Shared Resources (`shared/`)

**Purpose:** Truly reusable code used across multiple features

**Sub-organization:**

- `components/ui/` - Generic UI primitives (Modal, Button, Card)
- `components/layout/` - Layout components (Sidebar, TopBar)
- `components/feedback/` - User feedback (Toast, Loading)
- `hooks/` - Generic hooks (useRefresh, useDebounce)
- `contexts/` - Global state (NetworkContext)
- `utils/` - Pure utility functions
- `constants/` - Global constants

**Rules:**

- Only include code used by **3+ features**
- Avoid feature-specific logic
- Keep components generic and composable

---

### 4. Type Organization Strategy

**Three-tier approach:**

1. **Global types** (`src/types/`)
   - Shared across 3+ features
   - Core domain types

2. **Feature types** (`features/{feature}/types/`)
   - Feature-specific interfaces
   - Co-located with usage

3. **Integration types** (`integrations/{integration}/types.ts`)
   - SDK-specific types
   - Protocol interfaces

**Convention:**

- Use `.types.ts` suffix for type-only files
- Start with feature-local, elevate when needed
- Avoid circular dependencies

---

### 5. Hook Placement Rules

**Decision Tree:**

1. **Feature-specific logic?** → `features/{feature}/hooks/`
   - Example: `useSwapQuotes` → `features/swap/hooks/`
   - Example: `useLendingTransaction` → `features/lending/hooks/`

2. **Generic/reusable utility?** → `shared/hooks/`
   - Example: `useRefresh`, `useDebounce`, `useLocalStorage`

3. **SDK-specific wrapper?** → `integrations/{integration}/`
   - Example: Integration-specific hooks can stay with SDK

---

### 6. Constants Organization

**Three-tier approach:**

1. **Global constants** → `shared/constants/`
   - Routes, network configs, app-wide settings

2. **Feature constants** → `features/{feature}/constants.ts`
   - Feature-specific configurations
   - Validation rules, default values

3. **Integration constants** → `integrations/{integration}/constants.ts`
   - SDK-specific constants (DEX providers, slippage defaults)

4. **Large configuration data** → `config/`
   - DeFi pool configurations, token lists

---

## Migration Strategy

### Phase 1: Preparation (0 Risk)

- [x] Create new directory structure (empty folders)
- [x] Set up barrel exports (`index.ts` files)
- [x] Update `tsconfig.json` with new path aliases
- [x] Commit: "chore: prepare new directory structure"

### Phase 2: Shared Layer (Low Risk)

- [x] Move `components/ui/` → `shared/components/ui/`
- [x] Move `components/common/Toast.tsx` → `shared/components/feedback/`
- [x] Move `components/layout/` → `shared/components/layout/`
- [x] Move `components/logo/` → `shared/components/branding/`
- [x] Move `lib/context/` → `shared/contexts/`
- [x] Move `lib/utils/` → `shared/utils/`
- [x] Move `lib/constants/` (generic) → `shared/constants/`
- [x] Commit: "refactor: migrate shared components and utilities"

### Phase 3: Integration Layer (Medium Risk)

- [x] Move `lib/sui/` → `integrations/sui/`
- [x] Move `lib/suilend/` → `integrations/dex/suilend/`
- [x] Move `lib/scallop/` → `integrations/lending/scallop/`
- [x] Move `lib/constants/defi-pools.ts` → `config/defi-pools.ts`
- [x] Update integration barrel exports
- [x] Commit: "refactor: migrate integration layer (SDKs)"

### Phase 4: Features Layer (Medium Risk)

#### Priority Order: Swap → Wallet → Dashboard → Lending → Auth

- [x] **Swap Feature (FIRST - Most Complex):**
  - Move swap components → `features/swap/components/`
  - Create swap-specific hooks (extracted from components)
  - Create `features/swap/types/swap.types.ts`
  - Create `features/swap/index.ts`

- [x] **Wallet Feature:**
  - Move wallet components → `features/wallet/components/`
  - Move `lib/hooks/useWallet.ts` → `features/wallet/hooks/`
  - Move `lib/hooks/useTransactions.ts` → `features/wallet/hooks/`
  - Create `features/wallet/types/wallet.types.ts`
  - Create `features/wallet/index.ts`

- [x] **Dashboard Feature:**
  - Move dashboard components → `features/dashboard/components/`
  - Create `features/dashboard/index.ts`

- [x] **Lending Feature:**
  - Move defi/lending components → `features/lending/components/`
  - Move defi hooks → `features/lending/hooks/`
  - Move `lib/hooks/useScallopMarket.ts` → `features/lending/hooks/`
  - Move `lib/types/defi.ts` → `features/lending/types/lending.types.ts`
  - Create `features/lending/index.ts`

- [x] **Auth Feature:**
  - Move auth components → `features/auth/components/`
  - Create `features/auth/index.ts`

- [x] Commit: "refactor: migrate to feature-based organization"

### Phase 5: Generic Hooks (Low Risk)

- [x] Move `lib/hooks/useRefresh.ts` → `shared/hooks/`
- [x] Create `shared/hooks/index.ts`
- [x] Commit: "refactor: organize shared hooks"

### Phase 6: Update Imports & Verification (Critical)

- [x] Update all import paths across codebase
  - Find/replace old paths with new paths
  - Use IDE refactoring tools
- [x] Verify TypeScript compilation: `npm run build`
- [x] Run linting: `npm run lint`
- [x] Test all features manually
- [x] Commit: "refactor: update import paths"

### Phase 7: Cleanup (Low Risk)

- [x] Remove old empty directories
- [x] Update `README.md` with new structure
- [x] Update documentation
- [x] Commit: "docs: update documentation for new structure"

---

## Naming Conventions

### File Naming

- **Components:** PascalCase - `SwapInterface.tsx`
- **Hooks:** camelCase with `use` prefix - `useSwapQuotes.ts`
- **Utils:** camelCase - `formatCurrency.ts`
- **Types:** `.types.ts` suffix - `swap.types.ts`
- **Constants:** `constants.ts` with SCREAMING_SNAKE_CASE exports
- **Config:** kebab-case - `defi-pools.ts`

### Import Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/features/*": ["src/features/*"],
      "@/shared/*": ["src/shared/*"],
      "@/integrations/*": ["src/integrations/*"],
      "@/config/*": ["src/config/*"],
      "@/*": ["src/*"]
    }
  }
}
```

### Barrel Exports Pattern

```typescript
// features/swap/index.ts
export { SwapInterface } from "./components/SwapInterface";
export { TokenSelector } from "./components/TokenSelector";
export { useSwapQuotes } from "./hooks/useSwapQuotes";
export { useSwapExecution } from "./hooks/useSwapExecution";
export type { SwapParams, SwapQuote, DexProvider } from "./types/swap.types";
```

---

## Adding New Features - Guidelines

### Checklist for New Feature

```
1. Create feature directory: features/{feature-name}/
2. Create subdirectories:
   - components/
   - hooks/ (if needed)
   - types/ (if needed)
   - lib/ (if complex business logic)
3. Create index.ts for public API exports
4. Define types first in types/{feature}.types.ts
5. Build components
6. Extract logic to hooks
7. Add feature routes to app/
8. Export public API through index.ts
9. Update documentation
```

### Example: Adding "Staking" Feature

```
features/staking/
├── components/
│   ├── StakingInterface.tsx
│   ├── StakingPoolList.tsx
│   ├── StakeModal.tsx
│   └── UnstakeModal.tsx
├── hooks/
│   ├── useStakingPools.ts
│   └── useStakeTransaction.ts
├── types/
│   └── staking.types.ts
├── lib/
│   └── staking-calculator.ts
└── index.ts
```

### Adding New DEX Protocol

```typescript
// integrations/dex/suilend/builders/new-dex.ts
export async function buildNewDexSwap(params: SwapParams): Promise<SwapResult> {
  // Implementation
}

// integrations/dex/suilend/builders/index.ts
export { buildNewDexSwap } from './new-dex';

// integrations/dex/suilend/constants.ts
export const DEX_PROVIDERS = [..., 'new-dex'] as const;
```

### Adding New Lending Protocol

```
integrations/lending/new-protocol/
├── sdk.ts
├── supply.ts
├── withdraw.ts
├── types.ts
└── index.ts
```

---

## Critical Files Reference

### Configuration Files to Update

- [tsconfig.json](tsconfig.json) - Update path aliases
- [next.config.ts](next.config.ts) - May need srcDir config if using `src/`

### Key Migration Files

- [lib/suilend/index.ts](lib/suilend/index.ts) - Integration layer barrel export pattern
- [components/swap/SwapInterface.tsx](components/swap/SwapInterface.tsx) - Complex feature component
- [lib/hooks/useWallet.ts](lib/hooks/useWallet.ts) - Hook placement decision
- [lib/types/defi.ts](lib/types/defi.ts) - Type organization reference
- [components/ui/Modal.tsx](components/ui/Modal.tsx) - Shared component pattern

---

## Benefits Summary

### Developer Experience

- ✅ **Faster navigation** - Find all feature code in one place
- ✅ **Clear patterns** - Consistent structure for all features
- ✅ **Reduced cognitive load** - Know where to put new code
- ✅ **Better IDE support** - Barrel exports improve autocomplete

### Code Quality

- ✅ **Reduced circular dependencies** - Clear boundaries between layers
- ✅ **Improved type safety** - Co-located types with usage
- ✅ **Better testability** - Features testable in isolation
- ✅ **Easier refactoring** - Changes contained to features

### Scalability

- ✅ **Easy to add features** - Follow established pattern
- ✅ **Natural code splitting** - Feature-based lazy loading
- ✅ **SDK isolation** - Easy to upgrade/replace integrations
- ✅ **Team collaboration** - Reduced merge conflicts

### Maintainability

- ✅ **Clear ownership** - Features have defined boundaries
- ✅ **Easier onboarding** - Intuitive structure
- ✅ **Better documentation** - Self-documenting organization
- ✅ **Future-proof** - Flexible for growth

---

## Verification Steps

### After Migration

1. **TypeScript Compilation:**

   ```bash
   npm run build
   # Should complete without errors
   ```

2. **Linting:**

   ```bash
   npm run lint
   # Should pass all rules
   ```

3. **Manual Testing:**
   - [ ] Login/Register flow works
   - [ ] Dashboard displays correctly
   - [ ] Wallet operations (send, deposit, faucet)
   - [ ] Swap interface and execution
   - [ ] Lending supply/withdraw
   - [ ] Network switching
   - [ ] Transaction history

4. **Import Verification:**
   - Search for old import paths: `from '@/lib/'`, `from '@/components/'`
   - Ensure all imports use new structure

5. **Dead Code Check:**
   - Verify no duplicate files exist
   - Remove old empty directories

---

## Timeline & Risks

### Estimated Effort

- **Phase 1-2:** 1-2 hours (low risk, mostly moves)
- **Phase 3-4:** 3-4 hours (medium risk, integration + features)
- **Phase 5-7:** 2-3 hours (import updates + verification)
- **Total:** 6-9 hours

### Risk Mitigation

- ✅ Use Git branches - easy rollback
- ✅ Incremental commits - track progress
- ✅ Test after each phase - catch issues early
- ✅ Keep app compiling - avoid breaking changes
- ✅ Automated refactoring - IDE tools for imports

### Rollback Plan

- Each phase is a separate commit
- Can revert specific phases if needed
- No data loss risk (code-only changes)

---

## Success Criteria

✅ All files organized according to new structure
✅ TypeScript compilation succeeds without errors
✅ All features work correctly (manual testing)
✅ Import paths use new aliases (`@/features/`, `@/shared/`, etc.)
✅ No duplicate files or dead code
✅ Documentation updated with new structure
✅ Team members understand new patterns

---

## Next Steps

After refactoring completion:

1. Update development documentation
2. Create architecture decision record (ADR)
3. Add feature development guide
4. Consider adding ESLint rules to enforce structure
5. Set up import linting to prevent pattern violations

---

## User Preferences (Confirmed)

✅ **Use `src/` directory** - All source code under src/ for better organization
✅ **Pure refactor only** - No logic changes, no new features during refactoring
✅ **Priority order:** Swap (most complex) → Wallet → Dashboard → Lending → Auth

- Swap first to validate the pattern with most complex feature
- Then follow the standard order for remaining features

---

**This refactoring transforms VestPay into a scalable, maintainable architecture that will support growth as you add more DeFi protocols, features, and complexity.**
