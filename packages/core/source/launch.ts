import { type Channel, type ChannelPayload } from "./channel";
import { context, type Context, RuntimeContext } from "./context";

export interface LaunchContext extends Context {
	errors: unknown[];
}

export function launch(
	subject: Channel<void>,
	payload?: never,
): Promise<LaunchContext>;

export function launch<Subject extends Channel<any>>(
	subject: Subject,
	payload: ChannelPayload<Subject>,
): Promise<LaunchContext>;

export async function launch<Subject extends Channel<any>>(
	subject: Subject,
	payload: ChannelPayload<Subject>,
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
