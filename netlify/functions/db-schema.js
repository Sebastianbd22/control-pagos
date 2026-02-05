const { Client } = require('pg');

exports.handler = async (event, context) => {
  // FALLBACK CREDENTIALS (PROVIDED BY USER)
  const DB_URL = "postgres://neondb_owner:npg_cVKjp5F9uPSX@ep-noisy-star-ajm5x9kk-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require";

  const client = new Client({
    connectionString: process.env.DATABASE_URL || DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Create Agenda Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS agenda (
        id BIGINT PRIMARY KEY,
        text TEXT NOT NULL,
        date DATE,
        time TIME,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create Payments Table (Simple key-value store for monthly checkboxes)
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        month_key VARCHAR(20) PRIMARY KEY,
        data JSONB
      );
    `);

    await client.end();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Tables created successfully" })
    };
  } catch (error) {
    console.error('DB Error:', error);
    await client.end();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
