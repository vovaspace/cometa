import { FC } from "react";

// import { MovieToken } from "../../modules/Movie";
import { useSource, useToken } from "@cometa/react";

import { CoreToken } from "../../core";

export const Meta: FC = () => {
	const core = useToken(CoreToken);
	// const movie = useToken(MovieToken);

	const sault = useSource(core.sault);
	const counter = useSource(core.counter);
	// const isLoading = useSource(movie.isLoading);

	return (
		<div>
			<span>Sault: {sault}</span>
			<div>
				<span>Counter: {counter}</span>
				{/* <span>{isLoading ? "Something loading" : "Loaded"}</span> */}
				<button type="button" onClick={() => core.increased()}>
					Plus
				</button>
			</div>
		</div>
	);
};
