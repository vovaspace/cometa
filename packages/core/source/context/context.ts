export interface Context {
	inFlight: number;
	error: (error: unknown) => void;
}

export const RuntimeContext: Context = {
	inFlight: 0,
	error() {},
};

export const context = {
	current: RuntimeContext,
};
