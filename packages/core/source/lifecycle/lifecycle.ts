import { type Channel } from "../channel";
import { type ModelInstance } from "../model";
import { type Link } from "../scheduler";
import { back } from "../stub";

export interface Lifecycle {
	subject: <S extends Channel<any>>(subject: S) => S;
	link: <L extends Link<any, any, any>>(link: L) => L;
	model: <M extends ModelInstance>(model: M) => M;
}

export const RuntimeLifecycle: Lifecycle = {
	subject: back,
	link: back,
	model: back,
};

export const lifecycle = {
	current: RuntimeLifecycle,
};
