import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function createAdmin() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log('Checking for admin user...');
    const result = await pool.query(`SELECT * FROM "AdminUser" WHERE email = 'admin@voting.com'`);
    if (result.rows.length === 0) {
      console.log('Admin user not found. Creating one...');
      const passwordHash = await bcrypt.hash('password123', 10);
      
      // UUID generation using pgcrypto or we can just use crypto module
      const crypto = require('crypto');
      const id = crypto.randomUUID();
      
      await pool.query(
        `INSERT INTO "AdminUser" (id, email, "passwordHash", name, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [id, 'admin@voting.com', passwordHash, 'Super Admin']
      );
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user already exists!');
      // Update password just in case
      console.log('Updating password to password123...');
      const passwordHash = await bcrypt.hash('password123', 10);
      await pool.query(
        `UPDATE "AdminUser" SET "passwordHash" = $1 WHERE email = 'admin@voting.com'`,
        [passwordHash]
      );
      console.log('Password updated successfully!');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

createAdmin();
