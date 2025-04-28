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

export const ActSession = mysqlTable('act_session', {
	id: serial().primaryKey(),
	device: varchar('device', { length: 255 }),
	start: timestamp(),
	end: timestamp(),
	duration: int(),
	userId: int('user_id')
		.notNull()
		.references(() => User.id),
});

export type ActSessionType = InferSelectModel<typeof ActSession>;
export type ActSessionTypeIn = InferInsertModel<typeof ActSession>;
export const ActSessionSelSchema = createSelectSchema(ActSession);
export const ActSessionInSchema = createInsertSchema(ActSession);
export const ActSessionUpSchema = createUpdateSchema(ActSession);
