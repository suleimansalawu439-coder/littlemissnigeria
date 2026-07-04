import { Pool } from 'pg';
import 'dotenv/config';

async function fix() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('Connecting to DB via pooler...');
    
    // Check if slug exists
    const check = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Contestant' and column_name='slug';
    `);
    
    if (check.rows.length === 0) {
      console.log('Adding slug column to Contestant table...');
      await pool.query(`ALTER TABLE "Contestant" ADD COLUMN "slug" TEXT UNIQUE;`);
      console.log('Slug column added successfully!');
    } else {
      console.log('Slug column already exists.');
    }
  } catch (err) {
    console.error('Error fixing DB:', err);
  } finally {
    await pool.end();
  }
}

fix();
