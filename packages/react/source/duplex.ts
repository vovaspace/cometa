import { type Scope } from "./scope";
import { Duplex as NodeDuplex } from "node:stream";

interface DuplexWindowFields {
	scope: string;
	state: string;
}

const DefaultDuplexWindowFields: DuplexWindowFields = {
	scope: "scope",
	state: "state",
};

export interface DuplexConfiguration {
	window?: DuplexWindowFields;
}

const empty = "{}";

export class Duplex extends NodeDuplex {
	private window: DuplexWindowFields;
	private written = false;

	constructor(
		private scope: Scope,
		configuration: DuplexConfiguration = { window: DefaultDuplexWindowFields },
	) {
		super();
		this.window = configuration.window || DefaultDuplexWindowFields;
	}

	_read() {}

	_write(
		chunk: any,
		encoding: BufferEncoding,
		callback: (error?: Error | null) => void,
	): void {
		const dehydrated = this.scope.dehydrate();
		const state = JSON.stringify(dehydrated[0]);
		const serverstate = JSON.stringify(dehydrated[1]);

		if (this.written) {
			this.push(
				`<script>${
					state === empty ? "" : `Object.assign(${this.window.state}[0],${state});`
				}${
					serverstate === empty
						? ""
						: `Object.assign(${this.window.state}[1],${serverstate});`
				}${this.window.scope}&&${this.window.scope}.hydrate(${
					this.window.state
				})</script>`,
				"utf-8",
			);

			this.push(chunk, encoding);
		} else {
			this.written = true;

			/* <!DOCTYPE html><html><head> */
			this.push(chunk.subarray(0, 27), encoding);

			this.push(
				`<script>${this.window.state}=[${state},${serverstate}]</script>`,
				"utf-8",
			);

			this.push(chunk.subarray(27), encoding);
		}

		callback();
	}

	_final() {
		this.push(null);
	}
}
