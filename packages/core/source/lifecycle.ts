import { type Link } from "./link";
import { type Model } from "./model";
import { type Thread } from "./thread";

const identity = <T>(input: T): T => input;

export interface Lifecycle {
	subject: <S extends Thread<any>>(subject: S) => S;
	link: <L extends Link<any, any, any>>(link: L) => L;
	model: <M extends Model<{}>>(model: M) => M;
}

export const RuntimeLifecycle: Lifecycle = {
	subject: identity,
	link: identity,
	model: identity,
};

export const lifecycle = {
	current: RuntimeLifecycle,
};
