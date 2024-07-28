import { sql } from './db.js';

const main = async () => {
	await sql`CREATE TABLE IF NOT EXISTS placements (
        rid integer NOT NULL,
        name text NOT NULL,
        location geometry(Polygon) NOT NULL,
        PRIMARY KEY (rid, name),
        CONSTRAINT fk_submissions
            FOREIGN KEY (rid) 
            REFERENCES submissions(rid) 
            ON DELETE CASCADE
    )`;
};

main();
