const { Pool } = require('pg');

// 환경 변수를 사용하여 DB 연결 설정
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // [선택 사항] 연결 풀 크기 설정 (기본값은 10)
    max: 20, 
    idleTimeoutMillis: 30000, 
    connectionTimeoutMillis: 2000,
});

// 연결 테스트 (선택 사항)
pool.on('connect', () => {
  console.log('✅ PostgreSQL pool connected successfully.');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});


module.exports = pool; 