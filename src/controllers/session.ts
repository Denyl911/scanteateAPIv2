import { eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import db from '../config/db';
import {
	ActSession,
	ActSessionInSchema,
	ActSessionSelSchema,
	ActSessionUpSchema,
} from '../schemas/actSesison';
import {
	itsAdmin,
	validateSessionToken,
	validateSessionTokenFull,
} from '../utils/auth';
import { messageSchema } from '../utils/schemas';

const sessionRouter = new Elysia({
	prefix: '/sessions',
	detail: {
		tags: ['ActSessions'],
	},
});

sessionRouter.get(
	'/',
	async ({ headers: { auth }, error }) => {
		const isadmin = await itsAdmin(auth);
		if (!isadmin) {
			return error(401, { message: 'No autorizado' });
		}
		return await db.select().from(ActSession);
	},
	{
		headers: t.Object({
			auth: t.String(),
		}),
		response: {
			200: t.Array(ActSessionSelSchema),
			401: messageSchema,
		},
	},
);

sessionRouter.get(
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
		const data = await db
			.select()
			.from(ActSession)
			.where(eq(ActSession.id, id));
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
			200: ActSessionSelSchema,
			404: messageSchema,
			401: messageSchema,
			403: messageSchema,
		},
	},
);

sessionRouter.post(
	'/',
	async ({ body, set }) => {
		set.status = 201;
		await db.insert(ActSession).values(body);
		return {
			message: 'success',
		};
	},
	{
		body: ActSessionInSchema,
		response: {
			201: messageSchema,
		},
	},
);

sessionRouter.put(
	'/:id',
	async ({ headers: { auth }, params: { id }, body, error }) => {
		const { user } = await validateSessionToken(auth);
		if (!user) {
			return error(401, { message: 'No autorizado' });
		}
		await db.update(ActSession).set(body).where(eq(ActSession.id, id));
		return {
			message: 'success',
		};
	},
	{
		headers: t.Object({
			auth: t.String(),
		}),
		params: t.Object({ id: t.Integer() }),
		body: ActSessionUpSchema,
		response: {
			200: messageSchema,
			401: messageSchema,
			403: messageSchema,
		},
	},
);

sessionRouter.delete(
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
		await db.delete(ActSession).where(eq(ActSession.id, id));
		return { message: 'ActSession deleted' };
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

export default sessionRouter;
