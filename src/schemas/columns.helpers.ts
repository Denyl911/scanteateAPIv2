import { timestamp } from 'drizzle-orm/mysql-core';

const timestamps = {
	updatedAt: timestamp().defaultNow().notNull(),
	createdAt: timestamp().defaultNow().notNull(),
};

export default timestamps;
