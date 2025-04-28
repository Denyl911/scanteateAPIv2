import { drizzle } from 'drizzle-orm/mysql2';

const db = drizzle({
	connection: {
		host: process.env.SCANTEATE_DB_HOST,
		database: process.env.SCANTEATE_DB_NAME,
		user: process.env.SCANTEATE_DB_USER,
		password: process.env.SCANTEATE_DB_PASS,
	},
});

export default db;
