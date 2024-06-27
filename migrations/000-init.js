import { sql } from './db';

const main = async () => {
	await sql(`CREATE TABLE IF NOT EXISTS reg(
        rid SERIAL PRIMARY KEY,
        placements jsonb NOT NULL,
        city text NOT NULL,

        years INT NOT NULL,
        CONSTRAINT years CHECK (years >= 0),

        collab boolean NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
};

main();
