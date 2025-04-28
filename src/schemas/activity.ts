import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
	int,
	mysqlTable,
	serial,
	timestamp,
	varchar,
} from 'drizzle-orm/mysql-core';
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-typebox';
import { User } from './user';

export const Activity = mysqlTable('activity', {
	id: serial().primaryKey(),
	type: varchar('type', { length: 255 }),
	start: timestamp(),
	end: timestamp(),
	duration: int(),
	userId: int('user_id')
		.notNull()
		.references(() => User.id),
});

export type ActivityType = InferSelectModel<typeof Activity>;
export type ActivityTypeIn = InferInsertModel<typeof Activity>;
export const ActivitySelSchema = createSelectSchema(Activity);
export const ActivityInSchema = createInsertSchema(Activity);
export const ActivityUpSchema = createUpdateSchema(Activity);
