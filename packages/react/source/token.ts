export type TokenKey = string;

const TokenSymbol = Symbol("cometa/token");

export interface Token<T> {
	[TokenSymbol]: T;
	key: TokenKey;
}

export type TokenType<T> = T extends Token<infer K> ? K : never;

export type Tokenized<T extends {}> = {
	[K in keyof T]: T[K] | Token<T[K]>;
};

export const createToken = <T>(key: TokenKey): Token<T> => ({
	[TokenSymbol]: null as unknown as T,
	key,
});

export const isToken = <T>(unknown: Token<T> | unknown): unknown is Token<T> =>
	typeof unknown === "object" && unknown !== null && TokenSymbol in unknown;
