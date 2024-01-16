import { Duplex as NodeDuplex } from "node:stream";

import { type Scope } from "./scope";

export interface DuplexConfigurationWindow {
	scope: string;
	state: string;
}

const DefaultDuplexConfigurationWindow: DuplexConfigurationWindow = {
	scope: "scope",
	state: "state",
};

export interface DuplexConfiguration {
	window?: DuplexConfigurationWindow;
}

const DefaultConfiguration: DuplexConfiguration = {
	window: DefaultDuplexConfigurationWindow,
};

const empty = "{}";

export class Duplex extends NodeDuplex {
	private window: DuplexConfigurationWindow;
	private written: boolean = false;

	constructor(private scope: Scope, configuration = DefaultConfiguration) {
		super();
		this.window = configuration.window || DefaultDuplexConfigurationWindow;
	}

	_read() {}

	_write(
		chunk: any,
		encoding: BufferEncoding,
		callback: (error?: Error | null) => void,
	) {
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
