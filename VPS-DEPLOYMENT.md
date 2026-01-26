# Пошаговое руководство по деплою на VPS

## Порты (нестандартные для безопасности)
- Frontend (Next.js): **5437**
- Backend (Express): **5438**
- Nginx: 80 (HTTP), 443 (HTTPS через Cloudflare)

---

## ✅ Шаг 1: Настройка сервера

### 1.1. Подключение к серверу
```bash
ssh root@YOUR_SERVER_IP
```

### 1.2. Запуск скрипта установки
```bash
cd ~
wget https://raw.githubusercontent.com/vi11abajo/base.invaders/main/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

### 1.3. Настройка PM2 автозапуска
После выполнения скрипта, скопируйте и выполните команду, которую показал PM2:
```bash
# Пример (ваша команда может отличаться):
# systemctl enable pm2-root
```

---

## ✅ Шаг 2: Создание базы данных PostgreSQL

### 2.1. Генерация сильного пароля
Сначала сгенерируйте сильный пароль (на локальной машине или сервере):
```bash
openssl rand -base64 32
```
**Сохраните этот пароль! Он понадобится для .env и GitHub Secrets**

### 2.2. Создание базы данных
```bash
# Скачать SQL скрипт
cd /tmp
wget https://raw.githubusercontent.com/vi11abajo/base.invaders/main/setup-database.sql

# Отредактировать - заменить YOUR_STRONG_PASSWORD
nano setup-database.sql
# Замените YOUR_STRONG_PASSWORD на сгенерированный пароль

# Выполнить скрипт
sudo -u postgres psql -f setup-database.sql
```

### 2.3. Проверка
```bash
psql -U base_invaders_user -d base_invaders -h localhost -c "\dt"
# Введите пароль, должно показать пустую таблицу (это нормально)
```

---

## ✅ Шаг 3: Настройка Nginx

### 3.1. Копирование конфигурации
```bash
cd /tmp
wget https://raw.githubusercontent.com/vi11abajo/base.invaders/main/nginx-seainvaders.conf
cp nginx-seainvaders.conf /etc/nginx/sites-available/seainvaders.fun
```

### 3.2. Активация конфигурации
```bash
# Создание символической ссылки
ln -s /etc/nginx/sites-available/seainvaders.fun /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации (если мешает)
rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации
nginx -t

# Перезапуск Nginx
systemctl restart nginx
systemctl status nginx
```

---

## ✅ Шаг 4: Добавление SSH ключа для GitHub Actions

### 4.1. Добавление публичного ключа
```bash
# Создать директорию если не существует
mkdir -p /root/.ssh

# Добавить публичный ключ
echo "ssh-ed25519 REDACTED-DEPLOY-PUBLIC-KEY github-actions-deploy" >> /root/.ssh/authorized_keys

# Установить правильные права
chmod 700 /root/.ssh
chmod 600 /root/.ssh/authorized_keys
```

### 4.2. Проверка SSH доступа (с локальной машины)
```bash
# На локальной машине Windows
ssh -i ~\.ssh\github_deploy_key root@YOUR_SERVER_IP "echo 'SSH работает!'"
```

---

## ✅ Шаг 5: Настройка GitHub Secrets

Перейдите в GitHub:
`https://github.com/vi11abajo/base.invaders/settings/secrets/actions`

### 5.1. SSH секреты

**SSH_PRIVATE_KEY**
```
Содержимое файла: ~\.ssh\github_deploy_key
Скопировать весь текст включая:
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

**SSH_HOST**
```
YOUR_SERVER_IP
```

**SSH_USER**
```
root
```

**SSH_PORT**
```
22
```

### 5.2. Frontend секреты

**NEXT_PUBLIC_ONCHAINKIT_API_KEY**
```
Ваш API ключ от Coinbase OnchainKit
```

**NEXT_PUBLIC_URL**
```
https://seainvaders.fun
```

**NEXT_PUBLIC_BASE_RPC_URL**
```
https://mainnet.base.org
```

**NEXT_PUBLIC_CHAIN_ID**
```
8453
```

**NEXT_PUBLIC_GAME_STARTER_ADDRESS**
```
Адрес вашего смарт-контракта GameStarter
```

### 5.3. Backend секреты

**JWT_SECRET**
```bash
# Сгенерировать на локальной машине:
openssl rand -base64 64
```

**DB_HOST**
```
localhost
```

**DB_PORT**
```
5432
```

**DB_NAME**
```
base_invaders
```

**DB_USER**
```
base_invaders_user
```

**DB_PASSWORD**
```
Пароль из Шага 2
```

**DISCORD_CLIENT_ID**
```
Ваш Discord Application Client ID
```

**DISCORD_CLIENT_SECRET**
```
Ваш Discord Application Client Secret
```

**DISCORD_REDIRECT_URI**
```
https://seainvaders.fun/api/auth/discord/callback
```

**FRONTEND_URL**
```
https://seainvaders.fun
```

**NODE_ENV**
```
production
```

**BACKEND_PORT**
```
5438
```

---

## ✅ Шаг 6: Первый деплой

### 6.1. Создание директории на сервере
```bash
ssh root@YOUR_SERVER_IP
mkdir -p /var/www
cd /var/www
```

### 6.2. Push кода (запустит GitHub Actions)
```bash
# На локальной машине
cd ~\PycharmProjects\base-invaders
git push origin main
```

### 6.3. Мониторинг деплоя
Откройте в браузере:
```
https://github.com/vi11abajo/base.invaders/actions
```

Следите за прогрессом workflow "Deploy to VPS"

### 6.4. Проверка после деплоя

**На сервере:**
```bash
ssh root@YOUR_SERVER_IP

# Проверка PM2 процессов
pm2 status

# Должно показать:
# nextjs-frontend - online
# express-backend - online

# Проверка портов
netstat -tlnp | grep -E '5437|5438'

# Логи
pm2 logs --lines 50
```

**В браузере:**
```
https://seainvaders.fun
https://seainvaders.fun/health
```

---

## ✅ Шаг 7: Настройка Cloudflare

Перейдите в Cloudflare Dashboard для домена seainvaders.fun:

### 7.1. DNS записи
- Type: **A**, Name: **@**, Value: **YOUR_SERVER_IP**, Proxy: **✅ Включен** (оранжевое облако)
- Type: **A**, Name: **www**, Value: **YOUR_SERVER_IP**, Proxy: **✅ Включен**

### 7.2. SSL/TLS настройки
- SSL/TLS encryption mode: **Flexible**
- Always Use HTTPS: **On**
- Automatic HTTPS Rewrites: **On**

---

## 🔄 Автоматический деплой

После настройки каждый `git push origin main` будет:
1. Собирать Next.js приложение
2. Создавать .env файлы из GitHub Secrets
3. Деплоить на VPS через SSH
4. Перезапускать PM2 процессы
5. Делать health check

---

## 📊 Мониторинг

### PM2 команды
```bash
pm2 status              # Статус процессов
pm2 logs                # Все логи
pm2 logs nextjs-frontend    # Логи frontend
pm2 logs express-backend    # Логи backend
pm2 monit               # Интерактивный мониторинг
pm2 restart all         # Перезапуск всех процессов
```

### Логи Nginx
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🆘 Откат к предыдущей версии

```bash
cd /var/www/base-invaders
pm2 stop all

# Найти последний бэкап
ls -lht ../backup-*.tar.gz | head -5

# Восстановить (замените на имя нужного бэкапа)
tar -xzf ../backup-20260126-210000.tar.gz

pm2 restart all
```

---

## ✅ Чек-лист готовности

### Сервер
- [ ] Node.js 20.x установлен (`node --version`)
- [ ] PM2 установлен глобально (`pm2 --version`)
- [ ] PostgreSQL 16 установлен (`psql --version`)
- [ ] База данных создана
- [ ] Nginx настроен и запущен
- [ ] SSH ключ добавлен

### GitHub
- [ ] Все 20 GitHub Secrets настроены
- [ ] SSH_PRIVATE_KEY добавлен (весь ключ целиком)
- [ ] Repository имеет доступ к Actions

### Cloudflare
- [ ] DNS A записи настроены
- [ ] Proxy включен (оранжевое облако)
- [ ] SSL/TLS Flexible mode включен
- [ ] Always Use HTTPS включен

### Первый деплой
- [ ] git push выполнен
- [ ] GitHub Actions workflow завершился успешно
- [ ] PM2 показывает 2 процесса online
- [ ] https://seainvaders.fun открывается
- [ ] https://seainvaders.fun/health возвращает OK

---

## 📝 Полезные ссылки

- GitHub Actions: https://github.com/vi11abajo/base.invaders/actions
- План деплоя: ~\.claude\plans\zesty-marinating-scroll.md
