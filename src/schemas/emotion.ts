import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { int, mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core';
import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-typebox';
import timestamps from './columns.helpers';
import { User } from './user';

export const Emotion = mysqlTable('emotion', {
	id: int().primaryKey().autoincrement(),
	name: varchar('name', { length: 255 }),
	color: varchar('color', { length: 255 }),
	uri: varchar('uri', { length: 255 }),
	userId: int('user_id')
		.notNull()
		.references(() => User.id),
	...timestamps,
});

export type EmotionType = InferSelectModel<typeof Emotion>;
export type EmotionTypeIn = InferInsertModel<typeof Emotion>;
export const EmotionSelSchema = createSelectSchema(Emotion);
export const EmotionInSchema = createInsertSchema(Emotion);
export const EmotionUpSchema = createUpdateSchema(Emotion);
