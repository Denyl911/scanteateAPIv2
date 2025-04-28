import { randomUUIDv7 } from 'bun';
import { eq } from 'drizzle-orm';
import db from '../config/db';
import {
	Session,
	type SessionType,
	User,
	type UserType,
} from '../schemas/user';

export async function createSession(userId: number): Promise<SessionType> {
	const token = randomUUIDv7();
	const hasher = new Bun.CryptoHasher('sha256');
	hasher.update(token);
	const sessionId = hasher.digest('hex');
	const session: SessionType = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
	};
	await db.insert(Session).values(session);
	return session;
}

export async function validateSessionTokenFull(
	token: string,
): Promise<SessionValidationResult> {
	const result = await db
		.select({ user: User, session: Session })
		.from(Session)
		.innerJoin(User, eq(Session.userId, User.id))
		.where(eq(Session.id, token));
	if (result.length < 1) {
		return { session: null, user: null };
	}
	const { user, session } = result[0];
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(Session).where(eq(Session.id, session.id));
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update(Session)
			.set({
				expiresAt: session.expiresAt,
			})
			.where(eq(Session.id, session.id));
	}
	return { session, user };
}

export async function validateSessionToken(
	token: string,
): Promise<SessionValidationResultShort> {
	const result = await db
		.select({ user: { id: User.id, type: User.type }, session: Session })
		.from(Session)
		.innerJoin(User, eq(Session.userId, User.id))
		.where(eq(Session.id, token));
	if (result.length < 1) {
		return { session: null, user: null };
	}
	const { user, session } = result[0];
	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(Session).where(eq(Session.id, session.id));
		return { session: null, user: null };
	}
	if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
		session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
		await db
			.update(Session)
			.set({
				expiresAt: session.expiresAt,
			})
			.where(eq(Session.id, session.id));
	}
	return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(Session).where(eq(Session.id, sessionId));
}

export async function invalidateAllSessions(userId: number): Promise<void> {
	await db.delete(Session).where(eq(Session.userId, userId));
}

export async function itsAdmin(auth: string): Promise<boolean> {
	const { user } = await validateSessionToken(auth);
	if (!user) {
		return false;
	}
	if (user.type !== 'Admin') {
		return false;
	}
	return true;
}

export type SessionValidationResult =
	| { session: SessionType; user: UserType }
	| { session: null; user: null };

export type SessionValidationResultShort =
	| { session: SessionType; user: { id: number; type: string | null } }
	| { session: null; user: null };
