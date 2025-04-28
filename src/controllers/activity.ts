import { eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import db from '../config/db';
import {
	Activity,
	ActivityInSchema,
	ActivitySelSchema,
	ActivityUpSchema,
} from '../schemas/activity';
import {
	itsAdmin,
	validateSessionToken,
	validateSessionTokenFull,
} from '../utils/auth';
import { messageSchema } from '../utils/schemas';

const activityRouter = new Elysia({
	prefix: '/activities',
	detail: {
		tags: ['Activitys'],
	},
});

activityRouter.get(
	'/',
	async ({ headers: { auth }, error }) => {
		const isadmin = await itsAdmin(auth);
		if (!isadmin) {
			return error(401, { message: 'No autorizado' });
		}
		return await db.select().from(Activity);
	},
	{
		headers: t.Object({
			auth: t.String(),
		}),
		response: {
			200: t.Array(ActivitySelSchema),
			401: messageSchema,
		},
	},
);

activityRouter.get(
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
		const data = await db.select().from(Activity).where(eq(Activity.id, id));
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
			200: ActivitySelSchema,
			404: messageSchema,
			401: messageSchema,
			403: messageSchema,
		},
	},
);

activityRouter.post(
	'/',
	async ({ body, set }) => {
		set.status = 201;
		await db.insert(Activity).values(body);
		return {
			message: 'success',
		};
	},
	{
		body: ActivityInSchema,
		response: {
			201: messageSchema,
		},
	},
);

activityRouter.put(
	'/:id',
	async ({ headers: { auth }, params: { id }, body, error }) => {
		const { user } = await validateSessionToken(auth);
		if (!user) {
			return error(401, { message: 'No autorizado' });
		}
		await db.update(Activity).set(body).where(eq(Activity.id, id));
		return {
			message: 'success',
		};
	},
	{
		headers: t.Object({
			auth: t.String(),
		}),
		params: t.Object({ id: t.Integer() }),
		body: ActivityUpSchema,
		response: {
			200: messageSchema,
			401: messageSchema,
			403: messageSchema,
		},
	},
);

activityRouter.delete(
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
		await db.delete(Activity).where(eq(Activity.id, id));
		return { message: 'Activity deleted' };
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

export default activityRouter;
