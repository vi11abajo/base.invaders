#!/bin/bash
# Скрипт для автоматической настройки сервера
# Запустить на сервере: bash server-setup.sh

set -e

echo "=== Установка Node.js 20.x ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version

echo "=== Установка PM2 ==="
npm install -g pm2
echo "PM2 установлен. Выполните команду ниже для автозапуска:"
pm2 startup systemd

echo "=== Установка PostgreSQL 16 ==="
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update
apt install -y postgresql-16 postgresql-contrib-16
systemctl enable postgresql
systemctl start postgresql

echo "=== Настройка firewall ==="
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable
ufw status

echo ""
echo "========================================="
echo "✅ Базовая настройка сервера завершена!"
echo "========================================="
echo ""
echo "Следующие шаги:"
echo "1. Выполните команду pm2 startup, которая была показана выше"
echo "2. Создайте базу данных: sudo -u postgres psql"
echo "3. Добавьте SSH ключ в /root/.ssh/authorized_keys"
echo "4. Настройте Nginx конфигурацию"
