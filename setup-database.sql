-- Скрипт для настройки PostgreSQL базы данных
-- Запустить: sudo -u postgres psql -f setup-database.sql

-- ВАЖНО: Замените YOUR_STRONG_PASSWORD на реальный пароль!

CREATE USER base_invaders_user WITH PASSWORD 'YOUR_STRONG_PASSWORD';
CREATE DATABASE base_invaders OWNER base_invaders_user;
GRANT ALL PRIVILEGES ON DATABASE base_invaders TO base_invaders_user;

-- Подключаемся к базе для настройки прав
\c base_invaders

GRANT ALL ON SCHEMA public TO base_invaders_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO base_invaders_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO base_invaders_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO base_invaders_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO base_invaders_user;

\echo 'База данных base_invaders создана успешно!'
\echo 'Пользователь: base_invaders_user'
\echo 'ВАЖНО: Сохраните пароль в безопасное место!'
