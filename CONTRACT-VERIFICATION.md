# 🔍 Верификация GameStarter контракта

**Адрес контракта:** `0x3788852622B3a26A994db11980cBcbEaD6e0D51e`

## Зачем нужна верификация?

Верификация контракта на BaseScan позволяет:
- ✅ Пользователям видеть исходный код
- ✅ Взаимодействовать с контрактом через BaseScan UI
- ✅ Подтвердить, что deployed код совпадает с исходниками
- ✅ Повысить доверие к проекту

---

## Способ 1: Автоматическая верификация через Hardhat

### Для Base Sepolia:

```bash
npx hardhat verify --network baseSepolia 0x3788852622B3a26A994db11980cBcbEaD6e0D51e
```

### Для Base Mainnet:

```bash
npx hardhat verify --network base 0x3788852622B3a26A994db11980cBcbEaD6e0D51e
```

### Если ошибка "Already Verified":

Контракт уже верифицирован - можете пропустить этот шаг! ✅

### Если ошибка "Missing API Key":

1. Получите BaseScan API Key: https://basescan.org/myapikey
2. Добавьте в `.env.local`:
   ```bash
   BASESCAN_API_KEY=ваш_api_key
   ```
3. Попробуйте снова

---

## Способ 2: Ручная верификация через BaseScan UI

### Шаг 1: Открыть BaseScan

**Base Sepolia:**
https://sepolia.basescan.org/address/0x3788852622B3a26A994db11980cBcbEaD6e0D51e#code

**Base Mainnet:**
https://basescan.org/address/0x3788852622B3a26A994db11980cBcbEaD6e0D51e#code

### Шаг 2: Нажать "Verify and Publish"

На странице контракта:
1. Вкладка **"Contract"**
2. Кнопка **"Verify and Publish"**

### Шаг 3: Заполнить форму

**Compiler Type:**
- Solidity (Single file)

**Compiler Version:**
- v0.8.20+commit.a1b79de6

**Open Source License Type:**
- MIT License (MIT)

**Optimization:**
- ✅ Yes
- Runs: `200`

### Шаг 4: Вставить исходный код

Скопировать содержимое `contracts/GameStarter.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GameStarter
 * @notice Simple contract to initiate Base Invaders game sessions via on-chain transaction
 * @dev Extremely gas-efficient - only increments counters and emits event
 */
contract GameStarter {
    /// @notice Emitted when a player starts a new game
    /// @param player Address of the player starting the game
    /// @param timestamp Block timestamp when game was started
    /// @param gameCount Total number of games this player has started
    event GameStarted(
        address indexed player,
        uint256 indexed timestamp,
        uint256 gameCount
    );

    /// @notice Number of games started per player (auto-generates getter: playerGameCount(address))
    mapping(address => uint256) public playerGameCount;

    /// @notice Total games started across all players (auto-generates getter: totalGamesStarted())
    uint256 public totalGamesStarted;

    /**
     * @notice Start a new game session by signing this transaction
     * @dev Increments player count, total count, and emits GameStarted event
     */
    function startGame() external {
        playerGameCount[msg.sender]++;
        totalGamesStarted++;

        emit GameStarted(
            msg.sender,
            block.timestamp,
            playerGameCount[msg.sender]
        );
    }
}
```

### Шаг 5: Верифицировать

Нажать **"Verify and Publish"**

Если все правильно - увидите: ✅ **"Contract Source Code Verified"**

---

## Проверка после верификации

После успешной верификации:

1. **Зеленая галочка** на странице контракта
2. Вкладка **"Read Contract"** доступна:
   - `playerGameCount(address)` - проверить счет игрока
   - `totalGamesStarted()` - общее количество игр
3. Вкладка **"Write Contract"** доступна:
   - `startGame()` - можно вызвать через UI

---

## Тестирование контракта через BaseScan

### 1. Read Contract (чтение данных)

Перейти на вкладку **"Read Contract"**:

```
totalGamesStarted()
→ 0 (или количество игр, если уже кто-то играл)

playerGameCount(0xВашАдрес)
→ 0 (или количество ваших игр)
```

### 2. Write Contract (запись данных)

Перейти на вкладку **"Write Contract"**:

1. Нажать **"Connect to Web3"** (подключить MetaMask)
2. Выбрать функцию **`startGame()`**
3. Нажать **"Write"**
4. Подтвердить транзакцию в MetaMask
5. Дождаться подтверждения
6. Проверить: `playerGameCount(yourAddress)` должен увеличиться на 1

---

## Troubleshooting

### Ошибка: "Bytecode does not match"

Причины:
- Неправильная версия компилятора
- Неправильные настройки оптимизации
- Изменения в коде после деплоя

**Решение:**
1. Убедитесь, что используете Solidity v0.8.20
2. Optimizer enabled: Yes, Runs: 200
3. Код точно совпадает с задеплоенным

### Ошибка: "Invalid API Key"

**Решение:**
1. Проверьте `BASESCAN_API_KEY` в `.env.local`
2. API key должен быть активен (не истек)
3. Попробуйте создать новый API key

### Контракт не найден

**Возможные причины:**
1. Неправильная сеть (Sepolia vs Mainnet)
2. Адрес скопирован с ошибкой
3. Транзакция деплоя еще не подтверждена

**Решение:**
- Подождите несколько минут после деплоя
- Проверьте адрес контракта
- Убедитесь, что используете правильный BaseScan (sepolia.basescan.org или basescan.org)

---

## После верификации

Контракт готов к использованию! ✅

**Следующие шаги:**
1. Протестировать через BaseScan UI (`startGame()`)
2. Запустить Next.js приложение: `npm run dev`
3. Открыть игру: `http://localhost:3000/game`
4. Подключить кошелек
5. Нажать "START GAME"
6. Подписать транзакцию
7. Игра начнется после подтверждения! 🎮
