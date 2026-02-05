const { Client } = require('pg');

exports.handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const payload = JSON.parse(event.body);
    const type = payload.type; // 'agenda_add', 'agenda_delete', 'payment_update'

    // FALLBACK CREDENTIALS (PROVIDED BY USER)
    const DB_URL = "postgres://neondb_owner:npg_cVKjp5F9uPSX@ep-noisy-star-ajm5x9kk-pooler.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require";

    const client = new Client({
        connectionString: process.env.DATABASE_URL || DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        if (type === 'agenda_add') {
            const { id, text, date, time } = payload.data;
            await client.query(
                `INSERT INTO agenda (id, text, date, time) VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING`,
                [id, text, date || null, time || null]
            );
        }
        else if (type === 'agenda_delete') {
            const { id } = payload.data;
            await client.query('DELETE FROM agenda WHERE id = $1', [id]);
        }
        else if (type === 'payment_update') {
            const { key, data } = payload.data; // key="2024-1", data={0:true, 1:false...}
            await client.query(
                `INSERT INTO payments (month_key, data) VALUES ($1, $2)
             ON CONFLICT (month_key) DO UPDATE SET data = $2`,
                [key, JSON.stringify(data)]
            );
        }

        await client.end();
        return { statusCode: 200, body: JSON.stringify({ success: true }) };

    } catch (error) {
        console.error('DB Error:', error);
        await client.end();
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
