import { eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import db from '../config/db';
import {
	Emotion,
	EmotionInSchema,
	EmotionSelSchema,
	EmotionUpSchema,
} from '../schemas/emotion';
import {
	itsAdmin,
	validateSessionToken,
	validateSessionTokenFull,
} from '../utils/auth';
import { messageSchema } from '../utils/schemas';

const emotionRouter = new Elysia({
	prefix: '/emotions',
	detail: {
		tags: ['Emotions'],
	},
});

emotionRouter.get(
	'/',
	async ({ headers: { auth }, error }) => {
		const isadmin = await itsAdmin(auth);
		if (!isadmin) {
			return error(401, { message: 'No autorizado' });
		}
		return await db.select().from(Emotion);
	},
	{
		headers: t.Object({
			auth: t.String(),
		}),
		response: {
			200: t.Array(EmotionSelSchema),
			401: messageSchema,
		},
	},
);

emotionRouter.get(
	'/:id',
	async ({ headers: { auth }, params: { id }, error }) => {
		const { user } = await validateSessionToken(auth);
		if (!user) {
			return error(401, { message: 'No autorizado' });
		}
		const data = await db.select().from(Emotion).where(eq(Emotion.id, id));
		if (data.length < 1) {
			return error(404, {
				message: 'Not found',
			});
		}
		return data[0];
	},
	{
		headers: t.Object({
			auth: t.String(),
		}),
		params: t.Object({ id: t.Integer() }),
		response: {
			200: EmotionSelSchema,
			404: messageSchema,
			401: messageSchema,
			403: messageSchema,
		},
	},
);

emotionRouter.post(
	'/',
	async ({ body, set }) => {
		set.status = 201;
		await db.insert(Emotion).values(body);
		return {
			message: 'success',
		};
	},
	{
		body: EmotionInSchema,
		response: {
			201: messageSchema,
		},
	},
);

emotionRouter.put(
	'/:id',
	async ({ headers: { auth }, params: { id }, body, error }) => {
		const { user } = await validateSessionToken(auth);
		if (!user) {
			return error(401, { message: 'No autorizado' });
		}
		await db.update(Emotion).set(body).where(eq(Emotion.id, id));
		return {
			message: 'success',
		};
	},
	{
		headers: t.Object({
			auth: t.String(),
		}),
		params: t.Object({ id: t.Integer() }),
		body: EmotionUpSchema,
		response: {
			200: messageSchema,
			401: messageSchema,
			403: messageSchema,
		},
	},
);

emotionRouter.delete(
	'/:id',
	async ({ headers: { auth }, params: { id }, body, error }) => {
		const { user } = await validateSessionTokenFull(auth);
		if (!user) {
			return error(401, { message: 'No autorizado' });
		}
		await db.delete(Emotion).where(eq(Emotion.id, id));
		return { message: 'Emotion deleted' };
	},
	{
		headers: t.Object({
			auth: t.String(),
		}),
		params: t.Object({ id: t.Integer() }),
		response: {
			200: messageSchema,
			401: messageSchema,
			403: messageSchema,
		},
	},
);

export default emotionRouter;
