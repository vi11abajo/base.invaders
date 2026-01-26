# 🚀 Быстрый старт: Деплой на VPS за 30 минут

## Что вы получите
- ✅ Production-ready Next.js приложение на вашем VPS
- ✅ Автоматический деплой при `git push` (как на Vercel)
- ✅ PM2 процесс-менеджер с автоперезапуском
- ✅ PostgreSQL база данных
- ✅ Nginx reverse proxy
- ✅ SSL через Cloudflare

## Требования
- VPS сервер с Ubuntu 20.04+ (у вас: root@YOUR_SERVER_IP)
- Домен в Cloudflare (у вас: seainvaders.fun)
- 30 минут времени

---

## Шаг 1: Генерация секретов (локально) - 2 минуты

```bash
cd ~\PycharmProjects\base-invaders
bash generate-secrets.sh
```

Сохраните сгенерированные значения! Они понадобятся позже.

---

## Шаг 2: Настройка сервера - 10 минут

```bash
# Подключитесь к серверу
ssh root@YOUR_SERVER_IP

# Скачайте и запустите скрипт установки
cd ~
wget https://raw.githubusercontent.com/vi11abajo/base.invaders/main/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

После завершения скрипта:
1. Выполните команду `pm2 startup`, которую показал PM2
2. Продолжайте к Шагу 3

---

## Шаг 3: База данных - 3 минуты

```bash
# На сервере
cd /tmp
wget https://raw.githubusercontent.com/vi11abajo/base.invaders/main/setup-database.sql
nano setup-database.sql
# Замените YOUR_STRONG_PASSWORD на пароль из Шага 1 (DB_PASSWORD)

sudo -u postgres psql -f setup-database.sql
```

---

## Шаг 4: Nginx - 2 минуты

```bash
# На сервере
wget https://raw.githubusercontent.com/vi11abajo/base.invaders/main/nginx-seainvaders.conf
cp nginx-seainvaders.conf /etc/nginx/sites-available/seainvaders.fun
ln -s /etc/nginx/sites-available/seainvaders.fun /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## Шаг 5: SSH ключ - 1 минута

```bash
# На сервере
mkdir -p /root/.ssh
echo "ssh-ed25519 REDACTED-DEPLOY-PUBLIC-KEY github-actions-deploy" >> /root/.ssh/authorized_keys
chmod 700 /root/.ssh
chmod 600 /root/.ssh/authorized_keys
```

Проверка (на локальной машине):
```bash
ssh -i ~\.ssh\github_deploy_key root@YOUR_SERVER_IP "echo 'OK'"
```

---

## Шаг 6: GitHub Secrets - 10 минут

Откройте: https://github.com/vi11abajo/base.invaders/settings/secrets/actions

Создайте 20 секретов (используйте значения из Шага 1):

### Критически важные (обязательно заполните!)
- `SSH_PRIVATE_KEY` - содержимое файла `~\.ssh\github_deploy_key`
- `SSH_HOST` - `YOUR_SERVER_IP`
- `SSH_USER` - `root`
- `SSH_PORT` - `22`
- `JWT_SECRET` - из Шага 1
- `DB_PASSWORD` - из Шага 1

### Frontend (замените на ваши значения)
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`
- `NEXT_PUBLIC_URL` - `https://seainvaders.fun`
- `NEXT_PUBLIC_BASE_RPC_URL` - `https://mainnet.base.org`
- `NEXT_PUBLIC_CHAIN_ID` - `8453`
- `NEXT_PUBLIC_GAME_STARTER_ADDRESS`

### Backend (замените на ваши значения)
- `DB_HOST` - `localhost`
- `DB_PORT` - `5432`
- `DB_NAME` - `base_invaders`
- `DB_USER` - `base_invaders_user`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI` - `https://seainvaders.fun/api/auth/discord/callback`
- `FRONTEND_URL` - `https://seainvaders.fun`
- `NODE_ENV` - `production`
- `BACKEND_PORT` - `5438`

---

## Шаг 7: Cloudflare DNS - 2 минуты

Откройте Cloudflare Dashboard для seainvaders.fun:

1. **DNS Records**:
   - `A` @ → YOUR_SERVER_IP (Proxy: ON ☁️)
   - `A` www → YOUR_SERVER_IP (Proxy: ON ☁️)

2. **SSL/TLS**:
   - Mode: Flexible
   - Always Use HTTPS: ON

---

## Шаг 8: Первый деплой - 3 минуты

```bash
# На сервере создайте директорию
ssh root@YOUR_SERVER_IP "mkdir -p /var/www"

# На локальной машине запустите деплой
cd ~\PycharmProjects\base-invaders
git push origin main
```

Следите за деплоем: https://github.com/vi11abajo/base.invaders/actions

---

## ✅ Проверка

После успешного деплоя (2-3 минуты):

**В браузере:**
- https://seainvaders.fun - должна открыться игра
- https://seainvaders.fun/health - должен вернуть OK

**На сервере:**
```bash
ssh root@YOUR_SERVER_IP
pm2 status
# Должно показать: nextjs-frontend и express-backend в статусе "online"
```

---

## 🎉 Готово!

Теперь при каждом `git push origin main` ваше приложение будет автоматически деплоиться на VPS!

---

## 🆘 Помощь

- **Детальная инструкция:** [VPS-DEPLOYMENT.md](./VPS-DEPLOYMENT.md)
- **Полный план:** `~\.claude\plans\zesty-marinating-scroll.md`
- **Логи PM2:** `ssh root@YOUR_SERVER_IP "pm2 logs"`
- **Логи Nginx:** `ssh root@YOUR_SERVER_IP "tail -f /var/log/nginx/error.log"`

## 📊 Мониторинг

```bash
# Статус сервисов
pm2 status

# Логи
pm2 logs

# Перезапуск
pm2 restart all
```
