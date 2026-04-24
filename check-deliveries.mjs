import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_1mK2dqolLWwB@ep-calm-dust-agmgn51v-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require');

async function check() {
    console.log("Checking DB deliveries...");
    try {
        const deliveries = await sql`
      SELECT status, notification_type, entity_id, error_message, sent_at, created_at 
      FROM notification_deliveries 
      ORDER BY created_at DESC 
      LIMIT 3;
    `;
        console.log("LATEST DELIVERIES:", JSON.stringify(deliveries, null, 2));

        const devices = await sql`
      SELECT id, user_id, platform, notifications_enabled, invalidated_at, created_at 
      FROM user_devices 
      ORDER BY created_at DESC 
      LIMIT 1;
    `;
        console.log("LATEST DEVICES:", JSON.stringify(devices, null, 2));

    } catch (err) {
        console.error("DB Query Error:", err);
    }
}
check();
