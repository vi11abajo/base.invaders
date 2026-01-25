# 🚀 Гайд по деплою GameStarter контракта на Base

## Шаг 1: Создать кошелек для деплоя

⚠️ **ВАЖНО:** Создайте новый кошелек ТОЛЬКО для деплоя контрактов, не используйте основной!

1. Установите MetaMask (если еще не установлен)
2. Создайте новый аккаунт: **Settings → Create Account**
3. Назовите его "Deployer Wallet" или "Base Deployer"

## Шаг 2: Получить приватный ключ

1. В MetaMask выберите аккаунт Deployer
2. Нажмите на три точки → **Account Details**
3. Нажмите **Show Private Key**
4. Введите пароль MetaMask
5. Скопируйте приватный ключ (начинается с `0x...`)

## Шаг 3: Пополнить кошелек ETH на Base

Для деплоя контракта нужно ~0.001-0.002 ETH на Base Mainnet.

**Опция 1: Bridge с Ethereum**
- Перейдите на https://bridge.base.org
- Подключите MetaMask (Deployer кошелек)
- Bridgeйте минимум 0.005 ETH с Ethereum на Base

**Опция 2: Купить ETH напрямую на Base**
- Coinbase: купите ETH и отправьте на Base network
- Binance/OKX: withdrawal на Base network
- Или используйте фиат on-ramp (MoonPay, Transak)

**Опция 3: Использовать testnet (Base Sepolia)**
- Получите бесплатные тестовые ETH: https://www.alchemy.com/faucets/base-sepolia
- Деплойте сначала на testnet, потом на mainnet

## Шаг 4: Настроить .env.local

Откройте `.env.local` и замените значения:

```bash
# Вставьте приватный ключ из Шага 2
DEPLOYER_PRIVATE_KEY=0x...ваш_приватный_ключ...

# Base RPC (оставьте как есть или используйте Alchemy/Infura)
BASE_RPC_URL=https://mainnet.base.org

# BaseScan API Key (опционально, для верификации контракта)
# Получить здесь: https://basescan.org/myapikey
BASESCAN_API_KEY=your_basescan_api_key_here
```

⚠️ **НИКОГДА** не коммитьте `.env.local` в Git!

## Шаг 5: Задеплоить контракт

### Вариант A: Deploy на Base Sepolia (testnet, рекомендуется для тестирования)

```bash
npx hardhat run contracts/scripts/deploy.js --network baseSepolia
```

### Вариант B: Deploy на Base Mainnet (production)

```bash
npx hardhat run contracts/scripts/deploy.js --network base
```

После успешного деплоя вы увидите:

```
✅ GameStarter deployed to: 0xAbC123...
📝 Save this address to your .env file:
NEXT_PUBLIC_GAME_STARTER_ADDRESS=0xAbC123...

🔍 Verify contract on BaseScan:
npx hardhat verify --network base 0xAbC123...
```

## Шаг 6: Сохранить адрес контракта

1. Скопируйте адрес контракта из вывода
2. Откройте `.env.local`
3. Вставьте адрес:

```bash
NEXT_PUBLIC_GAME_STARTER_ADDRESS=0xAbC123...
```

## Шаг 7: Верифицировать контракт на BaseScan (опционально)

Верификация позволяет пользователям видеть исходный код контракта.

1. Получите BaseScan API Key:
   - Зарегистрируйтесь на https://basescan.org
   - Перейдите в **My Account → API Keys**
   - Создайте новый API key
   - Добавьте в `.env.local`: `BASESCAN_API_KEY=ваш_ключ`

2. Запустите верификацию:

```bash
# Замените 0xAbC123... на адрес вашего контракта
npx hardhat verify --network base 0xAbC123...
```

3. После успешной верификации контракт будет доступен на:
   - Base Mainnet: https://basescan.org/address/0xAbC123...
   - Base Sepolia: https://sepolia.basescan.org/address/0xAbC123...

## Шаг 8: Проверить деплой

Перейдите на BaseScan и проверьте:
- ✅ Контракт задеплоен
- ✅ Balance кошелька уменьшился (потрачен gas)
- ✅ Контракт верифицирован (зеленая галочка)
- ✅ Можно вызвать функции: `startGame()`, `getPlayerGameCount()`, `getTotalGamesStarted()`

## Troubleshooting

### Ошибка: "insufficient funds for gas"
- Пополните Deployer кошелек ETH на Base

### Ошибка: "Invalid private key"
- Проверьте, что ключ начинается с `0x`
- Проверьте, что ключ скопирован полностью (64 символа после 0x)

### Ошибка: "network does not support ENS"
- Игнорируйте, это warning, не влияет на деплой

### Контракт задеплоен, но верификация не работает
- Проверьте BASESCAN_API_KEY в `.env.local`
- Подождите 1-2 минуты после деплоя
- Попробуйте верификацию снова

## Следующие шаги

После успешного деплоя:
1. ✅ Адрес контракта сохранен в `.env.local`
2. ✅ Перейти к интеграции frontend с MiniKit
3. ✅ Создать хук `useGameStart()` для вызова контракта
4. ✅ Протестировать flow: Кнопка Start → Подписание транзакции → Начало игры
