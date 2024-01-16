import { FC } from "react";

import { useSource } from "@cometa/react";

import { useMovieCardModel } from "./model";

export const MovieComponent: FC = () => {
	const model = useMovieCardModel();
	const name = useSource(model.name);

	return (
		<article>
			<h2>Movie {name}</h2>
		</article>
	);
};
