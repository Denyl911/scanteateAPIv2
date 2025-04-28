import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './drizzle',
	schema: './src/schemas',
	dialect: 'mysql',
	dbCredentials: {
		host: process.env.SCANTEATE_DB_HOST || '',
		port: 5432,
		database: process.env.SCANTEATE_DB_NAME || '',
		user: process.env.SCANTEATE_DB_USER || '',
		password: process.env.SCANTEATE_DB_PASS || '',
	},
});
