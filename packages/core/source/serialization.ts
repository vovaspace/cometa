export type Serialized =
	| number
	| string
	| null
	| { [key: string | number]: Serialized }
	| Serialized[];

export type Serialization<State, SerializedState extends Serialized> =
	| {
			serialize: (state: State) => SerializedState;
			deserialize: (input: SerializedState) => State;
	  }
	| false;
