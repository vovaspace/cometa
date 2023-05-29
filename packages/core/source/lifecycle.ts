import { type Channel } from "./channel";
import { type Instance } from "./factory";
import { type Link } from "./link";

const identity = <T>(input: T): T => input;

export interface Lifecycle {
	subject: <S extends Channel<any>>(subject: S) => S;
	link: <L extends Link<any, any, any>>(link: L) => L;
	instance: <I extends Instance<{}>>(instance: I) => I;
}

export const RuntimeLifecycle: Lifecycle = {
	subject: identity,
	link: identity,
	instance: identity,
};

export const lifecycle = {
	current: RuntimeLifecycle,
};
