# 🚀 VestPay - Premium DeFi Experience on Sui

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/) [![Sui Network](https://img.shields.io/badge/Sui-Network-blue?logo=sui)](https://sui.io/) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/) [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)

**VestPay** is a state-of-the-art DeFi application built on the **Sui Network**, designed to provide a seamless, secure, and visually stunning experience for managing assets, lending, and token swaps. By leveraging **Passkey** technology, VestPay simplifies user authentication while maintaining high-grade security.

---

## ✨ Key Features

- 🌐 **Sui Network Integration**: Native support for Sui assets and smart interactions with mainnet/testnet switching.
- 🔑 **Passkey Authentication**: Secure, biometric, and passwordless login experience using WebAuthn.
- 💰 **Wallet Management**: Send, receive, and manage multiple tokens with real-time balance tracking.
- 🔄 **Multi-DEX Token Swaps**: Aggregated swaps across **Cetus**, **Aftermath**, and **FlowX** DEXs for best rates via Suilend aggregator.
- 💸 **Lending & Borrowing**: Deeply integrated with the **Scallop Protocol** API to provide real-time market data and one-click lending/borrowing.
- 📊 **Intuitive DeFi Dashboard**: A comprehensive overview of your portfolio, active lending pools, and recent activities.
- 📈 **Activity Tracking**: Detailed transaction history and activity logs to keep you informed.
- 🛡️ **Premium UI/UX**: A modern design with smooth animations and a responsive layout.

---

## 🛠️ Technology Stack

- **Frontend**: [Next.js 16.1](https://nextjs.org/), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Core**: TypeScript 5, [Zod](https://zod.dev/)
- **Blockchain**: [Sui Network](https://sui.io/) (Mainnet/Testnet), `@mysten/sui`
- **DeFi**: [Scallop](https://scallop.io/) (Lending), [Suilend](https://suilend.fi/) (Aggregator), Cetus, Aftermath, FlowX

---

## 📁 Project Structure

The project follows a feature-based architecture within the `src` directory:

```text
vestpay/
├── public/                  # Static assets (images, icons)
├── scripts/                 # Utility and testing scripts
├── src/
│   ├── app/                 # Next.js App Router (Pages & Layouts)
│   ├── config/              # Application configuration
│   ├── features/            # Feature-specific code (Auth, Wallet, Swap, Lending)
│   ├── integrations/        # External services (Sui, Scallop, DEXs)
│   ├── shared/              # Shared components, hooks, and utilities
│   └── types/               # Global TypeScript type definitions
└── package.json             # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [pnpm](https://pnpm.io/) (recommended) or npm

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-repo/vestpay.git
   cd vestpay
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Start the development server**:

   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`.

### Utility Scripts

- `pnpm test:swap` - Run Swap Test
- `pnpm test:swap:passkey` - Run Swap Test (Passkey)

> **Note**: The application connects to Sui networks by default. No additional environment variables are required.

## 📸 Preview

# <p align="center"><img src="./public/images/vestpay_banner.png" alt="Vestpay Banner" width="800"/></p>

---

## 🗺️ Roadmap

- [ ] **Multi-chain Support**: Expanding beyond Sui to other L1/L2 networks.
- [ ] **Yield Aggregator**: Automatic shifting of assets to the highest APY pools.
- [ ] **Advanced Swap Features**: Limit orders, multi-hop routing, and price alerts.
- [ ] **Mobile App**: Dedicated iOS and Android versions via React Native.
- [ ] **Staking Integration**: Native staking support for SUI and other tokens.

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">Made by VestPay team for the Sui Ecosystem</p>
