import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
	boolean,
	int,
	mysqlEnum,
	mysqlTable,
	serial,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/mysql-core';
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-typebox';
import timestamps from './columns.helpers';

export const User = mysqlTable('user', {
	id: serial().primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull(),
	password: varchar('password', { length: 255 }).notNull(),
	psicoEmail: varchar('psico-email', { length: 255 }),
	autoReport: boolean().default(true),
	type: mysqlEnum(['User', 'Admin']).default('Admin'),
	...timestamps,
});

export const Session = mysqlTable('session', {
	id: text('id').primaryKey(),
	userId: int('user_id')
		.notNull()
		.references(() => User.id),
	expiresAt: timestamp('expires_at', {
		mode: 'date',
	}).notNull(),
});

export type SessionType = InferSelectModel<typeof Session>;
export type UserType = InferSelectModel<typeof User>;
export type UserTypeIn = InferInsertModel<typeof User>;
export const UserSelSchema = createSelectSchema(User);
export const UserInSchema = createInsertSchema(User);
export const UserUpSchema = createUpdateSchema(User);
