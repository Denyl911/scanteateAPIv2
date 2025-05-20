import { cors } from '@elysiajs/cors';
import staticPlugin from '@elysiajs/static';
import { swagger } from '@elysiajs/swagger';
import { Elysia } from 'elysia';
import { Logestic } from 'logestic';
import activityRouter from './controllers/activity';
import emotionRouter from './controllers/emotion';
import sessionRouter from './controllers/session';
import userRouter from './controllers/user';

const app = new Elysia()
	.use(Logestic.preset('fancy'))
	.use(cors())
	.use(
		swagger({
			documentation: {
				info: {
					title: 'SCANTEATE - API Documentation',
					version: '1.0.0',
				},
			},
			path: '/docs',
			exclude: '/',
		}),
	)
	.use(staticPlugin({ assets: 'src/public' }))
	.get('/', () => 'Hello Elysia')
	.use(userRouter)
	.use(activityRouter)
	.use(emotionRouter)
	.use(sessionRouter)
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
