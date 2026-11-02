-- Migration 025: Add User Profile Fields (Birth Date, Phone, Telegram)
-- For Primakov Gymnasium students, teachers, and staff

ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram VARCHAR(100);

-- Update Teachers with realistic contact details and birth dates
UPDATE users 
SET 
  birth_date = '1982-03-14',
  phone = '+7 (916) 234-56-01',
  telegram = '@elena_sokolova_math'
WHERE email = 'elena.sokolova@primakov.school';

UPDATE users 
SET 
  birth_date = '1978-11-20',
  phone = '+7 (916) 234-56-02',
  telegram = '@mikhail_vinogradov_math'
WHERE email = 'mikhail.vinogradov@primakov.school';

UPDATE users 
SET 
  birth_date = '1985-06-08',
  phone = '+7 (916) 234-56-03',
  telegram = '@olga_kuznetsova_math'
WHERE email = 'olga.kuznetsova@primakov.school';

UPDATE users 
SET 
  birth_date = '1980-09-17',
  phone = '+7 (916) 234-56-04',
  telegram = '@sergey_polyakov_math'
WHERE email = 'sergey.polyakov@primakov.school';

UPDATE users 
SET 
  birth_date = '1987-01-25',
  phone = '+7 (916) 234-56-05',
  telegram = '@tatiana_voronina_math'
WHERE email = 'tatiana.voronina@primakov.school';

UPDATE users 
SET 
  birth_date = '1983-04-12',
  phone = '+7 (916) 345-67-01',
  telegram = '@anna_kovaleva_lit'
WHERE email = 'anna.kovaleva@primakov.school';

UPDATE users 
SET 
  birth_date = '1975-12-03',
  phone = '+7 (916) 345-67-02',
  telegram = '@victor_sidorov_lit'
WHERE email = 'victor.sidorov@primakov.school';

UPDATE users 
SET 
  birth_date = '1989-08-19',
  phone = '+7 (916) 345-67-03',
  telegram = '@natalia_belova_lit'
WHERE email = 'natalia.belova@primakov.school';

UPDATE users 
SET 
  birth_date = '1981-02-28',
  phone = '+7 (916) 456-78-01',
  telegram = '@dmitriy_smirnov_science'
WHERE email = 'dmitriy.smirnov@primakov.school';

UPDATE users 
SET 
  birth_date = '1986-07-15',
  phone = '+7 (916) 456-78-02',
  telegram = '@irina_vasilieva_bio'
WHERE email = 'irina.vasilieva@primakov.school';

UPDATE users 
SET 
  birth_date = '1984-10-30',
  phone = '+7 (916) 567-89-01',
  telegram = '@yulia_morozova_eng'
WHERE email = 'yulia.morozova@primakov.school';

UPDATE users 
SET 
  birth_date = '1990-05-22',
  phone = '+7 (916) 567-89-03',
  telegram = '@elizabeth_clark_ib'
WHERE email = 'elizabeth.clark@primakov.school';

UPDATE users 
SET 
  birth_date = '1988-09-04',
  phone = '+7 (916) 678-90-01',
  telegram = '@ivan_ivanov_it'
WHERE email = 'ivan.ivanov@primakov.school';

UPDATE users 
SET 
  birth_date = '1992-11-16',
  phone = '+7 (916) 678-90-02',
  telegram = '@gleb_nikolaev_robotics'
WHERE email = 'gleb.nikolaev@primakov.school';

UPDATE users 
SET 
  birth_date = '1979-08-27',
  phone = '+7 (916) 789-01-01',
  telegram = '@vadim_stepanov_sport'
WHERE email = 'vadim.stepanov@primakov.school';

-- Update Students across classes with birth dates matching their grade
-- 10-А & 10-Б (Born ~2010)
UPDATE users 
SET 
  birth_date = '2010-04-15',
  phone = '+7 (999) 101-20-01',
  telegram = '@artem_smirnov_10a'
WHERE email = 'artem.smirnov.10a@primakov.school';

UPDATE users 
SET 
  birth_date = '2010-08-22',
  phone = '+7 (999) 101-20-02',
  telegram = '@sofia_kuznetsova_10a'
WHERE email = 'sofia.kuznetsova.10a@primakov.school';

UPDATE users 
SET 
  birth_date = '2010-11-05',
  phone = '+7 (999) 101-20-03',
  telegram = '@maksim_vasiliev_10a'
WHERE email = 'maksim.vasiliev.10a@primakov.school';

UPDATE users 
SET 
  birth_date = '2010-01-18',
  phone = '+7 (999) 102-20-01',
  telegram = '@danil_fedorov_10b'
WHERE email = 'danil.fedorov.10b@primakov.school';

-- 11-А & 11-Б (Born ~2009)
UPDATE users 
SET 
  birth_date = '2009-05-10',
  phone = '+7 (999) 111-20-01',
  telegram = '@alexander_popov_11a'
WHERE email = 'alexander.popov.11a@primakov.school';

UPDATE users 
SET 
  birth_date = '2009-09-30',
  phone = '+7 (999) 112-20-01',
  telegram = '@dmitriy_novikov_11b'
WHERE email = 'dmitriy.novikov.11b@primakov.school';

-- Default fallback generator for other students/teachers without explicit profile details
UPDATE users
SET 
  birth_date = CASE 
    WHEN role = 'TEACHER' THEN '1985-09-01'::DATE
    WHEN group_name LIKE '1-%' THEN '2019-04-12'::DATE
    WHEN group_name LIKE '2-%' THEN '2018-05-15'::DATE
    WHEN group_name LIKE '4-%' THEN '2016-03-20'::DATE
    WHEN group_name LIKE '5-%' THEN '2015-07-08'::DATE
    WHEN group_name LIKE '6-%' THEN '2014-09-14'::DATE
    WHEN group_name LIKE '7-%' THEN '2013-11-02'::DATE
    WHEN group_name LIKE '8-%' THEN '2012-01-24'::DATE
    WHEN group_name LIKE '9-%' THEN '2011-06-18'::DATE
    WHEN group_name LIKE '10-%' THEN '2010-10-10'::DATE
    WHEN group_name LIKE '11-%' THEN '2009-12-05'::DATE
    ELSE '2010-01-01'::DATE
  END,
  phone = COALESCE(phone, '+7 (999) 000-' || LPAD((FLOOR(RANDOM() * 90 + 10))::TEXT, 2, '0') || '-' || LPAD((FLOOR(RANDOM() * 90 + 10))::TEXT, 2, '0')),
  telegram = COALESCE(telegram, '@' || LOWER(SPLIT_PART(email, '@', 1)))
WHERE birth_date IS NULL;

