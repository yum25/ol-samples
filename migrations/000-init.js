import { sql } from './db';

const main = async () => {
	await sql(`CREATE TABLE IF NOT EXISTS reg(
        rid SERIAL PRIMARY KEY,
        placements geometry(Polygon)[] NOT NULL
        )`);
};

main();
