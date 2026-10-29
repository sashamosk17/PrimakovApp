const { Pool } = require('pg');

const pool = new Pool({
  host: '185.221.198.242',
  port: 5432,
  database: 'primakovapp',
  user: 'primakov',
  password: 'primakov',
});

async function seedStories() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get admin user ID
    const adminResult = await client.query(
      "SELECT id FROM users WHERE email = 'admin@primakov.school' LIMIT 1"
    );

    const teacherResult = await client.query(
      "SELECT id FROM users WHERE email = 'teacher.ivanov@primakov.school' LIMIT 1"
    );

    if (adminResult.rows.length === 0 || teacherResult.rows.length === 0) {
      console.error('Admin or teacher user not found!');
      await client.query('ROLLBACK');
      return;
    }

    const adminId = adminResult.rows[0].id;
    const teacherId = teacherResult.rows[0].id;

    console.log('Admin ID:', adminId);
    console.log('Teacher ID:', teacherId);

    // Insert stories
    const stories = [
      {
        id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
        title: 'Новости школы',
        description: 'Сегодня прошло общешкольное собрание. Обсудили планы на следующий месяц.',
        image_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
        author_id: adminId,
      },
      {
        id: 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
        title: 'Спортивные достижения',
        description: 'Наша команда заняла первое место в городских соревнованиях по баскетболу!',
        image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
        author_id: teacherId,
      },
      {
        id: 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
        title: 'Научная конференция',
        description: 'Приглашаем всех на школьную научную конференцию 15 мая.',
        image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800',
        author_id: adminId,
      },
      {
        id: 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a',
        title: 'Экскурсия в музей',
        description: 'В субботу состоится экскурсия в Третьяковскую галерею. Запись у классного руководителя.',
        image_url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800',
        author_id: teacherId,
      },
      {
        id: 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b',
        title: 'День открытых дверей',
        description: 'Приглашаем будущих учеников и их родителей на день открытых дверей 20 мая.',
        image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
        author_id: adminId,
      },
    ];

    for (const story of stories) {
      await client.query(
        `INSERT INTO stories (id, title, description, content, image_url, author_id, expires_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '72 hours', NOW(), NOW())
         ON CONFLICT (id) DO NOTHING`,
        [story.id, story.title, story.description, story.description, story.image_url, story.author_id]
      );
      console.log(`✓ Inserted story: ${story.title}`);
    }

    await client.query('COMMIT');
    console.log('\n✓ All stories seeded successfully!');

    // Verify
    const countResult = await client.query('SELECT COUNT(*) FROM stories');
    console.log(`Total stories in database: ${countResult.rows[0].count}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding stories:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedStories();
