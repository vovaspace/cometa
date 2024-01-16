import { FunctionComponent, ReactNode } from "react";

import { Token, TokenKey } from "./token";

type RelayProvider<T> = FunctionComponent<{ children?: ReactNode; value: T }>;

interface RelayConfiguration {
	key: TokenKey;
}

export declare function relay<T>(
	configuration: RelayConfiguration,
): [Token: Token<T>, Provider: RelayProvider<T>];
