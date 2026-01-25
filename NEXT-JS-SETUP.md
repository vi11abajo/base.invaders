# 🎮 Base Invaders - Next.js Setup Guide

## ✅ Что уже сделано

### 1. Smart Contract
- ✅ `GameStarter.sol` создан и скомпилирован
- ✅ Hardhat настроен для Base Mainnet/Sepolia
- ✅ Deploy скрипты готовы
- ⏳ **Контракт еще не задеплоен** (ждет приватного ключа)

### 2. Next.js Frontend
- ✅ Next.js 16 установлен и настроен
- ✅ MiniKit интеграция (Farcaster auth)
- ✅ OnchainKit + Wagmi (Wallet integration)
- ✅ TypeScript конфигурация
- ✅ Игровая страница `/game`
- ✅ React компоненты:
  - `GameCanvas` - интеграция с vanilla JS движком
  - `GameUI` - отображение score/lives/level
  - `Providers` - Wagmi + OnchainKit setup

### 3. Authentication
- ✅ Farcaster FID auth через Quick Auth
- ✅ Coinbase Wallet интеграция
- ✅ Backend endpoint `/api/auth/farcaster` для сохранения пользователей
- ✅ JWT токены для backend API

### 4. Game Flow
```
1. User opens /game
2. Farcaster auth автоматически (через MiniKit)
3. User connects Coinbase Wallet
4. User clicks "START GAME"
5. Transaction подписывается (GameStarter.startGame())
6. После подтверждения → игра начинается
7. Vanilla JS движок запускается в React
8. Game Over → сохранение счета в PostgreSQL
```

---

## 🚀 Запуск проекта

### Предварительные требования

1. **Node.js** 18+ установлен
2. **PostgreSQL** база данных запущена
3. **Backend API** работает на `localhost:3001`

### Шаг 1: Настроить переменные окружения

Скопируйте `.env.local.example` в `.env.local` и заполните:

```bash
# OnchainKit API Key
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key

# Base Network
NEXT_PUBLIC_CHAIN_ID=8453
BASE_RPC_URL=https://mainnet.base.org

# GameStarter Contract (после деплоя)
NEXT_PUBLIC_GAME_STARTER_ADDRESS=0x...

# Backend API
BACKEND_URL=http://localhost:3001/api
JWT_SECRET=your_jwt_secret_here

# Application URL
NEXT_PUBLIC_URL=http://localhost:3000
```

### Шаг 2: Установить зависимости

```bash
npm install
```

### Шаг 3: Запустить Backend (Express API)

```bash
cd backend
npm run dev
# Backend: http://localhost:3001
```

### Шаг 4: Запустить Next.js

В другом терминале:

```bash
npm run dev
# Next.js: http://localhost:3000
```

### Шаг 5: Открыть игру

Перейдите на: **http://localhost:3000/game**

---

## 📁 Структура проекта

```
base-invaders/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout with MiniKit
│   ├── page.tsx              # Home page (waitlist)
│   ├── game/
│   │   ├── page.tsx          # Игровая страница
│   │   └── game.module.css   # Стили игры
│   └── api/
│       └── auth/
│           └── route.ts      # Farcaster auth API
│
├── components/
│   └── game/
│       ├── GameCanvas.tsx    # Canvas компонент (React ↔ Vanilla JS)
│       ├── GameUI.tsx        # UI: score, lives, level
│       └── *.module.css      # Стили компонентов
│
├── providers/
│   └── Providers.tsx         # Wagmi + OnchainKit providers
│
├── lib/
│   ├── contracts/
│   │   ├── GameStarterABI.ts     # ABI контракта
│   │   └── contractAddresses.ts  # Адреса контрактов
│   └── hooks/
│       └── useGameStart.ts   # Хук для вызова startGame()
│
├── game/                     # Vanilla JS игровой движок
│   ├── core/
│   ├── systems/
│   ├── modes/
│   └── features/
│
├── contracts/                # Solidity контракты
│   ├── GameStarter.sol
│   └── scripts/
│       └── deploy.js
│
├── backend/                  # Express API (PostgreSQL)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js       # Farcaster auth endpoint
│   │   │   └── scores.js     # Score submission
│   │   └── services/
│   └── migrations/
│       └── 004_farcaster_migration.sql
│
├── minikit.config.ts         # Base Mini App config
├── hardhat.config.js         # Hardhat для контрактов
├── next.config.ts            # Next.js config
└── .env.local                # Environment variables
```

---

## 🔗 Интеграция компонентов

### 1. GameCanvas → Vanilla JS Engine

**Проблема**: Vanilla JS движок использует глобальные переменные и DOM манипуляции
**Решение**: React wrapper с callbacks

```typescript
// components/game/GameCanvas.tsx
const { RegularGame } = await import("@/game/game.js");
const game = new RegularGame({ canvasId: "gameCanvas" });

// Подключаем callbacks для React state updates
game.updateScore = function(points) {
  this.score += points;
  onScoreUpdate(this.score); // React callback
};
```

### 2. MiniKit → Farcaster Auth

```typescript
// app/game/page.tsx
const { context } = useMiniKit(); // FID, display name
const { data: authData } = useQuickAuth("/api/auth"); // JWT verify
```

### 3. Wagmi → Wallet + Game Start

```typescript
// lib/hooks/useGameStart.ts
const { writeContract } = useWriteContract();

await writeContract({
  address: CONTRACTS.gameStarter,
  abi: GameStarterABI,
  functionName: "startGame",
});
```

---

## 🛠️ Следующие шаги

### 1. Деплой GameStarter контракта

См. `DEPLOYMENT-GUIDE.md`:

```bash
# На Base Sepolia (testnet)
npx hardhat run contracts/scripts/deploy.js --network baseSepolia

# На Base Mainnet (production)
npx hardhat run contracts/scripts/deploy.js --network base
```

Сохранить адрес в `.env.local`:
```bash
NEXT_PUBLIC_GAME_STARTER_ADDRESS=0x...
```

### 2. Запустить БД миграцию

```bash
cd backend
node migrations/run.js
```

Это добавит колонки `fid` и `wallet_address` в таблицу `users`.

### 3. Получить OnchainKit API Key

1. Перейдите на https://portal.cdp.coinbase.com/
2. Создайте проект
3. Скопируйте API Key
4. Добавьте в `.env.local`:
```bash
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key
```

### 4. Настроить Account Association (для Base Mini App)

1. Перейдите на https://base.dev/preview
2. Введите URL вашего приложения
3. Нажмите "Verify"
4. Скопируйте credentials в `.env.local`:

```bash
ACCOUNT_ASSOCIATION_HEADER="..."
ACCOUNT_ASSOCIATION_PAYLOAD="..."
ACCOUNT_ASSOCIATION_SIGNATURE="..."
```

### 5. Deploy на Vercel

```bash
# Push на GitHub
git add .
git commit -m "Add Next.js frontend with MiniKit integration"
git push origin main

# Vercel автоматически задеплоит
# Добавить Environment Variables в Vercel Dashboard
```

---

## 🧪 Тестирование

### Local Testing

1. **Запустить backend**:
```bash
cd backend && npm run dev
```

2. **Запустить Next.js**:
```bash
npm run dev
```

3. **Открыть игру**:
```
http://localhost:3000/game
```

### Production Testing (после деплоя)

1. **Base Sepolia (testnet)**:
   - Получить тестовые ETH: https://www.alchemy.com/faucets/base-sepolia
   - Деплоить контракт на Sepolia
   - Тестировать полный flow

2. **Base Mainnet**:
   - Только после успешного тестирования на Sepolia
   - Реальные ETH для gas

---

## 📝 FAQ

### Q: Почему игра не запускается после подписания транзакции?

A: Проверьте:
1. Контракт задеплоен на правильной сети (Base Mainnet)
2. `NEXT_PUBLIC_GAME_STARTER_ADDRESS` в `.env.local` корректный
3. Кошелек подключен к Base network
4. Транзакция подтверждена (check на BaseScan)

### Q: Ошибка "Cannot find module @/game/game.js"

A: Убедитесь, что:
1. Файл `game/game.js` существует
2. TypeScript `paths` настроен в `tsconfig.json`:
```json
"paths": {
  "@/*": ["./*"]
}
```

### Q: Backend API не отвечает

A: Проверьте:
1. Backend запущен: `cd backend && npm run dev`
2. PostgreSQL база данных работает
3. `BACKEND_URL` в `.env.local` корректный
4. CORS настроен в backend для `http://localhost:3000`

---

## 🎯 Что готово к работе

✅ **Можно тестировать локально**:
- Farcaster auth (FID)
- Wallet connection
- Game UI (canvas, компоненты)

⏳ **Требует деплоя контракта**:
- Transaction signing для старта игры
- On-chain game sessions

⏳ **Требует Account Association**:
- Публикация в Base Mini Apps directory
- Работа в Farcaster клиентах

---

**Готово к следующему этапу!** 🚀

Если есть вопросы, см. `DEPLOYMENT-GUIDE.md` для деплоя контракта.
