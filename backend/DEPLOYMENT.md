# 🚀 Инструкция по деплою на VPS (Ubuntu 22.04)

Полное руководство по развертыванию Pharos Invaders Backend на вашем VPS.

---

## 📋 Предварительные требования

- ✅ VPS с Ubuntu 22.04
- ✅ SSH доступ к серверу
- ✅ Домен (настроенный DNS A Record на IP сервера)
- ✅ Discord Application (Client ID, Client Secret)
- ✅ PostgreSQL установлен
- ✅ Node.js 20.x установлен

---

## 1️⃣ Подключение к VPS

```bash
ssh root@your-vps-ip
# или
ssh your-username@your-vps-ip
```

---

## 2️⃣ Установка необходимого ПО

### Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

### Установка Node.js 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Проверка
node --version  # v20.x.x
npm --version   # v10.x.x
```

### Установка PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib -y

# Проверка статуса
sudo systemctl status postgresql
```

### Установка PM2

```bash
sudo npm install -g pm2

# Настройка автозапуска
pm2 startup
# Выполните команду, которую выдаст PM2
```

### Установка Nginx

```bash
sudo apt install nginx -y

# Настройка firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Установка Certbot (для SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

---

## 3️⃣ Настройка PostgreSQL

### Создание базы данных и пользователя

```bash
# Вход в PostgreSQL
sudo -u postgres psql

# Внутри psql:
CREATE DATABASE pharos_invaders;
CREATE USER pharos_user WITH ENCRYPTED PASSWORD 'ваш_надежный_пароль';
GRANT ALL PRIVILEGES ON DATABASE pharos_invaders TO pharos_user;

# Выход
\q
```

### Настройка pg_hba.conf (если нужен удаленный доступ)

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Добавить в конец (для локального доступа):
host    all             all             127.0.0.1/32            md5

# Сохранить и перезапустить:
sudo systemctl restart postgresql
```

---

## 4️⃣ Клонирование проекта

```bash
# Создать директорию для проектов
mkdir -p /var/www
cd /var/www

# Клонировать репозиторий
git clone https://github.com/vi11abajo/PI_Offline.git
cd PI_Offline/backend

# Установить зависимости
npm install --production
```

---

## 5️⃣ Настройка переменных окружения

```bash
# Создать .env файл
nano .env
```

Вставить и заполнить:

```env
# Discord OAuth
DISCORD_CLIENT_ID=ваш_discord_client_id
DISCORD_CLIENT_SECRET=ваш_discord_client_secret
DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/discord/callback

# JWT (сгенерировать: openssl rand -hex 64)
JWT_SECRET=ваш_64_символьный_случайный_ключ

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pharos_invaders
DB_USER=pharos_user
DB_PASSWORD=ваш_пароль_от_postgresql

# Server
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Anti-Cheat
ENABLE_SCORE_VALIDATION=true
MAX_SCORE_PER_LEVEL=10000
MAX_LEVEL=100
MIN_GAME_DURATION=5000
```

Сохранить (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## 6️⃣ Запуск миграций базы данных

```bash
npm run migrate
```

Вы должны увидеть: `✅ Migration completed successfully!`

---

## 7️⃣ Запуск сервера через PM2

```bash
# Запуск
pm2 start ecosystem.config.cjs

# Проверка статуса
pm2 status

# Просмотр логов
pm2 logs pharos-backend

# Сохранить конфигурацию для автозапуска
pm2 save
```

**Полезные PM2 команды:**

```bash
pm2 restart pharos-backend   # Перезапуск
pm2 stop pharos-backend       # Остановка
pm2 delete pharos-backend     # Удаление
pm2 monit                     # Мониторинг в реальном времени
pm2 flush                     # Очистить логи
```

---

## 8️⃣ Настройка Nginx (Reverse Proxy)

### Создать конфигурацию для сайта

```bash
sudo nano /etc/nginx/sites-available/pharos-backend
```

Вставить:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Socket.IO support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Увеличить timeout для долгих запросов
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

Сохранить и выйти.

### Активировать конфигурацию

```bash
# Создать символическую ссылку
sudo ln -s /etc/nginx/sites-available/pharos-backend /etc/nginx/sites-enabled/

# Проверить конфигурацию
sudo nginx -t

# Перезапустить Nginx
sudo systemctl restart nginx
```

---

## 9️⃣ Настройка SSL (Let's Encrypt)

```bash
# Получить сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Следовать инструкциям:
# 1. Ввести email
# 2. Согласиться с Terms of Service
# 3. Выбрать "Redirect" (перенаправлять HTTP на HTTPS)
```

Certbot автоматически обновит конфигурацию Nginx для HTTPS.

### Проверка автообновления сертификата

```bash
# Тест обновления
sudo certbot renew --dry-run
```

Сертификаты Let's Encrypt действительны 90 дней и обновляются автоматически.

---

## 🔟 Обновление Discord Redirect URI

Зайдите на [Discord Developer Portal](https://discord.com/developers/applications):

1. Выберите ваше приложение
2. OAuth2 → Redirects
3. Добавьте: `https://yourdomain.com/api/auth/discord/callback`
4. Сохраните

---

## 1️⃣1️⃣ Проверка работоспособности

```bash
# Локально на сервере
curl http://localhost:3000/health

# Через домен
curl https://yourdomain.com/health
```

Ответ должен быть:

```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123,
  "environment": "production"
}
```

---

## 1️⃣2️⃣ Обновление кода (при изменениях)

```bash
# Зайти в директорию проекта
cd /var/www/PI_Offline/backend

# Получить обновления
git pull

# Установить новые зависимости (если есть)
npm install --production

# Перезапустить PM2
pm2 restart pharos-backend

# Проверить логи
pm2 logs pharos-backend --lines 50
```

---

## 🔒 Безопасность

### Рекомендации:

1. **Использовать сильные пароли** для PostgreSQL
2. **Не коммитить .env** в Git (добавлен в .gitignore)
3. **Ограничить SSH доступ**:
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Изменить: PermitRootLogin no
   sudo systemctl restart sshd
   ```
4. **Настроить fail2ban** для защиты от брутфорса:
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   ```

---

## 📊 Мониторинг

### Логи PM2

```bash
pm2 logs pharos-backend         # Все логи
pm2 logs pharos-backend --err   # Только ошибки
pm2 logs pharos-backend --out   # Только output
```

### Логи Nginx

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Логи PostgreSQL

```bash
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

---

## 🛠️ Решение проблем

### Сервер не запускается

```bash
# Проверить логи PM2
pm2 logs pharos-backend

# Проверить переменные окружения
cat .env

# Проверить подключение к БД
npm run migrate
```

### Ошибки подключения к БД

```bash
# Проверить что PostgreSQL запущен
sudo systemctl status postgresql

# Проверить что база данных создана
sudo -u postgres psql -c "\l"
```

### Nginx ошибки

```bash
# Проверить конфигурацию
sudo nginx -t

# Перезапустить Nginx
sudo systemctl restart nginx

# Проверить что порт 3000 занят
sudo lsof -i :3000
```

---

## ✅ Готово!

Ваш backend сервер теперь работает на:

- **API:** `https://yourdomain.com/api/*`
- **Socket.IO:** `wss://yourdomain.com`
- **Health Check:** `https://yourdomain.com/health`

---

## 📞 Поддержка

Если возникли проблемы:

1. Проверьте логи: `pm2 logs pharos-backend`
2. Откройте Issue на GitHub
3. Свяжитесь с [@IIIDARt](https://twitter.com/IIIDARt)
