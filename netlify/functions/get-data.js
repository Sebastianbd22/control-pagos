const { Client } = require('pg');

exports.handler = async (event, context) => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Fetch Agenda
        const agendaRes = await client.query('SELECT * FROM agenda ORDER BY created_at DESC');
        const agenda = agendaRes.rows.map(row => ({
            id: parseInt(row.id), // Ensure BIGINT is number
            text: row.text,
            date: row.date ? row.date.toISOString().split('T')[0] : null,
            time: row.time,
            created: new Date(row.created_at).toLocaleDateString()
        }));

        // Fetch Payments
        const payRes = await client.query('SELECT * FROM payments');
        const payments = {};
        payRes.rows.forEach(row => {
            payments[row.month_key] = row.data;
        });

        await client.end();

        return {
            statusCode: 200,
            body: JSON.stringify({ agenda, payments })
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
