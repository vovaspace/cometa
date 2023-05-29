import { context, type Context, RuntimeContext } from "./context";
import { type Event, type EventPayload } from "./event";

export interface LaunchContext extends Context {
	errors: unknown[];
}

export function launch(
	subject: Event<void>,
	payload?: never,
): Promise<LaunchContext>;

export function launch<Subject extends Event<any>>(
	subject: Subject,
	payload: EventPayload<Subject>,
): Promise<LaunchContext>;

export async function launch<Subject extends Event<any>>(
	subject: Subject,
	payload: EventPayload<Subject>,
) {
	const ctx: LaunchContext = {
		inFlight: 0,
		error(error) {
			ctx.errors.push(error);
		},
		errors: [],
	};

	context.current = ctx;

	try {
		await subject(payload);
	} catch {
	} finally {
		return new Promise((resolve) => {
			const check = () => {
				if (ctx.inFlight === 0) {
					context.current = RuntimeContext;
					resolve(ctx);
				} else setTimeout(check);
			};

			check();
		});
	}
}
