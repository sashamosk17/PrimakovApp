const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: process.env.DB_PASSWORD || 'primakoVV'
});

async function checkUser() {
  try {
    const res = await pool.query("SELECT id, email, password_hash, is_active, deleted_at FROM users WHERE lower(email)='ivan.petrov@primakov.school'");
    if (res.rows.length === 0) {
      console.log('Пользователь не найден в БД');
    } else {
      const user = res.rows[0];
      console.log('--- ДАННЫЕ ПОЛЬЗОВАТЕЛЯ ---');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('is_active:', user.is_active);
      console.log('deleted_at:', user.deleted_at);
      console.log('Hash в БД:', user.password_hash);
      
      const match = await bcrypt.compare('password123', user.password_hash);
      console.log('--- ПРОВЕРКА ПАРОЛЯ ---');
      console.log('Подходит ли "password123"?', match ? '✅ ДА' : '❌ НЕТ');
      
      if (!match) {
        const newHash = await bcrypt.hash('password123', 10);
        console.log('\nЕсли нужно починить, вот правильный хэш для password123:', newHash);
        
        // Давайте сразу обновим
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, user.id]);
        console.log('✅ Пароль успешно сброшен на password123 в базе!');
      }
    }
  } catch (e) {
    console.error('Ошибка:', e.message);
  } finally {
    await pool.end();
  }
}

checkUser();