import { Pool } from 'pg';

// Создаем connection pool для PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Настройки для production
  max: 20, // Максимум 20 соединений в пуле
  idleTimeoutMillis: 30000, // Закрыть неактивное соединение через 30 сек
  connectionTimeoutMillis: 2000, // Timeout подключения 2 сек
});

// Проверка подключения при старте
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

export default pool;
