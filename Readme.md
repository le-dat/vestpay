# <p align="center"><img src="vestpay_banner_1768649690224.png" alt="Vestpay Banner" width="800"/></p>

# 🚀 VestPay - Premium DeFi Experience on Sui

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Sui Network](https://img.shields.io/badge/Sui-Network-blue?logo=sui)](https://sui.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)](https://nestjs.com/)

**VestPay** is a state-of-the-art DeFi application built on the **Sui Network**, designed to provide a seamless, secure, and visually stunning experience for managing assets, lending, and borrowing. By leveraging **Passkey** technology, VestPay simplifies user authentication while maintaining high-grade security.

---

## ✨ Key Features

- 🌐 **Sui Network Integration**: Native support for Sui assets and smart interactions.
- 🔑 **Passkey Authentication**: Secure, biometric, and passwordless login experience.
- 📊 **Intuitive DeFi Dashboard**: A comprehensive overview of your portfolio, active lending pools, and recent activities.
- 💸 **Lending & Borrowing**: Deeply integrated with the **Scallop Protocol** API to provide real-time market data and one-click lending/borrowing.
- 🛡️ **Premium UI/UX**: A glassmorphism-inspired design with smooth animations, light/dark mode support, and a responsive layout.
- 📈 **Activity Tracking**: Detailed transaction history and activity logs to keep you informed.

---

## 🛠️ Technology Stack

### Front-end

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Logic**: TypeScript, React Hooks

### Back-end

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: TypeScript

### Blockchain & DeFi

- **Network**: [Sui Network](https://sui.io/)
- **SDK**: `@mysten/sui`
- **Protocol Integration**: [Scallop](https://scallop.io/)

---

## 📁 Project Structure

```text
vestpay/
├── front-end/        # Next.js Application
│   ├── app/          # App Router (DeFi, Wallet, Dashboard routes)
│   ├── components/   # UI Components (Logo, Tables, Sidebar)
│   ├── lib/          # Utilities, Types, and Hooks
│   └── public/       # Static Assets
├── backend/          # NestJS API Service
│   ├── src/          # API Source Code
│   └── test/         # Testing suite
└── Readme.md         # You are here
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) or [npm](https://www.npmjs.com/)

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/your-repo/vestpay.git
    cd vestpay
    ```

2.  **Setup Front-end**:

    ```bash
    cd front-end
    pnpm install
    pnpm dev
    ```

3.  **Setup Backend**:
    ```bash
    cd ../backend
    pnpm install
    pnpm run start:dev
    ```

---

## 📸 Preview

_Placeholder for more screenshots - check out the live demo!_

---

## 🗺️ Roadmap

- [ ] **Multi-chain Support**: Expanding beyond Sui to other L1/L2 networks.
- [ ] **Yield Aggregator**: Automatic shifting of assets to the highest APY pools.
- [ ] **Swap Integration**: Direct token swaps within the VestPay interface.
- [ ] **Mobile App**: Dedicated iOS and Android versions using React Native.

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">Made with ❤️ for the Sui Ecosystem</p>
