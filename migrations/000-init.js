import { sql } from './db';

const main = async () => {
	await sql(`CREATE TABLE IF NOT EXISTS reg(
        rid SERIAL PRIMARY KEY,
        placements jsonb NOT NULL,
        city_live text NOT NULL,
        city_work text NOT NULL,
        city_visit text NOT NULL,
        city_avoid text NOT NULL,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
};

main();
