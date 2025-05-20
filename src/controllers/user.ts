import path from 'node:path';
import { and, eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import db from '../config/db';
import { Emotion, EmotionInSchema, EmotionSelSchema } from '../schemas/emotion';
import {
	User,
	UserInSchema,
	UserSelSchema,
	UserUpSchema,
} from '../schemas/user';
import {
	createSession,
	invalidateAllSessions,
	invalidateSession,
	itsAdmin,
	validateSessionToken,
	validateSessionTokenFull,
} from '../utils/auth';
import { messageSchema } from '../utils/schemas';

const userRouter = new Elysia({
	prefix: '/users',
	detail: {
		tags: ['Users'],
	},
});

userRouter.get(
	'/',
	async ({ headers: { auth }, error }) => {
		const isadmin = await itsAdmin(auth);
		if (!isadmin) {
			return error(401, { message: 'No autorizado' });
		}
		return await db.select().from(User);
	},
	{
		headers: t.Object({
			auth: t.String(),
		}),
		response: {
			200: t.Array(UserSelSchema),
			401: messageSchema,
		},
	},
);

userRouter.get(
	'/profile',
	async ({ headers: { auth }, error }) => {
		const { user } = await validateSessionTokenFull(auth);
		if (!user) {
			return error(401, { message: 'No autorizado' });
		}
		return user;
	},
	{
		headers: t.Object({
			auth: t.String(),
		}),
		response: {
			200: UserSelSchema,
			401: messageSchema,
		},
	},
);

userRouter.get(
	'/:id',
	async ({ headers: { auth }, params: { id }, error }) => {
		const { user } = await validateSessionToken(auth);
		if (!user) {
			return error(401, { message: 'No autorizado' });
		}
		if (id !== user.id && user.type !== 'Admin') {
			return error(403, {
				message: 'No tiene permisos',
			});
		}
		const data = await db.select().from(User).where(eq(User.id, id));
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
			200: UserSelSchema,
			404: messageSchema,
			401: messageSchema,
			403: messageSchema,
		},
	},
);

userRouter.post(
	'/',
	async ({ body, set }) => {
		set.status = 201;
		body.password = await Bun.password.hash(body.password);
		const [user] = await db.insert(User).values(body).$returningId();
		const [data] = await db.select().from(User).where(eq(User.id, user.id));
		const session = await createSession(user.id);
		return {
			user: data,
			token: session.id,
		};
	},
	{
		body: UserInSchema,
		response: {
			201: t.Object({
				user: UserSelSchema,
				token: t.String(),
			}),
		},
	},
);

userRouter.post(
	'/login',
	async ({ body, error }) => {
		const data = await db.select().from(User).where(eq(User.email, body.email));
		if (data.length === 0) {
			return error(400, {
				message: 'Email incorrecto',
			});
		}
		const user = data[0];
		const passMatch = await Bun.password.verify(body.password, user.password);
		if (!passMatch) {
			return error(401, {
				message: 'Password incorrecta',
			});
		}
		const session = await createSession(user.id);
		return {
			user,
			token: session.id,
		};
	},
	{
		body: t.Object({
			email: t.String({ format: 'email' }),
			password: t.String(),
		}),
		response: {
			200: t.Object({
				user: UserSelSchema,
				token: t.String(),
			}),
			400: messageSchema,
			401: messageSchema,
		},
	},
);

userRouter.post(
	'/logout',
	async ({ headers: { auth }, error }) => {
		await invalidateSession(auth);
		return {
			message: 'success',
		};
	},
	{
		headers: t.Object({
			auth: t.String(),
		}),
		response: {
			200: messageSchema,
		},
	},
);

userRouter.post(
	'/unauth/:id',
	async ({ headers: { auth }, params: { id }, error }) => {
		const isadmin = await itsAdmin(auth);
		if (!isadmin) {
			return error(401, { message: 'No autorizado' });
		}
		await invalidateAllSessions(id);
		return {
			message: 'success',
		};
	},
	{
		headers: t.Object({
			auth: t.String(),
		}),
		params: t.Object({ id: t.Integer() }),
		response: {
			200: messageSchema,
			401: messageSchema,
		},
	},
);

userRouter.post(
	'/emotions',
	async ({ headers: { auth }, body, set, error }) => {
		const { user } = await validateSessionToken(auth);
		if (!user) {
			return error(401, { message: 'No autorizado' });
		}
		set.status = 201;
		await db.insert(Emotion).values(body);
		return {
			message: 'success',
		};
	},
	{
		headers: t.Object({
			auth: t.String(),
		}),
		body: EmotionInSchema,
		response: {
			201: messageSchema,
			401: messageSchema,
		},
	},
);

userRouter.get(
	'/emotions/:id',
	async ({ headers: { auth }, params: { id }, error }) => {
		const { user } = await validateSessionToken(auth);
		if (!user) {
			return error(401, { message: 'No autorizado' });
		}
		return await db.select().from(Emotion).where(eq(Emotion.userId, id));
	},
	{
		headers: t.Object({
			auth: t.String(),
		}),
		params: t.Object({ id: t.Integer() }),
		response: {
			200: t.Array(EmotionSelSchema),
			401: messageSchema,
		},
	},
);

userRouter.delete(
	'/emotions/:id',
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

userRouter.put(
	'/:id',
	async ({ headers: { auth }, params: { id }, body, error }) => {
		const { user } = await validateSessionToken(auth);
		if (!user) {
			return error(401, { message: 'No autorizado' });
		}
		if (id !== user.id && user.type !== 'Admin') {
			return error(403, {
				message: 'No tiene permisos',
			});
		}
		if (body.password) {
			body.password = await Bun.password.hash(body.password);
		}
		await db
			.update(User)
			.set({ updatedAt: new Date(), ...body })
			.where(eq(User.id, id));
		return {
			message: 'success',
		};
	},
	{
		headers: t.Object({
			auth: t.String(),
		}),
		params: t.Object({ id: t.Integer() }),
		body: UserUpSchema,
		response: {
			200: messageSchema,
			401: messageSchema,
			403: messageSchema,
		},
	},
);

userRouter.delete(
	'/:id',
	async ({ headers: { auth }, params: { id }, body, error }) => {
		const { user } = await validateSessionTokenFull(auth);
		if (!user) {
			return error(401, { message: 'No autorizado' });
		}
		if (id !== user.id && user.type !== 'Admin') {
			return error(403, {
				message: 'No tiene permisos',
			});
		}
		await db.delete(User).where(eq(User.id, id));
		return { message: 'User deleted' };
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

export default userRouter;
