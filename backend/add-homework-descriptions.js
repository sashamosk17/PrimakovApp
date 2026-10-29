/**
 * Script to add homework descriptions to existing lessons
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function updateHomeworkDescriptions() {
  const client = await pool.connect();

  try {
    console.log('Updating homework descriptions...');

    const updates = [
      { subject: 'Математика', description: 'Решить задачи №15-20 из учебника, повторить формулы' },
      { subject: 'Литература', description: 'Прочитать главу 5, написать краткий конспект' },
      { subject: 'Английский язык', description: 'Выучить неправильные глаголы (стр. 45), упражнение 3' },
      { subject: 'История', description: 'Подготовить доклад о Великой Отечественной войне' },
      { subject: 'Физика', description: 'Решить задачи на законы Ньютона (№10-15)' },
      { subject: 'Химия', description: 'Написать уравнения реакций, выучить таблицу растворимости' },
      { subject: 'География', description: 'Подготовить презентацию о климате России' },
      { subject: 'Информатика', description: 'Написать программу для сортировки массива' },
    ];

    for (const update of updates) {
      const result = await client.query(
        `UPDATE lessons
         SET homework_description = $1
         WHERE subject = $2 AND has_homework = true`,
        [update.description, update.subject]
      );
      console.log(`✓ Updated ${result.rowCount} lessons for ${update.subject}`);
    }

    console.log('\n✅ All homework descriptions updated successfully!');
  } catch (error) {
    console.error('❌ Error updating homework descriptions:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateHomeworkDescriptions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
