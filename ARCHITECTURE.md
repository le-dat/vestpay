# VestPay Architecture

## Frontend vs Backend Responsibilities

### 🎨 Frontend (Next.js)
**Handles:** Transaction Building & Signing

```typescript
// front-end/lib/scallop/client.ts
- buildSupplyAsCollateralTransaction()  ✅ Build with wallet context
- buildBorrowTransaction()              ✅ Build with wallet context
- buildWithdrawTransaction()            ✅ Build with wallet context
- buildRepayTransaction()               ✅ Build with wallet context
```

**Why Frontend?**
- ✅ Has wallet context (address, gas coins)
- ✅ Can sign with Passkey directly
- ✅ No need to send sensitive data to backend

---

### 🔧 Backend (NestJS)
**Handles:** Data Queries & Aggregation

```typescript
// backend/src/tools/scallop/query.ts
- getLendingPosition()      ✅ Query user's positions
- getMarketInfo()           ✅ Query market data
- getObligations()          ✅ Query user obligations
- calculateHealthFactor()   ✅ Calculate risk metrics
```

**Why Backend?**
- ✅ Heavy queries (don't block UI)
- ✅ Data aggregation from multiple sources
- ✅ Caching & optimization
- ✅ Rate limiting protection

---

## 🔄 Current Flow

### Supply Flow:
```
User clicks "Supply"
  ↓
FE: buildSupplyAsCollateralTransaction()
  ↓
FE: Sign with Passkey
  ↓
FE: Execute transaction
  ↓
BE: Query updated position (refresh UI)
```

### Borrow Flow:
```
User clicks "Borrow"
  ↓
BE: Check if user has collateral (query)
  ↓
FE: buildBorrowTransaction()
  ↓
FE: Sign with Passkey
  ↓
FE: Execute transaction
  ↓
BE: Query updated position (refresh UI)
```

---

## 📂 File Structure

### Frontend:
```
front-end/
├── lib/
│   ├── scallop/
│   │   └── client.ts          # Transaction builders
│   └── sui/
│       ├── passkey.ts         # Wallet management
│       └── signing.ts         # Transaction signing
└── components/
    └── wallet/
        ├── ScallopSupply.tsx  # UI + transaction execution
        ├── ScallopBorrow.tsx
        └── ScallopPosition.tsx # UI + data display
```

### Backend:
```
backend/
└── src/
    ├── tools/
    │   └── scallop/
    │       ├── query.ts       # Data queries
    │       ├── sdk.ts         # SDK initialization
    │       └── types.ts       # Type definitions
    └── scallop/
        ├── scallop.controller.ts  # API endpoints
        └── scallop.service.ts     # Business logic
```

---

## 🚀 API Endpoints (Backend)

### Query Endpoints:
```
GET  /scallop/position/:address    # Get user's lending position
GET  /scallop/market/:coinName     # Get market info
GET  /scallop/obligations/:address # Get user obligations
GET  /scallop/health/:address      # Calculate health factor
```

### ❌ Removed Endpoints:
```
POST /scallop/supply/build    # ❌ Moved to frontend
POST /scallop/borrow/build    # ❌ Moved to frontend
POST /scallop/withdraw/build  # ❌ Moved to frontend
POST /scallop/repay/build     # ❌ Moved to frontend
```

**Why removed?**
- Cannot build transactions without wallet context
- Frontend can build directly with Scallop SDK

---

## 🔐 Security Benefits

### Frontend Transaction Building:
- ✅ Private keys never leave user's device
- ✅ Passkey authentication in browser
- ✅ No sensitive data sent to backend
- ✅ User has full control over transactions

### Backend Query Only:
- ✅ Read-only operations
- ✅ No access to user funds
- ✅ Can be rate-limited safely
- ✅ Cacheable for performance

---

## 📊 Performance Optimization

### Frontend:
- Passkey caching (30s window)
- Transaction batching
- Optimistic UI updates

### Backend:
- Query result caching
- Parallel data fetching
- Connection pooling

---

## 🎯 Next Steps

1. ✅ Remove unused transaction builders from backend
2. ✅ Keep only query functions in backend
3. ✅ Add more query endpoints as needed
4. ✅ Implement caching for frequently accessed data
